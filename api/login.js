import pool from "../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, password } = req.body;
  const SECRET_KEY = process.env.SECRET_KEY;

  try {
    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);

    if (result.rowCount === 0) return res.status(400).json({ error: "کاربر یافت نشد" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ error: "رمز اشتباه است" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطای سرور" });
  }
}
