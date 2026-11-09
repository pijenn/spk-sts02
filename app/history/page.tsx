"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Award,
  Clock,
  History,
  Layers,
  Loader2,
  Search,
  Share2,
} from "lucide-react";
import { EntityDetailModal } from "@/components/EntityDetailModal";
import { useAppContext } from "@/components/providers/AppProviders";
import { resolveAssetUrl } from "@/lib/asset-url";
import { humanizeTacticalReason } from "@/lib/dsw-wp-engine";
import { getApiBaseUrl } from "@/lib/fetch-cache";
import type { Card, Relic, RunHistoryRecord } from "@/lib/types";

export default function RunHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-amber-100 font-bold">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400 mr-2" />
          Memuat halaman riwayat sesi...
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-6">
        <RunHistoryContent />
      </div>
    </Suspense>
  );
}

function RunHistoryContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const { cardsById, relicsById, user, isCatalogLoading } = useAppContext();

  const [codeInput, setCodeInput] = useState(initialCode);
  const [searching, setSearching] = useState(false);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [loadedRecord, setLoadedRecord] = useState<RunHistoryRecord | null>(
    null
  );

  const [fetchedMyRuns, setFetchedMyRuns] = useState<{
    userId: string;
    runs: RunHistoryRecord[];
  } | null>(null);

  const [inspectedEntity, setInspectedEntity] = useState<
    { kind: "card"; data: Card } | { kind: "relic"; data: Relic } | null
  >(null);

  const fetchRunByCode = useCallback(async (targetCode: string) => {
    const clean = targetCode.trim().toUpperCase();
    if (!clean) return;
    setSearching(true);
    setNotFoundMsg(null);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/history/${encodeURIComponent(clean)}`
      );
      const data = (await res.json()) as RunHistoryRecord & { detail?: string };
      if (!res.ok) {
        setLoadedRecord(null);
        setNotFoundMsg(
          data.detail || `Kode sesi "${clean}" tidak ditemukan.`
        );
        return;
      }
      setLoadedRecord(data);
    } catch {
      setNotFoundMsg("Gagal menghubungi server saat mencari kode sesi.");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!initialCode) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setCodeInput(initialCode);
      void fetchRunByCode(initialCode);
    });
    return () => {
      active = false;
    };
  }, [initialCode, fetchRunByCode]);

  const currentUserId = user?.user_id || "";

  useEffect(() => {
    if (!currentUserId) return;
    let active = true;
    fetch(
      `${getApiBaseUrl()}/history?user_id=${encodeURIComponent(currentUserId)}`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((list: RunHistoryRecord[]) => {
        if (active) setFetchedMyRuns({ userId: currentUserId, runs: list });
      })
      .catch(() => {
        if (active) setFetchedMyRuns({ userId: currentUserId, runs: [] });
      });
    return () => {
      active = false;
    };
  }, [currentUserId]);

  const myRuns =
    currentUserId && fetchedMyRuns?.userId === currentUserId
      ? fetchedMyRuns.runs
      : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchRunByCode(codeInput);
  };

  return (
    <div className="space-y-6">
      <section className="cartoon-panel p-5 sm:p-6 space-y-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            <History className="h-4 w-4" />
            Riwayat &amp; Berbagi Kode Sesi Permainan
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-amber-100 cartoon-text-shadow">
            Cari Sesi Permainan dengan Kode Unik
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/80 mt-0.5">
            Masukkan kode sesi unik (contoh:{" "}
            <strong className="text-amber-300">STS2-8X9K2M</strong>) untuk
            melihat kembali kondisi dek, relik aktif, serta hasil saran kartu.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-200/70" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Masukkan kode sesi unik, misal: STS2-8X9K2M"
              className="w-full rounded-xl border-3 border-[#0e161b] bg-[#131e24] pl-10 pr-4 py-2.5 text-sm font-bold uppercase text-amber-100 placeholder:normal-case placeholder:text-amber-100/45 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !codeInput.trim()}
            className="relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-amber-100 transition hover:scale-105 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundImage: "url('/assets/ftue_confirm_button.webp')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Share2 className="h-4 w-4" />
            <span className="cartoon-text-shadow">
              {searching ? "Mencari..." : "Muat Kode Sesi"}
            </span>
          </button>
        </form>

        {notFoundMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border-2 border-red-500/60 bg-red-950/90 p-3.5 text-xs sm:text-sm font-bold text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />
            <span>{notFoundMsg}</span>
          </div>
        )}
      </section>

      {loadedRecord && !isCatalogLoading && (
        <section className="cartoon-panel p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#152229] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl border-2 border-[#0e161b] bg-amber-400 px-3 py-0.5 text-xs font-bold text-slate-950">
                  {loadedRecord.run_code}
                </span>
                <span className="text-xs font-bold text-amber-100/75 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(loadedRecord.created_at).toLocaleString("id-ID")}
                </span>
              </div>
              <h2 className="mt-1.5 text-xl font-bold text-amber-100 capitalize cartoon-text-shadow">
                Sesi {loadedRecord.character} • Act {loadedRecord.act_level} •
                Sisa HP {loadedRecord.hp_ratio.toFixed(1)}%
              </h2>
            </div>

            <div className="rounded-xl border-2 border-emerald-400/60 bg-[#17332b] px-4 py-2 text-right">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-200/80">
                Kartu yang Disarankan
              </span>
              <span className="text-base font-bold text-amber-300">
                {loadedRecord.recommended_card}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-200 mb-3">
              Urutan 3 Kartu Hadiah yang Ditawarkan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadedRecord.vector_scores.rankings.map((rankItem) => {
                const card = cardsById.get(rankItem.card_id);
                const isWinner =
                  rankItem.rank === 1 &&
                  !loadedRecord.vector_scores.is_skip_recommended;

                return (
                  <div
                    key={rankItem.card_id}
                    className={`cartoon-subpanel p-4 ${
                      isWinner ? "border-amber-400 bg-amber-500/15" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1 rounded-xl border border-[#0e161b] bg-[#142027] px-2.5 py-0.5 text-xs font-bold text-amber-300">
                        {isWinner && <Award className="h-3.5 w-3.5" />}
                        Pilihan #{rankItem.rank}
                      </span>
                      <span className="text-xs font-bold text-sky-300">
                        Skor Kekuatan: {rankItem.vector_s.toFixed(2)}
                      </span>
                    </div>

                    {card && (
                      <div
                        onClick={() =>
                          setInspectedEntity({ kind: "card", data: card })
                        }
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <Image
                          unoptimized
                          src={resolveAssetUrl(card.image_url)}
                          alt={card.name}
                          width={84}
                          height={108}
                          loading="lazy"
                          decoding="async"
                          className="w-18 h-auto rounded-lg group-hover:scale-105 transition"
                        />
                        <div>
                          <h4 className="font-bold text-amber-100 group-hover:text-amber-300">
                            {card.name}
                          </h4>
                          <p className="text-xs text-amber-100/70">
                            {card.rarity} • {card.type}
                          </p>
                          <p className="mt-1 text-xs font-bold text-amber-300">
                            Presentase Kecocokan:{" "}
                            {rankItem.preference_percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-[#0e161b] bg-[#0e161b]">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width: `${Math.min(
                            100,
                            rankItem.preference_percentage
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cartoon-subpanel p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              Alasan Rekomendasi
            </p>
            <p className="text-sm text-amber-50 leading-relaxed">
              {humanizeTacticalReason(loadedRecord.tactical_reason)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="cartoon-subpanel p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-2.5">
                Relik Aktif ({loadedRecord.active_relics.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {loadedRecord.active_relics.map((rid, idx) => {
                  const relic = relicsById.get(rid);
                  if (!relic) return null;
                  return (
                    <button
                      key={`${rid}-${idx}`}
                      type="button"
                      onClick={() =>
                        setInspectedEntity({ kind: "relic", data: relic })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0e161b] bg-[#16232b] px-2.5 py-1 text-xs font-bold text-amber-100 hover:border-amber-400 cursor-pointer"
                    >
                      <Image
                        unoptimized
                        src={resolveAssetUrl(relic.image_url)}
                        alt={relic.name}
                        width={20}
                        height={20}
                        loading="lazy"
                        decoding="async"
                        className="h-5 w-5 object-contain"
                      />
                      <span>{relic.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cartoon-subpanel p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-2.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                Kartu di Dek ({loadedRecord.selected_cards.length} Kartu)
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {loadedRecord.selected_cards.map((cid, idx) => {
                  const c = cardsById.get(cid);
                  if (!c) return null;
                  return (
                    <button
                      key={`${cid}-${idx}`}
                      type="button"
                      onClick={() =>
                        setInspectedEntity({ kind: "card", data: c })
                      }
                      className="rounded-lg border border-[#0e161b] bg-[#16232b] px-2.5 py-0.5 text-xs font-bold text-amber-100 hover:text-amber-300 cursor-pointer"
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {user && (
        <section className="cartoon-panel p-5 space-y-3">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-amber-200">
            Riwayat Sesi Tersimpan Milik {user.username} ({myRuns.length})
          </h2>

          {myRuns.length === 0 ? (
            <p className="text-xs sm:text-sm text-amber-100/70">
              Kamu belum menyimpan sesi permainan. Lakukan pencarian rekomendasi
              kartu di halaman utama lalu klik{" "}
              <strong className="text-amber-300">Simpan Riwayat Sesi</strong>.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myRuns.map((run) => (
                <button
                  key={run.run_id}
                  type="button"
                  onClick={() => {
                    setCodeInput(run.run_code);
                    setLoadedRecord(run);
                    setNotFoundMsg(null);
                  }}
                  className="cartoon-subpanel flex flex-col items-start p-3.5 text-left hover:border-amber-400 transition cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {run.run_code}
                    </span>
                    <span className="text-xs font-bold text-amber-100/70">
                      Act {run.act_level}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-amber-100 capitalize">
                    {run.character} → {run.recommended_card}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-100/70">
                    HP {run.hp_ratio.toFixed(1)}% • {run.selected_cards.length}{" "}
                    kartu di dek
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <EntityDetailModal
        entity={inspectedEntity}
        onClose={() => setInspectedEntity(null)}
      />
    </div>
  );
}
