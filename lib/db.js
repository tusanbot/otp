// api/db.js
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// ایجاد جدول اختصاصی مشتریان برای هر همکار در صورت نیاز
export async function ensurePartnerTable(partnerId) {
  const tableName = `customers_${partnerId}`;
  await sql(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      national_id VARCHAR(20) UNIQUE,
      phone VARCHAR(20),
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  return tableName;
}

export { sql };
