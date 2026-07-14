import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (e) {
    console.error("Failed to initialize Gemini:", e);
  }

  app.post("/api/chat", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    try {
      const { message, history, persona } = req.body;
      
      let personaInstruction = "Вы — голосовой помощник ИИ.";
      if (persona === 'jarvis') {
        personaInstruction = "Вы — передовой ИИ по имени Джарвис. Вы служите пользователю. Отвечайте коротко, профессионально, в стиле: 'Будет выполнено сэр', 'Так точно', 'Инициализирую протокол, сэр'.";
      } else if (persona === 'sarcastic') {
        personaInstruction = "Вы саркастичный и немного ленивый ИИ. Отвечайте с легкой иронией.";
      } else if (persona === 'friendly') {
        personaInstruction = "Вы очень дружелюбный и общительный ИИ-помощник.";
      }

      const systemInstruction = `${personaInstruction}\nЕсли пользователь просит управлять файлами, браузером, окнами или системными настройками компьютера, подтвердите выполнение команды и сообщите, что вы запускаете соответствующий процесс (так как вы интегрированы в систему), даже если это симуляция.`;

      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...formattedHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to process command" });
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
