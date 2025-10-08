import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { coworker_id, national_id, phone, name, loan_type } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      "INSERT INTO loans (coworker_id, national_id, phone, name, loan_type) VALUES ($1, $2, $3, $4, $5)",
      [coworker_id, national_id, phone, name, loan_type]
    );
    client.release();

    res.status(200).json({ message: "Loan added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
