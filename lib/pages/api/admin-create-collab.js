// pages/api/admin-create-collab.js
import { admin, db } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const idToken = req.headers.authorization?.split("Bearer ")?.[1];
  if (!idToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const requester = await db.collection("users").doc(decoded.uid).get();
    if (!requester.exists || requester.data().role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { phone, password, name } = req.body;
    if (!phone || !password) return res.status(400).json({ error: "missing" });

    // create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      uid: `collab_${phone}`,
      phoneNumber: `+98${phone.replace(/^0/, "")}`,
      password: password,
      displayName: name || phone
    });

    // store profile in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      role: "collaborator",
      username: phone,
      phone,
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ ok: true, uid: userRecord.uid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error", detail: err.message });
  }
}
