"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, login } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
      await login({ username, password });
      const user = await fetchMe();
      if (user) {
        setUser(user);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const data = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: Record<string, string | string[]> } }).response?.data
        : null;
      const msg = data
        ? (Array.isArray(data.detail) ? data.detail.join(" ") : (data.detail as string) || JSON.stringify(data))
        : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageStyle}>
      <h1>Register</h1>
      <p style={{ marginBottom: 16, fontSize: 14 }}>Name, pseudo (username), and phone for your profile.</p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input type="text" placeholder="Username (pseudo)" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
        <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Confirm password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required style={inputStyle} />
        {error && <p style={{ color: "#e94560", marginBottom: 8 }}>{error}</p>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already have an account? <Link href="/login" style={{ color: "#e94560" }}>Login</Link>
      </p>
    </div>
  );
}

const pageStyle: React.CSSProperties = { maxWidth: 400, margin: "60px auto", padding: 24 };
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
