// lib/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    // or use application default on Vercel with GOOGLE_APPLICATION_CREDENTIALS
  });
}

const db = admin.firestore();
export { admin, db };
