"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link href="/polls" style={linkStyle}>Polls</Link>
        <Link href="/evaluations" style={linkStyle}>Evaluations</Link>
        <Link href="/teams" style={linkStyle}>Teams</Link>
        <Link href="/profile" style={linkStyle}>Profile</Link>
      </nav>
      <div style={userStyle}>
        {user && <span style={{ marginRight: 12 }}>{user.username}</span>}
        <button type="button" onClick={logout} style={buttonStyle}>Logout</button>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  backgroundColor: "#1a1a2e",
  color: "#eee",
};
const navStyle: React.CSSProperties = { display: "flex", gap: 20 };
const linkStyle: React.CSSProperties = { color: "#eee", textDecoration: "none" };
const userStyle: React.CSSProperties = { display: "flex", alignItems: "center" };
const buttonStyle: React.CSSProperties = {
  padding: "6px 12px",
  backgroundColor: "#e94560",
  border: "none",
  borderRadius: 4,
  color: "#fff",
  cursor: "pointer",
};
