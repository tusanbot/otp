import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  const { phone, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE phone=$1", [phone]);
  if (user.rows.length === 0) return res.status(401).json({ error: "کاربر یافت نشد" });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ error: "رمز اشتباه است" });

  const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(200).json({ token });
}
