import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def test_user_id():
    return "test-user-123"
