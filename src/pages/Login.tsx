import { useState } from "react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

        const handleLogin = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); onLogin(); }, 1500);
        };

  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white text-sm font-medium">CT</div>
          <span className="text-lg font-medium text-gray-800">CopyTrader</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-8">
          <h1 className="text-base font-medium text-gray-800 mb-1">Welcome back</h1>
          <p className="text-xs text-gray-400 mb-6">Sign in to your account</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400">Don't have an account? </span>
            <span className="text-xs text-sky-500 cursor-pointer hover:underline">Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}