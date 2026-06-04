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
  modal: {position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100},
  modalBox: {background:"white",borderRadius:"12px",padding:"28px",width:"400px",boxShadow:"0 20px 40px rgba(0,0,0,0.15)"},
  input: {width:"100%",padding:"8px 12px",fontSize:"13px",borderRadius:"8px",border:"1px solid #e5e7eb",outline:"none",boxSizing:"border-box" as const,marginTop:"4px"},
  label: {fontSize:"12px",color:"#6b7280",display:"block",marginBottom:"2px"},
};

const NAV = [{icon:"home",label:"Home"},{icon:"plug",label:"Connections"},{icon:"calendar",label:"Calendar"}];
const NAV2 = [{icon:"chart",label:"Cockpit",active:true},{icon:"users",label:"Groups"},{icon:"shield",label:"Risk Mgmt"}];
const NAV3 = [{icon:"bar",label:"Dashboard"},{icon:"day",label:"Daily"},{icon:"week",label:"Weekly"}];

function Icon({name}: {name:string}) {
  const icons: Record<string,string> = {
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    plug: "M13 10V3L4 14h7v7l9-11h-7z",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    bar: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    day: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    week: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
    plus: "M12 4v16m8-8H4",
    x: "M6 18L18 6M6 6l12 12",
  };
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name] || icons.home}/>
    </svg>
  );
}

export default function Dashboard({ token }: { token: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({label:"",broker:"tradelocker",account_id:"PINEX",api_key:"",api_secret:""});
  const [saving, setSaving] = useState(false);

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

  const deleteAccount = async (id: number) => {
    await fetch(`${API}/api/accounts/${id}`, { method: "DELETE", headers });
    fetchAccounts();
  };

  const addAccount = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/accounts/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ratio: 1.0 }),
      });
      setShowModal(false);
      setForm({label:"",broker:"tradelocker",account_id:"PINEX",api_key:"",api_secret:""});
      fetchAccounts();
    } finally { setSaving(false); }
  };

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalDayPnl = accounts.reduce((s, a) => s + a.day_pnl, 0);
  const totalOpenPnl = accounts.reduce((s, a) => s + a.open_pnl, 0);

  return (
    <div style={s.app}>
      {showModal && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
              <span style={{fontSize:"15px",fontWeight:500,color:"#1f2937"}}>Account hinzufuegen</span>
              <div onClick={() => setShowModal(false)} style={{cursor:"pointer",color:"#9ca3af"}}><Icon name="x"/></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <div>
                <label style={s.label}>Label</label>
                <input style={s.input} value={form.label} onChange={e => setForm({...form,label:e.target.value})} placeholder="" />
              </div>
              <div>
                <label style={s.label}>Plattform</label>
                <select style={s.input} value={form.broker} onChange={e => setForm({...form,broker:e.target.value})}>
                  <option value="tradelocker">TradeLocker</option>
                  <option value="paper">Paper Trading</option>
                  <option value="mt4">MT4</option>
                  <option value="mt5">MT5</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Server</label>
                <input style={s.input} value={form.account_id} onChange={e => setForm({...form,account_id:e.target.value})} placeholder="" />
              </div>
              <div>
                <label style={s.label}>Email</label>
                <input type="email" style={s.input} value={form.api_key} onChange={e => setForm({...form,api_key:e.target.value})} placeholder="" />
              </div>
              <div>
                <label style={s.label}>Passwort</label>
                <input type="password" style={s.input} value={form.api_secret} onChange={e => setForm({...form,api_secret:e.target.value})} placeholder="" />
              </div>
              <button onClick={addAccount} disabled={saving}
                style={{...s.btnBlue,padding:"8px",borderRadius:"8px",fontSize:"13px",fontWeight:500,marginTop:"4px",opacity:saving?0.6:1}}>
                {saving ? "Speichern..." : "Account hinzufuegen"}
              </button>
            </div>
          </div>
        </div>
      )}

      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}>CT</div>
          <span style={{fontWeight:500,color:"#1f2937"}}>CopyTrader</span>
        </div>
        <div style={s.nav}>
          {NAV.map(({icon,label}) => (
            <div key={label} style={s.navItem}><Icon name={icon}/> {label}</div>
          ))}
          <div style={s.navSection}>Copy Trading</div>
          {NAV2.map(({icon,label,active}) => (
            <div key={label} style={active ? s.navItemActive : s.navItem}><Icon name={icon}/> {label}</div>
          ))}
          <div style={s.navSection}>Analytics</div>
          {NAV3.map(({icon,label}) => (
            <div key={label} style={s.navItem}><Icon name={icon}/> {label}</div>
          ))}
        </div>
        <div style={{padding:"8px 6px",borderTop:"1px solid #f3f4f6"}}>
          <div style={s.navItem}><Icon name="settings"/> Settings</div>
          <div style={s.navItem}><Icon name="moon"/> Dark mode</div>
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
            <button onClick={() => setShowModal(true)} style={s.btnBlue}><Icon name="plus"/> Account</button>
            <button style={s.btnGray}>Change leader</button>
            <button style={s.btnGray}>Disable all</button>
            <button style={s.btnRed}>x Cancel orders</button>
            <button style={{...s.btnBlue,background:"#0f172a",borderColor:"#0f172a"}}>Flatten all</button>
          </div>
        </div>

        <div style={s.stats}>
          <div style={s.stat}>
            <div style={s.statLabel}>Total day PnL</div>
            <div style={{...s.statVal,color:totalDayPnl>=0?"#16a34a":"#ef4444"}}>{totalDayPnl>=0?"+":""} ${totalDayPnl.toFixed(2)}</div>
          </div>
          <div style={s.stat}>
            <div style={s.statLabel}>Total open PnL</div>
            <div style={{...s.statVal,color:totalOpenPnl>=0?"#16a34a":"#ef4444"}}>{totalOpenPnl>=0?"+":""} ${totalOpenPnl.toFixed(2)}</div>
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
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"200px",color:"#9ca3af",gap:"12px"}}>
              <span>Noch keine Accounts</span>
              <button onClick={() => setShowModal(true)} style={s.btnBlue}>Account hinzufuegen</button>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}></th>
                  <th style={s.th}>Follow</th>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Plattform</th>
                  <th style={s.th}>Account</th>
                  <th style={s.th}>Balance</th>
                  <th style={s.th}>Day PnL</th>
                  <th style={s.th}>Open PnL</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td style={s.td}>
                      {a.is_leader && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                          <path d="M5 16L3 5l5.5 5L12 2l3.5 8L21 5l-2 11H5zm0 0h14" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </td>
                    <td style={s.td}>
                      {a.is_leader ? (
                        <span style={{color:"#f59e0b",fontSize:"11px",fontWeight:500}}>Leader</span>
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
                    <td style={{...s.td,display:"flex",gap:"4px"}}>
                      <button onClick={() => setLeader(a.id)} style={{...s.btnSmall,color:"#d97706",borderColor:"#fde68a"}}>Leader</button>
                      <button style={{...s.btnSmall,color:"#dc2626",borderColor:"#fecaca"}}>Flatten</button>
                      <button onClick={() => deleteAccount(a.id)} style={{...s.btnSmall,color:"#9ca3af"}}>x</button>
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
