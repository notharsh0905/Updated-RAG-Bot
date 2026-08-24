import io
import time
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


from unittest.mock import patch

def test_admin_upload_success(admin_headers):
    unique_id = str(int(time.time()))
    filename = f"test_upload_{unique_id}.txt"
    file_content = f"Sample document text content for CSJMU B.Tech admission guidelines test {unique_id}.".encode("utf-8")
    files = {
        "file": (filename, io.BytesIO(file_content), "text/plain")
    }
    data = {
        "category": "admissions"
    }

    with patch("langchain_chroma.Chroma.add_documents", return_value=["id_1"]):
        with TestClient(app) as client:
            response = client.post("/admin/upload", headers=admin_headers, files=files, data=data)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

            res = response.json()
            assert res["success"] is True
            assert res["filename"] == filename
            assert res["chunks"] > 0


