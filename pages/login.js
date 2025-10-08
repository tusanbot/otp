import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // در Firebase ایمیل نمی‌خوایم — پس موبایل رو به صورت ایمیل جعلی ذخیره کردیم
      const fakeEmail = `${phone}@loan-app.fake`;
      await signInWithEmailAndPassword(auth, fakeEmail, password);

      // نقش کاربر رو از Firestore بخون
      const userRef = doc(db, "users", phone);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        router.push(`/dashboard?role=${data.role}&phone=${phone}`);
      } else {
        setError("کاربر یافت نشد.");
      }
    } catch (err) {
      setError("ورود ناموفق. اطلاعات را بررسی کنید.");
    }
  };

  return (
    <div dir="rtl" style={styles.container}>
      <h1 style={styles.title}>ورود به سامانه وام</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="شماره موبایل"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>ورود</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Vazir, sans-serif",
    backgroundColor: "#f3f4f6",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#1e3a8a", marginBottom: 20 },
  form: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    textAlign: "center",
  },
  button: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  error: { color: "red", fontSize: 13, textAlign: "center" },
};
