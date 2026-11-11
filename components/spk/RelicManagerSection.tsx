"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Eye, Search, Zap } from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { CharacterId, Relic } from "@/lib/types";

const DEFAULT_RELIC_LIMIT = 18;
const SEARCH_RELIC_LIMIT = 24;

interface RelicManagerSectionProps {
  character: CharacterId;
  activeRelicIds: string[];
  relics: Relic[];
  relicsById: Map<string, Relic>;
  onToggleRelic: (relicId: string) => void;
  onInspectRelic: (relic: Relic) => void;
}

export function RelicManagerSection({
  character,
  activeRelicIds,
  relics,
  relicsById,
  onToggleRelic,
  onInspectRelic,
}: RelicManagerSectionProps) {
  const [relicQuery, setRelicQuery] = useState("");

  const activeRelics = useMemo(
    () =>
      activeRelicIds
        .map((id) => relicsById.get(id))
        .filter((r): r is Relic => Boolean(r)),
    [activeRelicIds, relicsById]
  );

  const hasActiveEnergyRelic = useMemo(
    () => activeRelics.some((r) => r.is_energy_relic),
    [activeRelics]
  );

  const filteredRelics = useMemo(() => {
    const query = relicQuery.trim().toLowerCase();
    const eligible = relics.filter(
      (r) => r.pool === "shared" || r.pool === character
    );
    if (!query) return eligible.slice(0, DEFAULT_RELIC_LIMIT);
    return eligible
      .filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description_clean.toLowerCase().includes(query)
      )
      .slice(0, SEARCH_RELIC_LIMIT);
  }, [relics, relicQuery, character]);

  return (
    <div className="lg:col-span-5 cartoon-panel p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#152229] pb-3">
        <div className="flex items-center gap-2.5">
          <Image
            unoptimized
            src="/assets/reward_icon_shared_relic.webp"
            alt="Relik"
            width={28}
            height={28}
            className="h-7 w-7 object-contain drop-shadow"
          />
          <div>
            <h3 className="text-lg font-bold text-amber-100 cartoon-text-shadow">
              Relik Saat Ini ({activeRelics.length})
            </h3>
            <p className="text-xs text-amber-100/70">
              Pilih relik yang sedang aktif di permainanmu
            </p>
          </div>
        </div>

        {hasActiveEnergyRelic && (
          <span className="inline-flex items-center gap-1 rounded-xl border-2 border-emerald-400/70 bg-emerald-950/90 px-2.5 py-1 text-xs font-bold text-emerald-200">
            <Zap className="h-3.5 w-3.5 text-emerald-300" />
            Relik Energi Aktif
          </span>
        )}
      </div>

      {/* 1. Relik Aktif Saat Ini */}
      <div className="cartoon-subpanel p-3">
        <span className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2">
          Relik Aktif Milikmu:
        </span>
        {activeRelics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeRelics.map((r) => (
              <div
                key={r.relic_id}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-xs sm:text-sm font-bold shadow-sm ${
                  r.is_energy_relic
                    ? "border-emerald-400/70 bg-[#19382f] text-emerald-100"
                    : "border-[#0e161b] bg-[#243844] text-amber-100"
                }`}
              >
                <Image
                  unoptimized
                  src={resolveAssetUrl(r.image_url)}
                  alt={r.name}
                  width={26}
                  height={26}
                  loading="lazy"
                  decoding="async"
                  className="h-6 w-6 object-contain cursor-pointer"
                  onClick={() => onInspectRelic(r)}
                />
                <button
                  type="button"
                  onClick={() => onInspectRelic(r)}
                  className="hover:underline cursor-pointer"
                >
                  {r.name}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleRelic(r.relic_id)}
                  className="ml-0.5 rounded-md bg-black/30 px-1.5 py-0.2 text-amber-200/80 hover:bg-red-500/40 hover:text-red-200 cursor-pointer"
                  title="Hapus relik"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-amber-100/60">
            Belum ada relik aktif. Pilih dari daftar relik di bawah ini.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="relic-search"
          className="block text-xs sm:text-sm font-bold text-amber-200 mb-1.5"
        >
          Cari &amp; Tambah Relik:
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-200/70" />
          <input
            id="relic-search"
            type="text"
            value={relicQuery}
            onChange={(e) => setRelicQuery(e.target.value)}
            placeholder="Cari nama atau efek relik (misal: Vajra, Kunai, Sozu)..."
            className="w-full rounded-xl border-3 border-[#0e161b] bg-[#131e24] pl-10 pr-4 py-2.5 text-sm font-bold text-amber-100 placeholder:text-amber-100/45 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
        {filteredRelics.map((r) => {
          const isSelected = activeRelicIds.includes(r.relic_id);
          return (
            <div
              key={r.relic_id}
              onClick={() => onToggleRelic(r.relic_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleRelic(r.relic_id);
                }
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 p-2.5 text-left transition cursor-pointer ${
                isSelected
                  ? "border-amber-400 bg-amber-500/20 text-amber-100 shadow"
                  : "border-[#0e161b] bg-[#16232b] hover:border-amber-400/50 hover:bg-[#1e303b] text-amber-100/90"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#0e161b] bg-[#111b21] p-1">
                  <Image
                    unoptimized
                    src={resolveAssetUrl(r.image_url)}
                    alt={r.name}
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-bold">{r.name}</span>
                    {r.is_energy_relic && (
                      <span className="rounded-md bg-emerald-500/25 border border-emerald-400/50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-200">
                        ⚡ Energi
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs text-amber-100/70">
                    {r.description_clean}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectRelic(r);
                  }}
                  className="rounded-lg border border-[#0e161b] bg-[#111b21] p-1.5 text-amber-200/80 hover:text-amber-300 cursor-pointer"
                  title="Detail relik"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    isSelected
                      ? "bg-amber-400 text-slate-950"
                      : "bg-[#253a46] text-amber-200"
                  }`}
                >
                  {isSelected ? "Aktif ✓" : "+ Pilih"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
