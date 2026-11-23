"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Eye, Filter, PlusCircle, Search, Sparkles, Trash2, X } from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import { CARD_COLOR_TABS, CHARACTER_MAP } from "@/lib/constants";
import type { Card, CharacterId } from "@/lib/types";

function matchesRewardCardTab(card: Card, tabId: string, character: CharacterId): boolean {
  if (tabId === "all") return true;
  if (tabId === "default") {
    return (
      card.color === character ||
      card.color === "colorless" ||
      card.color === "event" ||
      card.color === "quest" ||
      card.rarity === "Ancient" ||
      card.rarity === "Event" ||
      card.rarity === "Quest"
    );
  }
  if (tabId === "event") {
    return (
      card.color === "event" ||
      card.color === "quest" ||
      card.color === "token" ||
      card.rarity === "Ancient" ||
      card.rarity === "Event" ||
      card.rarity === "Quest"
    );
  }
  if (tabId === "curse_status") {
    return card.color === "curse" || card.color === "status";
  }
  return card.color === tabId;
}

interface CardRewardSelectorProps {
  character: CharacterId;
  rewardSlots: (string | null)[];
  onSelectSlotCard: (slotIndex: number, cardId: string | null) => void;
  onSetRewardSlotCount?: (count: 3 | 4) => void;
  onBackToPanelA: () => void;
  canEvaluate: boolean;
  isEvaluating: boolean;
  onEvaluate: () => void;
  cards: Card[];
  cardsById: Map<string, Card>;
  onInspectCard: (card: Card) => void;
}

