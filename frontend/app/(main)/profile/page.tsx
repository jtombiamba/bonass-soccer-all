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

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Player profile</h1>
        <p className="text-gray-300">
          Your name comes from your account; here you set your pseudo and phone for the group.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes("created") || message.includes("updated") ? "alert-success" : "alert-error"}`}>
          {message}
        </div>
      )}

      <div className="card-modern max-w-2xl">
        <form onSubmit={profile ? handleUpdate : handleCreate} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Your pseudo"
              required
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="input w-full"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary w-full sm:w-auto px-8 py-3"
          >
            {saving ? "Saving..." : profile ? "Update profile" : "Create profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
