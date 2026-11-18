import unittest
from fastapi.testclient import TestClient
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main
from database import models as db_models

client = TestClient(main.app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_dispute_packet_unauthenticated():
    res = client.post("/profit-engine/generate-dispute-packet", json={"sku": "TEST-SKU"})
    assert res.status_code == 401

def test_buy_box_war_room_unauthenticated():
    res = client.post("/profit-engine/buy-box-war-room", json={"sku": "TEST-SKU"})
    assert res.status_code == 401

def test_price_simulator_valid():
    res = client.post("/profit-engine/price-simulator", json={
        "sku": "FAST-CHARGER-65W",
        "price_change_percent": 10.0
    })
    assert res.status_code == 200
    data = res.json()
    assert "projected_monthly_profit" in data
    assert "annualized_impact" in data
    assert data["sku"] == "FAST-CHARGER-65W"
