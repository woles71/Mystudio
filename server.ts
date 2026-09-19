import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Script & Storyboard Breakdown
  app.post("/api/ai/script-assist", async (req, res) => {
    try {
      const {
        sourceText,
        mode = "breakdown",
        targetScenes = 6,
        visualStyle = "Cinematic 35mm Film",
        lightingStyle = "Golden Hour & Volumetric Light",
        aspectRatio = "16:9",
        characterNotes = "",
        settingNotes = "",
      } = req.body;

      if (!sourceText || typeof sourceText !== "string" || !sourceText.trim()) {
        return res.status(400).json({ error: "Source text is required" });
      }

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const systemInstruction = `You are a world-class Hollywood film director, storyboard artist, and cinematographer.
Your job is to analyze story excerpts, scripts, or song lyrics, and transform them into a coherent sequential storyboard.
Each scene must maintain visual and narrative continuity.
Output must be strictly JSON adhering to the provided schema.

Visual style required: "${visualStyle}".
Lighting setup required: "${lightingStyle}".
Aspect ratio: "${aspectRatio}".
Character consistency guidance: "${characterNotes || "Derive distinct protagonist details and keep consistent across all prompts"}".
Setting consistency guidance: "${settingNotes || "Maintain coherent world and atmosphere"}".

For each scene:
1. "title": Short evocative scene title (e.g. "Scene 1: The Whispering Rooftop").
2. "narrative": Brief story beat or song lyric line for this specific moment.
3. "visualDescription": What visually happens on screen (action, emotion, framing).
4. "cinematicPrompt": A rich, ultra-descriptive text-to-image prompt tailored for photorealistic or cinematic generation. Always include the visual style, lighting setup, camera shot, detailed character wardrobe/appearance, environmental textures, color palette, and high cinematic fidelity.
5. "cameraAngle": One of: "Extreme Wide Shot", "Wide Shot", "Medium Shot", "Close-Up", "Extreme Close-Up", "Low Angle Heroic", "High Angle Overlook", "Dutch Angle / Tilted", "Over The Shoulder".
6. "lighting": Specific lighting notes for this panel.
7. "duration": Recommended duration in seconds (between 2 and 8 seconds, default 4).`;

      let promptTask = "";
      if (mode === "lyrics_to_storyboard") {
        promptTask = `The user provided song lyrics. Interpret the lyrical themes, emotional arc, and rhythm into a sequenced visual narrative of approximately ${targetScenes} scenes.
Lyrics:
"""
${sourceText}
"""`;
      } else if (mode === "expand_script") {
        promptTask = `The user provided a raw concept or short story. Expand and refine it into a coherent, compelling cinematic narrative broken down into ${targetScenes} sequential storyboard panels.
Concept / Story:
"""
${sourceText}
"""`;
      } else {
        promptTask = `Break down this story/script into approximately ${targetScenes} sequential cinematic storyboard scenes with high visual continuity.
Story:
"""
${sourceText}
"""`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptTask,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              storyTitle: { type: Type.STRING },
              logline: { type: Type.STRING },
              consistencyProfile: {
                type: Type.OBJECT,
                properties: {
                  protagonist: { type: Type.STRING },
                  environment: { type: Type.STRING },
                  colorPalette: { type: Type.STRING },
                },
                required: ["protagonist", "environment", "colorPalette"],
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    narrative: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    cinematicPrompt: { type: Type.STRING },
                    cameraAngle: { type: Type.STRING },
                    lighting: { type: Type.STRING },
                    duration: { type: Type.NUMBER },
                  },
                  required: [
                    "sceneNumber",
                    "title",
                    "narrative",
                    "visualDescription",
                    "cinematicPrompt",
                    "cameraAngle",
                    "lighting",
                    "duration",
                  ],
                },
              },
            },
            required: ["storyTitle", "logline", "consistencyProfile", "scenes"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response returned by Gemini model.");
      }

      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err: any) {
      console.error("Script assist error:", err);
      return res.status(500).json({
        error: err?.message || "Failed to process script with AI",
      });
    }
  });

  // Prompt Refinement API
  app.post("/api/ai/refine-prompt", async (req, res) => {
    try {
      const { scenePrompt, visualStyle, lightingStyle, characterNotes, cameraAngle } = req.body;

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({ error: "Gemini API key not configured" });
      }

      const prompt = `You are an expert AI prompt engineer for cinematic imagery.
Enhance this storyboard scene prompt to produce stunning visual quality while preserving scene continuity.

Base Prompt: "${scenePrompt}"
Visual Style: "${visualStyle || "Cinematic 35mm"}"
Lighting: "${lightingStyle || "Volumetric Rim Light"}"
Camera: "${cameraAngle || "Medium Shot"}"
Character Continuity: "${characterNotes || "None"}"

Respond ONLY with a JSON object:
{
  "enhancedPrompt": "...",
  "directorNotes": "..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              enhancedPrompt: { type: Type.STRING },
              directorNotes: { type: Type.STRING },
            },
            required: ["enhancedPrompt", "directorNotes"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Prompt refine error:", err);
      return res.status(500).json({ error: err?.message || "Prompt refine failed" });
    }
  });

  // Generate Image API
  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "16:9" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured.",
        });
      }

      // Map aspect ratios to supported Gemini imageConfig ratios:
      // Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
      let mappedRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9";
      if (aspectRatio === "9:16") mappedRatio = "9:16";
      else if (aspectRatio === "1:1") mappedRatio = "1:1";
      else if (aspectRatio === "4:3") mappedRatio = "4:3";
      else if (aspectRatio === "3:4") mappedRatio = "3:4";
      else mappedRatio = "16:9"; // default for 16:9 and 21:9

      // Use gemini-3.1-flash-lite-image by default
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: mappedRatio,
          },
        },
      });

      let imageUrl: string | null = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: "Model did not return image data.",
        });
      }

      return res.json({ imageUrl });
    } catch (err: any) {
      console.error("Generate image error:", err);
      return res.status(500).json({
        error: err?.message || "Failed to generate image.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
