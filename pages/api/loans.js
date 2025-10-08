import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const result = await pool.query(
    "SELECT * FROM loans WHERE worker_id=$1 ORDER BY created_at DESC",
    [decoded.id]
  );
  res.status(200).json(result.rows);
}
