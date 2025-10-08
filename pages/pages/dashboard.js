import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const { role, phone } = router.query;
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    nationalId: "",
    customerPhone: "",
    name: "",
    loanType: "",
  });

  useEffect(() => {
    if (!role) return;
    fetchLoans();
  }, [role]);

  const fetchLoans = async () => {
    const q = query(collection(db, "loans"), where("createdBy", "==", phone));
    const snap = await getDocs(q);
    setLoans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addLoan = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "loans"), {
      ...form,
      createdBy: phone,
      createdAt: new Date(),
    });
    setForm({ nationalId: "", customerPhone: "", name: "", loanType: "" });
    fetchLoans();
  };

  return (
    <div dir="rtl" style={styles.container}>
      <h1 style={styles.title}>داشبورد {role === "agent" ? "همکار" : "مشتری"}</h1>

      {role === "agent" ? (
        <div style={styles.formCard}>
          <h3>➕ افزودن وام جدید</h3>
          <form onSubmit={addLoan} style={styles.form}>
            <input
              placeholder="کد ملی مشتری"
              value={form.nationalId}
              onChange={(e) =>
                setForm({ ...form, nationalId: e.target.value })
              }
              required
              style={styles.input}
            />
            <input
              placeholder="شماره موبایل مشتری"
              value={form.customerPhone}
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
              required
              style={styles.input}
            />
            <input
              placeholder="نام مشتری"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              placeholder="نوع وام (مثلاً ازدواج)"
              value={form.loanType}
              onChange={(e) => setForm({ ...form, loanType: e.target.value })}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>ثبت</button>
          </form>

          <h3 style={{ marginTop: 20 }}>📋 وام‌های ثبت‌شده</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>نام</th>
                <th>شماره موبایل</th>
                <th>نوع وام</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.customerPhone}</td>
                  <td>{l.loanType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.formCard}>
          <h3>📨 پیام‌های دریافتی شما</h3>
          <p>در نسخه بعدی، پیامک‌ها و اطلاع‌رسانی‌های وام اینجا نمایش داده می‌شن.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Vazir, sans-serif",
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "20px",
  },
  title: { color: "#1e3a8a", textAlign: "center" },
  formCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: 600,
    margin: "30px auto",
  },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: 10,
  },
  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: 10,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
  },
};
