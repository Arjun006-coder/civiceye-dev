import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import cors from "cors";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "civic-eye-ai-service"
  });
});

// ========== NSFW CHECK (Falconsai) ==========
app.post("/nsfw-check", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!process.env.HF_API_KEY) {
      return res.status(500).json({ error: "HuggingFace API key not configured" });
    }

    console.log("Processing NSFW check for image:", req.file.originalname);
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection",
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
        method: "POST",
        body: req.file.buffer,
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

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

    console.log("NSFW check result:", { flagged, result });
    res.json({ flagged, raw: result });
  } catch (err) {
    console.error("NSFW check error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========== ISSUE CLASSIFICATION (CLIP) ==========
app.post("/issue-classify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!process.env.HF_API_KEY) {
      return res.status(500).json({ error: "HuggingFace API key not configured" });
    }

    const labels = [
      "Street Light Problem",
      "Flooding",
      "Garbage",
      "Pothole",
      "Traffic Signal Issue",
    ];

    console.log("Processing issue classification for image:", req.file.originalname);

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

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Issue classification result:", result);
    res.json(result);
  } catch (err) {
    console.error("Issue classification error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========== SERVER START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI service running on port ${PORT}`));
