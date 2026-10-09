"""
Brain MRI Input Validation Module for NeuroScan AI
=================================================
This module provides a multi-signal validation stage to prevent non-brain-MRI images
(e.g., cats, dogs, cellular phones, landscapes, screenshots, everyday objects)
from reaching the downstream ResNet50 brain tumor classification network.

Educational Research Prototype Architecture:
1. Format & Integrity Verification (Valid image tensor, min resolution 64x64).
2. Radiometric & Spectral Monochromatic Consistency (Brain MRIs are single-channel grayscale acquisitions).
3. Spatial Anatomical Background Margin & Cranial Envelope Consistency (Dark outer air background with centered intracranial tissue).
4. Semantic Out-of-Distribution (OOD) Screening via Pre-trained Foundation Vision Model (ImageNet MobileNetV2 for detecting everyday animals, electronics, vehicles, landscapes, etc.).
5. Dedicated Binary MRI Classifier Hook (Pluggable support for fine-tuned binary weights if available).
"""

import os
import io
from typing import Dict, Any, Tuple, Optional, Set
from PIL import Image
import numpy as np
import tensorflow as tf

# Set of prominent everyday semantic categories from ImageNet
# These categories represent clear non-medical everyday objects/creatures/scenes
EVERYDAY_SEMANTIC_KEYWORDS = {
    # Animals / Pets
    "cat", "dog", "kitten", "puppy", "tabby", "persian", "siamese", "egyptian_cat",
    "terrier", "retriever", "hound", "shepherd", "spitz", "mastiff", "bulldog",
    "bird", "robin", "finch", "jay", "eagle", "parrot", "peacock",
    "bear", "lion", "tiger", "cheetah", "leopard", "elephant", "zebra", "horse", "cow", "sheep",
    "snake", "lizard", "frog", "toad", "fish", "shark", "whale", "spider", "butterfly",
    # Consumer electronics / Devices
    "cellular_telephone", "cellphone", "mobile", "telephone", "dial_telephone",
    "laptop", "notebook", "desktop_computer", "computer_keyboard", "mouse", "monitor",
    "television", "screen", "ipod", "radio", "loudspeaker", "camera", "remote_control",
    # Vehicles / Transport
    "car", "sports_car", "cab", "minivan", "convertible", "jeep", "limousine",
    "motorcycle", "bicycle", "tricycle", "scooter", "bus", "truck", "trailer",
    "airplane", "airliner", "helicopter", "space_shuttle", "speedboat", "canoe", "submarine",
    # Nature / Landscapes / Architecture
    "alp", "mountain", "valley", "cliff", "promontory", "seashore", "lakeside",
    "sandbar", "coral_reef", "volcano", "fountain", "bridge", "pier", "castle",
    "church", "mosque", "palace", "barn", "greenhouse", "lighthouse",
    # Food & Household Items
    "pizza", "hamburger", "hotdog", "bagel", "pretzel", "banana", "orange", "apple",
    "strawberry", "broccoli", "cauliflower", "espresso", "coffee_mug", "water_bottle",
    "chair", "desk", "dining_table", "table_lamp", "wardrobe", "bookcase", "sofa", "couch",
    "shoe", "boot", "sneaker", "sandal", "sock", "suit", "jersey", "dress", "t-shirt",
    "guitar", "piano", "violin", "drum", "clock", "watch", "umbrella", "backpack"
}

