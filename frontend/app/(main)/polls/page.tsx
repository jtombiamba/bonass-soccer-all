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
      setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, responses: [...p.responses] } : p)));
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
        {polls.map((poll) => (
          <li key={poll.id} style={pollItemStyle}>
            <div>
              <strong>Game: {poll.game_date}</strong>
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={() => answerPoll(poll.id, true)} disabled={answering === poll.id} style={btnStyle(true)}>Available</button>
                <button type="button" onClick={() => answerPoll(poll.id, false)} disabled={answering === poll.id} style={btnStyle(false)}>Not available</button>
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#aaa" }}>Responses: {poll.responses.filter((r) => r.available).length} available</div>
          </li>
        ))}
      </ul>
      {polls.length === 0 && <p>No polls yet. A new poll is launched every Monday for the Friday game.</p>}
    </div>
  );
}

const pollItemStyle: React.CSSProperties = { padding: 16, marginBottom: 12, backgroundColor: "#1a1a2e", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" };
const btnStyle = (available: boolean): React.CSSProperties => ({ marginRight: 8, padding: "8px 16px", border: "none", borderRadius: 6, backgroundColor: available ? "#0f3460" : "#e94560", color: "#fff", cursor: "pointer" });
