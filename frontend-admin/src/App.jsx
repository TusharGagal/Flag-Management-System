import { useState } from "react";
import { isLoggedIn } from "./api/index.js";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  return loggedIn ? (
    <Dashboard onLogout={() => setLoggedIn(false)} />
  ) : (
    <Auth onAuth={() => setLoggedIn(true)} />
  );
}
