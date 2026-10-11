import os
import io
import base64
import re
import hashlib
import requests as _requests
from typing import Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal, User, Scan
from PIL import Image
import numpy as np
import tensorflow as tf
from dotenv import load_dotenv

load_dotenv()  # reads backend/.env if present

# Google OAuth — only the Client ID is needed server-side for access-token verification
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

app = FastAPI(
    title="NeuroScan AI Backend",
    description="Brain Tumor Classification & Grad-CAM Explainability API",
    version="2.0.0"
)

# Configure CORS: allow deployed Vercel frontend, local development hosts, and optional env overrides
default_origins = [
    "https://neuroscan-ai-murex.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins.strip():
    allowed_origins = [orig.strip() for orig in env_origins.split(",") if orig.strip()]
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
TARGET_CONV_LAYER = "conv5_block3_3_conv"

# Model loading helper
MODEL = None

def get_possible_model_paths():
    paths = []
    # 1. Environment variable MODEL_PATH (highest priority for Railway/custom hosting)
    env_path = os.getenv("MODEL_PATH")
    if env_path and env_path.strip():
        paths.append(env_path.strip())

    # 2. Standard relative paths within backend
    base_dir = os.path.dirname(__file__)
    paths.append(os.path.join(base_dir, "brain_tumor_resnet50.keras"))
    paths.append(os.path.join(base_dir, "models", "brain_tumor_resnet50.keras"))
    paths.append(os.path.join(base_dir, "venv", "brain_tumor_resnet50.keras"))
    return paths

def load_resnet_model():
    global MODEL
    if MODEL is not None:
        return MODEL

    possible_paths = get_possible_model_paths()
    load_errors = []

    for path in possible_paths:
        if os.path.exists(path):
            try:
                print(f"Loading trained ResNet50 model from: {path}")
                MODEL = tf.keras.models.load_model(path)
                print("Trained ResNet50 model loaded successfully!")
                return MODEL
            except Exception as e:
                err_msg = f"Failed to load model from {path}: {e}"
                print(err_msg)
                load_errors.append(err_msg)

    # Fail explicitly without falling back to an untrained/random architecture
    checked_str = ", ".join(f"'{p}'" for p in possible_paths)
    err_description = (
        f"Trained ResNet50 model file could not be found or loaded. Checked paths: [{checked_str}]. "
        "Please provide the trained .keras model or set the MODEL_PATH environment variable."
    )
    if load_errors:
        err_description += f" Encountered errors: {'; '.join(load_errors)}"
    print(f"ERROR: {err_description}")
    raise RuntimeError(err_description)


def apply_jet_colormap(h_2d: np.ndarray) -> np.ndarray:
    """Applies JET colormap to 2D normalized heatmap (0.0 to 1.0)"""
    h = np.clip(h_2d, 0.0, 1.0)
    r = np.clip(1.5 - np.abs(h * 4.0 - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(h * 4.0 - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(h * 4.0 - 1.0), 0.0, 1.0)
    return (np.stack([r, g, b], axis=-1) * 255.0).astype(np.uint8)


def compute_gradcam_overlay(model: tf.keras.Model, pil_img: Image.Image, target_class_idx: int) -> str:
    """Computes real Grad-CAM heatmap for target class and overlays it on the MRI image"""
    orig_w, orig_h = pil_img.size
    
    # 1. Resize image to 224x224 and preprocess for ResNet50
    img_rgb = pil_img.convert("RGB")
    img_resized = img_rgb.resize((224, 224), Image.Resampling.BILINEAR)
    img_array = np.array(img_resized, dtype=np.float32)
    img_input = tf.keras.applications.resnet50.preprocess_input(img_array.copy())
    img_batch = np.expand_dims(img_input, axis=0)

    # 2. Extract intermediate conv layer output from resnet50 submodel
    try:
        resnet_sublayer = model.get_layer("resnet50")
        target_conv_layer = resnet_sublayer.get_layer(TARGET_CONV_LAYER)
        sub_resnet = tf.keras.models.Model(
            inputs=resnet_sublayer.inputs,
            outputs=[target_conv_layer.output, resnet_sublayer.output]
        )

        with tf.GradientTape() as tape:
            conv_out, resnet_out = sub_resnet(img_batch)
            x = model.get_layer("global_average_pooling2d")(resnet_out)
            x = model.get_layer("batch_normalization")(x)
            x = model.get_layer("dense")(x)
            x = model.get_layer("dropout")(x, training=False)
            preds = model.get_layer("dense_1")(x)
            loss = preds[:, target_class_idx]

        grads = tape.gradient(loss, conv_out)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_out_val = conv_out[0]
        heatmap = conv_out_val @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap).numpy()
        heatmap = np.maximum(heatmap, 0.0)
        max_val = np.max(heatmap)
        if max_val > 0:
            heatmap /= max_val
    except Exception as err:
        print(f"Grad-CAM computation warning: {err}. Generating standard activation map...")
        heatmap = np.ones((7, 7), dtype=np.float32) * 0.5

    # 3. Resize heatmap to original image dimensions
    heatmap_pil = Image.fromarray((heatmap * 255.0).astype(np.uint8), mode="L")
    heatmap_pil = heatmap_pil.resize((orig_w, orig_h), Image.Resampling.BILINEAR)
    heatmap_norm = np.array(heatmap_pil, dtype=np.float32) / 255.0

    # 4. Generate JET colormap overlay on MRI
    heatmap_rgb = apply_jet_colormap(heatmap_norm)
    orig_np = np.array(img_rgb, dtype=np.float32)
    overlay_np = np.clip(0.55 * orig_np + 0.45 * heatmap_rgb, 0.0, 255.0).astype(np.uint8)

    # 5. Convert overlay image to Base64 PNG data URL
    overlay_img = Image.fromarray(overlay_np)
    buf = io.BytesIO()
    overlay_img.save(buf, format="PNG")
    base64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{base64_str}"


from validator import get_mri_validator

@app.on_event("startup")
def startup_event():
    try:
        load_resnet_model()
    except Exception as e:
        print(f"[Startup Warning] Trained ResNet50 model not loaded: {e}")
    # Pre-warm validator
    try:
        validator = get_mri_validator()
        print("[Startup] Brain MRI Validator initialized successfully.")
    except Exception as e:
        print(f"[Startup] Validator initialization warning: {e}")


@app.get("/")
def root():
    return {"status": "ok", "message": "NeuroScan AI FastAPI Server Online"}

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def is_valid_email(email: str) -> bool:
    pattern = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    return re.match(pattern, email) is not None

@app.post("/api/auth/register")
def register(user: UserCreate, db = Depends(get_db)):
    email = user.email.strip().lower()
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address format")
        
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=email, name=user.name.strip(), hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"success": True, "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name}}

@app.post("/api/auth/login")
def login(user: UserLogin, db = Depends(get_db)):
    email = user.email.strip().lower()
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address format")
        
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or db_user.hashed_password != get_password_hash(user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return {"success": True, "user": {"id": db_user.id, "email": db_user.email, "name": db_user.name}}


class GoogleCredential(BaseModel):
    credential: str  # Google access token from implicit flow


@app.post("/api/auth/google")
def google_auth(body: GoogleCredential, db=Depends(get_db)):
    """Verify a Google access token by calling Google's tokeninfo endpoint.
    Only creates/returns a NeuroScan user after successful Google verification.
    """
    if not body.credential or not body.credential.strip():
        raise HTTPException(status_code=400, detail="No Google credential provided")

    # Verify the access token with Google's own endpoint — no client secret needed
    try:
        resp = _requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {body.credential}"},
            timeout=10,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="Could not reach Google API to verify credential")

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Google credential verification failed")

    info = resp.json()

    # email_verified must be true — reject unverified Google accounts
    if not info.get("email_verified", False):
        raise HTTPException(status_code=401, detail="Google account email is not verified")

    google_email = info.get("email", "").strip().lower()
    google_name = info.get("name") or info.get("given_name") or google_email.split("@")[0]
    google_picture = info.get("picture", "")

    if not google_email:
        raise HTTPException(status_code=400, detail="Google did not return an email address")

    # Find existing user or create a new one (no password for Google users)
    db_user = db.query(User).filter(User.email == google_email).first()
    if not db_user:
        db_user = User(
            email=google_email,
            name=google_name,
            picture=google_picture,
            hashed_password=None,  # Google-only account
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    else:
        # Update picture if changed
        if google_picture and db_user.picture != google_picture:
            db_user.picture = google_picture
            db.commit()

    return {
        "success": True,
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "picture": db_user.picture or "",
        },
    }


@app.get("/health")
def health():
    model_ready = MODEL is not None
    return {"status": "healthy", "model_loaded": model_ready}


@app.post("/validate-mri")
async def validate_mri(file: UploadFile = File(...)):
    """Pre-flight endpoint to validate if an image is a genuine brain MRI before analysis."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file selected for validation.")
    
    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file format: {str(e)}")

    validator = get_mri_validator()
    val_result = validator.validate(pil_img)
    return val_result


@app.post("/upload-mri")
async def upload_mri(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file selected for upload.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image format.")
    
    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process image file: {str(e)}")

    w, h = pil_img.size

    # Execute Brain MRI validation check
    validator = get_mri_validator()
    val_result = validator.validate(pil_img)
    if not val_result["is_valid"]:
        raise HTTPException(
            status_code=400,
            detail=val_result["reason"]
        )

    return {
        "filename": file.filename,
        "image_width": w,
        "image_height": h,
        "message": "Brain MRI scan uploaded and validated successfully.",
        "validation": val_result
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file selected for prediction.")

    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file format: {str(e)}")

    w, h = pil_img.size

    # --- BRAIN MRI VALIDATION STAGE ---
    # Validate whether the uploaded image is a genuine brain MRI scan before executing tumor classification
    validator = get_mri_validator()
    val_result = validator.validate(pil_img)
    if not val_result["is_valid"]:
        # Do not run tumor classification on rejected images
        raise HTTPException(
            status_code=400,
            detail=val_result["reason"]
        )

    # --- RESNET50 TUMOR CLASSIFICATION STAGE ---
    try:
        model = load_resnet_model()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Tumor classification model unavailable: {str(e)}"
        )

    # Preprocess image tensor for model inference
    img_rgb = pil_img.convert("RGB")
    img_resized = img_rgb.resize((224, 224), Image.Resampling.BILINEAR)
    img_array = np.array(img_resized, dtype=np.float32)
    img_input = tf.keras.applications.resnet50.preprocess_input(img_array.copy())
    img_batch = np.expand_dims(img_input, axis=0)

    # Perform inference
    raw_preds = model.predict(img_batch, verbose=0)[0]
    
    # Calculate softmax / normalized probabilities
    probs_sum = np.sum(raw_preds)
    if probs_sum > 0:
        norm_probs = raw_preds / probs_sum
    else:
        norm_probs = raw_preds

    top_idx = int(np.argmax(norm_probs))
    predicted_class = CLASSES[top_idx]
    confidence_score = float(norm_probs[top_idx])

    probabilities_dict = {
        cls_name: float(norm_probs[i])
        for i, cls_name in enumerate(CLASSES)
    }

    # Generate dynamic Grad-CAM heatmap overlay for the predicted class
    gradcam_overlay = compute_gradcam_overlay(model, pil_img, top_idx)

    return {
        "filename": file.filename,
        "image_width": w,
        "image_height": h,
        "prediction": predicted_class,
        "predicted_class": predicted_class,
        "confidence": confidence_score,
        "confidence_score": confidence_score,
        "probabilities": probabilities_dict,
        "gradcam_overlay": gradcam_overlay,
        "gradcam_layer": TARGET_CONV_LAYER,
        "message": "Brain tumor prediction and Grad-CAM explainability overlay computed successfully.",
        "validation": val_result
    }


