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

  if (loading) return <p className="text-white">Loading polls...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Weekly Polls</h1>
        <p className="text-gray-300">
          Answer whether you are available for the Friday game.
        </p>
      </div>

      {message && <p className="text-danger mb-4">{message}</p>}

      {polls.length === 0 ? (
        <p className="text-gray-400">No polls yet. A new poll is launched every Monday for the Friday game.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => {
            const lockMessage = poll.is_locked
              ? poll.hard_lock
                ? "Hard locked (Wednesday noon)"
                : poll.locked_by_max
                  ? "Locked (max players reached)"
                  : "Locked"
              : "";

            return (
              <div key={poll.id} className="card-modern">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">Game: {poll.game_date}</h3>
                  {lockMessage && (
                    <span className="text-xs font-semibold bg-danger text-white px-2 py-1 rounded-full">
                      🔒 {lockMessage}
                    </span>
                  )}
                </div>

                <div className="text-gray-300 mb-4">
                  <p>
                    {poll.available_count} / {poll.max_players} players (min {poll.min_players})
                  </p>
                  <p className="text-sm mt-2">
                    Responses: {poll.responses.filter((r) => r.available).length} available
                  </p>
                  <p className="text-sm">Game status: {poll.game_status}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => answerPoll(poll.id, true)}
                    disabled={answering === poll.id || poll.is_locked}
                    className="btn btn-primary flex-1 py-3"
                  >
                    {answering === poll.id ? "Saving..." : "Available"}
                  </button>
                  <button
                    type="button"
                    onClick={() => answerPoll(poll.id, false)}
                    disabled={answering === poll.id || poll.is_locked}
                    className="btn btn-danger flex-1 py-3"
                  >
                    {answering === poll.id ? "Saving..." : "Not available"}
                  </button>
                </div>

                {poll.is_locked && (
                  <div className="text-warning text-sm border-t border-surface-light pt-3">
                    Poll locked. You cannot change your answer.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
