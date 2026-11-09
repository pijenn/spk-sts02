"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Coins,
  Flame,
  Shield,
  Sparkles,
  Swords,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { RichDescription } from "@/components/RichDescription";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { Card, Relic } from "@/lib/types";

type ModalEntity =
  | { kind: "card"; data: Card }
  | { kind: "relic"; data: Relic };

interface EntityDetailModalProps {
  entity: ModalEntity | null;
  onClose: () => void;
}

export function EntityDetailModal({ entity, onClose }: EntityDetailModalProps) {
  useEffect(() => {
    if (!entity) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [entity, onClose]);

  if (!entity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="cartoon-panel relative my-auto w-full max-w-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border-2 border-[#0e161b] bg-[#3b2325] p-1.5 text-red-200 hover:bg-[#522e31] transition cursor-pointer"
          aria-label="Tutup detail"
        >
          <X className="h-5 w-5" />
        </button>

        {entity.kind === "card" ? (
          <CardDetailBody card={entity.data} />
        ) : (
          <RelicDetailBody relic={entity.data} />
        )}
      </div>
    </div>
  );
}

function CardDetailBody({ card }: { card: Card }) {
  const criteria = [
    {
      label: "⚡ Biaya Energi",
      value: card.c1_cost,
      max: 4,
      note: card.cost === -1 ? "X / Tak Dapat Dimainkan" : `${card.cost ?? 0} Energi`,
      barColor: "bg-amber-400",
      isCost: true,
    },
    {
      label: "⚔️ Kekuatan Serangan",
      value: card.c2_offensive,
      max: 5,
      note: `${card.c2_offensive} / 5`,
      barColor: "bg-red-500",
      isCost: false,
    },
    {
      label: "🛡️ Kekuatan Pertahanan",
      value: card.c3_defensive,
      max: 5,
      note: `${card.c3_defensive} / 5`,
      barColor: "bg-sky-400",
      isCost: false,
    },
    {
      label: "💎 Tingkat Kelangkaan",
      value: card.c4_rarity,
      max: 5,
      note: `${card.rarity} (${card.c4_rarity}/5)`,
      barColor: "bg-purple-400",
      isCost: false,
    },
    {
      label: "🔗 Potensi Kombo & Sinergi",
      value: card.c5_synergy,
      max: 5,
      note: `${card.c5_synergy} / 5`,
      barColor: "bg-emerald-400",
      isCost: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
      <div className="sm:col-span-5 flex flex-col items-center">
        <Image
          unoptimized
          src={resolveAssetUrl(card.image_url)}
          alt={card.name}
          width={240}
          height={310}
          loading="lazy"
          decoding="async"
          className="w-56 h-auto rounded-xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)]"
        />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {card.is_rewardable ? (
            <span className="inline-flex items-center gap-1 rounded-xl border-2 border-emerald-500/50 bg-[#17332b] px-3 py-1 text-xs font-bold text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Kartu Hadiah Pertarungan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0e161b] bg-[#16232b] px-3 py-1 text-xs font-bold text-amber-100/80">
              <XCircle className="h-3.5 w-3.5 text-amber-300" />
              Kartu Khusus ({card.rarity})
            </span>
          )}
        </div>
      </div>

      <div className="sm:col-span-7 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200/80">
            <span className="text-amber-300">{card.color}</span>
            <span>•</span>
            <span>{card.type}</span>
            <span>•</span>
            <span>{card.rarity}</span>
          </div>
          <h3 className="mt-1 text-2xl font-bold text-amber-100 cartoon-text-shadow">
            {card.name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0e161b] bg-[#142027] px-3 py-1 text-xs font-bold text-amber-100">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Energi: <strong>{card.cost === -1 ? "X / -" : card.cost ?? 0}</strong>
          </span>
          {card.damage !== null && (
            <span className="inline-flex items-center gap-1 rounded-xl border-2 border-red-500/40 bg-[#2d1a1d] px-3 py-1 text-xs font-bold text-red-200">
              <Swords className="h-3.5 w-3.5" />
              Serangan: <strong>{card.damage}</strong>
            </span>
          )}
          {card.block !== null && (
            <span className="inline-flex items-center gap-1 rounded-xl border-2 border-sky-500/40 bg-[#192b36] px-3 py-1 text-xs font-bold text-sky-200">
              <Shield className="h-3.5 w-3.5" />
              Block: <strong>{card.block}</strong>
            </span>
          )}
          {card.cards_draw !== null && (
            <span className="inline-flex items-center gap-1 rounded-xl border-2 border-emerald-500/40 bg-[#17332b] px-3 py-1 text-xs font-bold text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Ambil Kartu: <strong>+{card.cards_draw}</strong>
            </span>
          )}
          {card.energy_gain !== null && (
            <span className="inline-flex items-center gap-1 rounded-xl border-2 border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-200">
              <Flame className="h-3.5 w-3.5" />
              Tambah Energi: <strong>+{card.energy_gain}</strong>
            </span>
          )}
        </div>

        <div className="cartoon-subpanel p-3.5 text-sm text-amber-50">
          <RichDescription text={card.description} />
        </div>

        {card.keywords.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
              Efek &amp; Kombo Kartu
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-lg border-2 border-[#0e161b] bg-[#16232b] px-2.5 py-0.5 text-xs font-bold text-amber-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="cartoon-subpanel p-3.5 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-200">
            Statistik Kekuatan Kartu
          </p>
          {criteria.map((item) => {
            const pct = item.isCost
              ? Math.max(8, (item.value / item.max) * 100)
              : (item.value / item.max) * 100;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-100">{item.label}</span>
                  <span className="text-amber-300">{item.note}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#0e161b] bg-[#0e161b]">
                  <div
                    className={`h-full rounded-full ${item.barColor} transition-all`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RelicDetailBody({ relic }: { relic: Relic }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-3 border-[#0e161b] bg-[#142027] p-2">
          <Image
            unoptimized
            src={resolveAssetUrl(relic.image_url)}
            alt={relic.name}
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="h-16 w-16 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border-2 border-[#0e161b] bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-slate-950">
              {relic.rarity}
            </span>
            <span className="rounded-lg border-2 border-[#0e161b] bg-[#16232b] px-2.5 py-0.5 text-xs font-bold uppercase text-amber-200">
              Karakter: {relic.pool}
            </span>
            {relic.merchant_price !== null && (
              <span className="inline-flex items-center gap-1 rounded-lg border-2 border-yellow-500/40 bg-yellow-500/15 px-2.5 py-0.5 text-xs font-bold text-yellow-200">
                <Coins className="h-3.5 w-3.5" />
                {relic.merchant_price} Gold
              </span>
            )}
            {relic.is_energy_relic && (
              <span className="inline-flex items-center gap-1 rounded-lg border-2 border-emerald-400/60 bg-[#17332b] px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                ⚡ Relik Tambahan Energi
              </span>
            )}
          </div>
          <h3 className="mt-2 text-2xl font-bold text-amber-100 cartoon-text-shadow">
            {relic.name}
          </h3>
        </div>
      </div>

      <div className="cartoon-subpanel p-4 text-sm text-amber-50">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
          Efek Relik
        </p>
        <RichDescription text={relic.description} />
      </div>

      {relic.flavor && (
        <div className="cartoon-subpanel p-4 text-xs italic text-amber-100/80">
          <p className="not-italic text-xs font-bold uppercase tracking-wider text-amber-300/70 mb-1">
            Cerita Relik
          </p>
          <RichDescription text={relic.flavor} />
        </div>
      )}

      {relic.notes && (
        <div className="cartoon-subpanel p-3.5 text-xs text-amber-100/90">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
            Catatan Tambahan
          </p>
          <RichDescription text={relic.notes} />
        </div>
      )}
    </div>
  );
}
