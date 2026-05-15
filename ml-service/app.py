import time
import random
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="TruPhish ML Service")

class UrlRequest(BaseModel):
    url: str

class TextRequest(BaseModel):
    text: str

def analyze_input(input_value: str, input_type: str):
    # Dummy mock logic for now, represents ML evaluation.
    # We add an artificial delay to test latency
    time.sleep(1.0)
    
    # Simple keyword heuristic as a proxy prediction
    phishing_keywords = ['login', 'verify', 'update', 'secure', 'account', 'bank', 'urgent', 'free', '.xyz']
    is_phishing = any(keyword in input_value.lower() for keyword in phishing_keywords)
    
    if is_phishing:
        score = random.randint(75, 99)
        prediction = 'phishing'
        explanations = [
            f"Suspicious {input_type} content detected.",
            "Contains common deceptive keywords."
        ]
    else:
        score = random.randint(5, 30)
        prediction = 'safe'
        explanations = [
            "No known malicious signatures found.",
            f"{input_type.capitalize()} appears authentic."
        ]
    
    return {
        "risk_score": score,
        "prediction": prediction,
        "explanations": explanations
    }

@app.post("/scan/url")
async def scan_url(request: UrlRequest):
    return analyze_input(request.url, "url")

@app.post("/scan/text")
async def scan_text(request: TextRequest):
    return analyze_input(request.text, "text")

@app.get("/")
def root():
    return {"message": "TruPhish ML Service is running."}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
