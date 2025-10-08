import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { phone, password, role } = req.body; // role = "admin" | "worker"
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (phone, password, role) VALUES ($1,$2,$3) ON CONFLICT (phone) DO NOTHING",
      [phone, hash, role]
    );
    return res.status(201).json({ success: true });
  } else if (req.method === "GET") {
    const result = await pool.query("SELECT id, phone, role FROM users");
    return res.status(200).json(result.rows);
  }
}
