import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function parseUserId(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return parseInt(payload.sub);
  } catch { return 1; }
}

export default function App() {
  const [token, setToken] = useState("");

  if (!token) return <Login onLogin={setToken} />;
  return <Dashboard token={token} userId={parseUserId(token)} />;
}
