from fastapi.testclient import TestClient
from fastapi import status
from app import app

client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "hello world"}


def test_next_day_delivery_success():
    response = client.get("/admin/next-day-delivery", json={"date": "2023-07-04"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "data": [{"user": {"wing": "b", "houseno": 1609}, "milks": [1]}]
    }


def test_next_day_delivery_error():
    response = client.get("/admin/next-day-delivery", json={"date": "04-07-2023"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"detail": {"message": "Invalid date"}}
