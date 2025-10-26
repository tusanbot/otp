// api/agents.js
import { pool } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, mobile, national_id } = req.body;

    try {
      // مرحله ۱: ثبت همکار در جدول agents
      const insertAgent = await pool.query(
        `INSERT INTO agents (name, mobile, national_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [name, mobile, national_id]
      );

      const agentId = insertAgent.rows[0].id;
      const tableName = `customers_${agentId}`;

      // مرحله ۲: ایجاد جدول اختصاصی مشتری‌ها برای همکار
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          national_id TEXT,
          mobile TEXT,
          name TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // مرحله ۳: ذخیره‌ی نام جدول در جدول agents
      await pool.query(
        `UPDATE agents SET customer_table = $1 WHERE id = $2`,
        [tableName, agentId]
      );

      res.status(201).json({
        success: true,
        message: `همکار با شناسه ${agentId} ثبت شد.`,
        agentId,
        table: tableName,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'خطا در ثبت همکار یا ساخت جدول مشتری‌ها.' });
    }
  } else {
    res.status(405).json({ error: 'فقط POST مجاز است.' });
  }
}
