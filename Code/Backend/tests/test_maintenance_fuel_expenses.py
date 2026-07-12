"""
test_maintenance_fuel_expenses.py — Tests for /maintenance, /fuel, /expenses
"""
from datetime import datetime


NOW = datetime.utcnow().isoformat()


class TestMaintenance:
    def test_create_maintenance_log(self, client, fleet_manager_token, sample_vehicle):
        resp = client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Oil change and brake inspection",
            "date": NOW,
            "cost": 5000.0,
            "status": "Active",
        }, headers=fleet_manager_token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["description"] == "Oil change and brake inspection"
        assert data["cost"] == 5000.0

    def test_creating_maintenance_sets_vehicle_in_shop(self, client, fleet_manager_token, sample_vehicle):
        client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Tyre replacement",
            "date": NOW,
            "cost": 8000.0,
        }, headers=fleet_manager_token)
        vehicle = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token).json()
        assert vehicle["status"] == "In Shop"

    def test_driver_cannot_create_maintenance_log(self, client, driver_token, sample_vehicle):
        resp = client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Engine fix",
            "date": NOW,
            "cost": 1000.0,
        }, headers=driver_token)
        assert resp.status_code == 403

    def test_list_maintenance_logs(self, client, fleet_manager_token, sample_vehicle):
        client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Brake fix",
            "date": NOW,
            "cost": 3000.0,
        }, headers=fleet_manager_token)
        resp = client.get("/maintenance/", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_filter_maintenance_by_vehicle(self, client, fleet_manager_token, sample_vehicle):
        client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Brake fix",
            "date": NOW,
            "cost": 3000.0,
        }, headers=fleet_manager_token)
        resp = client.get(f"/maintenance/?vehicle_id={sample_vehicle['id']}", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert all(m["vehicle_id"] == sample_vehicle["id"] for m in resp.json())

    def test_close_maintenance_sets_vehicle_available(self, client, fleet_manager_token, sample_vehicle):
        log = client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Full service",
            "date": NOW,
            "cost": 12000.0,
        }, headers=fleet_manager_token).json()

        resp = client.patch(f"/maintenance/{log['id']}/close", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["status"] == "Closed"

        vehicle = client.get(f"/vehicles/{sample_vehicle['id']}", headers=fleet_manager_token).json()
        assert vehicle["status"] == "Available"

    def test_close_already_closed_log_fails(self, client, fleet_manager_token, sample_vehicle):
        log = client.post("/maintenance/", json={
            "vehicle_id": sample_vehicle["id"],
            "description": "Minor fix",
            "date": NOW,
            "cost": 500.0,
        }, headers=fleet_manager_token).json()
        client.patch(f"/maintenance/{log['id']}/close", headers=fleet_manager_token)
        resp = client.patch(f"/maintenance/{log['id']}/close", headers=fleet_manager_token)
        assert resp.status_code == 400


class TestFuelLogs:
    def test_fleet_manager_can_log_fuel(self, client, fleet_manager_token, sample_vehicle):
        resp = client.post("/fuel/", json={
            "vehicle_id": sample_vehicle["id"],
            "liters": 80.0,
            "cost": 8000.0,
            "date": NOW,
        }, headers=fleet_manager_token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["liters"] == 80.0
        assert data["cost"] == 8000.0

    def test_driver_can_log_fuel(self, client, driver_token, sample_vehicle):
        resp = client.post("/fuel/", json={
            "vehicle_id": sample_vehicle["id"],
            "liters": 50.0,
            "cost": 5000.0,
            "date": NOW,
        }, headers=driver_token)
        assert resp.status_code == 201

    def test_safety_officer_cannot_log_fuel(self, client, safety_officer_token, sample_vehicle):
        resp = client.post("/fuel/", json={
            "vehicle_id": sample_vehicle["id"],
            "liters": 50.0,
            "cost": 5000.0,
            "date": NOW,
        }, headers=safety_officer_token)
        assert resp.status_code == 403

    def test_list_fuel_logs(self, client, fleet_manager_token, sample_vehicle):
        client.post("/fuel/", json={
            "vehicle_id": sample_vehicle["id"],
            "liters": 60.0,
            "cost": 6000.0,
            "date": NOW,
        }, headers=fleet_manager_token)
        resp = client.get("/fuel/", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_filter_fuel_by_vehicle(self, client, fleet_manager_token, sample_vehicle):
        client.post("/fuel/", json={
            "vehicle_id": sample_vehicle["id"],
            "liters": 70.0,
            "cost": 7000.0,
            "date": NOW,
        }, headers=fleet_manager_token)
        resp = client.get(f"/fuel/?vehicle_id={sample_vehicle['id']}", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert all(f["vehicle_id"] == sample_vehicle["id"] for f in resp.json())

    def test_delete_fuel_log(self, client, fleet_manager_token, sample_vehicle):
        fuel = client.post("/fuel/", json={
            "vehicle_id": sample_vehicle["id"],
            "liters": 40.0,
            "cost": 4000.0,
            "date": NOW,
        }, headers=fleet_manager_token).json()
        resp = client.delete(f"/fuel/{fuel['id']}", headers=fleet_manager_token)
        assert resp.status_code == 204

    def test_nonexistent_vehicle_fuel_log_fails(self, client, fleet_manager_token):
        resp = client.post("/fuel/", json={
            "vehicle_id": 9999,
            "liters": 40.0,
            "cost": 4000.0,
            "date": NOW,
        }, headers=fleet_manager_token)
        assert resp.status_code == 404


class TestExpenses:
    def test_fleet_manager_can_log_expense(self, client, fleet_manager_token, sample_vehicle):
        resp = client.post("/expenses/", json={
            "expense_type": "Toll",
            "amount": 250.0,
            "date": NOW,
            "vehicle_id": sample_vehicle["id"],
        }, headers=fleet_manager_token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["expense_type"] == "Toll"
        assert data["amount"] == 250.0

    def test_financial_analyst_can_log_expense(self, client, financial_analyst_token, sample_vehicle):
        resp = client.post("/expenses/", json={
            "expense_type": "Repair",
            "amount": 1500.0,
            "date": NOW,
            "vehicle_id": sample_vehicle["id"],
        }, headers=financial_analyst_token)
        assert resp.status_code == 201

    def test_driver_cannot_log_expense(self, client, driver_token, sample_vehicle):
        resp = client.post("/expenses/", json={
            "expense_type": "Toll",
            "amount": 100.0,
            "date": NOW,
            "vehicle_id": sample_vehicle["id"],
        }, headers=driver_token)
        assert resp.status_code == 403

    def test_list_expenses(self, client, fleet_manager_token, sample_vehicle):
        client.post("/expenses/", json={
            "expense_type": "Toll",
            "amount": 100.0,
            "date": NOW,
            "vehicle_id": sample_vehicle["id"],
        }, headers=fleet_manager_token)
        resp = client.get("/expenses/", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_filter_expenses_by_type(self, client, fleet_manager_token, sample_vehicle):
        client.post("/expenses/", json={
            "expense_type": "Toll",
            "amount": 100.0,
            "date": NOW,
            "vehicle_id": sample_vehicle["id"],
        }, headers=fleet_manager_token)
        resp = client.get("/expenses/?expense_type=Toll", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert all(e["expense_type"] == "Toll" for e in resp.json())

    def test_delete_expense(self, client, fleet_manager_token, sample_vehicle):
        expense = client.post("/expenses/", json={
            "expense_type": "Parking",
            "amount": 50.0,
            "date": NOW,
            "vehicle_id": sample_vehicle["id"],
        }, headers=fleet_manager_token).json()
        resp = client.delete(f"/expenses/{expense['id']}", headers=fleet_manager_token)
        assert resp.status_code == 204
