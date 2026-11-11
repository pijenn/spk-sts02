"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertOctagon,
  Award,
  Check,
  Copy,
  ExternalLink,
  FastForward,
  PlusCircle,
  Save,
  Sliders,
} from "lucide-react";
import { resolveAssetUrl } from "@/lib/asset-url";
import { humanizeRuleText, humanizeTacticalReason } from "@/lib/dsw-wp-engine";
import type { Card, RecommendationResponse } from "@/lib/types";

const WEIGHT_BAR_ITEMS = [
  {
    key: "w1_cost" as const,
    label: "⚡ Hemat Energi Kartu",
    color: "bg-amber-400",
  },
  {
    key: "w2_offensive" as const,
    label: "⚔️ Kekuatan Serangan",
    color: "bg-red-500",
  },
  {
    key: "w3_defensive" as const,
    label: "🛡️ Kekuatan Pertahanan (Block)",
    color: "bg-sky-400",
  },
  {
    key: "w4_rarity" as const,
    label: "💎 Kelangkaan Kartu",
    color: "bg-purple-400",
  },
  {
    key: "w5_synergy" as const,
    label: "🔗 Kecocokan Kombo Dek & Relik",
    color: "bg-emerald-400",
  },
];

interface RecommendationDashboardProps {
  evalError: string | null;
  recommendation: RecommendationResponse | null;
  onTakeCardToDeck: (cardId: string) => void;
  onSkipReward: () => void;
  onSaveSession: () => void;
  isSavingSession: boolean;
  savedRunCode: string | null;
  statusBanner: string | null;
  cardsById: Map<string, Card>;
  onInspectCard: (card: Card) => void;
}