export function CardRewardSelector({
  character,
  rewardSlots,
  onSelectSlotCard,
  onSetRewardSlotCount,
  onBackToPanelA,
  canEvaluate,
  isEvaluating,
  onEvaluate,
  cards,
  cardsById,
  onInspectCard,
}: CardRewardSelectorProps) {
  const [activePickerSlot, setActivePickerSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColorTab, setSelectedColorTab] = useState<string>("default");
  const slotCount = rewardSlots.length === 4 ? 4 : 3;

  const filteredModalCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // Saat pengguna mengetik kata kunci pencarian pada tab Default, cari di seluruh katalog (All Cards)
    // sehingga kartu dari karakter lain maupun kartu non-hadiah standar (Ancient, Event, Quest, General
    // seperti Squash, Exterminate, dan Relax) tetap muncul tanpa tersembunyi.
    const effectiveTab =
      selectedColorTab === "default" && q.length > 0 ? "all" : selectedColorTab;

    const basePool = cards.filter((card) =>
      matchesRewardCardTab(card, effectiveTab, character)
    );

    if (!q) return basePool;
    return basePool.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.rarity.toLowerCase().includes(q) ||
        c.color.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [cards, character, selectedColorTab, searchQuery]);

  const charMeta = CHARACTER_MAP[character];

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-2">
          <button
            type="button"
            onClick={onBackToPanelA}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-100 transition hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundImage: "url('/assets/reward_skip_button.webp')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <ArrowLeft className="h-4 w-4 drop-shadow" />
            <span className="cartoon-text-shadow">
              Kembali ke Kondisi &amp; Dek
            </span>
          </button>

          <div className="inline-flex items-center gap-2.5 rounded-2xl border-3 border-[#0e161b] bg-[#16232b]/95 px-3.5 py-1.5 shadow">
            <Image
              unoptimized
              src={charMeta.portraitUrl}
              alt={charMeta.name}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className={`text-sm font-bold ${charMeta.accentClass}`}>
              {charMeta.name}
            </span>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-full max-w-xl h-20 sm:h-24 select-none">
          <Image
            unoptimized
            src="/assets/reward_banner.webp"
            alt="Choose a Card"
            fill
            className="object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]"
          />
          <div className="relative z-10 text-center pb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2b1d0e] tracking-wide drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
              Pilih {slotCount} Kartu Hadiah
            </h2>
          </div>
        </div>
        <p className="text-center text-sm sm:text-base text-amber-100/90 cartoon-text-shadow -mt-1">
          Masukkan {slotCount} pilihan kartu hadiah yang muncul di layar permainanmu (mendukung 3–4 slot kartu hadiah)
        </p>

        {onSetRewardSlotCount && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onSetRewardSlotCount(3)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                slotCount === 3
                  ? "border-amber-400 bg-amber-400 text-slate-950 shadow"
                  : "border-[#0e161b] bg-[#16232b] text-amber-100 hover:border-amber-400/60"
              }`}
            >
              <span>3 Slot Kartu (Standar)</span>
            </button>
            <button
              type="button"
              onClick={() => onSetRewardSlotCount(4)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                slotCount === 4
                  ? "border-amber-400 bg-amber-400 text-slate-950 shadow"
                  : "border-[#0e161b] bg-[#16232b] text-amber-100 hover:border-amber-400/60"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>4 Slot Kartu (+1 Opsi Relik / Lasting Candy)</span>
            </button>
          </div>
        )}
      </div>
      <div
        className={`grid grid-cols-1 gap-5 ${
          slotCount === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
        {Array.from({ length: slotCount }, (_, idx) => idx).map((slotIdx) => {
          const selectedId = rewardSlots[slotIdx];
          const card = selectedId ? cardsById.get(selectedId) || null : null;

          return (
            <div
              key={slotIdx}
              className="cartoon-panel p-4 sm:p-5 flex flex-col justify-between transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0e161b] bg-[#142027] px-3 py-1 text-xs sm:text-sm font-bold text-amber-300 shadow-sm">
                  <Image
                    unoptimized
                    src="/assets/reward_icon_card.webp"
                    alt=""
                    width={18}
                    height={18}
                    className="h-4 w-4 object-contain"
                  />
                  Pilihan Kartu #{slotIdx + 1}
                </span>
                {card && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onInspectCard(card)}
                      className="rounded-xl border-2 border-[#0e161b] bg-[#16232b] p-1.5 text-amber-200 hover:bg-[#233743] hover:text-amber-300 transition cursor-pointer"
                      title="Lihat detail kartu"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectSlotCard(slotIdx, null)}
                      className="rounded-xl border-2 border-[#0e161b] bg-[#3b2325] p-1.5 text-red-200 hover:bg-[#522e31] transition cursor-pointer"
                      title="Kosongkan slot"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {card ? (
                <div className="flex flex-col items-center text-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActivePickerSlot(slotIdx);
                    }}
                    className="group relative cursor-pointer"
                    title="Klik untuk mengganti kartu"
                  >
                    <Image
                      unoptimized
                      src={resolveAssetUrl(card.image_url)}
                      alt={card.name}
                      width={240}
                      height={310}
                      loading="lazy"
                      decoding="async"
                      className="w-48 sm:w-52 h-auto rounded-xl drop-shadow-[0_10px_18px_rgba(0,0,0,0.75)] transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>

                  <h3 className="mt-3 text-xl font-bold text-amber-100 cartoon-text-shadow">
                    {card.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-amber-200/75">
                    {card.rarity} • {card.type} • Energi{" "}
                    {card.cost === -1 ? "X" : card.cost ?? 0}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-1.5 w-full">
                    <div className="rounded-xl border-2 border-[#0e161b] bg-[#2a1d20] py-1 px-2 text-xs font-bold text-red-200">
                      ⚔️ Serang: {card.c2_offensive}/5
                    </div>
                    <div className="rounded-xl border-2 border-[#0e161b] bg-[#1a2b36] py-1 px-2 text-xs font-bold text-sky-200">
                      🛡️ Tahan: {card.c3_defensive}/5
                    </div>
                    <div className="rounded-xl border-2 border-[#0e161b] bg-[#193029] py-1 px-2 text-xs font-bold text-emerald-200">
                      🔗 Kombo: {card.c5_synergy}/5
                    </div>
                  </div>

                  {card.keywords.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                      {card.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-lg border border-[#0e161b] bg-[#152229] px-2 py-0.5 text-xs font-bold text-amber-300"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActivePickerSlot(slotIdx);
                    }}
                    className="mt-4 w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-amber-100 transition hover:brightness-110 cursor-pointer"
                    style={{
                      backgroundImage: "url('/assets/reward_item_button.webp')",
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <span className="cartoon-text-shadow">
                      Ganti Kartu Pilihan #{slotIdx + 1}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActivePickerSlot(slotIdx);
                  }}
                  className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-3 border-dashed border-amber-300/40 bg-[#142027]/70 p-5 text-center hover:border-amber-400 hover:bg-[#192830] transition cursor-pointer"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-[#0e161b] bg-[#243844] mb-3 shadow">
                    <Image
                      unoptimized
                      src="/assets/reward_icon_special_card.webp"
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <span className="text-base font-bold text-amber-100 cartoon-text-shadow">
                    Pilih Kartu Hadiah #{slotIdx + 1}
                  </span>
                  <span className="mt-1 text-xs text-amber-100/70">
                    Klik untuk mencari &amp; memilih kartu hadiah
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center pt-2">
        <button
          type="button"
          disabled={!canEvaluate || isEvaluating}
          onClick={onEvaluate}
          className="relative inline-flex items-center justify-center gap-3 px-10 py-4 text-lg sm:text-2xl font-bold text-amber-100 transition hover:scale-105 active:scale-95 disabled:opacity-45 disabled:pointer-events-none cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)]"
          style={{
            backgroundImage: "url('/assets/ftue_confirm_button.webp')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Sparkles className="h-6 w-6 text-amber-300 drop-shadow" />
          <span className="cartoon-text-shadow tracking-wide">
            {isEvaluating ? "Memproses Rekomendasi..." : "Proses Hasil"}
          </span>
        </button>

        {!canEvaluate && (
          <p className="mt-2 text-xs sm:text-sm font-bold text-amber-200/80 cartoon-text-shadow">
            Lengkapi ke-{slotCount} slot kartu hadiah di atas terlebih dahulu untuk menekan tombol Proses Hasil.
          </p>
        )}
      </div>

      {activePickerSlot !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActivePickerSlot(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="cartoon-panel flex max-h-[85vh] w-full max-w-4xl flex-col p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[#152229]">
              <div className="flex items-center gap-2.5">
                <Image
                  unoptimized
                  src="/assets/reward_icon_special_card.webp"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-100 cartoon-text-shadow">
                    Pilih Kartu Hadiah — Slot #{activePickerSlot + 1} dari {slotCount}
                  </h3>
                  <p className="text-xs text-amber-100/75">
                    Pilih salah satu dari {filteredModalCards.length} kartu yang tersedia
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onSetRewardSlotCount && (
                  <button
                    type="button"
                    onClick={() => {
                      if (slotCount === 3) {
                        onSetRewardSlotCount(4);
                      } else {
                        onSetRewardSlotCount(3);
                        if (activePickerSlot >= 3) {
                          setActivePickerSlot(2);
                        }
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      slotCount === 4
                        ? "border-amber-400 bg-amber-400 text-slate-950"
                        : "border-[#0e161b] bg-[#16232b] text-amber-200 hover:border-amber-400"
                    }`}
                  >
                    {slotCount === 3 ? (
                      <>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Pilihan 4 Kartu Hadiah</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Kembali ke 3 Kartu</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActivePickerSlot(null)}
                  className="rounded-xl border-2 border-[#0e161b] bg-[#3b2325] p-1.5 text-red-200 hover:bg-[#522e31] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="my-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200">
                  <Filter className="h-3.5 w-3.5" />
                  Filter Sumber Kartu (Karakter Lain, Event, Ancient, Quest &amp; All Cards):
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedColorTab("default")}
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    selectedColorTab === "default"
                      ? "bg-amber-400 text-slate-950 shadow"
                      : "border border-[#0e161b] bg-[#131e24] text-amber-100/80 hover:border-amber-400/50 hover:text-amber-100"
                  }`}
                >
                  {charMeta.name} + Umum &amp; Event
                </button>
                {CARD_COLOR_TABS.map((tab) => {
                  const active = selectedColorTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedColorTab(tab.id)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        active
                          ? "bg-amber-400 text-slate-950 shadow"
                          : "border border-[#0e161b] bg-[#131e24] text-amber-100/80 hover:border-amber-400/50 hover:text-amber-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-200/70" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama kartu (misal: Squash, Exterminate, Relax), karakter lain, tipe, atau efek..."
                  className="w-full rounded-xl border-3 border-[#0e161b] bg-[#131e24] pl-10 pr-4 py-2.5 text-sm font-bold text-amber-100 placeholder:text-amber-100/45 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pr-1">
              {filteredModalCards.slice(0, 80).map((c) => {
                const alreadyPicked = rewardSlots.includes(c.card_id);
                return (
                  <button
                    key={c.card_id}
                    type="button"
                    onClick={() => {
                      onSelectSlotCard(activePickerSlot, c.card_id);
                      setActivePickerSlot(null);
                    }}
                    className={`cartoon-subpanel flex flex-col items-center p-2.5 text-center transition cursor-pointer hover:-translate-y-1 ${
                      alreadyPicked
                        ? "border-amber-400 bg-amber-500/20"
                        : "hover:border-amber-400/70"
                    }`}
                  >
                    <Image
                      unoptimized
                      src={resolveAssetUrl(c.image_url)}
                      alt={c.name}
                      width={240}
                      height={310}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto rounded-lg"
                    />
                    <span className="mt-2 truncate w-full text-sm font-bold text-amber-100">
                      {c.name}
                    </span>
                    <span className="text-xs text-amber-100/70 capitalize">
                      {c.color} • {c.rarity} • {c.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
