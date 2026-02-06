"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PollResponse {
  id: number;
  player_pseudo: string;
  available: boolean;
  created_at: string;
}

interface Poll {
  id: number;
  game: number;
  game_date: string;
  game_status: string;
  max_players: number;
  min_players: number;
  is_locked: boolean;
  locked_at: string | null;
  locked_by_max: boolean;
  hard_lock: boolean;
  available_count: number;
  responses: PollResponse[];
  created_at: string;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<Poll[]>("polls/").then(({ data }) => setPolls(data)).catch(() => setPolls([])).finally(() => setLoading(false));
  }, []);

  async function answerPoll(pollId: number, available: boolean) {
    setAnswering(pollId);
    setMessage("");
    try {
      await api.post(`polls/${pollId}/answer/`, { available });
      setMessage("Answer saved.");
      // Refetch polls to update lock status and responses
      const { data } = await api.get<Poll[]>("polls/");
      setPolls(data);
    } catch (e: unknown) {
      setMessage(e && typeof e === "object" && "response" in e ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Error" : "Error");
    } finally {
      setAnswering(null);
    }
  }

  if (loading) return <p>Loading polls...</p>;

  return (
    <div>
      <h1>Weekly Polls</h1>
      <p style={{ marginTop: 8, marginBottom: 16 }}>Answer whether you are available for the Friday game.</p>
      {message && <p style={{ color: "#e94560", marginBottom: 12 }}>{message}</p>}
      <ul style={{ listStyle: "none" }}>
        {polls.map((poll) => {
          const lockMessage = poll.is_locked
            ? poll.hard_lock
              ? "Hard locked (Wednesday noon)"
              : poll.locked_by_max
                ? "Locked (max players reached)"
                : "Locked"
            : "";
          return (
            <li key={poll.id} style={pollItemStyle}>
              <div>
                <strong>Game: {poll.game_date}</strong>
                <div style={{ fontSize: 14, color: "#aaa", marginTop: 4 }}>
                  {poll.available_count} / {poll.max_players} players (min {poll.min_players})
                  {lockMessage && <span style={{ color: "#e94560", marginLeft: 8 }}>🔒 {lockMessage}</span>}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => answerPoll(poll.id, true)}
                    disabled={answering === poll.id || poll.is_locked}
                    style={btnStyle(true)}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => answerPoll(poll.id, false)}
                    disabled={answering === poll.id || poll.is_locked}
                    style={btnStyle(false)}
                  >
                    Not available
                  </button>
                </div>
                {poll.is_locked && (
                  <div style={{ fontSize: 12, color: "#ffaa00", marginTop: 4 }}>
                    Poll locked. You cannot change your answer.
                  </div>
                )}
              </div>
              <div style={{ fontSize: 14, color: "#aaa" }}>
                Responses: {poll.responses.filter((r) => r.available).length} available
                <br />
                Game status: {poll.game_status}
              </div>
            </li>
          );
        })}
      </ul>
      {polls.length === 0 && <p>No polls yet. A new poll is launched every Monday for the Friday game.</p>}
    </div>
  );
}

const pollItemStyle: React.CSSProperties = { padding: 16, marginBottom: 12, backgroundColor: "#1a1a2e", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" };
const btnStyle = (available: boolean): React.CSSProperties => ({ marginRight: 8, padding: "8px 16px", border: "none", borderRadius: 6, backgroundColor: available ? "#0f3460" : "#e94560", color: "#fff", cursor: "pointer" });
