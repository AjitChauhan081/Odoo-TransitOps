from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.post("/", response_model=schemas.Driver, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver: schemas.DriverCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Register a new driver. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    existing = db.query(models.Driver).filter(
        models.Driver.license_number == driver.license_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this license number already exists")
    db_driver = models.Driver(**driver.model_dump())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver


@router.get("/", response_model=List[schemas.Driver])
def list_drivers(
    status: Optional[models.DriverStatusEnum] = Query(None),
    search: Optional[str] = Query(None, description="Search by name or license number"),
    sort_by: Optional[str] = Query("id", description="Field to sort by (e.g. name, safety_score)"),
    order: Optional[str] = Query("asc", description="Sort order: 'asc' or 'desc'"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all drivers. Supports filtering, searching, and sorting."""
    query = db.query(models.Driver)
    if status:
        query = query.filter(models.Driver.status == status)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Driver.name.ilike(search_pattern)) | 
            (models.Driver.license_number.ilike(search_pattern))
        )
        
    if hasattr(models.Driver, sort_by):
        column = getattr(models.Driver, sort_by)
        if order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/expiring-licenses", response_model=List[schemas.Driver])
def get_expiring_licenses(
    days: int = Query(30, description="Licenses expiring within this many days"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get drivers whose licenses are expiring soon. Safety Officer / Fleet Manager."""
    from datetime import timedelta
    cutoff = date.today() + timedelta(days=days)
    drivers = db.query(models.Driver).filter(
        models.Driver.license_expiry_date <= cutoff,
        models.Driver.license_expiry_date >= date.today(),
    ).all()
    return drivers


@router.post("/trigger-reminders", status_code=status.HTTP_200_OK)
def trigger_license_reminders(
    days: int = Query(30, description="Licenses expiring within this many days"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Trigger mock email reminders for drivers with expiring licenses. Safety Officer / Fleet Manager."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.SAFETY_OFFICER]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    from datetime import timedelta
    cutoff = date.today() + timedelta(days=days)
    drivers = db.query(models.Driver).filter(
        models.Driver.license_expiry_date <= cutoff,
        models.Driver.license_expiry_date >= date.today(),
    ).all()
    
    print("\n" + "="*50)
    print(f"MOCK EMAIL SERVICE: Dispatching {len(drivers)} reminders")
    print("="*50)
    for d in drivers:
        print(f"To: {d.name} <driver_{d.id}@example.com>")
        print(f"Subject: URGENT: Driving License Expiring Soon")
        print(f"Body: Dear {d.name}, your license ({d.license_number}) expires on {d.license_expiry_date}. Please renew immediately.")
        print("-" * 50)
        
    return {"message": f"Successfully queued {len(drivers)} email reminders."}


@router.get("/{driver_id}", response_model=schemas.Driver)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific driver by ID."""
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.put("/{driver_id}", response_model=schemas.Driver)
def update_driver(
    driver_id: int,
    driver_update: schemas.DriverUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update driver details. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    update_data = driver_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(driver, key, value)
    db.commit()
    db.refresh(driver)
    return driver


@router.patch("/{driver_id}/status", response_model=schemas.Driver)
def update_driver_status(
    driver_id: int,
    status_update: schemas.DriverStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update driver status. Fleet Manager / Safety Officer."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.SAFETY_OFFICER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    driver.status = status_update.status
    db.commit()
    db.refresh(driver)
    return driver


@router.patch("/{driver_id}/safety-score", response_model=schemas.Driver)
def update_safety_score(
    driver_id: int,
    score_update: schemas.SafetyScoreUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a driver's safety score. Safety Officer only."""
    if current_user.role not in [models.RoleEnum.SAFETY_OFFICER, models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if not (0 <= score_update.safety_score <= 100):
        raise HTTPException(status_code=400, detail="Safety score must be between 0 and 100")
    driver.safety_score = score_update.safety_score
    db.commit()
    db.refresh(driver)
    return driver


@router.get("/{driver_id}/trips", response_model=List[schemas.Trip])
def get_driver_trips(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get trip history for a specific driver."""
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver.trips


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove a driver. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if driver.status == models.DriverStatusEnum.ON_TRIP:
        raise HTTPException(status_code=400, detail="Cannot delete a driver currently on a trip")
    db.delete(driver)
    db.commit()
