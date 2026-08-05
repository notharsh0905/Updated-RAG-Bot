import io
import pytest
from fastapi.testclient import TestClient
from app.api.api import app, create_session_token


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_headers():
    token = create_session_token()
    return {"Authorization": f"Bearer {token}"}


def test_admin_upload_success(admin_headers):
    file_content = b"Sample document text content for CSJMU B.Tech admission guidelines test."
    files = {
        "file": ("test_upload.txt", io.BytesIO(file_content), "text/plain")
    }
    data = {
        "category": "admissions"
    }

    with TestClient(app) as client:
        response = client.post("/admin/upload", headers=admin_headers, files=files, data=data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

        res = response.json()
        assert res["success"] is True
        assert res["filename"] == "test_upload.txt"
        assert res["chunks"] > 0
