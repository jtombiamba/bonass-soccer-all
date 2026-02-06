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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Monthly Evaluations</h1>
      <p style={{ marginTop: 8, marginBottom: 16 }}>
        Evaluate up to 5 players per month (0–100): pace, assist, defensive, dribbling, shooting.
      </p>
      {assignments.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2>Assigned Players to Evaluate</h2>
          <p style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>
            You have been assigned to evaluate the following players this month.
            Click a player to pre‑fill the form below.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            {assignments.map((a) => {
              const alreadyEvaluated = list.some(e => e.evaluated === a.evaluated);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setForm({ ...form, evaluated: a.evaluated.toString() })}
                  disabled={alreadyEvaluated || list.length >= 5}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: alreadyEvaluated ? "#333" : (list.length >= 5 ? "#333" : "#1a1a2e"),
                    color: alreadyEvaluated ? "#888" : "#eee",
                    border: "1px solid #444",
                    borderRadius: 6,
                    cursor: alreadyEvaluated ? "not-allowed" : "pointer",
                  }}
                >
                  {a.evaluated_pseudo}
                  {alreadyEvaluated && " (already evaluated)"}
                </button>
              );
            })}
          </div>
        </section>
      )}
      <section style={{ marginBottom: 24 }}>
        <h2>My evaluations this round</h2>
        <ul style={{ listStyle: "none" }}>
          {list.map((e) => (
            <li key={e.id} style={{ padding: 12, marginBottom: 8, backgroundColor: "#1a1a2e", borderRadius: 8 }}>
              {e.evaluated_pseudo}: pace {e.pace_skill}, assist {e.assist_skill}, defensive {e.defensive_skill}, dribbling {e.dribbling_skill}, shooting {e.shooting_skill}
            </li>
          ))}
        </ul>
        {list.length >= 5 && <p>You have reached the limit of 5 evaluations this round.</p>}
      </section>
      <section>
        <h2>Submit evaluation</h2>
        <p style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Select a player and give scores 0–100. Create a player profile first if needed.</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
          <label>
            Player to evaluate
            <select
              value={form.evaluated}
              onChange={(e) => setForm({ ...form, evaluated: e.target.value })}
              style={{ display: "block", marginTop: 4, padding: 8, width: "100%", borderRadius: 6, backgroundColor: "#1a1a2e", color: "#eee" }}
            >
              <option value="">-- Select --</option>
              {playerOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.pseudo}</option>
              ))}
            </select>
          </label>
          {skills.map((key) => (
            <label key={key}>
              {labels[key]} (0–100)
              <input
                type="number"
                min={0}
                max={100}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value, 10) || 0 })}
                style={{ display: "block", marginTop: 4, padding: 8, width: "100%", borderRadius: 6, backgroundColor: "#1a1a2e", color: "#eee" }}
              />
            </label>
          ))}
          {error && <p style={{ color: "#e94560" }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{ padding: 12, backgroundColor: "#e94560", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>
            {submitting ? "Submitting..." : "Submit evaluation"}
          </button>
        </form>
      </section>
    </div>
  );
}
