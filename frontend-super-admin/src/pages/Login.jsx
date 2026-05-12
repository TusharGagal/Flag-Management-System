import { useState } from "react";
import { login } from "../api/index.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onLogin(); // tell App.jsx login was successful
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h1>🔑 Super Admin</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Feature Flag Management System
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="superadmin@system.com"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f4f4f4",
  },
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: 32,
    width: 360,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  label: { display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    marginBottom: 16,
    boxSizing: "border-box",
  },
  btn: {
    display: "block",
    width: "100%",
    padding: 12,
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#c00",
    marginBottom: 16,
  },
};
