import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("dog");
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

      context.drawImage(image, 0, 0);

      detections.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.box;

        context.lineWidth = 4;
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);

        context.font = "24px Arial";
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    const response = await fetch("http://127.0.0.1:8000/detect", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    drawImageWithBoxes(file, data.detections);
  }

  return (
    <main>
      <h1>Open Vocabulary Image Detection</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files[0])}
      />

      <input
        type="text"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="What should be detected?"
      />

      <button onClick={handleDetect}>Detect</button>

      <canvas ref={canvasRef}></canvas>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </main>
  );
}

export default App;