
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import uvicorn
import os
import logging
import joblib

# Import router
from app.routers import api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Email Spam Classifier API",
    description="AI-powered spam detection using Machine Learning",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Ensure directories exist
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
os.makedirs("templates", exist_ok=True)
os.makedirs("models", exist_ok=True)

# Configure static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Model paths
MODEL_PATH = "models/spam_classifier_model.pkl"
VECTORIZER_PATH = "models/tfidf_vectorizer.pkl"

# Global variables for model and vectorizer
model = None
vectorizer = None

def load_models():
    global model, vectorizer
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        logger.info("Model and vectorizer loaded successfully!")
        return True
    except FileNotFoundError:
        logger.error(f"Model files not found. Please ensure these files exist: {MODEL_PATH}, {VECTORIZER_PATH}")
        return False
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """
    Initialize models and routers when the application starts
    """
    logger.info(" Starting Email Spam Classifier API...")
    
    # Load ML models
    if not load_models():
        logger.warning("API started but models are not available")
    
    # Initialize router with templates and models
    api.initialize_router(templates)
    api.set_models(model, vectorizer)
    
    # Include router
    app.include_router(api.router)
    
    logger.info("API initialization complete!")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(" Shutting down Email Spam Classifier API...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )