import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "worker") return res.status(403).json({ error: "Access denied" });

  const { national_id, customer_phone, customer_name, loan_type } = req.body;
  await pool.query(
    "INSERT INTO loans (worker_id, national_id, customer_phone, customer_name, loan_type, created_at) VALUES ($1,$2,$3,$4,$5,NOW())",
    [decoded.id, national_id, customer_phone, customer_name, loan_type]
  );

  res.status(201).json({ success: true });
}
