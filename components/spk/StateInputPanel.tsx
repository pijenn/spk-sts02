"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Eye,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import { CHARACTERS, CHARACTER_MAP } from "@/lib/constants";
import type { Card, CharacterId, Relic } from "@/lib/types";

interface StateInputPanelProps {
  character: CharacterId;
  isCharacterConfirmed: boolean;
  onSelectCharacter: (next: CharacterId) => void;
  onBackToCharacterSelect: () => void;
  currentHp: number;
  maxHp: number;
  onChangeHp: (current: number, max: number) => void;
  actLevel: 1 | 2 | 3;
  onChangeActLevel: (act: 1 | 2 | 3) => void;
  activeRelicIds: string[];
  onToggleRelic: (relicId: string) => void;
  deckCardIds: string[];
  onAddDeckCard: (cardId: string) => void;
  onRemoveDeckCardInstance: (cardId: string) => void;
  onResetStarterDeck: () => void;
  onOpenRewardHelper: () => void;
  cards: Card[];
  cardsById: Map<string, Card>;
  relics: Relic[];
  relicsById: Map<string, Relic>;
  onInspectCard: (card: Card) => void;
  onInspectRelic: (relic: Relic) => void;
}

export function StateInputPanel({
  character,
  isCharacterConfirmed,
  onSelectCharacter,
  onBackToCharacterSelect,
  currentHp,
  maxHp,
  onChangeHp,
  actLevel,
  onChangeActLevel,
  activeRelicIds,
  onToggleRelic,
  deckCardIds,
  onAddDeckCard,
  onRemoveDeckCardInstance,
  onResetStarterDeck,
  onOpenRewardHelper,
  cards,
  cardsById,
  relics,
  relicsById,
  onInspectCard,
  onInspectRelic,
}: StateInputPanelProps) {
  const [relicQuery, setRelicQuery] = useState("");
  const [deckQuery, setDeckQuery] = useState("");

  const safeMaxHp = Math.max(1, maxHp);
  const hpRatio = Math.min(100, Math.max(0, (currentHp / safeMaxHp) * 100));
  const isCriticalHp = hpRatio <= 30;

  const byCodexRelic = useMemo(
    () => new Map(relics.map((r) => [r.codex_id, r])),
    [relics]
  );

  const activeRelics = useMemo(
    () =>
      activeRelicIds
        .map((id) => relicsById.get(id))
        .filter((r): r is Relic => Boolean(r)),
    [activeRelicIds, relicsById]
  );

  const activeEnergyRelics = useMemo(
    () => activeRelics.filter((r) => r.is_energy_relic),
    [activeRelics]
  );

  const filteredRelics = useMemo(() => {
    const q = relicQuery.trim().toLowerCase();
    const eligible = relics.filter(
      (r) => r.pool === "shared" || r.pool === character
    );
    if (!q) return eligible.slice(0, 18);
    return eligible
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description_clean.toLowerCase().includes(q)
      )
      .slice(0, 24);
  }, [relics, relicQuery, character]);

  const filteredDeckCandidates = useMemo(() => {
    const q = deckQuery.trim().toLowerCase();
    const eligible = cards.filter(
      (c) =>
        c.color === character ||
        c.color === "colorless" ||
        c.color === "curse" ||
        c.color === "status"
    );
    if (!q) return eligible.slice(0, 12);
    return eligible
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.keywords.some((kw) => kw.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [cards, deckQuery, character]);

  // Ringkasan kartu di dek (dikelompokkan per kartu beserta jumlahnya)
  const groupedDeck = useMemo(() => {
    const counts = new Map<string, number>();
    for (const id of deckCardIds) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    const items: { card: Card; count: number }[] = [];
    counts.forEach((count, id) => {
      const c = cardsById.get(id);
      if (c) items.push({ card: c, count });
    });
    items.sort((a, b) => a.card.name.localeCompare(b.card.name));
    return items;
  }, [deckCardIds, cardsById]);

  // Ringkasan sinergi / efek kartu di dalam dek saat ini (contoh: "Vulnerable 1x")
  const keywordFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    for (const id of deckCardIds) {
      const c = cardsById.get(id);
      if (!c) continue;
      for (const kw of c.keywords) {
        freq.set(kw, (freq.get(kw) || 0) + 1);
      }
    }
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  }, [deckCardIds, cardsById]);

  if (!isCharacterConfirmed) {
    return (
      <section className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-4 px-2 sm:px-4">
        {/* Banner Judul */}
        <div className="relative flex items-center justify-center w-full max-w-xl h-20 sm:h-24 mb-3 select-none">
          <Image
            unoptimized
            src="/assets/reward_banner.webp"
            alt="Pilih Karakter"
            fill
            className="object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.65)]"
          />
          <div className="relative z-10 text-center pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2b1d0e] tracking-wide drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
              Pilih Karakter
            </h1>
          </div>
        </div>

        <p className="text-center text-sm sm:text-base text-amber-100/90 max-w-2xl mb-6 cartoon-text-shadow">
          Klik salah satu karakter di bawah ini untuk memulai pengaturan HP, Relik, dan Dek Kartu saat ini.
        </p>

        {/* Grid 5 Karakter Satu Layar Penuh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 w-full max-w-7xl">
          {CHARACTERS.map((char) => {
            const starterRelic = byCodexRelic.get(char.starterRelicCodexId);
            const isCurrent = char.id === character;

            return (
              <div
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCharacter(char.id);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-3xl border-4 p-4 text-center transition-all duration-200 cursor-pointer hover:-translate-y-2 ${
                  isCurrent
                    ? "border-amber-400 bg-[#233742]/95 shadow-[0_10px_0_#0d151a,0_0_30px_rgba(245,158,11,0.35)]"
                    : "border-[#10191f] bg-[#1d2e37]/90 hover:border-amber-300/80 shadow-[0_8px_0_#0d151a,0_12px_20px_rgba(0,0,0,0.5)]"
                }`}
              >
                {/* Tangan Penunjuk Kartun saat Hover */}
                <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-translate-y-1 z-20">
                  <Image
                    unoptimized
                    src={char.handPointUrl}
                    alt=""
                    width={46}
                    height={90}
                    className="h-14 w-auto object-contain rotate-180 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
                  />
                </div>

                <div>
                  {/* Badge HP di Pojok Atas */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`rounded-xl border-2 px-2.5 py-0.5 text-xs font-bold`}
                    >
                      {char.name}
                    </span>
                    <div className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0e161b] bg-[#131e24] px-2.5 py-0.5 text-xs font-bold text-red-200 shadow-sm">
                      <Image
                        unoptimized
                        src="/assets/heart.webp"
                        alt="HP"
                        width={16}
                        height={16}
                        className="h-4 w-4 object-contain"
                      />
                      <span>{char.defaultMaxHp} HP</span>
                    </div>
                  </div>

                  {/* Ilustrasi Karakter */}
                  <div className="relative mx-auto my-2 flex h-44 sm:h-48 w-full items-center justify-center rounded-2xl border-3 border-[#0e161b] bg-gradient-to-b from-[#131f26] to-[#0d151a] p-3 overflow-hidden shadow-inner">
                    <Image
                      unoptimized
                      src={char.portraitUrl}
                      alt={char.name}
                      width={180}
                      height={220}
                      className="h-full w-auto object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <h2
                    className={`mt-2 text-2xl font-bold tracking-wide cartoon-text-shadow ${char.accentClass}`}
                  >
                    {char.name}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-100/60">
                    {char.title}
                  </p>

                  <p className="mt-2 text-xs text-amber-50/85 leading-relaxed line-clamp-3">
                    {char.playstyle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-[#131f26] space-y-3">
                  {starterRelic && (
                    <div className="flex items-center gap-2 rounded-xl border-2 border-[#0e161b] bg-[#152229] p-2 text-left">
                      <Image
                        unoptimized
                        src={resolveAssetUrl(starterRelic.image_url)}
                        alt={starterRelic.name}
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 object-contain"
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider text-amber-300/80 font-bold">
                          Relik Awal
                        </span>
                        <span className="block truncate text-xs font-bold text-amber-100">
                          {starterRelic.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tombol Pilih Karakter */}
                  <div
                    className="w-full py-2.5 px-4 text-sm font-bold text-amber-100 flex items-center justify-center gap-1.5 transition group-hover:brightness-110"
                    style={{
                      backgroundImage: "url('/assets/ftue_confirm_button.webp')",
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <span className="cartoon-text-shadow">
                      Pilih {char.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const currentCharMeta = CHARACTER_MAP[character];

  return (
    <section className="space-y-5">
      {/* Header Bar: Tombol Back Ganti Karakter, Info Karakter Aktif, & Reset Dek */}
      <div className="cartoon-panel p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToCharacterSelect}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-100 transition hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundImage: "url('/assets/reward_skip_button.webp')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <ArrowLeft className="h-4 w-4 drop-shadow" />
            <span className="cartoon-text-shadow">Back / Ganti Karakter</span>
          </button>

          <div className="flex items-center gap-3 rounded-2xl border-3 border-[#0e161b] bg-[#16232b] px-3.5 py-1.5 shadow-inner">
            <Image
              unoptimized
              src={currentCharMeta.portraitUrl}
              alt={currentCharMeta.name}
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow"
            />
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80">
                Karakter Aktif
              </span>
              <span
                className={`text-base sm:text-lg font-bold ${currentCharMeta.accentClass} cartoon-text-shadow`}
              >
                {currentCharMeta.name}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetStarterDeck}
          className="inline-flex items-center gap-2 rounded-xl border-3 border-[#0e161b] bg-[#263c48] px-4 py-2 text-xs sm:text-sm font-bold text-amber-100 cartoon-button-shadow hover:bg-[#314c5b] transition cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 text-amber-300" />
          Reset Dek &amp; Relik Awal {currentCharMeta.name}
        </button>
      </div>

      {/* BAGIAN ATAS: Status Sisa HP (Kiri) & Act Level (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ATAS KIRI: Status Sisa HP (Slider, Input Manual HP, Max HP) */}
        <div
          className={`lg:col-span-7 cartoon-panel p-4 sm:p-5 transition ${
            isCriticalHp ? "border-red-500 ring-2 ring-red-500/40" : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <Image
                unoptimized
                src="/assets/heart.webp"
                alt="Status HP"
                width={28}
                height={28}
                className={`h-7 w-7 object-contain drop-shadow ${
                  isCriticalHp ? "animate-bounce" : ""
                }`}
              />
              <div>
                <h2 className="text-lg font-bold text-amber-100 cartoon-text-shadow">
                  Status Sisa HP ({hpRatio.toFixed(0)}%)
                </h2>
              </div>
            </div>

            {isCriticalHp ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-400 px-3 py-1 text-xs font-bold text-red-200 shadow">
                ⚠️ HP Darurat (&le; 30%) • Prioritas Pertahanan!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-500/60 px-3 py-1 text-xs font-bold text-emerald-200 shadow">
                ✓ Kondisi HP Aman ({currentHp} / {safeMaxHp})
              </span>
            )}
          </div>

          {/* Slider HP */}
          <div className="my-3 rounded-xl border-2 border-[#0e161b] bg-[#131e24] p-3">
            <input
              type="range"
              min={0}
              max={safeMaxHp}
              value={Math.min(currentHp, safeMaxHp)}
              onChange={(e) => onChangeHp(Number(e.target.value), safeMaxHp)}
              aria-label="Slider Sisa HP"
              className={`w-full h-3 rounded-lg cursor-pointer ${
                isCriticalHp ? "accent-red-500" : "accent-amber-400"
              }`}
            />
            <div className="flex justify-between text-[11px] font-bold text-amber-100/60 mt-1">
              <span>0 HP</span>
              <span>Batas Kritis (30%)</span>
              <span>Max: {safeMaxHp} HP</span>
            </div>
          </div>

          {/* Input Manual HP & Max HP */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border-2 border-[#0e161b] bg-[#152229] px-3 py-1.5">
              <label
                htmlFor="manual-current-hp"
                className="text-xs sm:text-sm font-bold text-amber-100/90"
              >
                HP Saat Ini:
              </label>
              <input
                id="manual-current-hp"
                type="number"
                min={0}
                max={safeMaxHp}
                value={currentHp}
                onChange={(e) => {
                  const val = Math.max(
                    0,
                    Math.min(safeMaxHp, Number(e.target.value) || 0)
                  );
                  onChangeHp(val, safeMaxHp);
                }}
                className="w-20 rounded-lg border-2 border-[#0e161b] bg-[#0e161b] px-2.5 py-1 text-center text-sm font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <span className="text-lg font-bold text-amber-200/60">/</span>

            <div className="flex items-center gap-2 rounded-xl border-2 border-[#0e161b] bg-[#152229] px-3 py-1.5">
              <label
                htmlFor="manual-max-hp"
                className="text-xs sm:text-sm font-bold text-amber-100/90"
              >
                Max HP:
              </label>
              <input
                id="manual-max-hp"
                type="number"
                min={1}
                max={999}
                value={maxHp}
                onChange={(e) => {
                  const nextMax = Math.max(
                    1,
                    Math.min(999, Number(e.target.value) || 1)
                  );
                  onChangeHp(Math.min(currentHp, nextMax), nextMax);
                }}
                className="w-20 rounded-lg border-2 border-[#0e161b] bg-[#0e161b] px-2.5 py-1 text-center text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ATAS KANAN: Act Level (Pilihan Act 1, Act 2, dan Act 3) */}
        <div className="lg:col-span-5 cartoon-panel p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-amber-100 cartoon-text-shadow mb-1">
              Act Level (Babak Permainan)
            </h2>
            <p className="text-xs text-amber-100/75 mb-3">
              Pilih babak permainan yang sedang kamu jalani saat ini:
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {([1, 2, 3] as const).map((act) => {
                const active = actLevel === act;
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => onChangeActLevel(act)}
                    className={`rounded-2xl border-3 py-3 px-2 text-sm sm:text-base font-bold transition cursor-pointer cartoon-button-shadow ${
                      active
                        ? "border-[#0e161b] bg-amber-400 text-slate-950"
                        : "border-[#0e161b] bg-[#16232b] text-amber-100 hover:bg-[#223642]"
                    }`}
                  >
                    Act {act}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-xl border-2 border-[#0e161b] bg-[#152229] px-3.5 py-2.5 text-xs sm:text-sm text-amber-100/90">
            {actLevel === 1 && (
              <span>
                🔥 <strong>Act 1:</strong> Fokus mencari kartu serangan yang kuat di awal untuk mengalahkan musuh &amp; Elite.
              </span>
            )}
            {actLevel === 2 && (
              <span>
                🛡️ <strong>Act 2:</strong> Fokus menyeimbangkan pertahanan (Block) dan mulai menyusun kombo kartu.
              </span>
            )}
            {actLevel === 3 && (
              <span>
                👑 <strong>Act 3:</strong> Fokus menyempurnakan kombo dek dan mencari kartu berefek besar untuk melawan Boss akhir.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BAGIAN TENGAH: KIRI (Kartu Dek Saat Ini) & KANAN (Relik) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* KIRI: KARTU DEK SAAT INI */}
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

          {/* 1. Kartu yang dimiliki saat ini (ada gambarnya) */}
          <div>
            <div className="max-h-72 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
              {groupedDeck.map(({ card, count }) => (
                <div
                  key={card.card_id}
                  className="cartoon-subpanel p-2 flex flex-col items-center text-center group relative"
                >
                  {/* Badge jumlah salinan kartu */}
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

          {/* 2. Sinergi saat ini beserta jumlahnya (misal "Vulnerable 1x") */}
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

          {/* 3. Search Bar Kartu */}
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

          {/* 4. Daftar Beberapa Kartu (ada gambarnya) */}
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

        {/* KANAN: RELIK */}
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

            {activeEnergyRelics.length > 0 && (
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

          {/* 2. Search Bar Relik */}
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

          {/* 3. Daftar Relik yang Ada */}
          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
            {filteredRelics.map((r) => {
              const selected = activeRelicIds.includes(r.relic_id);
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
                    selected
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
                        <span className="truncate text-sm font-bold">
                          {r.name}
                        </span>
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
                        selected
                          ? "bg-amber-400 text-slate-950"
                          : "bg-[#253a46] text-amber-200"
                      }`}
                    >
                      {selected ? "Aktif ✓" : "+ Pilih"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOMBOL BAWAH: "Card Reward Helper" */}
      <div className="cartoon-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#1c2d36] via-[#253b47] to-[#1c2d36]">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <Image
            unoptimized
            src="/assets/reward_icon_special_card.webp"
            alt="Card Reward Helper"
            width={48}
            height={48}
            className="hidden sm:block h-12 w-12 object-contain drop-shadow"
          />
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-amber-100 cartoon-text-shadow">
              Kondisi Permainan &amp; Dek Sudah Siap?
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/80">
              Lanjutkan ke layar pemilihan 3 kartu hadiah untuk melihat kartu mana yang paling cocok diambil!
            </p>
          </div>
        </div>

        <div className="relative flex items-center">
          <Image
            unoptimized
            src="/assets/ftue_pointer_arrow.webp"
            alt=""
            width={44}
            height={44}
            className="hidden md:block h-10 w-auto object-contain mr-2 -scale-x-100 animate-pulse"
          />
          <button
            type="button"
            onClick={onOpenRewardHelper}
            className="relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-lg sm:text-xl font-bold text-amber-100 transition hover:scale-105 active:scale-95 cursor-pointer drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            style={{
              backgroundImage: "url('/assets/ftue_confirm_button.webp')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Sparkles className="h-5 w-5 text-amber-300 drop-shadow" />
            <span className="cartoon-text-shadow tracking-wide">
              Card Reward Helper
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
