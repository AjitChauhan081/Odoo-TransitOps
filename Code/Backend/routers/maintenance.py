from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("/", response_model=schemas.MaintenanceLog, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(
    log: schemas.MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a maintenance log entry. Fleet Manager only.
    Automatically sets vehicle status to In Shop."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == log.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status == models.VehicleStatusEnum.ON_TRIP:
        raise HTTPException(status_code=400, detail="Cannot log maintenance for a vehicle currently on a trip")

    db_log = models.MaintenanceLog(**log.model_dump())
    db.add(db_log)

    # Set vehicle to In Shop
    vehicle.status = models.VehicleStatusEnum.IN_SHOP
    db.commit()
    db.refresh(db_log)
    return db_log


@router.get("/", response_model=List[schemas.MaintenanceLog])
def list_maintenance_logs(
    vehicle_id: Optional[int] = Query(None),
    status: Optional[models.MaintenanceStatusEnum] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all maintenance logs. Filter by vehicle or status."""
    query = db.query(models.MaintenanceLog)
    if vehicle_id:
        query = query.filter(models.MaintenanceLog.vehicle_id == vehicle_id)
    if status:
        query = query.filter(models.MaintenanceLog.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/{log_id}", response_model=schemas.MaintenanceLog)
def get_maintenance_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific maintenance log entry."""
    log = db.query(models.MaintenanceLog).filter(models.MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return log


@router.put("/{log_id}", response_model=schemas.MaintenanceLog)
def update_maintenance_log(
    log_id: int,
    log_update: schemas.MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a maintenance log. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    log = db.query(models.MaintenanceLog).filter(models.MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    update_data = log_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)
    db.commit()
    db.refresh(log)
    return log


@router.patch("/{log_id}/close", response_model=schemas.MaintenanceLog)
def close_maintenance_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Close a maintenance log. Sets vehicle back to Available."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    log = db.query(models.MaintenanceLog).filter(models.MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    if log.status == models.MaintenanceStatusEnum.CLOSED:
        raise HTTPException(status_code=400, detail="Maintenance log is already closed")

    log.status = models.MaintenanceStatusEnum.CLOSED

    # Set vehicle back to Available
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == log.vehicle_id).first()
    if vehicle and vehicle.status == models.VehicleStatusEnum.IN_SHOP:
        vehicle.status = models.VehicleStatusEnum.AVAILABLE

    db.commit()
    db.refresh(log)
    return log
