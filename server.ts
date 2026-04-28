import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import FormData from "form-data";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // n8n Chat/Instruction Route
  app.post("/api/chat", async (req, res) => {
    const { base64Data, mimeType, fileName, fileSize, lastModified, instructions } = req.body;

    const chatUrl = process.env.CHAT_WEBHOOK_URL;
    const webhookSecret = process.env.WEBHOOK_SECRET || 'everything-document-proxy';
    const userId = "mimie5015@gmail.com";

    if (!chatUrl) {
      return res.status(500).json({ 
        error: "CHAT_WEBHOOK_URL is not configured in the server environment." 
      });
    }

    try {
      console.log(`Forwarding chat instructions to n8n from ${userId}: ${fileName || 'unnamed'}`);
      
      const form = new FormData();
      
      // If there's a file, attach it as binary
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        form.append('data', buffer, {
          filename: fileName || 'document',
          contentType: mimeType,
        });
      }

      form.append('userId', userId);
      form.append('instructions', instructions || '');
      form.append('fileName', fileName || '');
      form.append('fileType', mimeType || '');
      form.append('fileSize', fileSize?.toString() || '0');
      form.append('lastModified', lastModified || '');
      form.append('timestamp', new Date().toISOString());
      form.append('event', "document_chat");

      const response = await axios.post(chatUrl, form, {
        headers: {
          ...form.getHeaders(),
          'X-EverythingDocument-Signature': webhookSecret,
        }
      });

      res.json({
        success: true,
        status: response.status,
        message: "Instructions dispatched to chat webhook successfully"
      });
    } catch (error: any) {
      console.error("Chat Dispatch Error:", error.message);
      res.status(500).json({
        success: false,
        error: "Failed to forward instructions to chat webhook",
        details: error.message
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
