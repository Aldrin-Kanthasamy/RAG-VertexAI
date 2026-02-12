from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
def mock_firebase():
    with patch("app.core.firebase_client.initialize_firebase"):
        yield


@pytest.mark.asyncio
async def test_health_check(mock_firebase):
    from app.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
