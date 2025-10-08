import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { customer_phone, message } = req.body;

  if (!customer_phone || !message) {
    return res.status(400).json({ error: "Missing phone or message" });
  }

  try {
    // ذخیره پیام در دیتابیس
    const query = `
      INSERT INTO sms_messages (customer_phone, message, received_at)
      VALUES ($1, $2, NOW())
      RETURNING id
    `;
    const result = await pool.query(query, [customer_phone, message]);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
}
