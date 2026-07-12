"""
test_drivers.py — Tests for /drivers endpoints
"""

DRIVER_PAYLOAD = {
    "name": "Ramesh Kumar",
    "license_number": "DL-1420110012345",
    "license_category": "HMV",
    "license_expiry_date": "2027-12-31",
    "contact_number": "9876543210",
    "safety_score": 95.0,
    "status": "Available",
}


class TestCreateDriver:
    def test_fleet_manager_can_create_driver(self, client, fleet_manager_token):
        resp = client.post("/drivers/", json=DRIVER_PAYLOAD, headers=fleet_manager_token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Ramesh Kumar"
        assert data["safety_score"] == 95.0
        assert "id" in data

    def test_driver_cannot_create_driver(self, client, driver_token):
        resp = client.post("/drivers/", json=DRIVER_PAYLOAD, headers=driver_token)
        assert resp.status_code == 403

    def test_unauthenticated_cannot_create_driver(self, client):
        resp = client.post("/drivers/", json=DRIVER_PAYLOAD)
        assert resp.status_code == 401

    def test_duplicate_license_number_fails(self, client, fleet_manager_token):
        client.post("/drivers/", json=DRIVER_PAYLOAD, headers=fleet_manager_token)
        resp = client.post("/drivers/", json=DRIVER_PAYLOAD, headers=fleet_manager_token)
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"]


class TestListDrivers:
    def test_list_drivers_returns_all(self, client, fleet_manager_token):
        client.post("/drivers/", json=DRIVER_PAYLOAD, headers=fleet_manager_token)
        resp = client.get("/drivers/", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_filter_drivers_by_status(self, client, fleet_manager_token):
        client.post("/drivers/", json=DRIVER_PAYLOAD, headers=fleet_manager_token)
        resp = client.get("/drivers/?status=Available", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert all(d["status"] == "Available" for d in resp.json())


class TestGetDriver:
    def test_get_existing_driver(self, client, fleet_manager_token, sample_driver):
        resp = client.get(f"/drivers/{sample_driver['id']}", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["id"] == sample_driver["id"]

    def test_get_nonexistent_driver_returns_404(self, client, fleet_manager_token):
        resp = client.get("/drivers/9999", headers=fleet_manager_token)
        assert resp.status_code == 404


class TestUpdateDriver:
    def test_fleet_manager_can_update_driver(self, client, fleet_manager_token, sample_driver):
        resp = client.put(
            f"/drivers/{sample_driver['id']}",
            json={"name": "Suresh Kumar", "contact_number": "1234567890"},
            headers=fleet_manager_token,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Suresh Kumar"

    def test_driver_cannot_update_other_driver(self, client, driver_token, sample_driver):
        resp = client.put(
            f"/drivers/{sample_driver['id']}",
            json={"name": "Hacked"},
            headers=driver_token,
        )
        assert resp.status_code == 403


class TestUpdateDriverStatus:
    def test_safety_officer_can_update_status(self, client, safety_officer_token, sample_driver):
        resp = client.patch(
            f"/drivers/{sample_driver['id']}/status",
            json={"status": "Suspended"},
            headers=safety_officer_token,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Suspended"

    def test_fleet_manager_can_update_status(self, client, fleet_manager_token, sample_driver):
        resp = client.patch(
            f"/drivers/{sample_driver['id']}/status",
            json={"status": "Off Duty"},
            headers=fleet_manager_token,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Off Duty"

    def test_driver_cannot_update_own_status(self, client, driver_token, sample_driver):
        resp = client.patch(
            f"/drivers/{sample_driver['id']}/status",
            json={"status": "Available"},
            headers=driver_token,
        )
        assert resp.status_code == 403


class TestUpdateSafetyScore:
    def test_safety_officer_can_update_score(self, client, safety_officer_token, sample_driver):
        resp = client.patch(
            f"/drivers/{sample_driver['id']}/safety-score",
            json={"safety_score": 75.0},
            headers=safety_officer_token,
        )
        assert resp.status_code == 200
        assert resp.json()["safety_score"] == 75.0

    def test_invalid_safety_score_above_100_fails(self, client, safety_officer_token, sample_driver):
        resp = client.patch(
            f"/drivers/{sample_driver['id']}/safety-score",
            json={"safety_score": 150.0},
            headers=safety_officer_token,
        )
        assert resp.status_code == 400

    def test_invalid_safety_score_below_0_fails(self, client, safety_officer_token, sample_driver):
        resp = client.patch(
            f"/drivers/{sample_driver['id']}/safety-score",
            json={"safety_score": -5.0},
            headers=safety_officer_token,
        )
        assert resp.status_code == 400


class TestExpiringLicenses:
    def test_expiring_licenses_endpoint(self, client, fleet_manager_token):
        # Add a driver with a license expiring very soon
        client.post("/drivers/", json={
            **DRIVER_PAYLOAD,
            "license_expiry_date": "2026-07-20",  # within 30 days
        }, headers=fleet_manager_token)
        resp = client.get("/drivers/expiring-licenses?days=30", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestDeleteDriver:
    def test_fleet_manager_can_delete_driver(self, client, fleet_manager_token, sample_driver):
        resp = client.delete(f"/drivers/{sample_driver['id']}", headers=fleet_manager_token)
        assert resp.status_code == 204

    def test_delete_nonexistent_driver_returns_404(self, client, fleet_manager_token):
        resp = client.delete("/drivers/9999", headers=fleet_manager_token)
        assert resp.status_code == 404
