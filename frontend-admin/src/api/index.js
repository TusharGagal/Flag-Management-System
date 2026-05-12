const BASE = "/api";

function getToken() {
  return localStorage.getItem("admin_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_org_id");
}

export function getStoredOrgId() {
  return localStorage.getItem("admin_org_id");
}

// ── AUTH ──────────────────────────────────────────────────────────────────

export async function signup(email, password, orgSlug) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, orgSlug }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  localStorage.setItem("admin_token", data.token);
  localStorage.setItem("admin_org_id", data.orgId);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.role !== "org_admin")
    throw new Error("This portal is for Organization Admins only.");
  localStorage.setItem("admin_token", data.token);
  localStorage.setItem("admin_org_id", data.orgId);
  return data;
}

// ── FEATURE FLAGS ─────────────────────────────────────────────────────────

export async function getFlags() {
  const res = await fetch(`${BASE}/flags`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch flags");
  return data;
}

export async function createFlag(feature_key) {
  const res = await fetch(`${BASE}/flags`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ feature_key, is_enabled: false }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create flag");
  return data;
}

export async function toggleFlag(id, is_enabled) {
  const res = await fetch(`${BASE}/flags/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ is_enabled }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update flag");
  return data;
}

export async function deleteFlag(id) {
  const res = await fetch(`${BASE}/flags/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete flag");
  return data;
}
