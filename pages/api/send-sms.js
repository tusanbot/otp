// pages/api/send-sms.js
import { db } from "../../lib/firebaseAdmin";
import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, body, loanId } = req.body;
  if (!to || !body) return res.status(400).json({ error: "missing" });

  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_FROM; // e.g. +1xxxx or Twilio sender name

  if (!accountSid || !authToken || !from) return res.status(500).json({ error: "sms not configured" });

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body,
      from,
      to: `+98${to.replace(/^0/, "")}`
    });

    // ذخیره پیام در Firestore
    await db.collection("messages").add({
      loanId: loanId || null,
      from: from,
      to,
      body,
      providerMessageSid: message.sid,
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ ok: true, sid: message.sid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
