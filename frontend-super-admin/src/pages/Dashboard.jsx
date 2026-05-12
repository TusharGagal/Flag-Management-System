import { useState, useEffect } from "react";
import { getOrganizations, createOrganization, logout } from "../api/index.js";

export default function Dashboard({ onLogout }) {
  const [orgs, setOrgs] = useState([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch orgs when dashboard loads
  useEffect(() => {
    fetchOrgs();
  }, []);

  async function fetchOrgs() {
    try {
      const data = await getOrganizations();
      setOrgs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateOrg(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const org = await createOrganization(newOrgName);
      setSuccess(`Organization "${org.name}" created! Slug: ${org.slug}`);
      setNewOrgName("");
      fetchOrgs(); // refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    onLogout();
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>🏢 Super Admin Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* CREATE ORG FORM */}
      <div style={styles.card}>
        <h2>Create New Organization</h2>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleCreateOrg} style={{ display: "flex", gap: 12 }}>
          <input
            style={{ ...styles.input, flex: 1, marginBottom: 0 }}
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            required
          />
          <button
            style={{ ...styles.btn, width: "auto", padding: "10px 24px" }}
            disabled={loading}
          >
            {loading ? "Creating..." : "+ Create"}
          </button>
        </form>
      </div>

      {/* ORGANIZATIONS TABLE */}
      <div style={styles.card}>
        <h2>All Organizations ({orgs.length})</h2>
        {orgs.length === 0 ? (
          <p style={{ color: "#888" }}>
            No organizations yet. Create one above.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Users</th>
                <th style={styles.th}>Flags</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td style={styles.td}>{org.id}</td>
                  <td style={styles.td}>
                    <strong>{org.name}</strong>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.code}>{org.slug}</code>
                  </td>
                  <td style={styles.td}>{org.user_count}</td>
                  <td style={styles.td}>{org.flag_count}</td>
                  <td style={styles.td}>
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* INSTRUCTIONS FOR ORG ADMINS */}
      <div style={{ ...styles.card, background: "#f0f7ff" }}>
        <h3>📋 How to onboard an Org Admin</h3>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li>Create the organization above</li>
          <li>
            Share the <strong>Slug</strong> and <strong>ID</strong> with the org
            admin
          </li>
          <li>
            Org admin signs up at <strong>localhost:3002</strong> using the slug
          </li>
          <li>
            End users check flags at <strong>localhost:3003</strong> using the
            org ID
          </li>
        </ol>
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
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 600,
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
  },
};
