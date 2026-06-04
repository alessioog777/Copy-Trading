import { useState, useEffect } from "react";

const API = "http://localhost:8000";

interface Account {
  id: number;
  label: string;
  broker: string;
  account_id: string;
  is_leader: boolean;
  is_active: boolean;
  balance: number;
  day_pnl: number;
  open_pnl: number;
  ratio: number;
}

const s = {
  app: {display:"flex",height:"100vh",background:"white",fontSize:"13px",overflow:"hidden"} as React.CSSProperties,
  sidebar: {width:"192px",borderRight:"1px solid #f3f4f6",display:"flex",flexDirection:"column" as const,background:"#f9fafb",flexShrink:0},
  logo: {display:"flex",alignItems:"center",gap:"8px",padding:"16px",borderBottom:"1px solid #f3f4f6"},
  logoMark: {width:"28px",height:"28px",borderRadius:"6px",background:"#0ea5e9",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"12px",fontWeight:500},
  nav: {flex:1,padding:"8px 6px"},
  navItem: {display:"flex",alignItems:"center",gap:"8px",padding:"6px 12px",borderRadius:"6px",color:"#6b7280",cursor:"pointer",marginBottom:"2px"},
  navItemActive: {display:"flex",alignItems:"center",gap:"8px",padding:"6px 12px",borderRadius:"6px",color:"#1f2937",background:"white",fontWeight:500,cursor:"pointer",marginBottom:"2px"},
  navSection: {fontSize:"11px",color:"#9ca3af",padding:"12px 12px 4px",textTransform:"uppercase" as const,letterSpacing:"0.04em"},
  main: {flex:1,display:"flex",flexDirection:"column" as const,overflow:"hidden"},
  topbar: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:"48px",borderBottom:"1px solid #f3f4f6",flexShrink:0},
  pill: {display:"flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"20px",border:"1px solid #e5e7eb",fontSize:"12px",color:"#6b7280"},
  dot: {width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e"},
  btnGray: {padding:"4px 10px",borderRadius:"6px",border:"1px solid #e5e7eb",fontSize:"12px",color:"#6b7280",cursor:"pointer",background:"transparent"},
  btnRed: {padding:"4px 10px",borderRadius:"6px",border:"1px solid #fecaca",fontSize:"12px",color:"#dc2626",cursor:"pointer",background:"#fef2f2"},
  btnBlue: {padding:"4px 10px",borderRadius:"6px",border:"1px solid #0ea5e9",fontSize:"12px",color:"white",cursor:"pointer",background:"#0ea5e9"},
  stats: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid #f3f4f6",flexShrink:0},
  stat: {padding:"10px 20px",borderRight:"1px solid #f3f4f6"},
  statLabel: {fontSize:"11px",color:"#9ca3af",marginBottom:"3px"},
  statVal: {fontSize:"14px",fontWeight:500},
  table: {width:"100%",borderCollapse:"collapse" as const,fontSize:"12px"},
  th: {padding:"8px 12px",textAlign:"left" as const,color:"#9ca3af",fontWeight:400,borderBottom:"1px solid #f3f4f6"},
  td: {padding:"8px 12px",borderBottom:"1px solid #f9fafb"},
  badge: {padding:"2px 8px",borderRadius:"4px",background:"#f3f4f6",color:"#4b5563",fontSize:"11px"},
  btnSmall: {padding:"2px 8px",borderRadius:"4px",border:"1px solid #e5e7eb",fontSize:"11px",color:"#6b7280",cursor:"pointer",background:"transparent"},
};

export default function Dashboard({ token }: { token: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API}/api/accounts/`, { headers });
      const data = await res.json();
      setAccounts(data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAccounts();
    const t = setInterval(fetchAccounts, 3000);
    return () => clearInterval(t);
  }, []);

  const toggle = async (id: number) => {
    await fetch(`${API}/api/accounts/${id}/toggle`, { method: "PATCH", headers });
    fetchAccounts();
  };

  const setLeader = async (id: number) => {
    await fetch(`${API}/api/accounts/${id}/set-leader`, { method: "PATCH", headers });
    fetchAccounts();
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalDayPnl = accounts.reduce((s, a) => s + a.day_pnl, 0);
  const totalOpenPnl = accounts.reduce((s, a) => s + a.open_pnl, 0);

  return (
    <div style={s.app}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}>CT</div>
          <span style={{fontWeight:500,color:"#1f2937"}}>CopyTrader</span>
        </div>
        <div style={s.nav}>
          {[["??","Home"],["??","Connections"],["??","Calendar"]].map(([icon,label]) => (
            <div key={label} style={s.navItem}>{icon} {label}</div>
          ))}
          <div style={s.navSection}>Copy Trading</div>
          <div style={s.navItemActive}>?? Cockpit</div>
          <div style={s.navItem}>?? Groups</div>
          <div style={s.navItem}>??? Risk Mgmt</div>
          <div style={s.navSection}>Analytics</div>
          <div style={s.navItem}>?? Dashboard</div>
          <div style={s.navItem}>?? Daily</div>
          <div style={s.navItem}>?? Weekly</div>
        </div>
        <div style={{padding:"8px 6px",borderTop:"1px solid #f3f4f6"}}>
          <div style={s.navItem}>?? Settings</div>
          <div style={s.navItem}>?? Dark mode</div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontWeight:500,color:"#1f2937"}}>Cockpit</span>
            <div style={s.pill}>
              <span style={s.dot}></span>
              {accounts.filter(a => a.is_active).length} Accounts aktiv
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <button style={s.btnGray}>Change leader</button>
            <button style={s.btnGray}>Disable all followers</button>
            <button style={s.btnRed}>? Cancel all orders</button>
            <button style={s.btnBlue}>Flatten all</button>
          </div>
        </div>

        <div style={s.stats}>
          <div style={s.stat}>
            <div style={s.statLabel}>Total day PnL</div>
            <div style={{...s.statVal,color:totalDayPnl>=0?"#16a34a":"#ef4444"}}>
              {totalDayPnl>=0?"+":""} ${totalDayPnl.toFixed(2)}
            </div>
          </div>
          <div style={s.stat}>
            <div style={s.statLabel}>Total open PnL</div>
            <div style={{...s.statVal,color:totalOpenPnl>=0?"#16a34a":"#ef4444"}}>
              {totalOpenPnl>=0?"+":""} ${totalOpenPnl.toFixed(2)}
            </div>
          </div>
          <div style={{...s.stat,borderRight:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={s.statLabel}>Total balance</div>
              <div style={s.statVal}>${totalBalance.toFixed(2)}</div>
            </div>
            <div style={s.pill}><span style={s.dot}></span>Accounts: {accounts.length}</div>
          </div>
        </div>

        <div style={{flex:1,overflow:"auto"}}>
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"128px",color:"#9ca3af"}}>Laden...</div>
          ) : accounts.length === 0 ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"128px",color:"#9ca3af"}}>Keine Accounts verknüpft</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}></th>
                  <th style={s.th}>Follow</th>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Broker</th>
                  <th style={s.th}>Account</th>
                  <th style={s.th}>Balance</th>
                  <th style={s.th}>Day PnL</th>
                  <th style={s.th}>Open PnL</th>
                  <th style={s.th}>Ratio</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} style={{borderBottom:"1px solid #f9fafb"}}>
                    <td style={s.td}>{a.is_leader ? "??" : ""}</td>
                    <td style={s.td}>
                      {a.is_leader ? (
                        <span style={{color:"#f59e0b",fontSize:"11px"}}>Leader</span>
                      ) : (
                        <div onClick={() => toggle(a.id)} style={{width:"32px",height:"16px",borderRadius:"8px",background:a.is_active?"#0ea5e9":"#d1d5db",cursor:"pointer",position:"relative"}}>
                          <div style={{position:"absolute",top:"2px",width:"12px",height:"12px",borderRadius:"50%",background:"white",transition:"transform 0.2s",transform:a.is_active?"translateX(18px)":"translateX(2px)"}}></div>
                        </div>
                      )}
                    </td>
                    <td style={{...s.td,color:"#9ca3af",fontFamily:"monospace"}}>#{a.id}</td>
                    <td style={s.td}><span style={s.badge}>{a.broker}</span></td>
                    <td style={{...s.td,color:"#6b7280"}}>{a.label}</td>
                    <td style={s.td}>${a.balance.toFixed(2)}</td>
                    <td style={{...s.td,color:a.day_pnl>=0?"#16a34a":"#ef4444"}}>{a.day_pnl>=0?"+":""} ${a.day_pnl.toFixed(2)}</td>
                    <td style={{...s.td,color:a.open_pnl>=0?"#16a34a":"#ef4444"}}>{a.open_pnl>=0?"+":""} ${a.open_pnl.toFixed(2)}</td>
                    <td style={s.td}>{a.ratio}x</td>
                    <td style={{...s.td,display:"flex",gap:"4px"}}>
                      <button onClick={() => setLeader(a.id)} style={{...s.btnSmall,color:"#d97706",borderColor:"#fde68a"}}>Leader</button>
                      <button style={{...s.btnSmall,color:"#dc2626",borderColor:"#fecaca"}}>Flatten</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
