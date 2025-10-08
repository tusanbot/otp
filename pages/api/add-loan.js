// pages/api/add-loan.js
import { admin, db } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const idToken = req.headers.authorization?.split("Bearer ")?.[1];
  if (!idToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const collabDoc = await db.collection("users").doc(decoded.uid).get();
    if (!collabDoc.exists || collabDoc.data().role !== "collaborator") {
      return res.status(403).json({ error: "forbidden" });
    }

    const { nationalId, phone, customerName, loanType } = req.body;
    if (!nationalId || !phone || !loanType) return res.status(400).json({ error: "missing" });

    // اگر مشتری وجود ندارد، ایجاد کن (uid = cust_<nationalId>)
    const customerUid = `cust_${nationalId}`;
    const customerRef = db.collection("users").doc(customerUid);
    const customerSnap = await customerRef.get();

    if (!customerSnap.exists) {
      // ایجاد Firebase Auth user برای مشتری
      try {
        await admin.auth().createUser({
          uid: customerUid,
          email: undefined,
          phoneNumber: `+98${phone.replace(/^0/, "")}`,
          password: phone, // طبق خواستت: password = phone
          displayName: customerName || nationalId,
        });
      } catch (e) {
        // احتمال اینکه کاربر با phone موجود باشه؛ در prod بهتر خطاها را هندل کن
        console.warn("createUser might fail:", e.message);
      }

      await customerRef.set({
        role: "customer",
        username: nationalId,
        phone,
        nationalId,
        name: customerName || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // ایجاد سند وام
    const loanRef = await db.collection("loans").add({
      nationalId,
      phone,
      customerName,
      loanType,
      createdBy: decoded.uid,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ ok: true, loanId: loanRef.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
