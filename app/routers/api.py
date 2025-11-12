from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import logging
from datetime import datetime
import joblib

from app.schemas import EmailRequest, PredictionResponse


logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Global variables for model and vectorizer (se moverán a main.py)
model = None
vectorizer = None
templates = None

def initialize_router(app_templates):
    global templates
    templates = app_templates

def set_models(app_model, app_vectorizer):
    global model, vectorizer
    model = app_model
    vectorizer = app_vectorizer

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.post("/predict", response_model=PredictionResponse)
async def predict(request: EmailRequest):
    if model is None or vectorizer is None:
        logger.error("Model or vectorizer not loaded")
        return PredictionResponse(
            email_text=request.text,
            prediction="Error",
            confidence=0.0,
            is_spam=False,
            timestamp=datetime.now().isoformat()
        )
    
    try:
        # Transform the text
        features = vectorizer.transform([request.text])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Get probability/confidence
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities))
        
        # Determine result
        is_spam = (prediction == 0)
        label = "Spam" if is_spam else "Ham"
        
        logger.info(f"📧 Prediction made: {label} (confidence: {confidence:.2f})")
        
        return PredictionResponse(
            email_text=request.text,
            prediction=label,
            confidence=confidence,
            is_spam=is_spam,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return PredictionResponse(
            email_text=request.text,
            prediction="Error",
            confidence=0.0,
            is_spam=False,
            timestamp=datetime.now().isoformat()
        )

@router.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "timestamp": datetime.now().isoformat()
    }
    
    if not health_status["model_loaded"]:
        health_status["status"] = "degraded"
        health_status["message"] = "Models not loaded"
    
    return health_status

@router.get("/api/model-info")
async def model_info():
    if model is None:
        return {"error": "Model not loaded"}
    
    model_info = {
        "model_type": type(model).__name__,
        "model_loaded": True,
        "vectorizer_loaded": vectorizer is not None,
        "features": vectorizer.get_feature_names_out().shape[0] if vectorizer else 0
    }
    
    return model_info