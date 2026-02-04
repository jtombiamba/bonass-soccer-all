"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ username, password });
      const user = await fetchMe();
      if (user) {
        setUser(user);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Login failed"
        : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: "#e94560", marginBottom: 8 }}>{error}</p>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        No account? <Link href="/register" style={{ color: "#e94560" }}>Register</Link>
      </p>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: 400,
  margin: "80px auto",
  padding: 24,
};
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 6,
  border: "1px solid #0f3460",
  backgroundColor: "#1a1a2e",
  color: "#eee",
};
const buttonStyle: React.CSSProperties = {
  padding: 12,
  backgroundColor: "#e94560",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  marginTop: 8,
};
