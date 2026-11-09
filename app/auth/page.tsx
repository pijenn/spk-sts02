"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  History,
  LogIn,
  LogOut,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import { useAppContext } from "@/components/providers/AppProviders";

export default function AuthPage() {
  const { user, login, register, logout } = useAppContext();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
          <h1 className="text-lg font-extrabold text-white">Sesi Aktif</h1>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1 text-xs">
          <p className="text-slate-400">
            Username: <strong className="text-slate-100">{user.username}</strong>
          </p>
          <p className="font-mono text-slate-500 break-all">
            User UUID: {user.user_id}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/history"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition"
          >
            <History className="h-4 w-4" />
            Lihat Riwayat Sesi Saya
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-bold text-red-300 hover:border-red-500/50 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
          Modul Autentikasi • Kebutuhan F-09
        </span>
        <h1 className="text-xl font-extrabold text-white mt-0.5">
          {mode === "login" ? "Masuk Akun Pemain" : "Registrasi Akun Baru"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Autentikasi mengisolasi kepemilikan riwayat sesi permainan (
          <code className="text-amber-300">run_histories</code>) pada Supabase PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
            mode === "login"
              ? "bg-amber-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LogIn className="h-3.5 w-3.5" />
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
            mode === "register"
              ? "bg-amber-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Register
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Username
          </label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username unik"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-extrabold text-slate-950 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 transition cursor-pointer"
        >
          {submitting
            ? "Memproses..."
            : mode === "login"
            ? "Masuk Sekarang"
            : "Buat Akun"}
        </button>
      </form>
    </div>
  );
}
