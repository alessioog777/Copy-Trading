import { useState } from "react";

const API = "http://localhost:8000";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
      if (!res.ok) { setError("Benutzername oder Passwort falsch"); return; }
      const data = await res.json();
      onLogin(data.access_token);
    } catch {
      setError("Server nicht erreichbar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:"flex",height:"100vh",background:"#f9fafb",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:"360px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",justifyContent:"center",marginBottom:"32px"}}>
          <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"#0ea5e9",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"13px",fontWeight:500}}>CT</div>
          <span style={{fontSize:"18px",fontWeight:500,color:"#1f2937"}}>CopyTrader</span>
        </div>
        <div style={{background:"white",borderRadius:"12px",border:"1px solid #f3f4f6",padding:"32px"}}>
          <h1 style={{fontSize:"16px",fontWeight:500,color:"#1f2937",marginBottom:"4px"}}>Welcome back</h1>
          <p style={{fontSize:"12px",color:"#9ca3af",marginBottom:"24px"}}>Sign in to your account</p>
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div>
              <label style={{fontSize:"12px",color:"#6b7280",display:"block",marginBottom:"6px"}}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder=""
                style={{width:"100%",padding:"8px 12px",fontSize:"14px",borderRadius:"8px",border:"1px solid #e5e7eb",outline:"none",boxSizing:"border-box"}} />
            </div>
            <div>
              <label style={{fontSize:"12px",color:"#6b7280",display:"block",marginBottom:"6px"}}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder=""
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{width:"100%",padding:"8px 12px",fontSize:"14px",borderRadius:"8px",border:"1px solid #e5e7eb",outline:"none",boxSizing:"border-box"}} />
            </div>
            {error && <p style={{fontSize:"12px",color:"#ef4444"}}>{error}</p>}
            <button onClick={handleLogin} disabled={loading}
              style={{width:"100%",padding:"8px",borderRadius:"8px",background:"#0ea5e9",color:"white",fontSize:"14px",fontWeight:500,border:"none",cursor:"pointer",opacity:loading?0.6:1}}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
