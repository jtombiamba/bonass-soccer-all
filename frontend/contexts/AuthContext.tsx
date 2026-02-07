"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, logout as authLogout, User } from "@/lib/auth";
import { getAccessToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
