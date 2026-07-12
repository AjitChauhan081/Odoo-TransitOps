from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
from models import RoleEnum, VehicleStatusEnum, DriverStatusEnum, TripStatusEnum, MaintenanceStatusEnum

# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: str
    role: RoleEnum

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: RoleEnum
    email: str

# ─── Vehicle Schemas ──────────────────────────────────────────────────────────

class VehicleBase(BaseModel):
    registration_number: str
    name_model: str
    vehicle_type: str
    max_load_capacity: float
    odometer: float = 0.0
    acquisition_cost: float
    status: VehicleStatusEnum = VehicleStatusEnum.AVAILABLE

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name_model: Optional[str] = None
    vehicle_type: Optional[str] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatusEnum

class Vehicle(VehicleBase):
    id: int

    class Config:
        from_attributes = True

# ─── Vehicle Document Schemas ─────────────────────────────────────────────────

class VehicleDocumentBase(BaseModel):
    vehicle_id: int
    document_type: str
    file_path: str
    uploaded_at: datetime

class VehicleDocumentCreate(VehicleDocumentBase):
    pass

class VehicleDocument(VehicleDocumentBase):
    id: int

    class Config:
        from_attributes = True

# ─── Driver Schemas ───────────────────────────────────────────────────────────

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float = 100.0
    status: DriverStatusEnum = DriverStatusEnum.AVAILABLE

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None

class DriverStatusUpdate(BaseModel):
    status: DriverStatusEnum

class SafetyScoreUpdate(BaseModel):
    safety_score: float

class Driver(DriverBase):
    id: int

    class Config:
        from_attributes = True

# ─── Trip Schemas ─────────────────────────────────────────────────────────────

class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    status: TripStatusEnum = TripStatusEnum.DRAFT
    final_odometer: Optional[float] = None
    fuel_consumed: Optional[float] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    source: Optional[str] = None
    destination: Optional[str] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    cargo_weight: Optional[float] = None
    planned_distance: Optional[float] = None

class TripComplete(BaseModel):
    final_odometer: float
    fuel_consumed: Optional[float] = None
    fuel_cost: Optional[float] = None

class Trip(TripBase):
    id: int

    class Config:
        from_attributes = True

# ─── Maintenance Schemas ──────────────────────────────────────────────────────

class MaintenanceLogBase(BaseModel):
    vehicle_id: int
    description: str
    date: datetime
    cost: float
    status: MaintenanceStatusEnum = MaintenanceStatusEnum.ACTIVE

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogUpdate(BaseModel):
    description: Optional[str] = None
    cost: Optional[float] = None
    status: Optional[MaintenanceStatusEnum] = None

class MaintenanceLog(MaintenanceLogBase):
    id: int

    class Config:
        from_attributes = True

# ─── Fuel Log Schemas ─────────────────────────────────────────────────────────

class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float
    cost: float
    date: datetime

class FuelLogCreate(FuelLogBase):
    pass

class FuelLog(FuelLogBase):
    id: int

    class Config:
        from_attributes = True

# ─── Expense Schemas ──────────────────────────────────────────────────────────

class ExpenseBase(BaseModel):
    expense_type: str
    amount: float
    date: datetime
    vehicle_id: int
    trip_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int

    class Config:
        from_attributes = True
