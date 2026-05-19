import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Simple in-memory cache
const analysisCache = new Map<string, string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { txData } = req.body;
      const cacheKey = txData.id;

      if (analysisCache.has(cacheKey)) {
        return res.json({ report: analysisCache.get(cacheKey) });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }
      const prompt = `
        You are a Cyber Forensic Expert focusing on Bitcoin transactions. 
        Analyze the following transaction data using Intuitionistic Fuzzy logic concepts.
        
        Data:
        - TX ID: ${txData.id}
        - Verdict: ${txData.verdict}
        - Confidence: ${txData.confidence}%
        - Fraud Probability: ${txData.fraudProb * 100}%
        - Licit Probability: ${txData.licitProb * 100}%
        - Membership (mu): ${txData.mu}
        - Non-membership (nu): ${txData.nu}
        - Hesitation (pi): ${txData.pi}
        - Neighborhood Size: ${txData.edges.length}
        - Sample Neighbors: ${JSON.stringify(txData.edges.slice(0, 3).map((e: any) => ({ id: e.neighbor, type: e.type, trust: e.w })))}

        Task: Write a professional, technical, and concise Forensic Report in English.
        Explain WHY the transaction was flagged (or cleared) based on these metrics. 
        Focus on the relationship between high mu/nu/pi and neighborhood trust scores (w).
        Use professional terminology but keep it actionable for human investigators.
        Output MUST be in Markdown format.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const report = response.text;
      analysisCache.set(cacheKey, report);
      res.json({ report });
    } catch (error: any) {
      console.error("Analysis Error:", error);
      if (error.status === 429) {
        // Log the full error to see retry info if available
        const retryAfter = error.details?.[0]?.retryDelay || "a few moments";
        return res.status(429).json({ 
          error: `Quota exceeded for the current AI model. Please retry in ${retryAfter}.`,
          isQuotaError: true
        });
      }
      res.status(500).json({ error: "Intelligence core offline. Neural link severed." });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
