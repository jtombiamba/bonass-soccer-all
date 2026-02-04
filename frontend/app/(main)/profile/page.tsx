"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PlayerProfile {
  id: number;
  pseudo: string;
  phone: string;
  organization: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<PlayerProfile>("players/me/").then(({ data }) => {
      setProfile(data);
      setPseudo(data.pseudo || "");
      setPhone(data.phone || "");
    }).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!pseudo.trim()) {
      setMessage("Pseudo is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await api.post("players/create/", { pseudo: pseudo.trim(), phone: phone.trim() });
      setMessage("Profile created.");
      const { data } = await api.get<PlayerProfile>("players/me/");
      setProfile(data);
      setPseudo(data.pseudo || "");
      setPhone(data.phone || "");
    } catch (err: unknown) {
      const detail = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Failed to create profile";
      setMessage(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!pseudo.trim()) {
      setMessage("Pseudo is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await api.patch("players/me/", { pseudo: pseudo.trim(), phone: phone.trim() });
      setMessage("Profile updated.");
      const { data } = await api.get<PlayerProfile>("players/me/");
      setProfile(data);
    } catch (err: unknown) {
      const detail = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Failed to update";
      setMessage(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Player profile</h1>
      <p style={{ marginTop: 8, marginBottom: 16 }}>Your name comes from your account; here you set your pseudo and phone for the group.</p>
      {message && <p style={{ color: "#e94560", marginBottom: 12 }}>{message}</p>}
      <form onSubmit={profile ? handleUpdate : handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
        <label>
          Pseudo
          <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Your pseudo" required style={{ display: "block", marginTop: 4, padding: 8, width: "100%", borderRadius: 6, backgroundColor: "#1a1a2e", color: "#eee" }} />
        </label>
        <label>
          Phone
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" style={{ display: "block", marginTop: 4, padding: 8, width: "100%", borderRadius: 6, backgroundColor: "#1a1a2e", color: "#eee" }} />
        </label>
        <button type="submit" disabled={saving} style={{ padding: 12, backgroundColor: "#e94560", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>
          {saving ? "Saving..." : profile ? "Update profile" : "Create profile"}
        </button>
      </form>
    </div>
  );
}
