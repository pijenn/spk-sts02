"use client";

import React, { useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { EntityDetailModal } from "@/components/EntityDetailModal";
import { useAppContext } from "@/components/providers/AppProviders";
import { CardRewardSelector } from "@/components/spk/CardRewardSelector";
import { RecommendationDashboard } from "@/components/spk/RecommendationDashboard";
import { StateInputPanel } from "@/components/spk/StateInputPanel";
import { CHARACTER_MAP } from "@/lib/constants";
import { getApiBaseUrl } from "@/lib/fetch-cache";
import type {
  Card,
  CharacterId,
  RecommendationResponse,
  Relic,
  RunHistoryRecord,
} from "@/lib/types";

type FlowStep = "character" | "panelA" | "reward";

export default function HomeSpkPage() {
  const {
    cards,
    relics,
    cardsById,
    relicsById,
    isCatalogLoading,
    catalogError,
    user,
    openAuthModal,
  } = useAppContext();

  const [flowStep, setFlowStep] = useState<FlowStep>("character");
  const [character, setCharacter] = useState<CharacterId>("ironclad");
  const [maxHp, setMaxHp] = useState<number>(80);
  const [currentHp, setCurrentHp] = useState<number>(64);
  const [actLevel, setActLevel] = useState<1 | 2 | 3>(1);

  const [customRelicIds, setCustomRelicIds] = useState<string[] | null>(null);
  const [customDeckCardIds, setCustomDeckCardIds] = useState<string[] | null>(
    null
  );
  const [customRewardSlots, setCustomRewardSlots] = useState<
    (string | null)[] | null
  >(null);

  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null);
  const [evaluatedRewardIds, setEvaluatedRewardIds] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [savedRunCode, setSavedRunCode] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const [inspectedEntity, setInspectedEntity] = useState<
    { kind: "card"; data: Card } | { kind: "relic"; data: Relic } | null
  >(null);

  const panelCRef = useRef<HTMLDivElement | null>(null);

  const defaultStarter = useMemo(() => {
    const meta = CHARACTER_MAP[character];
    const byCodexCard = new Map(cards.map((c) => [c.codex_id, c]));
    const byCodexRelic = new Map(relics.map((r) => [r.codex_id, r]));

    const deck: string[] = [];
    for (const entry of meta.starterCardCodexIds) {
      const found = byCodexCard.get(entry.codexId);
      if (found) {
        for (let i = 0; i < entry.count; i++) {
          deck.push(found.card_id);
        }
      }
    }

    const starterRelic = byCodexRelic.get(meta.starterRelicCodexId);
    const relicList = starterRelic ? [starterRelic.relic_id] : [];

    const samplePool = cards.filter(
      (c) => c.is_rewardable && c.color === character
    );
    const sampleRewards: (string | null)[] =
      samplePool.length >= 3
        ? [
            samplePool[0].card_id,
            samplePool[3]?.card_id || samplePool[1].card_id,
            samplePool[7]?.card_id || samplePool[2].card_id,
          ]
        : [null, null, null];

    return { deck, relicList, sampleRewards };
  }, [character, cards, relics]);

  const activeRelicIds = customRelicIds ?? defaultStarter.relicList;
  const deckCardIds = customDeckCardIds ?? defaultStarter.deck;
  const rewardSlots = customRewardSlots ?? defaultStarter.sampleRewards;

  const handleSelectCharacter = (nextChar: CharacterId) => {
    if (nextChar !== character) {
      const nextMeta = CHARACTER_MAP[nextChar];
      const ratio = maxHp > 0 ? currentHp / maxHp : 1;
      const nextMax = nextMeta.defaultMaxHp;
      const nextCurrent = Math.max(1, Math.round(nextMax * ratio));

      setCharacter(nextChar);
      setMaxHp(nextMax);
      setCurrentHp(Math.min(nextMax, nextCurrent));
      setCustomRelicIds(null);
      setCustomDeckCardIds(null);
      setCustomRewardSlots(null);
      setRecommendation(null);
      setSavedRunCode(null);
      setStatusBanner(null);
    }
    setFlowStep("panelA");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleRelic = (relicId: string) => {
    const base = activeRelicIds;
    setCustomRelicIds(
      base.includes(relicId)
        ? base.filter((id) => id !== relicId)
        : [...base, relicId]
    );
  };

  const handleAddDeckCard = (cardId: string) => {
    setCustomDeckCardIds([...deckCardIds, cardId]);
  };

  const handleRemoveDeckCardInstance = (cardId: string) => {
    const idx = deckCardIds.indexOf(cardId);
    if (idx === -1) return;
    setCustomDeckCardIds(deckCardIds.filter((_, i) => i !== idx));
  };

  const handleSelectSlotCard = (slotIndex: number, cardId: string | null) => {
    setCustomRewardSlots(
      rewardSlots.map((existing, idx) => (idx === slotIndex ? cardId : existing))
    );
  };

  const canEvaluate = rewardSlots.every((id) => Boolean(id));

  const handleEvaluate = async () => {
    if (!canEvaluate) return;
    const rewardIds = rewardSlots.filter((id): id is string => Boolean(id));

    setIsEvaluating(true);
    setEvalError(null);
    setSavedRunCode(null);
    setStatusBanner(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          current_hp: currentHp,
          max_hp: maxHp,
          act_level: actLevel,
          active_relics: activeRelicIds,
          current_deck_cards: deckCardIds,
          reward_card_ids: rewardIds,
        }),
      });
      const data = (await response.json()) as RecommendationResponse & {
        detail?: string;
      };
      if (!response.ok) {
        throw new Error(data.detail || "Gagal memproses hasil rekomendasi.");
      }
      setRecommendation(data);
      setEvaluatedRewardIds(rewardIds);
      setTimeout(() => {
        panelCRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setRecommendation(null);
      setEvalError(
        err instanceof Error
          ? err.message
          : "Server Machine Learning sedang mati atau tidak dapat dihubungi."
      );
      setTimeout(() => {
        panelCRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTakeCardToDeck = (cardId: string) => {
    const card = cardsById.get(cardId);
    const nextDeck = [...deckCardIds, cardId];
    setCustomDeckCardIds(nextDeck);
    setCustomRewardSlots([null, null, null]);
    setStatusBanner(
      `Kartu "${card?.name || "Terpilih"}" berhasil ditambahkan ke Dek Saat Ini (${
        nextDeck.length
      } kartu)! Silakan pilih 3 kartu hadiah berikutnya atau kembali ke pengaturan dek.`
    );
  };

  const handleSkipReward = () => {
    setCustomRewardSlots([null, null, null]);
    setStatusBanner(
      "Kamu melewati kartu hadiah (Skip Card) agar dek tetap ramping dan konsisten. Silakan masukkan 3 kartu hadiah untuk lantai berikutnya!"
    );
  };

  const executeSaveSession = async (targetUserId: string) => {
    if (!recommendation || evaluatedRewardIds.length !== 3) return;
    setIsSavingSession(true);
    setEvalError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: targetUserId,
          character,
          act_level: actLevel,
          hp_ratio: recommendation.hp_ratio,
          active_relics: activeRelicIds,
          selected_cards: deckCardIds,
          offered_cards: evaluatedRewardIds,
          recommended_card: recommendation.recommended_card,
          vector_scores: {
            rankings: recommendation.rankings,
            weights: recommendation.weights,
            is_skip_recommended: recommendation.is_skip_recommended,
            skip_threshold: recommendation.skip_threshold,
            max_vector_s: recommendation.max_vector_s,
          },
          tactical_reason: recommendation.tactical_reason,
        }),
      });
      const saved = (await res.json()) as RunHistoryRecord & { detail?: string };
      if (!res.ok) {
        throw new Error(saved.detail || "Gagal menyimpan riwayat sesi.");
      }
      setSavedRunCode(saved.run_code);
      setStatusBanner(
        `Sesi permainan berhasil disimpan! Bagikan kode unik sesi kamu: ${saved.run_code}`
      );
    } catch (err) {
      setEvalError(
        err instanceof Error ? err.message : "Gagal menyimpan sesi ke server."
      );
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleSaveSessionClick = () => {
    if (!recommendation) return;
    if (!user) {
      openAuthModal((authedUser) => {
        void executeSaveSession(authedUser.user_id);
      });
      return;
    }
    void executeSaveSession(user.user_id);
  };

  const isRewardBackground = flowStep === "reward";

  if (isCatalogLoading) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-3 text-amber-100">
        <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
        <p className="text-base font-bold cartoon-text-shadow">
          Memuat daftar kartu &amp; relik Slay the Spire 2...
        </p>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="mx-auto max-w-3xl my-10 cartoon-panel border-red-500 p-6 text-center text-base font-bold text-red-200">
        {catalogError}
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-5rem)] w-full bg-cover bg-center bg-fixed transition-all duration-500"
      style={{
        backgroundImage: isRewardBackground
          ? "linear-gradient(to bottom, rgba(10, 18, 26, 0.55), rgba(10, 18, 26, 0.82)), url('/assets/background reward.webp')"
          : "linear-gradient(to bottom, rgba(12, 20, 26, 0.50), rgba(12, 20, 26, 0.78)), url('/assets/background.webp')",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-6 space-y-6">
        {flowStep !== "reward" ? (
          <StateInputPanel
            character={character}
            isCharacterConfirmed={flowStep === "panelA"}
            onSelectCharacter={handleSelectCharacter}
            onBackToCharacterSelect={() => {
              setFlowStep("character");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            currentHp={currentHp}
            maxHp={maxHp}
            onChangeHp={(curr, max) => {
              setCurrentHp(curr);
              setMaxHp(max);
            }}
            actLevel={actLevel}
            onChangeActLevel={setActLevel}
            activeRelicIds={activeRelicIds}
            onToggleRelic={handleToggleRelic}
            deckCardIds={deckCardIds}
            onAddDeckCard={handleAddDeckCard}
            onRemoveDeckCardInstance={handleRemoveDeckCardInstance}
            onResetStarterDeck={() => {
              setCustomRelicIds(null);
              setCustomDeckCardIds(null);
            }}
            onOpenRewardHelper={() => {
              setFlowStep("reward");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            cards={cards}
            cardsById={cardsById}
            relics={relics}
            relicsById={relicsById}
            onInspectCard={(card) =>
              setInspectedEntity({ kind: "card", data: card })
            }
            onInspectRelic={(relic) =>
              setInspectedEntity({ kind: "relic", data: relic })
            }
          />
        ) : (
          <div className="space-y-8">
            <CardRewardSelector
              character={character}
              rewardSlots={rewardSlots}
              onSelectSlotCard={handleSelectSlotCard}
              onBackToPanelA={() => {
                setFlowStep("panelA");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              canEvaluate={canEvaluate}
              isEvaluating={isEvaluating}
              onEvaluate={handleEvaluate}
              cards={cards}
              cardsById={cardsById}
              onInspectCard={(card) =>
                setInspectedEntity({ kind: "card", data: card })
              }
            />

            <div ref={panelCRef}>
              <RecommendationDashboard
                evalError={evalError}
                recommendation={recommendation}
                onTakeCardToDeck={handleTakeCardToDeck}
                onSkipReward={handleSkipReward}
                onSaveSession={handleSaveSessionClick}
                isSavingSession={isSavingSession}
                savedRunCode={savedRunCode}
                statusBanner={statusBanner}
                cardsById={cardsById}
                onInspectCard={(card) =>
                  setInspectedEntity({ kind: "card", data: card })
                }
              />
            </div>
          </div>
        )}

        <EntityDetailModal
          entity={inspectedEntity}
          onClose={() => setInspectedEntity(null)}
        />
      </div>
    </div>
  );
}
