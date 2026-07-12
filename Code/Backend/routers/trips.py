from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/trips", tags=["Trips"])


def _validate_dispatch(trip: models.Trip, db: Session):
    """Business rules: validate vehicle and driver are available before dispatching."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
    driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Vehicle must be available
    if vehicle.status != models.VehicleStatusEnum.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle is not available (current status: {vehicle.status})"
        )
    # Driver must be available
    if driver.status != models.DriverStatusEnum.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Driver is not available (current status: {driver.status})"
        )
    # Cargo weight must not exceed vehicle capacity
    if trip.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Cargo weight ({trip.cargo_weight} kg) exceeds vehicle capacity ({vehicle.max_load_capacity} kg)"
        )
    return vehicle, driver


@router.post("/", response_model=schemas.Trip, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip: schemas.TripCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new trip (Draft status). Fleet Manager and Driver."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.DRIVER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Validate vehicle and driver exist
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    # Cargo weight check
    if trip.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Cargo weight ({trip.cargo_weight} kg) exceeds vehicle capacity ({vehicle.max_load_capacity} kg)"
        )

    db_trip = models.Trip(**trip.model_dump())
    db_trip.status = models.TripStatusEnum.DRAFT
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[schemas.Trip])
def list_trips(
    status: Optional[models.TripStatusEnum] = Query(None),
    search: Optional[str] = Query(None, description="Search by source or destination"),
    sort_by: Optional[str] = Query("id", description="Field to sort by (e.g. id, cargo_weight, planned_distance)"),
    order: Optional[str] = Query("asc", description="Sort order: 'asc' or 'desc'"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all trips. Supports filtering, searching, and sorting."""
    query = db.query(models.Trip)
    if status:
        query = query.filter(models.Trip.status == status)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Trip.source.ilike(search_pattern)) | 
            (models.Trip.destination.ilike(search_pattern))
        )
        
    if hasattr(models.Trip, sort_by):
        column = getattr(models.Trip, sort_by)
        if order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/{trip_id}", response_model=schemas.Trip)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific trip by ID."""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.patch("/{trip_id}/dispatch", response_model=schemas.Trip)
def dispatch_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Dispatch a trip (Draft → Dispatched). Validates vehicle and driver availability.
    Marks vehicle as On Trip and driver as On Trip."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.DRIVER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != models.TripStatusEnum.DRAFT:
        raise HTTPException(status_code=400, detail=f"Only Draft trips can be dispatched (current: {trip.status})")

    vehicle, driver = _validate_dispatch(trip, db)

    # State transitions
    trip.status = models.TripStatusEnum.DISPATCHED
    vehicle.status = models.VehicleStatusEnum.ON_TRIP
    driver.status = models.DriverStatusEnum.ON_TRIP

    db.commit()
    db.refresh(trip)
    return trip


@router.patch("/{trip_id}/complete", response_model=schemas.Trip)
def complete_trip(
    trip_id: int,
    completion: schemas.TripComplete,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Complete a dispatched trip (Dispatched → Completed).
    Updates vehicle odometer. Frees up vehicle and driver."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.DRIVER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != models.TripStatusEnum.DISPATCHED:
        raise HTTPException(status_code=400, detail=f"Only Dispatched trips can be completed (current: {trip.status})")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
    driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()

    # Update trip data
    trip.status = models.TripStatusEnum.COMPLETED
    trip.final_odometer = completion.final_odometer
    trip.fuel_consumed = completion.fuel_consumed

    # Update vehicle odometer and free up vehicle and driver
    if vehicle:
        vehicle.odometer = completion.final_odometer
        vehicle.status = models.VehicleStatusEnum.AVAILABLE
    if driver:
        driver.status = models.DriverStatusEnum.AVAILABLE

    # Auto-create fuel log if fuel_consumed provided
    if completion.fuel_consumed and completion.fuel_cost:
        from datetime import datetime
        fuel_log = models.FuelLog(
            vehicle_id=trip.vehicle_id,
            trip_id=trip.id,
            liters=completion.fuel_consumed,
            cost=completion.fuel_cost,
            date=datetime.utcnow(),
        )
        db.add(fuel_log)

    db.commit()
    db.refresh(trip)
    return trip


@router.patch("/{trip_id}/cancel", response_model=schemas.Trip)
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Cancel a Draft or Dispatched trip. Frees up vehicle and driver if dispatched."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.DRIVER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status == models.TripStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed trip")
    if trip.status == models.TripStatusEnum.CANCELLED:
        raise HTTPException(status_code=400, detail="Trip is already cancelled")

    # If it was dispatched, free up resources
    if trip.status == models.TripStatusEnum.DISPATCHED:
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
        driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()
        if vehicle:
            vehicle.status = models.VehicleStatusEnum.AVAILABLE
        if driver:
            driver.status = models.DriverStatusEnum.AVAILABLE

    trip.status = models.TripStatusEnum.CANCELLED
    db.commit()
    db.refresh(trip)
    return trip


@router.put("/{trip_id}", response_model=schemas.Trip)
def update_trip(
    trip_id: int,
    trip_update: schemas.TripUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a Draft trip's details. Fleet Manager and Driver."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.DRIVER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != models.TripStatusEnum.DRAFT:
        raise HTTPException(status_code=400, detail="Only Draft trips can be edited")
    update_data = trip_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(trip, key, value)
    db.commit()
    db.refresh(trip)
    return trip
