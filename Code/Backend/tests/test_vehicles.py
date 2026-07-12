"""
test_vehicles.py — Tests for /vehicles endpoints
"""
import pytest


VEHICLE_PAYLOAD = {
    "registration_number": "MH-01-AB-1234",
    "name_model": "Tata Prima 4028.S",
    "vehicle_type": "Heavy Truck",
    "max_load_capacity": 25000.0,
    "odometer": 15000.0,
    "acquisition_cost": 3500000.0,
    "status": "Available",
}


class TestCreateVehicle:
    def test_fleet_manager_can_create_vehicle(self, client, fleet_manager_token):
        resp = client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=fleet_manager_token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["registration_number"] == "MH-01-AB-1234"
        assert data["status"] == "Available"
        assert "id" in data

    def test_driver_cannot_create_vehicle(self, client, driver_token):
        resp = client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=driver_token)
        assert resp.status_code == 403

    def test_unauthenticated_cannot_create_vehicle(self, client):
        resp = client.post("/vehicles/", json=VEHICLE_PAYLOAD)
        assert resp.status_code == 401

    def test_duplicate_registration_number_fails(self, client, fleet_manager_token):
        client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=fleet_manager_token)
        resp = client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=fleet_manager_token)
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"]


class TestListVehicles:
    def test_list_vehicles_returns_all(self, client, fleet_manager_token):
        client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=fleet_manager_token)
        resp = client.get("/vehicles/", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_filter_by_status(self, client, fleet_manager_token):
        client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=fleet_manager_token)
        resp = client.get("/vehicles/?status=Available", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert all(v["status"] == "Available" for v in resp.json())

    def test_filter_by_nonexistent_status_returns_empty(self, client, fleet_manager_token):
        client.post("/vehicles/", json=VEHICLE_PAYLOAD, headers=fleet_manager_token)
        resp = client.get("/vehicles/?status=Retired", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json() == []


class TestGetVehicle:
    def test_get_existing_vehicle(self, client, fleet_manager_token, sample_vehicle):
        resp = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["id"] == sample_vehicle["id"]

    def test_get_nonexistent_vehicle_returns_404(self, client, fleet_manager_token):
        resp = client.get("/vehicles/9999", headers=fleet_manager_token)
        assert resp.status_code == 404


class TestUpdateVehicle:
    def test_fleet_manager_can_update_vehicle(self, client, fleet_manager_token, sample_vehicle):
        resp = client.put(
            f"/vehicles/{sample_vehicle['id']}",
            json={"name_model": "Updated Model", "max_load_capacity": 30000.0},
            headers=fleet_manager_token,
        )
        assert resp.status_code == 200
        assert resp.json()["name_model"] == "Updated Model"
        assert resp.json()["max_load_capacity"] == 30000.0

    def test_driver_cannot_update_vehicle(self, client, driver_token, sample_vehicle):
        resp = client.put(
            f"/vehicles/{sample_vehicle['id']}",
            json={"name_model": "Hacked"},
            headers=driver_token,
        )
        assert resp.status_code == 403


class TestUpdateVehicleStatus:
    def test_update_status_to_in_shop(self, client, fleet_manager_token, sample_vehicle):
        resp = client.patch(
            f"/vehicles/{sample_vehicle['id']}/status",
            json={"status": "In Shop"},
            headers=fleet_manager_token,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "In Shop"


class TestDeleteVehicle:
    def test_fleet_manager_can_delete_available_vehicle(self, client, fleet_manager_token, sample_vehicle):
        resp = client.delete(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token)
        assert resp.status_code == 204

    def test_delete_nonexistent_vehicle_returns_404(self, client, fleet_manager_token):
        resp = client.delete("/vehicles/9999", headers=fleet_manager_token)
        assert resp.status_code == 404

    def test_driver_cannot_delete_vehicle(self, client, driver_token, sample_vehicle):
        resp = client.delete(f"/vehicles/{sample_vehicle['id']}", headers=driver_token)
        assert resp.status_code == 403


class TestVehicleSubRoutes:
    def test_get_vehicle_trips(self, client, fleet_manager_token, sample_vehicle):
        resp = client.get(f"/vehicles/{sample_vehicle['id']}/trips", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_vehicle_maintenance(self, client, fleet_manager_token, sample_vehicle):
        resp = client.get(f"/vehicles/{sample_vehicle['id']}/maintenance", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
