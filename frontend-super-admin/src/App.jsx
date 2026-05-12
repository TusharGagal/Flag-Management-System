import { useState } from "react";
import { isLoggedIn } from "./api/index.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  // Check localStorage on first render to see if already logged in
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  return loggedIn ? (
    <Dashboard onLogout={() => setLoggedIn(false)} />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}
