import unittest
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from fastapi.testclient import TestClient
from main import app
from auth import security

class BackendSmokeTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Generate valid mock JWT for auth-protected routes
        cls.token = security.create_access_token(data={"sub": "founder@company.com"})
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    def test_health_endpoint(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertIn("DuckDB", data.get("engine", ""))

    def test_marketplace_connectors_status(self):
        res = self.client.get("/ecommerce/connectors/status", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("amazon", data)
        self.assertIn("flipkart", data)

    def test_amazon_settlement_sync(self):
        res = self.client.post("/ecommerce/connectors/amazon/sync", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "synced")
        self.assertIn("gross_gmv", data)
        self.assertIn("fee_leakage", data)

if __name__ == "__main__":
    unittest.main()
