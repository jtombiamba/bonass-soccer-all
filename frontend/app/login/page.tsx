"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchMe, login } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ username, password });
      const user = await fetchMe();
      if (user) {
        setUser(user);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Login failed"
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
      }}
      className="flex items-center justify-center p-4"
    >
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div
            style={{
              width: "5rem",
              height: "5rem",
              background: "linear-gradient(90deg, #fbbf24, #f97316)",
            }}
            className="rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Football Scheduler</h1>
          <p className="text-gray-600">Reconnect with your college roommates</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <div className="space-y-4">
          <button
            onClick={() => router.push("/register")}
            className="btn btn-primary w-full py-3 px-4 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            Create Account
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-secondary w-full py-3 px-4 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            No account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
