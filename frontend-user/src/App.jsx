import { useState } from "react";
import { checkFlag } from "./api/index.js";

export default function App() {
  const [orgId, setOrgId] = useState("");
  const [featureKey, setFeatureKey] = useState("");
  const [result, setResult] = useState(null); // { feature_key, is_enabled }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await checkFlag(orgId, featureKey);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h1>🚩 Feature Flag Checker</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Check if a feature is enabled for your organization
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Organization ID</label>
          <input
            style={styles.input}
            type="number"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            placeholder="e.g. 1"
            required
          />

          <label style={styles.label}>Feature Key</label>
          <input
            style={styles.input}
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            placeholder="e.g. dark_mode"
            required
          />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Feature"}
          </button>
        </form>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* RESULT */}
        {result && (
          <div
            style={{
              ...styles.result,
              background: result.is_enabled ? "#d4edda" : "#f8d7da",
              borderColor: result.is_enabled ? "#c3e6cb" : "#f5c6cb",
            }}
          >
            <div style={{ fontSize: 48 }}>
              {result.is_enabled ? "✅" : "❌"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
              <code>{result.feature_key}</code> is{" "}
              {result.is_enabled ? "ENABLED" : "DISABLED"}
            </div>
            <div style={{ color: "#555", marginTop: 4 }}>
              for your organization
            </div>
          </div>
        )}
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
    width: 400,
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
    background: "#6f42c1",
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
    marginTop: 16,
  },
  result: {
    border: "2px solid",
    borderRadius: 8,
    padding: 24,
    marginTop: 20,
    textAlign: "center",
  },
};