export function RecommendationDashboard({
  evalError,
  recommendation,
  onTakeCardToDeck,
  onSkipReward,
  onSaveSession,
  isSavingSession,
  savedRunCode,
  statusBanner,
  cardsById,
  onInspectCard,
}: RecommendationDashboardProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!savedRunCode) return;
    try {
      await navigator.clipboard.writeText(savedRunCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
    }
  };

  if (!evalError && !statusBanner && !recommendation) {
    return null;
  }

  return (
    <section className="space-y-6 pt-2">
      {evalError && (
        <div className="cartoon-panel border-red-500 bg-gradient-to-r from-[#421c1e] via-[#331719] to-[#241315] p-5 flex items-start gap-3.5 text-left">
          <AlertOctagon className="h-7 w-7 shrink-0 text-red-300 mt-0.5 drop-shadow" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-red-200 cartoon-text-shadow">
              Gagal Memproses Rekomendasi (Server Machine Learning Tidak Aktif)
            </h3>
            <p className="mt-1 text-xs sm:text-sm font-bold text-red-100/90 leading-relaxed">
              {evalError}
            </p>
          </div>
        </div>
      )}

      {statusBanner && (
        <div className="cartoon-panel border-emerald-400 bg-[#17332b]/95 p-4 text-center text-sm font-bold text-emerald-200">
          {statusBanner}
        </div>
      )}

      {recommendation && (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-full max-w-xl h-20 sm:h-24 select-none">
              <Image
                unoptimized
                src="/assets/reward_banner.webp"
                alt="Hasil Rekomendasi"
                fill
                className="object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]"
              />
              <div className="relative z-10 text-center pb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#2b1d0e] tracking-wide drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                  Hasil Saran Kartu Terbaik
                </h2>
              </div>
            </div>
            <p className="text-center text-sm sm:text-base text-amber-100/90 cartoon-text-shadow -mt-1">
              Urutan kartu dari yang paling cocok dengan kondisi HP, Relik, dan Kombo Dek kamu saat ini
            </p>
          </div>

          {recommendation.is_skip_recommended && (
            <div className="cartoon-panel border-red-500 bg-gradient-to-r from-[#421c1e] via-[#331719] to-[#241315] p-5 flex items-start gap-4">
              <AlertOctagon className="h-9 w-9 shrink-0 text-red-300 mt-0.5 drop-shadow" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-wide text-red-200 cartoon-text-shadow">
                  SARAN TERBAIK: LEWATI HADIAH (SKIP CARD)
                </h3>
                <p className="mt-1 text-sm text-red-100/90 leading-relaxed">
                  Skor Kekuatan Kartu tertinggi (
                  <strong>{recommendation.max_vector_s.toFixed(2)}</strong>) masih
                  di bawah nilai kelayakan minimal (
                  <strong>{recommendation.skip_threshold.toFixed(2)}</strong>).
                  Ketiga kartu ini kurang cocok dengan dek kamu saat ini — sebaiknya{" "}
                  <strong>Skip Card</strong> agar dek tidak penuh dengan kartu yang sulit digunakan!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {recommendation.rankings.map((item) => {
              const card = cardsById.get(item.card_id);
              const isTopPick =
                item.rank === 1 && !recommendation.is_skip_recommended;

              return (
                <div
                  key={item.card_id}
                  className={`cartoon-panel p-4 sm:p-5 flex flex-col justify-between transition ${
                    isTopPick
                      ? "border-amber-400 bg-gradient-to-b from-[#2c424d] via-[#1f313a] to-[#17252c] ring-4 ring-amber-400/35"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {isTopPick ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0e161b] bg-amber-400 px-3 py-1 text-xs sm:text-sm font-bold text-slate-950 shadow">
                          <Award className="h-4 w-4" />
                          PILIHAN #1 TERBAIK
                        </span>
                      ) : (
                        <span className="rounded-xl border-2 border-[#0e161b] bg-[#142027] px-3 py-1 text-xs sm:text-sm font-bold text-amber-200">
                          Pilihan #{item.rank}
                        </span>
                      )}
                      <span className="rounded-xl border-2 border-[#0e161b] bg-[#142027] px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-300">
                        {item.preference_percentage.toFixed(1)}% Cocok
                      </span>
                    </div>

                    {card && (
                      <div className="flex items-center gap-3.5 mb-4">
                        <Image
                          unoptimized
                          src={resolveAssetUrl(card.image_url)}
                          alt={card.name}
                          width={110}
                          height={142}
                          loading="lazy"
                          decoding="async"
                          onClick={() => onInspectCard(card)}
                          className="w-24 sm:w-28 h-auto rounded-xl cursor-pointer hover:scale-105 transition-transform drop-shadow-[0_8px_14px_rgba(0,0,0,0.75)]"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <h4 className="text-lg sm:text-xl font-bold text-amber-100 truncate cartoon-text-shadow">
                            {item.name}
                          </h4>
                          <p className="text-xs font-bold text-amber-200/75">
                            {card.rarity} • {card.type}
                          </p>
                          <div className="inline-block rounded-lg border border-[#0e161b] bg-[#142027] px-2.5 py-1 text-xs text-amber-100">
                            Skor Kekuatan Kartu:{" "}
                            <strong className="text-sky-300">
                              {item.vector_s.toFixed(2)}
                            </strong>
                          </div>

                          {item.matched_keywords.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {item.matched_keywords.map((kw) => (
                                <span
                                  key={kw}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[11px] font-bold text-emerald-200"
                                >
                                  🔗 Kombo {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="cartoon-subpanel p-3 space-y-1.5">
                      <div className="flex justify-between text-xs sm:text-sm font-bold">
                        <span className="text-amber-100/90">
                          Presentase Kecocokan
                        </span>
                        <span className="text-amber-300">
                          {item.preference_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3.5 w-full overflow-hidden rounded-full border-2 border-[#0e161b] bg-[#0e161b]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTopPick
                              ? "bg-gradient-to-r from-amber-400 to-orange-500"
                              : "bg-sky-400"
                          }`}
                          style={{
                            width: `${Math.min(100, item.preference_percentage)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTakeCardToDeck(item.card_id)}
                    className="mt-4 w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-amber-100 inline-flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                    style={{
                      backgroundImage: isTopPick
                        ? "url('/assets/ftue_confirm_button.webp')"
                        : "url('/assets/reward_item_button.webp')",
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <PlusCircle className="h-4 w-4 drop-shadow" />
                    <span className="cartoon-text-shadow">
                      Ambil {item.name} ke Dek
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 cartoon-panel p-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#0e161b] bg-amber-400 text-slate-950 font-bold text-lg shadow">
                  💡
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-300 cartoon-text-shadow">
                  Kenapa Kartu Ini Cocok Untukmu?
                </h3>
              </div>

              <p className="text-sm sm:text-base text-amber-50 leading-relaxed rounded-xl border-2 border-[#0e161b] bg-[#152229] p-3.5">
                {humanizeTacticalReason(recommendation.tactical_reason)}
              </p>

              {recommendation.weights.active_rules.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs sm:text-sm font-bold text-amber-200 mb-2">
                    Kondisi Permainan yang Dipertimbangkan:
                  </p>
                  <ul className="space-y-1.5">
                    {recommendation.weights.active_rules.map((rule) => (
                      <li
                        key={rule}
                        className="text-xs sm:text-sm text-emerald-200 flex items-start gap-2 rounded-xl border border-[#0e161b] bg-[#152229]/80 px-3 py-2"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{humanizeRuleText(rule)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="lg:col-span-5 cartoon-panel p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-sky-300 cartoon-text-shadow">
                <Sliders className="h-5 w-5" />
                Fokus Kebutuhan Dek Saat Ini
              </div>
              <p className="text-xs text-amber-100/75">
                Seberapa besar masing-masing aspek diutamakan pada kondisimu sekarang:
              </p>

              <div className="space-y-3 pt-1">
                {WEIGHT_BAR_ITEMS.map((w) => {
                  const val = recommendation.weights[w.key];
                  return (
                    <div key={w.key} className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm font-bold">
                        <span className="text-amber-100">{w.label}</span>
                        <span className="text-amber-300">
                          {(val * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#0e161b] bg-[#0e161b]">
                        <div
                          className={`h-full rounded-full ${w.color}`}
                          style={{ width: `${Math.min(100, val * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="cartoon-panel p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {recommendation.rankings[0] && (
                <button
                  type="button"
                  onClick={() =>
                    onTakeCardToDeck(recommendation.rankings[0].card_id)
                  }
                  className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-100 transition hover:scale-105 cursor-pointer"
                  style={{
                    backgroundImage: "url('/assets/ftue_confirm_button.webp')",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="cartoon-text-shadow">
                    Ambil Pilihan #1 ({recommendation.rankings[0].name})
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onSkipReward}
                className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-100 transition hover:scale-105 cursor-pointer"
                style={{
                  backgroundImage: "url('/assets/reward_skip_button.webp')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <FastForward className="h-4 w-4" />
                <span className="cartoon-text-shadow">
                  Lewati Kartu (Skip)
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isSavingSession}
                onClick={onSaveSession}
                className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-100 transition hover:scale-105 disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundImage: "url('/assets/reward_item_button.webp')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <Save className="h-4 w-4" />
                <span className="cartoon-text-shadow">
                  {isSavingSession ? "Menyimpan..." : "Simpan Riwayat Sesi"}
                </span>
              </button>

              {savedRunCode && (
                <div className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400/60 bg-[#17332b] px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-200">
                  <span>Kode Sesi:</span>
                  <strong className="text-amber-300">{savedRunCode}</strong>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="rounded p-1 hover:bg-emerald-500/20 cursor-pointer"
                    title="Salin kode sesi"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <Link
                    href={`/history?code=${encodeURIComponent(savedRunCode)}`}
                    className="inline-flex items-center gap-1 text-amber-300 hover:underline ml-1"
                  >
                    Buka
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
