const BASE = "/api/super-admin";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("sa_token");
}

// Build auth headers for protected routes
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Check if super admin is logged in
export function isLoggedIn() {
  return !!getToken();
}

// Save token after login
export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("sa_token", data.token);
  return data;
}

// Clear token on logout
export function logout() {
  localStorage.removeItem("sa_token");
}

// Fetch all organizations
export async function getOrganizations() {
  const res = await fetch(`${BASE}/organizations`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch organizations");
  return data;
}

// Create a new organization
export async function createOrganization(name) {
  const res = await fetch(`${BASE}/organizations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create organization");
  return data;
}
