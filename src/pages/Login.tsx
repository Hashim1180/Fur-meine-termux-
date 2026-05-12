import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "admin@awgyms.com";
const ADMIN_PASSWORD = "awgyms2026";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("awgyms_admin", JSON.stringify({
          name: "Admin",
          role: "admin",
          email: ADMIN_EMAIL,
        }));
        navigate("/admin");
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Card className="w-full max-w-sm bg-black/50 border border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-orbitron text-yellow-400">
            AW GYMS Admin
          </CardTitle>
          <p className="text-white/40 font-rajdhani text-sm">Sign in to continue</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-rajdhani focus:outline-none focus:border-yellow-500/50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-rajdhani focus:outline-none focus:border-yellow-500/50"
          />
          {error && (
            <p className="text-red-400 text-sm font-rajdhani text-center">{error}</p>
          )}
          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-orbitron font-bold"
            size="lg"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
