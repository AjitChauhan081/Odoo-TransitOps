"""
test_dashboard.py — Tests for /dashboard analytics endpoints
"""
from datetime import datetime

NOW = datetime.utcnow().isoformat()


class TestDashboardSummary:
    def test_summary_returns_correct_structure(self, client, fleet_manager_token):
        resp = client.get("/dashboard/summary", headers=fleet_manager_token)
        assert resp.status_code == 200
        data = resp.json()
        assert "vehicles" in data
        assert "drivers" in data
        assert "trips" in data
        assert "finances" in data
        assert "alerts" in data

    def test_summary_vehicle_count(self, client, fleet_manager_token, sample_vehicle):
        resp = client.get("/dashboard/summary", headers=fleet_manager_token)
        data = resp.json()
        assert data["vehicles"]["total"] == 1

    def test_summary_financial_keys(self, client, fleet_manager_token):
        resp = client.get("/dashboard/summary", headers=fleet_manager_token)
        finances = resp.json()["finances"]
        assert "total_fuel_cost" in finances
        assert "total_maintenance_cost" in finances
        assert "total_operational_cost" in finances

    def test_summary_alerts_keys(self, client, fleet_manager_token):
        resp = client.get("/dashboard/summary", headers=fleet_manager_token)
        alerts = resp.json()["alerts"]
        assert "active_maintenance_jobs" in alerts
        assert "drivers_with_low_safety_score" in alerts

    def test_unauthenticated_cannot_access_dashboard(self, client):
        resp = client.get("/dashboard/summary")
        assert resp.status_code == 401


class TestFleetUtilization:
    def test_utilization_returns_correct_structure(self, client, fleet_manager_token):
        resp = client.get("/dashboard/fleet-utilization", headers=fleet_manager_token)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_vehicles" in data
        assert "on_trip" in data
        assert "in_shop" in data
        assert "available" in data
        assert "utilization_rate_percent" in data

    def test_utilization_with_no_vehicles(self, client, fleet_manager_token):
        resp = client.get("/dashboard/fleet-utilization", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["utilization_rate_percent"] == 0.0

    def test_utilization_updates_after_dispatch(self, client, fleet_manager_token, sample_trip):
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        resp = client.get("/dashboard/fleet-utilization", headers=fleet_manager_token)
        data = resp.json()
        assert data["on_trip"] == 1
        assert data["utilization_rate_percent"] == 100.0


class TestCostPerTrip:
    def test_cost_per_trip_returns_list(self, client, fleet_manager_token):
        resp = client.get("/dashboard/cost-per-trip", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_cost_per_trip_shows_completed_trips(self, client, fleet_manager_token, sample_trip, sample_vehicle):
        # Dispatch then complete trip
        client.patch(f"/trips/{sample_trip['id']}/dispatch", headers=fleet_manager_token)
        client.patch(f"/trips/{sample_trip['id']}/complete", json={
            "final_odometer": 16000.0,
            "fuel_consumed": 45.0,
            "fuel_cost": 4500.0,
        }, headers=fleet_manager_token)

        resp = client.get("/dashboard/cost-per-trip", headers=fleet_manager_token)
        assert resp.status_code == 200
        trips = resp.json()
        assert len(trips) == 1
        assert trips[0]["trip_id"] == sample_trip["id"]
        assert "total_cost" in trips[0]
        assert "fuel_cost" in trips[0]
