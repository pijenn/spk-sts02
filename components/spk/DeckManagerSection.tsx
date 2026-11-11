"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Eye, Plus, Search, Trash2 } from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { Card, CharacterId } from "@/lib/types";

const DEFAULT_DECK_CANDIDATE_LIMIT = 12;
const SEARCH_DECK_CANDIDATE_LIMIT = 20;

interface DeckManagerSectionProps {
  character: CharacterId;
  deckCardIds: string[];
  cards: Card[];
  cardsById: Map<string, Card>;
  onAddDeckCard: (cardId: string) => void;
  onRemoveDeckCardInstance: (cardId: string) => void;
  onInspectCard: (card: Card) => void;
}

export function DeckManagerSection({
  character,
  deckCardIds,
  cards,
  cardsById,
  onAddDeckCard,
  onRemoveDeckCardInstance,
  onInspectCard,
}: DeckManagerSectionProps) {
  const [deckQuery, setDeckQuery] = useState("");

  const filteredDeckCandidates = useMemo(() => {
    const query = deckQuery.trim().toLowerCase();
    const eligible = cards.filter(
      (c) =>
        c.color === character ||
        c.color === "colorless" ||
        c.color === "curse" ||
        c.color === "status"
    );
    if (!query) return eligible.slice(0, DEFAULT_DECK_CANDIDATE_LIMIT);
    return eligible
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query) ||
          c.keywords.some((kw) => kw.toLowerCase().includes(query))
      )
      .slice(0, SEARCH_DECK_CANDIDATE_LIMIT);
  }, [cards, deckQuery, character]);

  const groupedDeck = useMemo(() => {
    const counts = new Map<string, number>();
    for (const id of deckCardIds) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    const items: { card: Card; count: number }[] = [];
    counts.forEach((count, id) => {
      const card = cardsById.get(id);
      if (card) items.push({ card, count });
    });
    return [...items].sort((a, b) => a.card.name.localeCompare(b.card.name));
  }, [deckCardIds, cardsById]);

  const keywordFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    for (const id of deckCardIds) {
      const card = cardsById.get(id);
      if (!card) continue;
      for (const kw of card.keywords) {
        freq.set(kw, (freq.get(kw) || 0) + 1);
      }
    }
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  }, [deckCardIds, cardsById]);

  return (
    <div className="lg:col-span-7 cartoon-panel p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#152229] pb-3">
        <div className="flex items-center gap-2.5">
          <Image
            unoptimized
            src="/assets/reward_icon_card.webp"
            alt="Dek Kartu"
            width={28}
            height={28}
            className="h-7 w-7 object-contain drop-shadow"
          />
          <div>
            <h3 className="text-lg font-bold text-amber-100 cartoon-text-shadow">
              Kartu Dek Saat Ini ({deckCardIds.length} Kartu)
            </h3>
            <p className="text-xs text-amber-100/70">
              Daftar kartu yang kamu miliki di dalam dek saat ini
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="max-h-72 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
          {groupedDeck.map(({ card, count }) => (
            <div
              key={card.card_id}
              className="cartoon-subpanel p-2 flex flex-col items-center text-center group relative"
            >
              <span className="absolute right-2 top-2 z-10 rounded-lg border-2 border-[#0e161b] bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-950 shadow">
                {count}x
              </span>

              <button
                type="button"
                onClick={() => onInspectCard(card)}
                className="w-full flex flex-col items-center cursor-pointer"
                title="Klik untuk melihat detail kartu"
              >
                <Image
                  unoptimized
                  src={resolveAssetUrl(card.image_url)}
                  alt={card.name}
                  width={150}
                  height={194}
                  loading="lazy"
                  decoding="async"
                  className="w-28 sm:w-32 h-auto rounded-lg object-contain transition-transform group-hover:scale-105"
                />
                <span className="mt-1.5 truncate w-full text-xs sm:text-sm font-bold text-amber-100 group-hover:text-amber-300">
                  {card.name}
                </span>
              </button>

              <div className="mt-2 flex items-center justify-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => onRemoveDeckCardInstance(card.card_id)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border-2 border-[#0e161b] bg-[#3b2325] py-1 text-xs font-bold text-red-200 hover:bg-[#522e31] transition cursor-pointer"
                  title="Kurangi 1 kartu"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>-1</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddDeckCard(card.card_id)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border-2 border-[#0e161b] bg-[#214538] py-1 text-xs font-bold text-emerald-200 hover:bg-[#2a5948] transition cursor-pointer"
                  title="Tambah 1 kartu"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+1</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="cartoon-subpanel p-3">
        <div className="flex items-center gap-2 mb-2">
          <Image
            unoptimized
            src="/assets/reward_chain.webp"
            alt="Sinergi"
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
          <span className="text-xs sm:text-sm font-bold text-amber-300">
            Sinergi Dek Saat Ini:
          </span>
        </div>

        {keywordFrequency.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {keywordFrequency.map(([kw, count]) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0e161b] bg-[#243844] px-3 py-1 text-xs sm:text-sm font-bold text-amber-100 shadow-sm"
              >
                <span>{kw}</span>
                <strong className="text-amber-300">{count}x</strong>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-amber-100/60">
            Belum ada efek sinergi khusus di dalam dek. Tambahkan kartu di bawah untuk membangun kombo!
          </p>
        )}
      </div>
      <div className="pt-1">
        <label
          htmlFor="deck-card-search"
          className="block text-xs sm:text-sm font-bold text-amber-200 mb-1.5"
        >
          Tambah Kartu ke Dek Saat Ini:
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-200/70" />
          <input
            id="deck-card-search"
            type="text"
            value={deckQuery}
            onChange={(e) => setDeckQuery(e.target.value)}
            placeholder="Cari nama kartu atau efek (misal: Shrug It Off, Vulnerable, Poison)..."
            className="w-full rounded-xl border-3 border-[#0e161b] bg-[#131e24] pl-10 pr-4 py-2.5 text-sm font-bold text-amber-100 placeholder:text-amber-100/45 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
        {filteredDeckCandidates.map((c) => (
          <div
            key={c.card_id}
            className="cartoon-subpanel p-2 flex flex-col items-center justify-between text-center group"
          >
            <div className="w-full">
              <div className="relative w-full flex justify-center">
                <Image
                  unoptimized
                  src={resolveAssetUrl(c.image_url)}
                  alt={c.name}
                  width={150}
                  height={194}
                  loading="lazy"
                  decoding="async"
                  onClick={() => onInspectCard(c)}
                  className="w-28 sm:w-32 h-auto rounded-lg object-contain cursor-pointer transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => onInspectCard(c)}
                  className="absolute right-1 top-1 rounded-lg border border-[#0e161b] bg-[#131e24]/90 p-1 text-amber-200 hover:text-amber-400 cursor-pointer"
                  title="Lihat detail kartu"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 truncate w-full text-xs sm:text-sm font-bold text-amber-100">
                {c.name}
              </p>
              <p className="text-[11px] text-amber-100/65">
                {c.type} • {c.rarity}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddDeckCard(c.card_id)}
              className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded-xl border-2 border-[#0e161b] bg-amber-400 py-1.5 px-2 text-xs font-bold text-slate-950 shadow-[0_2px_0_#0e161b] hover:bg-amber-300 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah ke Dek
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
