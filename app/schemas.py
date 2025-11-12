
from pydantic import BaseModel

# Request model
class EmailRequest(BaseModel):
    text: str

# Response model
class PredictionResponse(BaseModel):
    email_text: str
    prediction: str
    confidence: float
    is_spam: bool
    timestamp: str