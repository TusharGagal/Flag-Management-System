import { useState, useEffect } from "react";
import {
  getFlags,
  createFlag,
  toggleFlag,
  deleteFlag,
  logout,
} from "../api/index.js";

// ── SINGLE FLAG ROW ───────────────────────────────────────────────────────────
function FlagRow({ flag, onToggle, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await onToggle(flag.id, !flag.is_enabled);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete flag "${flag.feature_key}"? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    try {
      await onDelete(flag.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr>
      <td style={styles.td}>
        <code style={styles.code}>{flag.feature_key}</code>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.badge,
            background: flag.is_enabled ? "#d4edda" : "#f8d7da",
            color: flag.is_enabled ? "#155724" : "#721c24",
          }}
        >
          {flag.is_enabled ? "Enabled" : "Disabled"}
        </span>
      </td>
      <td style={styles.td}>
        {new Date(flag.created_at).toLocaleDateString()}
      </td>
      <td style={styles.td}>
        {/* Toggle button — green if currently disabled, red if currently enabled */}
        <button
          style={{
            ...styles.btnSm,
            background: flag.is_enabled ? "#dc3545" : "#28a745",
          }}
          onClick={handleToggle}
          disabled={toggling}
        >
          {toggling ? "..." : flag.is_enabled ? "Disable" : "Enable"}
        </button>{" "}
        <button
          style={{ ...styles.btnSm, background: "#6c757d" }}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export default function Dashboard({ onLogout }) {
  const [flags, setFlags] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, []);

  async function fetchFlags() {
    try {
      const data = await getFlags();
      setFlags(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await createFlag(newKey);
      setSuccess(`Flag "${newKey}" created successfully!`);
      setNewKey("");
      fetchFlags();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id, newState) {
    try {
      await toggleFlag(id, newState);
      fetchFlags();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteFlag(id);
      fetchFlags();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    logout();
    onLogout();
  }

  const enabledCount = flags.filter((f) => f.is_enabled).length;
  const disabledCount = flags.filter((f) => !f.is_enabled).length;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p style={{ color: "#666", margin: 0 }}>
            {flags.length} flags · {enabledCount} enabled · {disabledCount}{" "}
            disabled
          </p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* CREATE FLAG FORM */}
      <div style={styles.card}>
        <h2>Create Feature Flag</h2>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 12 }}>
          <input
            style={{ ...styles.input, flex: 1, marginBottom: 0 }}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="e.g. dark_mode, new_checkout"
            required
          />
          <button
            style={{ ...styles.btn, width: "auto", padding: "10px 24px" }}
            disabled={loading}
          >
            {loading ? "Creating..." : "+ Add Flag"}
          </button>
        </form>
      </div>

      {/* FLAGS TABLE */}
      <div style={styles.card}>
        <h2>Feature Flags</h2>
        {flags.length === 0 ? (
          <p style={{ color: "#888" }}>
            No flags yet. Create your first one above.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Feature Key</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <FlagRow
                  key={flag.id}
                  flag={flag}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 900, margin: "0 auto", padding: 24 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
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
  btnSm: {
    padding: "5px 12px",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 13,
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "8px 16px",
    background: "#666",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  error: {
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#c00",
    marginBottom: 16,
  },
  success: {
    background: "#efe",
    border: "1px solid #cfc",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#060",
    marginBottom: 16,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    background: "#f5f5f5",
    borderBottom: "2px solid #ddd",
    fontWeight: 600,
  },
  td: { padding: "10px 12px", borderBottom: "1px solid #eee" },
  code: {
    background: "#f0f0f0",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 13,
    fontFamily: "monospace",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },
};
