from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post("/", response_model=schemas.Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Register a new vehicle. Accessible by Fleet Manager."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    existing = db.query(models.Vehicle).filter(
        models.Vehicle.registration_number == vehicle.registration_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle registration number already exists")
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.get("/", response_model=List[schemas.Vehicle])
def list_vehicles(
    status: Optional[models.VehicleStatusEnum] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all vehicles. Optionally filter by status."""
    query = db.query(models.Vehicle)
    if status:
        query = query.filter(models.Vehicle.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/{vehicle_id}", response_model=schemas.Vehicle)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific vehicle by ID."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(
    vehicle_id: int,
    vehicle_update: schemas.VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update vehicle details. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    update_data = vehicle_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch("/{vehicle_id}/status", response_model=schemas.Vehicle)
def update_vehicle_status(
    vehicle_id: int,
    status_update: schemas.VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update vehicle status only."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.status = status_update.status
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retire/Delete a vehicle. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    # Check if vehicle is currently on a trip
    if vehicle.status == models.VehicleStatusEnum.ON_TRIP:
        raise HTTPException(status_code=400, detail="Cannot delete a vehicle currently on a trip")
    db.delete(vehicle)
    db.commit()


@router.get("/{vehicle_id}/maintenance", response_model=List[schemas.MaintenanceLog])
def get_vehicle_maintenance(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all maintenance logs for a specific vehicle."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle.maintenance_logs


@router.get("/{vehicle_id}/trips", response_model=List[schemas.Trip])
def get_vehicle_trips(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get trip history for a specific vehicle."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle.trips
