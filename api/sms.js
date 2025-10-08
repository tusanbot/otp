import pool from "../lib/db.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  if (req.method !== "POST")
    return res.status(405).json({ error: "فقط متد POST مجاز است." });

  // دریافت توکن مشتری
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "توکن ارسال نشده است." });

  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, SECRET_KEY);
  } catch {
    return res.status(401).json({ error: "توکن نامعتبر است." });
  }

  if (user.role !== "customer")
    return res.status(403).json({ error: "فقط مشتری می‌تواند پیامک ارسال کند." });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "متن پیامک خالی است." });

  try {
    // پیدا کردن همکار مربوط به مشتری از جدول loans
    const result = await pool.query(
      `SELECT u.id AS coworker_id, u.name, u.phone
       FROM loans l
       JOIN users u ON l.coworker_id = u.id
       WHERE l.customer_id = $1
       ORDER BY l.created_at DESC LIMIT 1`,
      [user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "هیچ همکار مرتبطی یافت نشد." });

    const coworker = result.rows[0];

    // ذخیره پیام در جدول sms_logs
    await pool.query(
      `CREATE TABLE IF NOT EXISTS sms_logs (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await pool.query(
      "INSERT INTO sms_logs (sender_id, receiver_id, message) VALUES ($1,$2,$3)",
      [user.id, coworker.coworker_id, message]
    );

    res.json({ success: true, message: "پیام با موفقیت ارسال شد." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای سرور هنگام ثبت پیامک." });
  }
}