class BrainMRIValidator:
    def __init__(self, custom_model_path: Optional[str] = None):
        self.custom_model_path = custom_model_path or os.path.join(
            os.path.dirname(__file__), "brain_mri_binary_classifier.keras"
        )
        self.custom_binary_model = None
        self.semantic_model = None
        self._load_custom_model_if_available()

    def _load_custom_model_if_available(self):
        """Attempts to load a fine-tuned binary MRI-vs-Non-MRI model if present."""
        if os.path.exists(self.custom_model_path):
            try:
                print(f"[Validator] Loading custom binary MRI classifier from {self.custom_model_path}")
                self.custom_binary_model = tf.keras.models.load_model(self.custom_model_path)
                print("[Validator] Custom binary MRI classifier loaded successfully.")
            except Exception as e:
                print(f"[Validator] Note: Could not load custom model from {self.custom_model_path}: {e}")
                self.custom_binary_model = None

    def _get_semantic_model(self):
        """Lazy loads pre-trained ImageNet MobileNetV2 for everyday object OOD detection."""
        if self.semantic_model is None:
            print("[Validator] Initializing MobileNetV2 ImageNet backbone for OOD semantic screening...")
            self.semantic_model = tf.keras.applications.MobileNetV2(
                weights="imagenet",
                include_top=True
            )
            print("[Validator] MobileNetV2 ImageNet screening backbone ready.")
        return self.semantic_model

    def validate(self, pil_img: Image.Image) -> Dict[str, Any]:
        """
        Validates whether the provided image is a genuine brain MRI scan or an unrelated image.
        Returns a structured validation dictionary with is_valid, reason, code, and diagnostics.
        """
        # 1. Format & Dimensions Check
        if pil_img is None:
            return {
                "is_valid": False,
                "reason": "Please upload a valid brain MRI image. No image data was provided.",
                "validation_code": "FAILED_EMPTY_IMAGE",
                "details": {"error": "Image is None"}
            }

        w, h = pil_img.size
        if w < 64 or h < 64:
            return {
                "is_valid": False,
                "reason": f"Please upload a valid brain MRI image. Image resolution ({w}x{h}) is too low for brain MRI analysis (minimum 64x64 required).",
                "validation_code": "FAILED_RESOLUTION_TOO_LOW",
                "details": {"width": w, "height": h}
            }

        # Convert to RGB numpy array for analysis
        img_rgb = pil_img.convert("RGB")
        img_np = np.array(img_rgb, dtype=np.float32)

        # 2. Radiometric / Spectral Monochromatic Consistency Check
        # Brain MRIs (T1, T2, FLAIR, T1CE) are single-channel grayscale acquisitions.
        # Even when saved in RGB format, R, G, and B channel values are virtually identical.
        # Natural color photos (cats, landscapes, phones, clothes, selfies) have high inter-channel divergence.
        r = img_np[:, :, 0]
        g = img_np[:, :, 1]
        b = img_np[:, :, 2]
        channel_diff = (np.abs(r - g) + np.abs(g - b) + np.abs(b - r)) / 3.0
        mean_color_divergence = float(np.mean(channel_diff))
        max_color_divergence = float(np.max(channel_diff))

        # Color divergence threshold: genuine MRIs typically have mean divergence < 3.0 (out of 255)
        # We allow up to 14.0 to accommodate slight compression artifacts or tinted grayscale saves.
        if mean_color_divergence > 14.0:
            return {
                "is_valid": False,
                "reason": (
                    "Please upload a valid brain MRI image. "
                    f"The uploaded image contains prominent multi-color spectral data (color divergence: {mean_color_divergence:.1f}/255). "
                    "Clinical brain MRI scans are monochromatic grayscale acquisitions."
                ),
                "validation_code": "FAILED_COLOR_SATURATION",
                "details": {
                    "mean_color_divergence": mean_color_divergence,
                    "max_color_divergence": max_color_divergence,
                    "threshold": 14.0,
                    "method": "spectral_radiometric_analysis"
                }
            }

        # 3. Spatial Background Margin vs Cranial Envelope Consistency
        # Brain MRIs in axial, sagittal, or coronal orientations feature centered cranial/skull tissue
        # surrounded by a dark air background margin (outer perimeter/corners near zero luminance).
        # In contrast, documents, white screenshots, bright wallpapers, and full-bleed photos have bright corners.
        gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
        h_px, w_px = gray.shape

        margin_h = max(int(h_px * 0.10), 1)
        margin_w = max(int(w_px * 0.10), 1)

        # Compute corner luminance
        top_left = gray[:margin_h, :margin_w]
        top_right = gray[:margin_h, -margin_w:]
        bot_left = gray[-margin_h:, :margin_w]
        bot_right = gray[-margin_h:, -margin_w:]

        corners_mean = float(np.mean([np.mean(top_left), np.mean(top_right), np.mean(bot_left), np.mean(bot_right)]))

        center_y_start, center_y_end = int(h_px * 0.20), int(h_px * 0.80)
        center_x_start, center_x_end = int(w_px * 0.20), int(w_px * 0.80)
        center_region = gray[center_y_start:center_y_end, center_x_start:center_x_end]
        center_mean = float(np.mean(center_region))
        center_std = float(np.std(center_region))

        # Check for bright corners / document / inverted image:
        # In genuine brain MRIs, outer corners are dark air field (corners_mean typically < 30.0).
        # If corners_mean > 65.0, it is a non-MRI photo, document, or non-radiological image.
        if corners_mean > 65.0:
            return {
                "is_valid": False,
                "reason": (
                    "Please upload a valid brain MRI image. "
                    f"The uploaded image has bright background perimeter/corners (mean luminance {corners_mean:.1f}/255). "
                    "Brain MRI scans require a dark outer air background surrounding the cranial tissue."
                ),
                "validation_code": "FAILED_BRIGHT_MARGIN_PROFILE",
                "details": {
                    "corners_mean_luminance": corners_mean,
                    "center_mean_luminance": center_mean,
                    "threshold": 65.0
                }
            }

        # 4. Semantic Out-of-Distribution (OOD) Screening with ImageNet Foundation Model
        # When an everyday non-medical image (even in grayscale, like a B&W cat, B&W phone, B&W car, B&W landscape)
        # is evaluated, the deep vision backbone detects identifiable everyday objects.
        try:
            semantic_net = self._get_semantic_model()
            resized_for_mob = img_rgb.resize((224, 224), Image.Resampling.BILINEAR)
            mob_arr = np.array(resized_for_mob, dtype=np.float32)
            mob_input = tf.keras.applications.mobilenet_v2.preprocess_input(mob_arr.copy())
            mob_batch = np.expand_dims(mob_input, axis=0)

            mob_preds = semantic_net.predict(mob_batch, verbose=0)
            decoded_preds = tf.keras.applications.mobilenet_v2.decode_predictions(mob_preds, top=5)[0]

            top1_id, top1_name, top1_prob = decoded_preds[0]
            top1_prob = float(top1_prob)
            top1_lower = top1_name.lower()

            # Check if top predicted class matches known everyday non-medical categories
            is_everyday_category = any(kw in top1_lower for kw in EVERYDAY_SEMANTIC_KEYWORDS)

            if is_everyday_category and top1_prob >= 0.22:
                readable_name = top1_name.replace("_", " ").title()
                return {
                    "is_valid": False,
                    "reason": (
                        "Please upload a valid brain MRI image. "
                        f"Detected unrelated non-medical object/scene ('{readable_name}', confidence {top1_prob * 100:.1f}%) "
                        "instead of a brain MRI scan."
                    ),
                    "validation_code": "FAILED_EVERYDAY_OBJECT_DETECTED",
                    "details": {
                        "detected_class": top1_name,
                        "readable_name": readable_name,
                        "confidence": top1_prob,
                        "top_predictions": [(d[1], float(d[2])) for d in decoded_preds[:3]],
                        "method": "imagenet_ood_semantic_screening"
                    }
                }
        except Exception as ood_err:
            print(f"[Validator] Warning: Semantic OOD check encountered an error: {ood_err}")

        # 5. Dedicated Binary Classifier Check (if fine-tuned model provided)
        if self.custom_binary_model is not None:
            try:
                resized_binary = img_rgb.resize((224, 224), Image.Resampling.BILINEAR)
                bin_arr = np.array(resized_binary, dtype=np.float32) / 255.0
                bin_batch = np.expand_dims(bin_arr, axis=0)
                bin_pred = float(self.custom_binary_model.predict(bin_batch, verbose=0)[0][0])
                if bin_pred < 0.5:
                    return {
                        "is_valid": False,
                        "reason": (
                            "Please upload a valid brain MRI image. "
                            f"Custom MRI binary classifier evaluated scan with score {bin_pred:.3f} (below 0.50 threshold)."
                        ),
                        "validation_code": "FAILED_CUSTOM_BINARY_CLASSIFIER",
                        "details": {"score": bin_pred, "method": "custom_binary_model"}
                    }
            except Exception as bin_err:
                print(f"[Validator] Warning: Custom binary model prediction failed: {bin_err}")

        # 6. Anatomical Texture & Cranial Envelope Validation
        # Intracranial brain tissue has non-zero variance and centered mass
        if center_std < 6.0 and center_mean < 15.0:
            return {
                "is_valid": False,
                "reason": (
                    "Please upload a valid brain MRI image. "
                    "The uploaded image lacks identifiable intracranial brain tissue structure (flat/empty central region)."
                ),
                "validation_code": "FAILED_NO_BRAIN_STRUCTURE",
                "details": {
                    "center_mean": center_mean,
                    "center_std": center_std
                }
            }

        # Passed all validation stages!
        return {
            "is_valid": True,
            "reason": "Image successfully validated as a brain MRI scan.",
            "validation_code": "PASSED",
            "details": {
                "mean_color_divergence": mean_color_divergence,
                "corners_mean_luminance": corners_mean,
                "center_mean_luminance": center_mean,
                "center_texture_std": center_std,
                "custom_binary_model_active": self.custom_binary_model is not None,
                "method": "multi_signal_mri_validator"
            }
        }

# Global singleton validator instance
_VALIDATOR_INSTANCE = None

def get_mri_validator() -> BrainMRIValidator:
    global _VALIDATOR_INSTANCE
    if _VALIDATOR_INSTANCE is None:
        _VALIDATOR_INSTANCE = BrainMRIValidator()
    return _VALIDATOR_INSTANCE
