"""
Test Suite for Brain MRI Validation & OOD Screening
===================================================
Tests both Brain MRI scans and unrelated non-MRI images:
- Real Brain MRI scans (web/src/assets/mri_scan_1..4.jpg)
- Synthetic Brain MRI scan
- Color natural images (cat/dog/landscape)
- Document / bright invoice image
- Empty black / blank image
- Low resolution image
"""

import sys
import os
import unittest
import numpy as np
from PIL import Image, ImageDraw

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from validator import BrainMRIValidator

class TestBrainMRIValidator(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.validator = BrainMRIValidator()

    def create_synthetic_brain_mri(self, size=(256, 256)):
        """Creates a realistic synthetic brain MRI (dark background, skull contour, grayscale brain tissue)."""
        w, h = size
        img = Image.new("RGB", (w, h), color=(0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Draw outer skull contour
        margin_x = int(w * 0.15)
        margin_y = int(h * 0.12)
        draw.ellipse([margin_x, margin_y, w - margin_x, h - margin_y], fill=(45, 45, 45), outline=(120, 120, 120), width=3)

        # Draw brain parenchyma tissue
        inner_mx = int(w * 0.18)
        inner_my = int(h * 0.15)
        draw.ellipse([inner_mx, inner_my, w - inner_mx, h - inner_my], fill=(130, 130, 130))

        # Add ventricles / internal tissue variations
        cx, cy = w // 2, h // 2
        draw.ellipse([cx - 15, cy - 25, cx - 2, cy + 25], fill=(20, 20, 20))
        draw.ellipse([cx + 2, cy - 25, cx + 15, cy + 25], fill=(20, 20, 20))
        return img

    def create_color_cat_landscape_image(self, size=(256, 256)):
        """Creates a colorful natural scene/cat-like image with high channel divergence."""
        w, h = size
        arr = np.zeros((h, w, 3), dtype=np.uint8)
        # Blue sky top
        arr[:h//2, :, 0] = 60
        arr[:h//2, :, 1] = 140
        arr[:h//2, :, 2] = 230
        # Green grass bottom
        arr[h//2:, :, 0] = 34
        arr[h//2:, :, 1] = 180
        arr[h//2:, :, 2] = 45
        # Red/Orange center object
        arr[h//3:2*h//3, w//3:2*w//3, 0] = 220
        arr[h//3:2*h//3, w//3:2*w//3, 1] = 80
        arr[h//3:2*h//3, w//3:2*w//3, 2] = 30
        return Image.fromarray(arr)

    def create_document_or_blank_image(self, size=(256, 256)):
        """Creates a white document / invoice / screenshot."""
        img = Image.new("RGB", size, color=(250, 250, 250))
        draw = ImageDraw.Draw(img)
        for y in range(40, 200, 20):
            draw.line([30, y, 220, y], fill=(40, 40, 40), width=2)
        return img

    def create_empty_black_image(self, size=(256, 256)):
        """Creates an entirely black image."""
        return Image.new("RGB", size, color=(0, 0, 0))

    def test_real_brain_mri_assets_pass_validation(self):
        """Tests that all real brain MRI scans in the project pass validation."""
        assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "src", "assets"))
        mri_files = ["mri_scan_1.jpg", "mri_scan_2.jpg", "mri_scan_3.jpg", "mri_scan_4.jpg"]
        for f in mri_files:
            path = os.path.join(assets_dir, f)
            if os.path.exists(path):
                img = Image.open(path)
                result = self.validator.validate(img)
                print(f"[Real MRI {f}] is_valid: {result['is_valid']}, code: {result['validation_code']}")
                self.assertTrue(result["is_valid"], f"Real MRI {f} failed validation: {result['reason']}")

    def test_synthetic_mri_passes_validation(self):
        mri = self.create_synthetic_brain_mri()
        result = self.validator.validate(mri)
        print(f"[Synthetic MRI] is_valid: {result['is_valid']}, code: {result['validation_code']}")
        self.assertTrue(result["is_valid"], f"Synthetic Brain MRI should be valid, failed: {result['reason']}")

    def test_colorful_natural_image_rejected(self):
        cat_img = self.create_color_cat_landscape_image()
        result = self.validator.validate(cat_img)
        print(f"[Color Image] is_valid: {result['is_valid']}, code: {result['validation_code']}")
        self.assertFalse(result["is_valid"], "Colorful natural image must be rejected")
        self.assertIn("Please upload a valid brain MRI image", result["reason"])

    def test_document_image_rejected(self):
        doc_img = self.create_document_or_blank_image()
        result = self.validator.validate(doc_img)
        print(f"[Document] is_valid: {result['is_valid']}, code: {result['validation_code']}")
        self.assertFalse(result["is_valid"], "Document/bright image must be rejected")
        self.assertIn("Please upload a valid brain MRI image", result["reason"])

    def test_empty_black_image_rejected(self):
        black_img = self.create_empty_black_image()
        result = self.validator.validate(black_img)
        print(f"[Empty Black] is_valid: {result['is_valid']}, code: {result['validation_code']}")
        self.assertFalse(result["is_valid"], "Empty black image must be rejected for lack of brain structure")
        self.assertIn("Please upload a valid brain MRI image", result["reason"])

    def test_tiny_resolution_rejected(self):
        tiny_img = Image.new("RGB", (32, 32), color=(0, 0, 0))
        result = self.validator.validate(tiny_img)
        self.assertFalse(result["is_valid"])
        self.assertEqual(result["validation_code"], "FAILED_RESOLUTION_TOO_LOW")

if __name__ == "__main__":
    unittest.main()
