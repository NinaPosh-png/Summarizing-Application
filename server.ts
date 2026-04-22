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

  // n8n Dispatch Route
  app.post("/api/dispatch", async (req, res) => {
    const { base64Data, mimeType, fileName, fileSize, lastModified } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Missing required file data" });
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.WEBHOOK_SECRET || 'everything-document-proxy';
    // User requested userId to be mimie5015@gmail.com by default
    const userId = "mimie5015@gmail.com";

    if (!n8nUrl) {
      return res.status(500).json({ 
        error: "N8N_WEBHOOK_URL is not configured in the server environment." 
      });
    }

    try {
      console.log(`Forwarding binary document to n8n from ${userId}: ${fileName || 'unnamed'}`);
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      const form = new FormData();
      // Binary file part MUST be named "data" as per user request
      form.append('data', buffer, {
        filename: fileName || 'document',
        contentType: mimeType,
      });

      // Metadata as separate fields
      form.append('userId', userId);
      form.append('fileName', fileName || '');
      form.append('fileType', mimeType);
      form.append('fileSize', fileSize?.toString() || '0');
      form.append('lastModified', lastModified || '');
      form.append('timestamp', new Date().toISOString());
      form.append('event', "document_upload");

      const response = await axios.post(n8nUrl, form, {
        headers: {
          ...form.getHeaders(),
          'X-EverythingDocument-Signature': webhookSecret,
        }
      });

      res.json({
        success: true,
        status: response.status,
        message: "Binary document dispatched to n8n successfully"
      });
    } catch (error: any) {
      console.error("n8n Dispatch Error:", error.message);
      res.status(500).json({
        success: false,
        error: "Failed to forward document to n8n",
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
