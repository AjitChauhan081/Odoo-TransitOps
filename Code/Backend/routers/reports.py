from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from fpdf import FPDF
from datetime import datetime, UTC
import os

from database import get_db
import models
from routers.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

class PDFReport(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 15)
        self.cell(0, 10, "TransitOps Fleet Report", border=False, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

@router.get("/export-pdf")
def export_pdf_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate a PDF report of fleet utilization and costs."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER, models.RoleEnum.FINANCIAL_ANALYST]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Fetch basic KPI data
    total_vehicles = db.query(models.Vehicle).count()
    available_vehicles = db.query(models.Vehicle).filter(models.Vehicle.status == models.VehicleStatusEnum.AVAILABLE).count()
    on_trip_vehicles = db.query(models.Vehicle).filter(models.Vehicle.status == models.VehicleStatusEnum.ON_TRIP).count()
    in_shop_vehicles = db.query(models.Vehicle).filter(models.Vehicle.status == models.VehicleStatusEnum.IN_SHOP).count()
    
    fleet_util = (on_trip_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0

    # Build PDF
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_font("helvetica", size=12)

    pdf.cell(0, 10, f"Generated: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "Fleet Summary", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", size=12)
    
    pdf.cell(0, 10, f"Total Vehicles: {total_vehicles}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f"Available: {available_vehicles}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f"On Trip: {on_trip_vehicles}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f"In Shop: {in_shop_vehicles}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f"Fleet Utilization: {fleet_util:.2f}%", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, "Recent Trips", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", size=10)
    
    recent_trips = db.query(models.Trip).order_by(models.Trip.id.desc()).limit(10).all()
    for trip in recent_trips:
        pdf.cell(0, 8, f"Trip #{trip.id}: {trip.source} -> {trip.destination} [{trip.status.value}]", new_x="LMARGIN", new_y="NEXT")

    file_path = os.path.join("uploads", "report.pdf")
    pdf.output(file_path)

    return FileResponse(path=file_path, filename="TransitOps_Report.pdf", media_type="application/pdf")
