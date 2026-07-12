from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Enum
from sqlalchemy.orm import relationship
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    FLEET_MANAGER = "Fleet Manager"
    DRIVER = "Driver"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"

class VehicleStatusEnum(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"

class DriverStatusEnum(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class TripStatusEnum(str, enum.Enum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class MaintenanceStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    CLOSED = "Closed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name_model = Column(String, nullable=False)
    vehicle_type = Column(String, nullable=False)
    max_load_capacity = Column(Float, nullable=False)
    odometer = Column(Float, default=0.0)
    acquisition_cost = Column(Float, nullable=False)
    status = Column(Enum(VehicleStatusEnum), default=VehicleStatusEnum.AVAILABLE)

    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
    documents = relationship("VehicleDocument", back_populates="vehicle")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String, nullable=False)
    safety_score = Column(Float, default=100.0)
    status = Column(Enum(DriverStatusEnum), default=DriverStatusEnum.AVAILABLE)

    trips = relationship("Trip", back_populates="driver")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)
    planned_distance = Column(Float, nullable=False)
    status = Column(Enum(TripStatusEnum), default=TripStatusEnum.DRAFT)
    final_odometer = Column(Float, nullable=True)
    fuel_consumed = Column(Float, nullable=True)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    description = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    cost = Column(Float, nullable=False)
    status = Column(Enum(MaintenanceStatusEnum), default=MaintenanceStatusEnum.ACTIVE)

    vehicle = relationship("Vehicle", back_populates="maintenance_logs")

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)

    vehicle = relationship("Vehicle", back_populates="fuel_logs")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)

    vehicle = relationship("Vehicle", back_populates="expenses")

class VehicleDocument(Base):
    __tablename__ = "vehicle_documents"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    document_type = Column(String, nullable=False) # e.g. Insurance, Registration
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, nullable=False)

    vehicle = relationship("Vehicle", back_populates="documents")
