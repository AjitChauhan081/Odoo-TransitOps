from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/fuel", tags=["Fuel Logs"])


@router.post("/", response_model=schemas.FuelLog, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    fuel: schemas.FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Log a fuel entry for a vehicle. Fleet Manager / Driver."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.DRIVER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == fuel.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if fuel.trip_id:
        trip = db.query(models.Trip).filter(models.Trip.id == fuel.trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

    db_fuel = models.FuelLog(**fuel.model_dump())
    db.add(db_fuel)
    db.commit()
    db.refresh(db_fuel)
    return db_fuel


@router.get("/", response_model=List[schemas.FuelLog])
def list_fuel_logs(
    vehicle_id: Optional[int] = Query(None),
    trip_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all fuel logs. Filter by vehicle or trip."""
    query = db.query(models.FuelLog)
    if vehicle_id:
        query = query.filter(models.FuelLog.vehicle_id == vehicle_id)
    if trip_id:
        query = query.filter(models.FuelLog.trip_id == trip_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{fuel_id}", response_model=schemas.FuelLog)
def get_fuel_log(
    fuel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific fuel log by ID."""
    fuel = db.query(models.FuelLog).filter(models.FuelLog.id == fuel_id).first()
    if not fuel:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    return fuel


@router.delete("/{fuel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_log(
    fuel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a fuel log entry. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    fuel = db.query(models.FuelLog).filter(models.FuelLog.id == fuel_id).first()
    if not fuel:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    db.delete(fuel)
    db.commit()
