"use client";

import React from "react";
import Image from "next/image";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { Relic } from "@/lib/types";

interface RelicGridItemProps {
  relic: Relic;
  onSelect: (relic: Relic) => void;
}

const RARITY_BADGE_STYLES: Record<string, string> = {
  Starter: "border-slate-600 bg-slate-800 text-slate-300",
  Common: "border-slate-500/40 bg-slate-700/30 text-slate-200",
  Uncommon: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  Rare: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  Ancient: "border-purple-500/50 bg-purple-500/15 text-purple-300",
  Boss: "border-red-500/50 bg-red-500/15 text-red-300",
  Shop: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  Event: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
};

/**
 * RelicGridItem (PRD 03 Bagian 3.2.C & 3.2.D):
 * Merender ikon relic 64x64 (.webp), nama relic, lencana rarity_key, dan potongan pendek description_clean.
 */
export const RelicGridItem = React.memo(function RelicGridItem({
  relic,
  onSelect,
}: RelicGridItemProps) {
  const badgeStyle =
    RARITY_BADGE_STYLES[relic.rarity_key] ||
    "border-slate-700 bg-slate-800 text-slate-300";

  return (
    <button
      type="button"
      onClick={() => onSelect(relic)}
      className="group flex items-start gap-3.5 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-slate-900 hover:shadow-lg cursor-pointer"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-1.5">
        <Image
          unoptimized
          src={resolveAssetUrl(relic.image_url)}
          alt={relic.name}
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          className="h-14 w-14 object-contain transition-transform duration-200 group-hover:scale-110"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${badgeStyle}`}
          >
            {relic.rarity_key}
          </span>
          <span className="rounded bg-slate-800/90 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
            {relic.pool}
          </span>
          {relic.is_energy_relic && (
            <span className="rounded border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
              ⚡ Energy
            </span>
          )}
        </div>

        <h3 className="truncate text-sm font-bold text-slate-100 group-hover:text-amber-300 transition">
          {relic.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-slate-400 leading-relaxed">
          {relic.description_clean}
        </p>
      </div>
    </button>
  );
});
