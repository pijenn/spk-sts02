"use client";

import React, { useState } from "react";
import { Lock, LogIn, ShieldAlert, UserPlus, X } from "lucide-react";
import { useAppContext } from "@/components/providers/AppProviders";
import type { AuthUser } from "@/lib/types";

interface AuthModalProps {
  hasPendingAction?: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export function AuthModal({
  hasPendingAction = false,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { login, register } = useAppContext();
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
      const authed =
        mode === "login"
          ? await login(username, password)
          : await register(username, password);
      onSuccess(authed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan autentikasi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          aria-label="Tutup modal autentikasi"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 mb-2">
            <Lock className="h-3.5 w-3.5" />
            Isolasi Sesi Permainan (F-09)
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-100">
            {mode === "login" ? "Masuk ke Akun Pemain" : "Buat Akun Pemain Baru"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {hasPendingAction
              ? "Data dek & hasil evaluasi Anda tetap aman di memori. Masuk atau daftar untuk langsung menyelesaikan penyimpanan sesi."
              : "Kelola dan simpan kode riwayat sesi permainan Slay the Spire 2 Anda."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === "login"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
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
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === "register"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={50}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: spire_slayer"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 transition cursor-pointer"
          >
            {submitting
              ? "Memproses..."
              : hasPendingAction
              ? mode === "login"
                ? "Masuk & Simpan Sesi Sekarang"
                : "Daftar & Simpan Sesi Sekarang"
              : mode === "login"
              ? "Masuk"
              : "Daftar Akun"}
          </button>
        </form>
      </div>
    </div>
  );
}
