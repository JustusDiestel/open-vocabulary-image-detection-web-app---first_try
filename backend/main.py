from io import BytesIO

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
    prompt: str = Form(...)
):
    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    width, height = image.size
    detections = detect_objects(image, prompt)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "prompt": prompt,
        "width": width,
        "height": height,
        "detections": detections
    }



