import json
from io import BytesIO
from typing import List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from model import detect_objects


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/detect")
async def detect_image(
    file: UploadFile = File(...),
    prompts: str = Form(...)
):
    try:
        prompts_list: List[str] = json.loads(prompts)
    except Exception:
        # Fallback: Zeilenweise trennen, falls kein JSON gesendet wurde
        prompts_list = [p.strip() for p in prompts.splitlines() if p.strip()]

    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    width, height = image.size

    detections_by_prompt: Dict[str, Any] = {}
    for p in prompts_list:
        detections_by_prompt[p] = detect_objects(image, p)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "prompt": prompts,
        "width": width,
        "height": height,
        "detections": detections_by_prompt
    }



