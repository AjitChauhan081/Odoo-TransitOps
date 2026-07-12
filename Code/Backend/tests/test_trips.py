"""
test_trips.py — Tests for /trips endpoints (full lifecycle)
"""


class TestCreateTrip:
    def test_create_draft_trip(self, client, fleet_manager_token, sample_vehicle, sample_driver):
        resp = client.post("/trips/", json={
            "source": "Mumbai",
            "destination": "Pune",
            "vehicle_id": sample_vehicle["id"],
            "driver_id": sample_driver["id"],
            "cargo_weight": 10000.0,
            "planned_distance": 150.0,
        }, headers=fleet_manager_token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "Draft"
        assert data["source"] == "Mumbai"

    def test_driver_cannot_create_trip(self, client, driver_token, sample_vehicle, sample_driver):
        resp = client.post("/trips/", json={
            "source": "Mumbai",
            "destination": "Pune",
            "vehicle_id": sample_vehicle["id"],
            "driver_id": sample_driver["id"],
            "cargo_weight": 10000.0,
            "planned_distance": 150.0,
        }, headers=driver_token)
        assert resp.status_code == 403

    def test_cargo_exceeding_vehicle_capacity_fails(self, client, fleet_manager_token, sample_vehicle, sample_driver):
        """Vehicle capacity is 25000 kg; cargo of 99999 should fail."""
        resp = client.post("/trips/", json={
            "source": "Mumbai",
            "destination": "Delhi",
            "vehicle_id": sample_vehicle["id"],
            "driver_id": sample_driver["id"],
            "cargo_weight": 99999.0,  # exceeds 25000 kg limit
            "planned_distance": 1400.0,
        }, headers=fleet_manager_token)
        assert resp.status_code == 400
        assert "capacity" in resp.json()["detail"].lower()

    def test_nonexistent_vehicle_fails(self, client, fleet_manager_token, sample_driver):
        resp = client.post("/trips/", json={
            "source": "A",
            "destination": "B",
            "vehicle_id": 9999,
            "driver_id": sample_driver["id"],
            "cargo_weight": 100.0,
            "planned_distance": 50.0,
        }, headers=fleet_manager_token)
        assert resp.status_code == 404

    def test_nonexistent_driver_fails(self, client, fleet_manager_token, sample_vehicle):
        resp = client.post("/trips/", json={
            "source": "A",
            "destination": "B",
            "vehicle_id": sample_vehicle["id"],
            "driver_id": 9999,
            "cargo_weight": 100.0,
            "planned_distance": 50.0,
        }, headers=fleet_manager_token)
        assert resp.status_code == 404


class TestListTrips:
    def test_list_all_trips(self, client, fleet_manager_token, sample_trip):
        resp = client.get("/trips/", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_filter_trips_by_status(self, client, fleet_manager_token, sample_trip):
        resp = client.get("/trips/?status=Draft", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert all(t["status"] == "Draft" for t in resp.json())


class TestGetTrip:
    def test_get_existing_trip(self, client, fleet_manager_token, sample_trip):
        resp = client.get(f"/trips/{sample_trip['id']}", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["id"] == sample_trip["id"]

    def test_get_nonexistent_trip_returns_404(self, client, fleet_manager_token):
        resp = client.get("/trips/9999", headers=fleet_manager_token)
        assert resp.status_code == 404


class TestDispatchTrip:
    def test_dispatch_draft_trip_succeeds(self, client, fleet_manager_token, sample_trip):
        resp = client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Dispatched"

    def test_dispatch_marks_vehicle_on_trip(self, client, fleet_manager_token, sample_trip, sample_vehicle):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        vehicle = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token).json()
        assert vehicle["status"] == "On Trip"

    def test_dispatch_marks_driver_on_trip(self, client, fleet_manager_token, sample_trip, sample_driver):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        driver = client.get(f"/drivers/{sample_driver['id']}", headers=fleet_manager_token).json()
        assert driver["status"] == "On Trip"

    def test_dispatch_already_dispatched_trip_fails(self, client, fleet_manager_token, sample_trip):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        resp = client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        assert resp.status_code == 400

    def test_driver_cannot_dispatch_trip(self, client, driver_token, sample_trip):
        resp = client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=driver_token)
        assert resp.status_code == 403


class TestCompleteTrip:
    def test_complete_dispatched_trip(self, client, fleet_manager_token, sample_trip, sample_vehicle, sample_driver):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        resp = client.patch(f"/trips/{sample_trip['id']}/complete", json={
            "final_odometer": 16000.0,
            "fuel_consumed": 45.0,
            "fuel_cost": 4500.0,
        }, headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Completed"
        assert resp.json()["final_odometer"] == 16000.0

    def test_complete_updates_vehicle_odometer(self, client, fleet_manager_token, sample_trip, sample_vehicle):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        client.patch(f"/trips/{sample_trip['id']}/complete", json={
            "final_odometer": 16000.0,
        }, headers=fleet_manager_token)
        vehicle = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token).json()
        assert vehicle["odometer"] == 16000.0

    def test_complete_frees_vehicle_and_driver(self, client, fleet_manager_token, sample_trip, sample_vehicle, sample_driver):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        client.patch(f"/trips/{sample_trip['id']}/complete", json={
            "final_odometer": 16000.0,
        }, headers=fleet_manager_token)
        vehicle = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token).json()
        driver = client.get(f"/drivers/{sample_driver['id']}", headers=fleet_manager_token).json()
        assert vehicle["status"] == "Available"
        assert driver["status"] == "Available"

    def test_complete_draft_trip_fails(self, client, fleet_manager_token, sample_trip):
        """Cannot complete a trip that was never dispatched."""
        resp = client.patch(f"/trips/{sample_trip['id']}/complete", json={
            "final_odometer": 16000.0,
        }, headers=fleet_manager_token)
        assert resp.status_code == 400


class TestCancelTrip:
    def test_cancel_draft_trip(self, client, fleet_manager_token, sample_trip):
        resp = client.patch(f"/trips/{sample_trip['id']}/cancel", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Cancelled"

    def test_cancel_dispatched_trip_frees_resources(self, client, fleet_manager_token, sample_trip, sample_vehicle, sample_driver):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        client.patch(f"/trips/{sample_trip['id']}/cancel", headers=fleet_manager_token)
        vehicle = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token).json()
        driver = client.get(f"/drivers/{sample_driver['id']}", headers=fleet_manager_token).json()
        assert vehicle["status"] == "Available"
        assert driver["status"] == "Available"

    def test_cancel_completed_trip_fails(self, client, fleet_manager_token, sample_trip):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        client.patch(f"/trips/{sample_trip['id']}/complete", json={"final_odometer": 16000.0}, headers=fleet_manager_token)
        resp = client.patch(f"/trips/{sample_trip['id']}/cancel", headers=fleet_manager_token)
        assert resp.status_code == 400

    def test_driver_cannot_cancel_trip(self, client, driver_token, sample_trip):
        resp = client.patch(f"/trips/{sample_trip['id']}/cancel", headers=driver_token)
        assert resp.status_code == 403
