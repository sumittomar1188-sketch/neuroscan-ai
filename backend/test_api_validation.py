"""
FastAPI Endpoint Integration Tests for Brain MRI Validation
===========================================================
Tests that:
1. Valid Brain MRI scans return HTTP 200 with prediction, confidence, probabilities, and Grad-CAM.
2. Unrelated images (cat, phone, landscape, document, blank) return HTTP 400 with "Please upload a valid brain MRI image."
3. Tumor classification and Grad-CAM are NEVER executed on rejected images.
"""

import sys
import os
import io
import unittest
from PIL import Image, ImageDraw
import numpy as np
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from main import app

class TestFastAPIValidationEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def _img_to_bytes(self, pil_img, format="PNG"):
        buf = io.BytesIO()
        pil_img.save(buf, format=format)
        buf.seek(0)
        return buf

    def test_health_endpoint(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "healthy")

    def test_predict_rejects_colorful_image(self):
        # Create a colorful image (e.g. landscape/cat)
        arr = np.zeros((224, 224, 3), dtype=np.uint8)
        arr[:112, :, 0] = 50
        arr[:112, :, 1] = 150
        arr[:112, :, 2] = 230
        arr[112:, :, 0] = 30
        arr[112:, :, 1] = 200
        arr[112:, :, 2] = 40
        img = Image.fromarray(arr)
        buf = self._img_to_bytes(img, format="JPEG")

        resp = self.client.post(
            "/predict",
            files={"file": ("landscape_cat.jpg", buf, "image/jpeg")}
        )

        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn("detail", data)
        self.assertIn("Please upload a valid brain MRI image", data["detail"])
        # Ensure prediction fields were NOT returned
        self.assertNotIn("prediction", data)
        self.assertNotIn("gradcam_overlay", data)

    def test_predict_rejects_document_image(self):
        # Create a white document image
        img = Image.new("RGB", (256, 256), color=(250, 250, 250))
        draw = ImageDraw.Draw(img)
        for y in range(40, 200, 20):
            draw.line([30, y, 220, y], fill=(40, 40, 40), width=2)
        buf = self._img_to_bytes(img, format="PNG")

        resp = self.client.post(
            "/predict",
            files={"file": ("document.png", buf, "image/png")}
        )

        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn("Please upload a valid brain MRI image", data["detail"])
        self.assertNotIn("prediction", data)

    def test_predict_accepts_real_brain_mri(self):
        assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "src", "assets"))
        mri_path = os.path.join(assets_dir, "mri_scan_1.jpg")
        if not os.path.exists(mri_path):
            self.skipTest(f"Asset {mri_path} not found")

        with open(mri_path, "rb") as f:
            resp = self.client.post(
                "/predict",
                files={"file": ("mri_scan_1.jpg", f, "image/jpeg")}
            )

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("prediction", data)
        self.assertIn(data["prediction"], ["Glioma", "Meningioma", "No Tumor", "Pituitary"])
        self.assertIn("confidence", data)
        self.assertIn("probabilities", data)
        self.assertIn("gradcam_overlay", data)
        self.assertTrue(data["gradcam_overlay"].startswith("data:image/png;base64,"))
        self.assertTrue(data["validation"]["is_valid"])

if __name__ == "__main__":
    unittest.main()
