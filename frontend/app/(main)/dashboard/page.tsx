"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ marginTop: 12, marginBottom: 24 }}>
        Welcome. Use the menu to answer polls, submit evaluations, and view teams.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <Link href="/polls" style={cardStyle}>
          <strong>Polls</strong>
          <span>Answer weekly availability for Friday games</span>
        </Link>
        <Link href="/evaluations" style={cardStyle}>
          <strong>Evaluations</strong>
          <span>Evaluate 5 players per month (pace, assist, defensive, dribbling, shooting)</span>
        </Link>
        <Link href="/teams" style={cardStyle}>
          <strong>Teams</strong>
          <span>View games and team distribution; submit physical condition and scores</span>
        </Link>
        <Link href="/profile" style={cardStyle}>
          <strong>Profile</strong>
          <span>Create or update your player profile (pseudo, phone)</span>
        </Link>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 20,
  backgroundColor: "#1a1a2e",
  borderRadius: 8,
  color: "#eee",
  textDecoration: "none",
  minWidth: 200,
  maxWidth: 280,
};
