import pool from "../lib/db.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, phone, national_id, password, role } = req.body;

  if (!phone || !password || !role)
    return res.status(400).json({ error: "تمام فیلدها الزامی‌اند." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, phone, national_id, password, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [name, phone, national_id, hashedPassword, role]
    );

    res.json({ success: true, user_id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای سرور" });
  }
}
