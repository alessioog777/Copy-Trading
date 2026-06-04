import { useState } from "react";

const accounts = [
  { id: "...29070482", conn: "Tradovate", acc: "MFFUEVPRO201861006", sym: "MNQZ5", bal: "$149,087.66", price: "21248.50", pnl: "+$70,548.00", qty: 12, ratio: "1x", master: true },
  { id: "...98672", conn: "DxFeed Volumetrica", acc: "MFFUEVPRO203682044", sym: "MNQZ5", bal: "$149,542.18", price: "21248.50", pnl: "+$432.00", qty: 12, ratio: "1x", master: false },
  { id: "...98673", conn: "DxFeed Volumetrica", acc: "MFFUEVPRO203682045", sym: "MNQZ5", bal: "$149,377.00", price: "21248.50", pnl: "+$432.00", qty: 12, ratio: "1x", master: false },
  { id: "...10552343", conn: "ProjectX", acc: "S1AUG1315421706", sym: "MNQZ5", bal: "$48,352.94", price: "21248.50", pnl: "+$70,548.00", qty: 12, ratio: "1x", master: false },
  { id: "...12247321", conn: "ProjectX", acc: "S1OCT115514246", sym: "MNQZ5", bal: "$49,669.11", price: "21248.50", pnl: "+$70,548.00", qty: 12, ratio: "1x", master: false },
  { id: "...29070483", conn: "Tradovate", acc: "MFFUEVPRO201861007", sym: "MNQZ5", bal: "$149,327.78", price: "21248.50", pnl: "+$70,548.00", qty: 12, ratio: "1x", master: false },
  { id: "...29070494", conn: "Tradovate", acc: "MFFUEVPRO201861008", sym: "MNQZ5", bal: "$149,125.90", price: "21248.50", pnl: "+$70,548.00", qty: 12, ratio: "1x", master: false },
];

export default function Dashboard() {
  const [followed, setFollowed] = useState(accounts.map((_, i) => i !== 0));

  return (
    <div className="flex h-screen bg-white text-sm overflow-hidden">

      {/* Sidebar */}
      <aside className="w-48 border-r border-gray-100 flex flex-col bg-gray-50 shrink-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-md bg-sky-500 flex items-center justify-center text-white text-xs font-medium">CT</div>
          <span className="font-medium text-gray-800">CopyTrader</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {[["🏠", "Home"], ["🔌", "Connections"], ["📅", "Calendar"]].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white hover:text-gray-800 cursor-pointer">{icon} {label}</div>
          ))}
          <div className="px-3 pt-3 pb-1 text-xs text-gray-400 uppercase tracking-wide">Copy Trading</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-gray-800 font-medium cursor-pointer">📊 Cockpit</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">👥 Groups</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">🛡️ Risk Mgmt</div>
          <div className="px-3 pt-3 pb-1 text-xs text-gray-400 uppercase tracking-wide">Analytics</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">📈 Dashboard</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">📆 Daily</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">📉 Weekly</div>
        </nav>
        <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">⚙️ Settings</div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-500 hover:bg-white cursor-pointer">🌙 Dark mode</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-800">Cockpit</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              7 Positions Running · MNQZ5
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-200 cursor-pointer">
              + Contract
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">Change leader</button>
            <button className="px-3 py-1 rounded-md border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">Disable all followers</button>
            <button className="px-3 py-1 rounded-md border border-red-200 bg-red-50 text-xs text-red-600 hover:bg-red-100">✕ Cancel all orders</button>
            <button className="px-3 py-1 rounded-md bg-sky-500 text-xs text-white hover:bg-sky-600">Flatten all</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-gray-100 shrink-0">
          <div className="px-5 py-2.5 border-r border-gray-100">
            <div className="text-xs text-gray-400 mb-0.5">Total day PnL</div>
            <div className="font-medium text-green-600">+$10,950.80</div>
          </div>
          <div className="px-5 py-2.5 border-r border-gray-100">
            <div className="text-xs text-gray-400 mb-0.5">Total open PnL</div>
            <div className="font-medium text-green-600">+$353,604.00</div>
          </div>
          <div className="px-5 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Total balance</div>
              <div className="font-medium text-gray-800">$844,482.57</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Open: 7
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-normal">
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left">Follow</th>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Connection</th>
                <th className="px-3 py-2 text-left">Account</th>
                <th className="px-3 py-2 text-left">Symbol</th>
                <th className="px-3 py-2 text-left">Side</th>
                <th className="px-3 py-2 text-left">Balance</th>
                <th className="px-3 py-2 text-left">Avg. Price</th>
                <th className="px-3 py-2 text-left">Open PnL</th>
                <th className="px-3 py-2 text-left">Qty</th>
                <th className="px-3 py-2 text-left">Ratio</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2 text-amber-400">{a.master ? "👑" : ""}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setFollowed(f => f.map((v, j) => j === i ? !v : v))}
                      className={`w-8 h-4 rounded-full transition-colors relative ${followed[i] ? "bg-sky-500" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${followed[i] ? "translate-x-4" : "translate-x-0.5"}`}></span>
                    </button>
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-400">{a.id}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">{a.conn}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-500">{a.acc}</td>
                  <td className="px-3 py-2 font-medium">{a.sym}</td>
                  <td className="px-3 py-2 text-green-600">↑ Long</td>
                  <td className="px-3 py-2">{a.bal}</td>
                  <td className="px-3 py-2">{a.price}</td>
                  <td className="px-3 py-2 text-green-600">{a.pnl}</td>
                  <td className="px-3 py-2">{a.qty}</td>
                  <td className="px-3 py-2">{a.ratio}</td>
                  <td className="px-3 py-2">
                    <button className="px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50">
                      Flatten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}