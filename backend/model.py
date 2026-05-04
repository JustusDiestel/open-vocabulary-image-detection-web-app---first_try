from PIL import Image
import torch
from transformers import OwlViTProcessor, OwlViTForObjectDetection

processor = OwlViTProcessor.from_pretrained("google/owlvit-base-patch32")
model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch32")


def detect_objects(image: Image.Image, prompt: str):
    texts = [[prompt]]

    inputs = processor(text=texts, images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    target_sizes = torch.tensor([image.size[::-1]])

    results = processor.post_process_grounded_object_detection(
        outputs=outputs,
        target_sizes=target_sizes,
        threshold=0.1
    )[0]

    detections = []

    for score, label, box in zip(
        results["scores"],
        results["labels"],
        results["boxes"]
    ):
        detections.append({
            "label": prompt,
            "confidence": float(score),
            "box": [round(x, 2) for x in box.tolist()]
        })

    return detections