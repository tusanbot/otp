import { sql, ensurePartnerTable } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const { partnerId, national_id, phone, name } = req.body;
    if (!partnerId || !national_id || !phone)
      return res.status(400).json({ error: 'Missing required fields' });

    // اطمینان از وجود جدول مخصوص همکار
    const tableName = await ensurePartnerTable(partnerId);

    // درج اطلاعات مشتری در جدول اختصاصی
    await sql(`
      INSERT INTO ${tableName} (national_id, phone, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (national_id) DO NOTHING;
    `, [national_id, phone, name]);

    res.status(200).json({ success: true, table: tableName });
  } catch (err) {
    console.error('Error adding customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
