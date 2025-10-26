// api/sms/forward.js (Vercel serverless / Express style handler)
import { verifyToken } from "../utils/auth.js";
import { getCustomerById, saveMessageForAgent } from "../utils/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
    const token = auth.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== "customer") return res.status(403).json({ error: "Invalid customer token" });

    // payload.id => customerId
    const customer = await getCustomerById(payload.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const { from, body, timestamp } = req.body || {};
    if (!from || !body) return res.status(400).json({ error: "Missing from or body" });

    // بررسی: آیا شماره فرستنده در allowedSenders برای این مشتری هست؟
    const allowed = (customer.allowedSenders || []).map(s => normalizeNumber(s));
    if (!allowed.includes(normalizeNumber(from))) {
      // اختیاری: می‌توانیم نپذیریم یا لاگ کنیم
      return res.status(403).json({ error: "Sender not allowed for this customer" });
    }

    // پیام آماده برای ذخیره/ارسال به همکار
    const msg = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      customerId: customer.id,
      from,
      body,
      timestamp: timestamp || new Date().toISOString(),
    };

    // ذخیره (موقتی) زیر agent
    await saveMessageForAgent(customer.agentId, msg);

    // اختیاری: اگر میخواید push notification ارسال کنید، اینجا تریگر کنید.

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

function normalizeNumber(n) {
  return n.replace(/[^0-9]/g, '').replace(/^0+/, '');
}
