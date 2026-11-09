"use client";

import React from "react";
import Image from "next/image";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { Card } from "@/lib/types";

interface CardGridItemProps {
  card: Card;
  onSelect: (card: Card) => void;
}

export const CardGridItem = React.memo(function CardGridItem({
  card,
  onSelect,
}: CardGridItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className="cartoon-panel group flex flex-col p-2.5 text-left transition hover:-translate-y-1.5 hover:border-amber-400 cursor-pointer"
    >
      <div className="relative w-full flex items-center justify-center overflow-hidden rounded-xl border-2 border-[#0e161b] bg-[#142027] p-1.5">
        <Image
          unoptimized
          src={resolveAssetUrl(card.image_url)}
          alt={card.name}
          width={240}
          height={310}
          loading="lazy"
          decoding="async"
          className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="mt-2.5 px-1 w-full">
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate text-sm font-bold text-amber-100 group-hover:text-amber-300 transition">
            {card.name}
          </span>
          {!card.is_rewardable && (
            <span className="shrink-0 rounded-md border border-[#0e161b] bg-[#142027] px-1.5 py-0.5 text-[10px] font-bold text-amber-200/70">
              Khusus
            </span>
          )}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1 text-center">
          <span
            title="Kekuatan Serangan"
            className="rounded-lg bg-[#2d1a1d] border border-red-500/30 py-0.5 text-[10px] font-bold text-red-200"
          >
            ⚔️ {card.c2_offensive}/5
          </span>
          <span
            title="Kekuatan Pertahanan"
            className="rounded-lg bg-[#192b36] border border-sky-500/30 py-0.5 text-[10px] font-bold text-sky-200"
          >
            🛡️ {card.c3_defensive}/5
          </span>
          <span
            title="Potensi Kombo"
            className="rounded-lg bg-[#17332b] border border-emerald-500/30 py-0.5 text-[10px] font-bold text-emerald-200"
          >
            🔗 {card.c5_synergy}/5
          </span>
        </div>
      </div>
    </button>
  );
});
