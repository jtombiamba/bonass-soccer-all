"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="flex items-center justify-between w-full">
        {/* Logo / Brand */}
        <div className="text-xl font-bold gradient-text">Bonass Soccer</div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-white hover:text-primary transition-colors font-medium">
            Dashboard
          </Link>
          <Link href="/polls" className="text-white hover:text-primary transition-colors font-medium">
            Polls
          </Link>
          <Link href="/evaluations" className="text-white hover:text-primary transition-colors font-medium">
            Evaluations
          </Link>
          <Link href="/teams" className="text-white hover:text-primary transition-colors font-medium">
            Teams
          </Link>
          <Link href="/profile" className="text-white hover:text-primary transition-colors font-medium">
            Profile
          </Link>
        </nav>

        {/* User info and logout (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <span className="text-white font-medium">{user.username}</span>
          )}
          <button
            type="button"
            onClick={logout}
            className="btn btn-danger py-2 px-4"
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`w-6 h-0.5 bg-white mt-1.5 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white mt-1.5 transition-transform ${menuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-surface-light pt-4">
          <nav className="flex flex-col gap-4">
            <Link href="/dashboard" className="text-white hover:text-primary transition-colors font-medium py-2" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            <Link href="/polls" className="text-white hover:text-primary transition-colors font-medium py-2" onClick={() => setMenuOpen(false)}>
              Polls
            </Link>
            <Link href="/evaluations" className="text-white hover:text-primary transition-colors font-medium py-2" onClick={() => setMenuOpen(false)}>
              Evaluations
            </Link>
            <Link href="/teams" className="text-white hover:text-primary transition-colors font-medium py-2" onClick={() => setMenuOpen(false)}>
              Teams
            </Link>
            <Link href="/profile" className="text-white hover:text-primary transition-colors font-medium py-2" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <div className="pt-4 border-t border-surface-light">
              {user && (
                <div className="text-white font-medium mb-2">Logged in as {user.username}</div>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="btn btn-danger w-full"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
