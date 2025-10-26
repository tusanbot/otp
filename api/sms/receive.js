import { verifyToken } from "../../utils/auth.js"; // ✅ توابع احراز هویت
import { getMessagesByAgent } from "../../utils/db.js"; // ✅ تابع نمونه برای واکشی داده‌ها

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const agent = verifyToken(token); // ← استخراج اطلاعات همکار از توکن

    if (!agent || !agent.id) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // ✅ دریافت پیامک‌های مربوط به همان همکار از دیتابیس
    const messages = await getMessagesByAgent(agent.id);

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
