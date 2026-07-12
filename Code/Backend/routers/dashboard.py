from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from routers.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get high-level KPI summary for the dashboard.
    Returns counts and aggregates for vehicles, drivers, trips, and finances.
    """
    # Vehicle counts by status
    vehicle_stats = db.query(
        models.Vehicle.status, func.count(models.Vehicle.id)
    ).group_by(models.Vehicle.status).all()
    vehicle_summary = {str(s): c for s, c in vehicle_stats}

    # Driver counts by status
    driver_stats = db.query(
        models.Driver.status, func.count(models.Driver.id)
    ).group_by(models.Driver.status).all()
    driver_summary = {str(s): c for s, c in driver_stats}

    # Trip counts by status
    trip_stats = db.query(
        models.Trip.status, func.count(models.Trip.id)
    ).group_by(models.Trip.status).all()
    trip_summary = {str(s): c for s, c in trip_stats}

    # Financial summary
    total_fuel_cost = db.query(func.sum(models.FuelLog.cost)).scalar() or 0.0
    total_fuel_liters = db.query(func.sum(models.FuelLog.liters)).scalar() or 0.0
    total_maintenance_cost = db.query(func.sum(models.MaintenanceLog.cost)).scalar() or 0.0
    total_expenses = db.query(func.sum(models.Expense.amount)).scalar() or 0.0
    total_operational_cost = total_fuel_cost + total_maintenance_cost + total_expenses

    # Safety: drivers with score < 70
    low_safety_drivers = db.query(func.count(models.Driver.id)).filter(
        models.Driver.safety_score < 70
    ).scalar() or 0

    # Maintenance: active logs
    active_maintenance = db.query(func.count(models.MaintenanceLog.id)).filter(
        models.MaintenanceLog.status == models.MaintenanceStatusEnum.ACTIVE
    ).scalar() or 0

    return {
        "vehicles": {
            "total": sum(vehicle_summary.values()),
            "by_status": vehicle_summary,
        },
        "drivers": {
            "total": sum(driver_summary.values()),
            "by_status": driver_summary,
            "low_safety_score_count": low_safety_drivers,
        },
        "trips": {
            "total": sum(trip_summary.values()),
            "by_status": trip_summary,
        },
        "finances": {
            "total_fuel_cost": round(total_fuel_cost, 2),
            "total_fuel_liters": round(total_fuel_liters, 2),
            "total_maintenance_cost": round(total_maintenance_cost, 2),
            "total_other_expenses": round(total_expenses, 2),
            "total_operational_cost": round(total_operational_cost, 2),
        },
        "alerts": {
            "active_maintenance_jobs": active_maintenance,
            "drivers_with_low_safety_score": low_safety_drivers,
        },
    }


@router.get("/fleet-utilization")
def get_fleet_utilization(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Fleet utilization metrics: percentage of fleet currently on trips,
    average trips per vehicle, and total distance (odometer-based).
    """
    total_vehicles = db.query(func.count(models.Vehicle.id)).scalar() or 0
    on_trip = db.query(func.count(models.Vehicle.id)).filter(
        models.Vehicle.status == models.VehicleStatusEnum.ON_TRIP
    ).scalar() or 0
    in_shop = db.query(func.count(models.Vehicle.id)).filter(
        models.Vehicle.status == models.VehicleStatusEnum.IN_SHOP
    ).scalar() or 0

    utilization_rate = round((on_trip / total_vehicles * 100), 2) if total_vehicles > 0 else 0.0

    # Total completed trips per vehicle
    completed_trips = db.query(func.count(models.Trip.id)).filter(
        models.Trip.status == models.TripStatusEnum.COMPLETED
    ).scalar() or 0
    avg_trips = round(completed_trips / total_vehicles, 2) if total_vehicles > 0 else 0.0

    # Total odometer across fleet
    total_odometer = db.query(func.sum(models.Vehicle.odometer)).scalar() or 0.0

    return {
        "total_vehicles": total_vehicles,
        "on_trip": on_trip,
        "in_shop": in_shop,
        "available": total_vehicles - on_trip - in_shop,
        "utilization_rate_percent": utilization_rate,
        "total_completed_trips": completed_trips,
        "avg_trips_per_vehicle": avg_trips,
        "total_fleet_odometer_km": round(total_odometer, 2),
    }


@router.get("/cost-per-trip")
def get_cost_per_trip(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns cost breakdown per completed trip (fuel + expenses).
    Useful for Financial Analysts.
    """
    trips = db.query(models.Trip).filter(
        models.Trip.status == models.TripStatusEnum.COMPLETED
    ).all()

    result = []
    for trip in trips:
        fuel_cost = db.query(func.sum(models.FuelLog.cost)).filter(
            models.FuelLog.trip_id == trip.id
        ).scalar() or 0.0
        other_expenses = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.trip_id == trip.id
        ).scalar() or 0.0
        result.append({
            "trip_id": trip.id,
            "source": trip.source,
            "destination": trip.destination,
            "planned_distance_km": trip.planned_distance,
            "fuel_cost": round(fuel_cost, 2),
            "other_expenses": round(other_expenses, 2),
            "total_cost": round(fuel_cost + other_expenses, 2),
        })
    return result
