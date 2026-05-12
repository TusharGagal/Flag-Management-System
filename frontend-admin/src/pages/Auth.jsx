import { useState } from "react";
import { login, signup } from "../api/index.js";

export default function Auth({ onAuth }) {
  const [tab, setTab] = useState("login"); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchTab(newTab) {
    setTab(newTab);
    setError(""); // clear error when switching tabs
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(email, password, orgSlug);
      }
      onAuth(); // tell App.jsx auth was successful
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h1>⚙️ Admin Portal</h1>
        <p style={{ color: "#666", marginBottom: 20 }}>
          Manage your organization's feature flags
        </p>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={tab === "login" ? styles.tabActive : styles.tab}
            onClick={() => switchTab("login")}
          >
            Login
          </button>
          <button
            style={tab === "signup" ? styles.tabActive : styles.tab}
            onClick={() => switchTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          {/* Only show org slug field on signup */}
          {tab === "signup" && (
            <>
              <label style={styles.label}>Organization Slug</label>
              <input
                style={styles.input}
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="e.g. acme-corp (get this from super admin)"
                required
              />
            </>
          )}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Login"
                : "Create Account"}
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
    width: 380,
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
    background: "#0d6efd",
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
  tabs: { display: "flex", marginBottom: 20, borderBottom: "2px solid #eee" },
  tab: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 15,
    color: "#666",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
  },
  tabActive: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 15,
    color: "#0d6efd",
    fontWeight: 700,
    borderBottom: "2px solid #0d6efd",
    marginBottom: -2,
  },
};
