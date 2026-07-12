from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, UTC
import shutil
import os

from database import get_db
import models
import schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicle Documents"])

UPLOAD_DIR = "uploads"

@router.post("/{vehicle_id}/documents", response_model=schemas.VehicleDocument, status_code=status.HTTP_201_CREATED)
def upload_vehicle_document(
    vehicle_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Upload a document for a specific vehicle. Fleet Manager only."""
    if current_user.role not in [models.RoleEnum.FLEET_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
    safe_filename = f"{vehicle_id}_{datetime.now(UTC).timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_document = models.VehicleDocument(
        vehicle_id=vehicle_id,
        document_type=document_type,
        file_path=file_path,
        uploaded_at=datetime.now(UTC)
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.get("/{vehicle_id}/documents", response_model=List[schemas.VehicleDocument])
def get_vehicle_documents(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all documents for a vehicle."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return vehicle.documents

@router.get("/{vehicle_id}/documents/{document_id}/download")
def download_vehicle_document(
    vehicle_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Download a specific vehicle document."""
    document = db.query(models.VehicleDocument).filter(
        models.VehicleDocument.id == document_id,
        models.VehicleDocument.vehicle_id == vehicle_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File missing on server")

    return FileResponse(path=document.file_path, filename=os.path.basename(document.file_path))
