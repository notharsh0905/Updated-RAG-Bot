"""
Unit and API integration tests for Student Inquiry Management System.
"""

import pytest
from fastapi.testclient import TestClient
from app.api.api import app, create_session_token
from app.analytics.database import db_manager


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_headers():
    token = create_session_token()
    return {"Authorization": f"Bearer {token}"}


def test_create_inquiry_success(client):
    payload = {
        "name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "category": "B.Tech Admissions 2026-27",
        "message": "I would like to inquire about the physical reporting procedure and fee payment schedule for UIET Kanpur."
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["reference_id"].startswith("CSJMU-2026-")


def test_create_inquiry_validation_short_message(client):
    payload = {
        "name": "Short Msg Student",
        "email": "student@example.com",
        "category": "General",
        "message": "Too short"  # Under 20 chars
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 422


def test_create_inquiry_invalid_email(client):
    payload = {
        "name": "Invalid Email Student",
        "email": "not-an-email",
        "category": "General",
        "message": "This is a valid long inquiry message with over twenty characters."
    }
    response = client.post("/api/v1/inquiries", json=payload)
    assert response.status_code == 422


def test_admin_get_inquiries_unauthorized(client):
    response = client.get("/api/v1/admin/inquiries")
    assert response.status_code == 401


def test_admin_inquiries_lifecycle(client, admin_headers):
    # 1. Submit Inquiry
    payload = {
        "name": "Lifecycle Student",
        "email": "lifecycle@example.com",
        "category": "Hostel & Mess Services",
        "message": "Requesting information about hostel allotment procedures for first year students."
    }
    res = client.post("/api/v1/inquiries", json=payload)
    assert res.status_code == 200
    ref_id = res.json()["reference_id"]

    # 2. Get Admin Inquiries
    res_get = client.get("/api/v1/admin/inquiries", headers=admin_headers)
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["success"] is True
    assert len(data["inquiries"]) > 0
    target = next((i for i in data["inquiries"] if i["reference_id"] == ref_id), None)
    assert target is not None
    inquiry_id = target["id"]
    assert target["status"] == "Pending"

    # 3. Patch Status -> In Progress
    res_patch = client.patch(
        f"/api/v1/admin/inquiries/{inquiry_id}",
        json={"status": "In Progress"},
        headers=admin_headers
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["inquiry"]["status"] == "In Progress"

    # 4. Delete Inquiry
    res_del = client.delete(f"/api/v1/admin/inquiries/{inquiry_id}", headers=admin_headers)
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True
