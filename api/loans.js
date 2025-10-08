import pool from "../lib/db.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  // اعتبارسنجی توکن
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

  if (req.method === "POST") {
    // 🟢 افزودن وام (فقط برای همکار)
    if (user.role !== "coworker")
      return res.status(403).json({ error: "فقط همکار می‌تواند وام ثبت کند." });

    const { customer_id, loan_type } = req.body;

    if (!customer_id || !loan_type)
      return res.status(400).json({ error: "اطلاعات ناقص است." });

    try {
      const result = await pool.query(
        "INSERT INTO loans (coworker_id, customer_id, loan_type) VALUES ($1,$2,$3) RETURNING *",
        [user.id, customer_id, loan_type]
      );
      res.json({ success: true, loan: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "خطای سرور هنگام افزودن وام" });
    }

  } else if (req.method === "GET") {
    // 🔵 مشاهده لیست وام‌ها
    try {
      let result;

      if (user.role === "coworker") {
        // همکار: فقط وام‌هایی که خودش ثبت کرده
        result = await pool.query(
          `SELECT l.*, u.name AS customer_name, u.phone AS customer_phone
           FROM loans l
           JOIN users u ON l.customer_id = u.id
           WHERE l.coworker_id = $1
           ORDER BY l.created_at DESC`,
          [user.id]
        );
      } else {
        // مشتری: فقط وام‌های خودش
        result = await pool.query(
          `SELECT l.*, u.name AS coworker_name, u.phone AS coworker_phone
           FROM loans l
           JOIN users u ON l.coworker_id = u.id
           WHERE l.customer_id = $1
           ORDER BY l.created_at DESC`,
          [user.id]
        );
      }

      res.json({ success: true, loans: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "خطای سرور هنگام دریافت لیست وام‌ها" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
