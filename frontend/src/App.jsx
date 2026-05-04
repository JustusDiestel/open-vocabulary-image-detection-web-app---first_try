// javascript
import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [promptsText, setPromptsText] = useState("dog"); // mehrere Prompts: je Prompt eine Zeile
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  function drawImageWithBoxes(imageFile, detections) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const image = new Image();
    image.src = URL.createObjectURL(imageFile);

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      // detections: Array von Box-Objekten; hier werden alle zusammen gezeichnet
      detections.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.box;

        context.lineWidth = 4;
        context.strokeStyle = detection.color || "red";
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);

        context.font = "24px Arial";
        context.fillStyle = detection.color || "red";
        context.fillText(
          `${detection.label} ${Math.round(detection.confidence * 100)}%`,
          x1,
          y1 > 30 ? y1 - 10 : y1 + 30
        );
      });
    };
  }

  async function handleDetect() {
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    // Prompt-Text in Array umwandeln (eine Zeile = ein Prompt)
    const promptsArray = promptsText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    if (promptsArray.length === 0) {
      alert("Bitte mindestens einen Prompt eingeben.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompts", JSON.stringify(promptsArray)); // als JSON-Array senden

    const response = await fetch("http://127.0.0.1:8000/detect", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);

    // Alle detections zusammenführen und zeichnen
    const combined = Object.values(data.detections).flat();
    drawImageWithBoxes(file, combined);
  }

  return (
    <main>
      <h1>Open Vocabulary Image Detection</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files[0])}
      />

      <textarea
        value={promptsText}
        onChange={(event) => setPromptsText(event.target.value)}
        placeholder="Gib pro Zeile einen Prompt ein (z. B. dog)"
        rows={4}
      />

      <button onClick={handleDetect}>Detect</button>

      <canvas ref={canvasRef}></canvas>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}

export default App;
