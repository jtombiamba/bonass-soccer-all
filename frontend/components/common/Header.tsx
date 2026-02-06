"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link href="/dashboard" style={{ color: "#eee", textDecoration: "none", fontWeight: 500 }}>
          Dashboard
        </Link>
        <Link href="/polls" style={{ color: "#eee", textDecoration: "none", fontWeight: 500 }}>
          Polls
        </Link>
        <Link href="/evaluations" style={{ color: "#eee", textDecoration: "none", fontWeight: 500 }}>
          Evaluations
        </Link>
        <Link href="/teams" style={{ color: "#eee", textDecoration: "none", fontWeight: 500 }}>
          Teams
        </Link>
        <Link href="/profile" style={{ color: "#eee", textDecoration: "none", fontWeight: 500 }}>
          Profile
        </Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <span style={{ color: "#fff", fontWeight: 500 }}>
            {user.username}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          className="btn btn-danger"
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
