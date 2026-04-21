import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const OLLAMA_API = process.env.OLLAMA_HOST || 'http://linkteam.us:11434';
  const MODEL = process.env.AI_MODEL || 'llama3';

  /**
   * Health Check Endpoint
   */
  app.get('/api/health', async (req, res) => {
    let ollamaStatus = 'offline';
    let availableModels = [];
    try {
      const check = await fetch(`${OLLAMA_API}/api/tags`);
      if (check.ok) {
        ollamaStatus = 'online';
        const data = await check.json();
        availableModels = data.models || [];
      }
    } catch (e) {
      ollamaStatus = 'connection_error';
    }

    res.json({
      status: 'online',
      local_ai: ollamaStatus,
      model: MODEL,
      available_models: availableModels,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Local AI Proxy Endpoint
   */
  app.post('/api/ai/generate', async (req, res) => {
    const { prompt, systemInstruction, jsonMode } = req.body;

    const generateRequest = async (modelName: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        return await fetch(`${OLLAMA_API}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            prompt: prompt,
            system: systemInstruction || "You are a helpful business agency assistant.",
            stream: false,
            format: jsonMode ? 'json' : undefined,
            options: {
              temperature: 0.7,
              top_p: 0.9
            }
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      let response = await generateRequest(MODEL);

      // If model not found (404), try to find an alternative
      if (response.status === 404) {
        console.warn(`Model ${MODEL} not found. Attempting to find an alternative...`);
        const tagsRes = await fetch(`${OLLAMA_API}/api/tags`);
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          if (tagsData.models && tagsData.models.length > 0) {
            const alternativeModel = tagsData.models[0].name;
            console.log(`Falling back to model: ${alternativeModel}`);
            response = await generateRequest(alternativeModel);
          }
        }
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Ollama Error (${response.status}):`, errorBody);
        throw new Error(`Ollama responded with status: ${response.status}. Details: ${errorBody}`);
      }

      const data = await response.json();
      res.json({ success: true, text: data.response });
    } catch (error: any) {
      let errorMessage = error.message || 'Unknown error';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 60 seconds. Your Ollama server might be slow or the model is too large.';
      }
      console.error('Ollama Proxy Error:', errorMessage);
      res.status(500).json({
        success: false,
        error: `Ollama Proxy Error: ${errorMessage}`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n---------------------------------------------------`);
    console.log(`🚀 BIZLINK AI SERVER IS LIVE`);
    console.log(`🔗 Interface: http://localhost:${PORT}`);
    console.log(`🧠 AI Engine: Ollama (${MODEL})`);
    console.log(`📡 Local Socket: ${OLLAMA_API}`);
    console.log(`---------------------------------------------------\n`);
  });
}

startServer();
