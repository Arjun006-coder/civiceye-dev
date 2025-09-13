import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import cors from "cors";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ========== NSFW CHECK (Falconsai) ==========
app.post("/nsfw-check", upload.single("image"), async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
        method: "POST",
        body: req.file.buffer,
      }
    );

    const result = await response.json();

    // HuggingFace usually returns array like: [{label: "nsfw", score: 0.92}, ...]
    const flagged = Array.isArray(result)
      ? result.some(
          (r) =>
            r.label.toLowerCase().includes("nsfw") &&
            r.score !== undefined &&
            r.score > 0.5
        )
      : false;

    res.json({ flagged, raw: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ISSUE CLASSIFICATION (CLIP) ==========
app.post("/issue-classify", upload.single("image"), async (req, res) => {
  try {
    const labels = [
      "Street Light Problem",
      "Flooding",
      "Garbage",
      "Pothole",
      "Traffic Signal Issue",
    ];

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            image: req.file.buffer.toString("base64"),
            text: labels,
          },
        }),
      }
    );

    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SERVER START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI service running on port ${PORT}`));
