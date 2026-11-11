"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { CharacterSelectionGrid } from "@/components/spk/CharacterSelectionGrid";
import { DeckManagerSection } from "@/components/spk/DeckManagerSection";
import { HpAndActSection } from "@/components/spk/HpAndActSection";
import { RelicManagerSection } from "@/components/spk/RelicManagerSection";
import { CHARACTER_MAP } from "@/lib/constants";
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
  const byCodexRelic = useMemo(
    () => new Map(relics.map((r) => [r.codex_id, r])),
    [relics]
  );

  if (!isCharacterConfirmed) {
    return (
      <CharacterSelectionGrid
        character={character}
        byCodexRelic={byCodexRelic}
        onSelectCharacter={onSelectCharacter}
      />
    );
  }

  const currentCharMeta = CHARACTER_MAP[character];

  return (
    <section className="space-y-5">
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
      <HpAndActSection
        currentHp={currentHp}
        maxHp={maxHp}
        onChangeHp={onChangeHp}
        actLevel={actLevel}
        onChangeActLevel={onChangeActLevel}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <DeckManagerSection
          character={character}
          deckCardIds={deckCardIds}
          cards={cards}
          cardsById={cardsById}
          onAddDeckCard={onAddDeckCard}
          onRemoveDeckCardInstance={onRemoveDeckCardInstance}
          onInspectCard={onInspectCard}
        />

        <RelicManagerSection
          character={character}
          activeRelicIds={activeRelicIds}
          relics={relics}
          relicsById={relicsById}
          onToggleRelic={onToggleRelic}
          onInspectRelic={onInspectRelic}
        />
      </div>
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
