// pages/api/sms-webhook.js
import { db } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  // provider-specific payload parsing
  const { From, To, Body } = req.body; // مثال از Twilio webhook
  // پیدا کردن loan مربوط به شماره فرستنده (یا mapping) و ذخیره پیام
  const loanQ = await db.collection("loans").where("phone", "==", From.replace("+98","0")).limit(1).get();
  let loanId = null;
  if (!loanQ.empty) loanId = loanQ.docs[0].id;

  await db.collection("messages").add({
    loanId,
    from: From,
    to: To,
    body: Body,
    receivedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // می‌توانیم نوتیفای به collaborator بفرستیم (push / in-app)
  res.status(200).end();
}
