"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PlayerMin {
  id: number;
  pseudo: string;
  phone?: string;
}

interface Team {
  id: number;
  game: number;
  side: string;
  players: PlayerMin[];
}

interface Game {
  id: number;
  game_date: string;
  team_a_goals: number;
  team_b_goals: number;
  teams: Team[];
  distribution_code?: string;
  code_sent_to_player_pseudo?: string;
}

export default function TeamsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayerPseudo, setCurrentPlayerPseudo] = useState<string | null>(null);
  const [physicalScore, setPhysicalScore] = useState<Record<number, string>>({});
  const [scoreForm, setScoreForm] = useState<Record<number, { a: string; b: string }>>({});
  const [assignCode, setAssignCode] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<Game[]>("players/games/").then(({ data }) => setGames(Array.isArray(data) ? data : [])).catch(() => setGames([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get("players/me/").then(({ data }) => setCurrentPlayerPseudo(data.pseudo)).catch(() => setCurrentPlayerPseudo(null));
  }, []);

  async function loadGameDetails(gameId: number) {
    try {
      const { data } = await api.get<Game>(`players/games/${gameId}/`);
      setSelectedGame(data);
    } catch {
      setSelectedGame(null);
    }
  }

  async function submitPhysicalCondition(gameId: number) {
    const score = parseInt(physicalScore[gameId], 10);
    if (isNaN(score) || score < 0 || score > 100) {
      setMessage("Enter a score 0–100");
      return;
    }
    setMessage("");
    try {
      await api.post("players/physical-condition/", { game: gameId, score });
      setMessage("Physical condition saved.");
    } catch (e: unknown) {
      setMessage(e && typeof e === "object" && "response" in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Error" : "Error");
    }
  }

  async function submitScore(gameId: number) {
    const form = scoreForm[gameId];
    if (!form) return;
    const a = parseInt(form.a, 10);
    const b = parseInt(form.b, 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
      setMessage("Enter valid goals (0 or more).");
      return;
    }
    setMessage("");
    try {
      await api.post(`players/games/${gameId}/score/`, { team_a_goals: a, team_b_goals: b });
      setMessage("Score saved.");
      setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, team_a_goals: a, team_b_goals: b } : g)));
      if (selectedGame?.id === gameId) setSelectedGame((s) => s ? { ...s, team_a_goals: a, team_b_goals: b } : null);
    } catch (e: unknown) {
      setMessage(e && typeof e === "object" && "response" in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Error" : "Error");
    }
  }

  async function launchDistribution(gameId: number) {
    const code = assignCode[gameId];
    if (!code?.trim()) {
      setMessage("Enter the distribution code you received.");
      return;
    }
    setMessage("");
    try {
      await api.post(`players/games/${gameId}/assign-teams/`, { code: code.trim() });
      setMessage("Teams assigned.");
      loadGameDetails(gameId);
    } catch (e: unknown) {
      setMessage(e && typeof e === "object" && "response" in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Invalid code" : "Error");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Teams & Games</h1>
      <p style={{ marginTop: 8, marginBottom: 16 }}>
        Submit your physical condition (day before game), view teams, submit final score, or launch team distribution with the code.
      </p>
      {message && <p style={{ color: "#e94560", marginBottom: 12 }}>{message}</p>}
      <ul style={{ listStyle: "none" }}>
        {games.map((game) => (
          <li key={game.id} style={{ padding: 16, marginBottom: 12, backgroundColor: "#1a1a2e", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <strong>Game: {game.game_date}</strong>
              <span>Score: {game.team_a_goals} – {game.team_b_goals}</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label>Physical condition (0–100):</label>
                <input type="number" min={0} max={100} value={physicalScore[game.id] ?? ""} onChange={(e) => setPhysicalScore((s) => ({ ...s, [game.id]: e.target.value }))} style={{ width: 60, padding: 6, borderRadius: 6, backgroundColor: "#0f3460", color: "#eee" }} />
                <button type="button" onClick={() => submitPhysicalCondition(game.id)} style={btnStyle}>Save</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label>Final score (A – B):</label>
                <input type="number" min={0} value={scoreForm[game.id]?.a ?? ""} onChange={(e) => setScoreForm((s) => ({ ...s, [game.id]: { ...(s[game.id] || { a: "", b: "" }), a: e.target.value } }))} style={{ width: 50, padding: 6, borderRadius: 6, backgroundColor: "#0f3460", color: "#eee" }} />
                <span>–</span>
                <input type="number" min={0} value={scoreForm[game.id]?.b ?? ""} onChange={(e) => setScoreForm((s) => ({ ...s, [game.id]: { ...(s[game.id] || { a: "", b: "" }), b: e.target.value } }))} style={{ width: 50, padding: 6, borderRadius: 6, backgroundColor: "#0f3460", color: "#eee" }} />
                <button type="button" onClick={() => submitScore(game.id)} style={btnStyle}>Save score</button>
              </div>
              {game.distribution_code ? (
                game.code_sent_to_player_pseudo === currentPlayerPseudo ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label>Distribution code:</label>
                    <input type="text" value={assignCode[game.id] ?? ""} onChange={(e) => setAssignCode((s) => ({ ...s, [game.id]: e.target.value }))} placeholder="Code received" style={{ width: 200, padding: 6, borderRadius: 6, backgroundColor: "#0f3460", color: "#eee" }} />
                    <button type="button" onClick={() => launchDistribution(game.id)} style={btnStyle}>Launch teams</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: "#aaa" }}>
                    Distribution code already sent to <strong>{game.code_sent_to_player_pseudo}</strong>.
                  </div>
                )
              ) : (
                <div style={{ fontSize: 14, color: "#aaa" }}>
                  No distribution code yet.
                </div>
              )}
            </div>
            <button type="button" onClick={() => selectedGame?.id === game.id ? setSelectedGame(null) : loadGameDetails(game.id)} style={{ marginTop: 8, ...btnStyle }}>
              {selectedGame?.id === game.id ? "Hide teams" : "Show teams"}
            </button>
            {selectedGame?.id === game.id && selectedGame.teams && (
              <div style={{ marginTop: 12, padding: 12, backgroundColor: "#0f3460", borderRadius: 8 }}>
                <p><strong>Team A:</strong> {selectedGame.teams.find((t) => t.side === "A")?.players?.map((p) => p.pseudo).join(", ") || "—"}</p>
                <p><strong>Team B:</strong> {selectedGame.teams.find((t) => t.side === "B")?.players?.map((p) => p.pseudo).join(", ") || "—"}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      {games.length === 0 && <p>No games yet. A new poll (and game) is created every Monday for the Friday game.</p>}
    </div>
  );
}

const btnStyle: React.CSSProperties = { padding: "6px 12px", backgroundColor: "#e94560", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" };
