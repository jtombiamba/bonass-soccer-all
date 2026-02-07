"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SkillEval {
  id: number;
  round: number;
  evaluated: number;
  evaluated_pseudo: string;
  pace_skill: number;
  assist_skill: number;
  defensive_skill: number;
  dribbling_skill: number;
  shooting_skill: number;
  created_at: string;
}

interface PlayerOption {
  id: number;
  pseudo: string;
}

interface Assignment {
  id: number;
  round: number;
  evaluated: number;
  evaluated_pseudo: string;
}

export default function EvaluationsPage() {
  const [list, setList] = useState<SkillEval[]>([]);
  const [playerOptions, setPlayerOptions] = useState<PlayerOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    evaluated: "",
    pace_skill: 50,
    assist_skill: 50,
    defensive_skill: 50,
    dribbling_skill: 50,
    shooting_skill: 50,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<SkillEval[]>("evaluations/evaluate/").then(({ data }) => setList(data)).catch(() => setList([]));
    api.get<PlayerOption[]>("players/").then(({ data }) => setPlayerOptions(Array.isArray(data) ? data : [])).catch(() => setPlayerOptions([]));
    api.get<Assignment[]>("evaluations/assignments/").then(({ data }) => setAssignments(Array.isArray(data) ? data : [])).catch(() => setAssignments([]));
    setLoading(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const evaluatedId = parseInt(form.evaluated, 10);
    if (!evaluatedId) {
      setError("Select a player");
      return;
    }
    if (list.length >= 5) {
      setError("You can evaluate at most 5 players per round.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("evaluations/evaluate/", {
        evaluated: evaluatedId,
        pace_skill: form.pace_skill,
        assist_skill: form.assist_skill,
        defensive_skill: form.defensive_skill,
        dribbling_skill: form.dribbling_skill,
        shooting_skill: form.shooting_skill,
      });
      const { data } = await api.get<SkillEval[]>("evaluations/evaluate/");
      setList(data);
      setForm({ ...form, evaluated: "", pace_skill: 50, assist_skill: 50, defensive_skill: 50, dribbling_skill: 50, shooting_skill: 50 });
    } catch (err: unknown) {
      const detail = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Failed to submit";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setSubmitting(false);
    }
  }

  const skills = ["pace_skill", "assist_skill", "defensive_skill", "dribbling_skill", "shooting_skill"] as const;
  const labels: Record<string, string> = { pace_skill: "Pace", assist_skill: "Assist", defensive_skill: "Defensive", dribbling_skill: "Dribbling", shooting_skill: "Shooting" };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Monthly Evaluations</h1>
        <p className="text-gray-300">
          Evaluate up to 5 players per month (0–100): pace, assist, defensive, dribbling, shooting.
        </p>
      </div>

      {/* Assigned Players */}
      {assignments.length > 0 && (
        <section className="card-modern">
          <h2 className="text-xl font-bold text-white mb-3">Assigned Players to Evaluate</h2>
          <p className="text-gray-300 mb-4">
            You have been assigned to evaluate the following players this month.
            Click a player to pre‑fill the form below.
          </p>
          <div className="flex flex-wrap gap-3">
            {assignments.map((a) => {
              const alreadyEvaluated = list.some(e => e.evaluated === a.evaluated);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setForm({ ...form, evaluated: a.evaluated.toString() })}
                  disabled={alreadyEvaluated || list.length >= 5}
                  className={`px-4 py-2 rounded-full border transition-colors ${alreadyEvaluated || list.length >= 5
                      ? "bg-surface border-surface-light text-gray-500 cursor-not-allowed"
                      : "bg-surface border-primary text-white hover:bg-primary hover:text-white"
                    }`}
                >
                  {a.evaluated_pseudo}
                  {alreadyEvaluated && " (already evaluated)"}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* My evaluations */}
      <section className="card-modern">
        <h2 className="text-xl font-bold text-white mb-4">My evaluations this round</h2>
        {list.length === 0 ? (
          <p className="text-gray-400">No evaluations submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((e) => (
              <div key={e.id} className="bg-surface-light rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">{e.evaluated_pseudo}</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>Pace: {e.pace_skill}</li>
                  <li>Assist: {e.assist_skill}</li>
                  <li>Defensive: {e.defensive_skill}</li>
                  <li>Dribbling: {e.dribbling_skill}</li>
                  <li>Shooting: {e.shooting_skill}</li>
                </ul>
              </div>
            ))}
          </div>
        )}
        {list.length >= 5 && (
          <p className="text-warning mt-4">You have reached the limit of 5 evaluations this round.</p>
        )}
      </section>

      {/* Submit evaluation form */}
      <section className="card-modern">
        <h2 className="text-xl font-bold text-white mb-4">Submit evaluation</h2>
        <p className="text-gray-300 mb-6">
          Select a player and give scores 0–100. Create a player profile first if needed.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-white mb-2">Player to evaluate</label>
            <select
              value={form.evaluated}
              onChange={(e) => setForm({ ...form, evaluated: e.target.value })}
              className="input w-full"
            >
              <option value="">-- Select --</option>
              {playerOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.pseudo}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((key) => (
              <div key={key}>
                <label className="block text-white mb-2">{labels[key]} (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value, 10) || 0 })}
                  className="input w-full"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full sm:w-auto px-8 py-3"
          >
            {submitting ? "Submitting..." : "Submit evaluation"}
          </button>
        </form>
      </section>
    </div>
  );
}
