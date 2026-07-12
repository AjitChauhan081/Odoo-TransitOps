from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/", response_model=schemas.Expense, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Log an expense (toll, repair, etc.). Fleet Manager / Financial Analyst."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.FINANCIAL_ANALYST]:
        raise HTTPException(status_code=403, detail="Not authorized")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == expense.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if expense.trip_id:
        trip = db.query(models.Trip).filter(models.Trip.id == expense.trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.get("/", response_model=List[schemas.Expense])
def list_expenses(
    vehicle_id: Optional[int] = Query(None),
    trip_id: Optional[int] = Query(None),
    expense_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all expenses. Filter by vehicle, trip, or type."""
    query = db.query(models.Expense)
    if vehicle_id:
        query = query.filter(models.Expense.vehicle_id == vehicle_id)
    if trip_id:
        query = query.filter(models.Expense.trip_id == trip_id)
    if expense_type:
        query = query.filter(models.Expense.expense_type == expense_type)
    return query.offset(skip).limit(limit).all()


@router.get("/{expense_id}", response_model=schemas.Expense)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific expense by ID."""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete an expense entry. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
