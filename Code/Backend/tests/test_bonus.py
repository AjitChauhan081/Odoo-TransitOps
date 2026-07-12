import pytest
from fastapi.testclient import TestClient
import io

def test_pdf_generation(client: TestClient, fleet_manager_token: dict):
    headers = fleet_manager_token
    resp = client.get("/reports/export-pdf", headers=headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert len(resp.content) > 100 # Should contain some PDF bytes

def test_trigger_email_reminders(client: TestClient, fleet_manager_token: dict):
    headers = fleet_manager_token
    resp = client.post("/drivers/trigger-reminders?days=30", headers=headers)
    assert resp.status_code == 200
    assert "message" in resp.json()

def test_upload_vehicle_document(client: TestClient, fleet_manager_token: dict, sample_vehicle: dict):
    headers = fleet_manager_token
    
    # Create a dummy file
    file_content = b"fake pdf content"
    files = {"file": ("test_doc.pdf", file_content, "application/pdf")}
    data = {"document_type": "Insurance"}

    resp = client.post(f"/vehicles/{sample_vehicle['id']}/documents", headers=headers, data=data, files=files)
    assert resp.status_code == 201
    doc = resp.json()
    assert doc["document_type"] == "Insurance"
    assert doc["file_path"].startswith("uploads")
    
    # Verify download
    doc_id = doc["id"]
    dl_resp = client.get(f"/vehicles/{sample_vehicle['id']}/documents/{doc_id}/download", headers=headers)
    assert dl_resp.status_code == 200
    assert dl_resp.content == file_content

def test_vehicle_search(client: TestClient, fleet_manager_token: dict, sample_vehicle: dict):
    headers = fleet_manager_token
    resp = client.get("/vehicles/?search=Tata", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["id"] == sample_vehicle["id"]

    # Test sorting
    resp_sort = client.get("/vehicles/?sort_by=odometer&order=desc", headers=headers)
    assert resp_sort.status_code == 200
