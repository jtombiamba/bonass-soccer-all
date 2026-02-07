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

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Teams & Games</h1>
        <p className="text-gray-300">
          Submit your physical condition (day before game), view teams, submit final score, or launch team distribution with the code.
        </p>
      </div>

      {message && <p className="text-danger mb-4">{message}</p>}

      {games.length === 0 ? (
        <p className="text-gray-400">No games yet. A new poll (and game) is created every Monday for the Friday game.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="card-modern">
              {/* Game header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Game: {game.game_date}</h3>
                <span className="text-lg font-semibold text-white">
                  {game.team_a_goals} – {game.team_b_goals}
                </span>
              </div>

              {/* Physical condition */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Physical condition (0–100)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={physicalScore[game.id] ?? ""}
                    onChange={(e) => setPhysicalScore((s) => ({ ...s, [game.id]: e.target.value }))}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => submitPhysicalCondition(game.id)}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Final score */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Final score (A – B)</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={scoreForm[game.id]?.a ?? ""}
                    onChange={(e) => setScoreForm((s) => ({ ...s, [game.id]: { ...(s[game.id] || { a: "", b: "" }), a: e.target.value } }))}
                    className="input w-16 text-center"
                  />
                  <span className="text-white">–</span>
                  <input
                    type="number"
                    min={0}
                    value={scoreForm[game.id]?.b ?? ""}
                    onChange={(e) => setScoreForm((s) => ({ ...s, [game.id]: { ...(s[game.id] || { a: "", b: "" }), b: e.target.value } }))}
                    className="input w-16 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => submitScore(game.id)}
                    className="btn btn-primary flex-1 sm:flex-none"
                  >
                    Save score
                  </button>
                </div>
              </div>

              {/* Distribution code */}
              {game.distribution_code ? (
                game.code_sent_to_player_pseudo === currentPlayerPseudo ? (
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Distribution code</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={assignCode[game.id] ?? ""}
                        onChange={(e) => setAssignCode((s) => ({ ...s, [game.id]: e.target.value }))}
                        placeholder="Code received"
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => launchDistribution(game.id)}
                        className="btn btn-primary whitespace-nowrap"
                      >
                        Launch teams
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm mb-4">
                    Distribution code already sent to <strong>{game.code_sent_to_player_pseudo}</strong>.
                  </div>
                )
              ) : (
                <div className="text-gray-400 text-sm mb-4">
                  No distribution code yet.
                </div>
              )}

              {/* Show/hide teams */}
              <button
                type="button"
                onClick={() => selectedGame?.id === game.id ? setSelectedGame(null) : loadGameDetails(game.id)}
                className="btn btn-secondary w-full mb-4"
              >
                {selectedGame?.id === game.id ? "Hide teams" : "Show teams"}
              </button>

              {/* Team details */}
              {selectedGame?.id === game.id && selectedGame.teams && (
                <div className="bg-surface-light rounded-lg p-4">
                  <h4 className="font-bold text-white mb-2">Team A</h4>
                  <p className="text-gray-300 mb-3">
                    {selectedGame.teams.find((t) => t.side === "A")?.players?.map((p) => p.pseudo).join(", ") || "—"}
                  </p>
                  <h4 className="font-bold text-white mb-2">Team B</h4>
                  <p className="text-gray-300">
                    {selectedGame.teams.find((t) => t.side === "B")?.players?.map((p) => p.pseudo).join(", ") || "—"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
