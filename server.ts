import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON parsing with larger size limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI on the server
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint for classifying a GIS image
app.post("/api/classify", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png", roadClassHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image base64 data." });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getAiClient();

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze this image. You must satisfy two conditions:
1. Determine if this image is a genuine GIS, satellite, aerial, or terrain photograph representing road infrastructure (such as highways, suburban streets, village/dirt paths). 
2. If the image is NOT a road or terrain image, but is instead a household pet (like a dog or cat), a person, indoor furniture, food, or arbitrary household items, YOU MUST flag it by setting 'isValidRoad' to false.

If 'isValidRoad' is true, identify the road type and classify it into exactly one of these classes:
1. Highway (Multi-lane, asphalt, clear markings, high-speed layout)
2. Street Road (Urban or suburban paved road, residential houses or commercial buildings, narrower than highway)
3. Village Road (Narrow paved/unpaved track, sparse rural homesteads, high tree canopy/fields)
4. Dirt Road (Unpaved, brown/orange soil, rugged vehicle track markings, no asphalt)
5. Concrete Road (Light gray surface, visible joints, textured concrete slabs, medium width)

${roadClassHint ? `Note: The user indicates this is likely a high-quality representation of a "${roadClassHint}". Feel free to confirm or correct this based on visual evidence.` : ""}

Return a structured JSON output with details of the classification, validity flag, visual indicators found, and custom suggestions for training a CNN with TensorFlow/OpenCV.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidRoad: {
              type: Type.BOOLEAN,
              description: "Must be true if the image is a valid road, street, or aerial/GIS landscape. Must be FALSE if the image represents an out-of-domain item like domestic pets, dogs, cats, indoor home environments, or random consumer objects."
            },
            roadType: {
              type: Type.STRING,
              description: "Must be exactly one of: 'Highway', 'Street Road', 'Village Road', 'Dirt Road', 'Concrete Road' if isValidRoad is true, or 'None' if false."
            },
            confidence: {
              type: Type.INTEGER,
              description: "Confidence percentage (e.g. 75 to 98) for the classification or the validation check."
            },
            visualIndicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Visual traits found (e.g., 'Double yellow line stripe', 'Gray asphalt surface', 'Sidewalk borders') or reasons for rejection."
            },
            surroundingFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Contextual elements (e.g., 'Dense green trees', 'Urban household grid') or reasons for rejection."
            },
            pythonCodeInspiration: {
              type: Type.STRING,
              description: "A short technical recommendation of which specific image-processing features (e.g. Edge contours, HSV filters, Hashing) would aid raw OpenCV preprocessing."
            },
            technicalRationale: {
              type: Type.STRING,
              description: "An engineering explanation of the classification choices and the domain validity check."
            }
          },
          required: [
            "isValidRoad",
            "roadType",
            "confidence",
            "visualIndicators",
            "surroundingFeatures",
            "pythonCodeInspiration",
            "technicalRationale"
          ]
        },
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No output returned from the classification model.");
    }

    const payload = JSON.parse(resultText);

    if (payload.isValidRoad === false) {
      return res.status(400).json({
        error: "Invalid Image. Please upload a proper road or GIS image.",
        details: payload.technicalRationale
      });
    }

    res.json(payload);

  } catch (error: any) {
    console.error("GIS Classification Error:", error);
    res.status(500).json({
      error: error.message && error.message.includes("Invalid Image") 
        ? error.message 
        : "Failed to classify GIS road image.",
      details: error.message || String(error)
    });
  }
});

// Configure Vite or Serve static build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
