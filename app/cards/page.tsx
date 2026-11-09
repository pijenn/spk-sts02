"use client";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Filter, Layers, Loader2, Search } from "lucide-react";
import { CardGridItem } from "@/components/CardGridItem";
import { EntityDetailModal } from "@/components/EntityDetailModal";
import { useAppContext } from "@/components/providers/AppProviders";
import { CARD_COLOR_TABS } from "@/lib/constants";
import type { Card } from "@/lib/types";

const CHUNK_SIZE = 36; // PRD 03 Bagian 3.2.B: Render bertahap 36 item per guliran

export default function CardsGalleryPage() {
  const { cards, isCatalogLoading } = useAppContext();

  // PRD 03 Bagian 3.2.B: Default tab aktif disetel ke "ironclad" (~87 kartu)
  const [selectedColorTab, setSelectedColorTab] = useState<string>("ironclad");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCost, setSelectedCost] = useState<string>("all");
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all");
  const [rewardableOnly, setRewardableOnly] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");

  const deferredSearch = useDeferredValue(searchInput);

  const filterKey = `${selectedColorTab}|${rewardableOnly}|${selectedType}|${selectedRarity}|${selectedCost}|${selectedKeyword}|${deferredSearch}`;
  const [pagination, setPagination] = useState<{ key: string; count: number }>({
    key: filterKey,
    count: CHUNK_SIZE,
  });
  const visibleCount =
    pagination.key === filterKey ? pagination.count : CHUNK_SIZE;

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const availableKeywords = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) {
      for (const kw of c.keywords) set.add(kw);
    }
    return Array.from(set).sort();
  }, [cards]);

  const filteredCards = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();

    return cards.filter((card) => {
      if (selectedColorTab !== "all") {
        if (selectedColorTab === "event") {
          if (
            card.color !== "event" &&
            card.color !== "quest" &&
            card.color !== "token"
          ) {
            return false;
          }
        } else if (selectedColorTab === "curse_status") {
          if (card.color !== "curse" && card.color !== "status") {
            return false;
          }
        } else if (card.color !== selectedColorTab) {
          return false;
        }
      }

      if (rewardableOnly && !card.is_rewardable) return false;
      if (selectedType !== "all" && card.type !== selectedType) return false;
      if (selectedRarity !== "all" && card.rarity !== selectedRarity) return false;

      if (selectedCost !== "all") {
        if (selectedCost === "3+") {
          if ((card.cost ?? -1) < 3) return false;
        } else if (selectedCost === "x") {
          if ((card.cost ?? 0) >= 0) return false;
        } else if (card.cost !== Number(selectedCost)) {
          return false;
        }
      }

      if (selectedKeyword !== "all" && !card.keywords.includes(selectedKeyword)) {
        return false;
      }

      if (q) {
        const matchName = card.name.toLowerCase().includes(q);
        const matchDesc = card.description.toLowerCase().includes(q);
        const matchKw = card.keywords.some((kw) => kw.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchKw) return false;
      }

      return true;
    });
  }, [
    cards,
    selectedColorTab,
    rewardableOnly,
    selectedType,
    selectedRarity,
    selectedCost,
    selectedKeyword,
    deferredSearch,
  ]);

  // IntersectionObserver untuk Chunked Infinite Scroll (+36 item per guliran)
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    if (visibleCount >= filteredCards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPagination((prev) => {
            const baseCount = prev.key === filterKey ? prev.count : CHUNK_SIZE;
            return {
              key: filterKey,
              count: Math.min(filteredCards.length, baseCount + CHUNK_SIZE),
            };
          });
        }
      },
      { rootMargin: "320px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredCards.length, filterKey]);

  const visibleCards = useMemo(
    () => filteredCards.slice(0, visibleCount),
    [filteredCards, visibleCount]
  );

  if (isCatalogLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="text-sm">Memuat galeri kartu dari memori klien...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-6 space-y-5">
      <div className="cartoon-panel p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Layers className="h-3.5 w-3.5" />
              Galeri Katalog Kartu
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-amber-100 cartoon-text-shadow">
              Katalog Kartu Slay the Spire 2 ({filteredCards.length} / {cards.length})
            </h1>
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0e161b] bg-[#142027] px-3.5 py-2 text-xs font-bold text-amber-100 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rewardableOnly}
              onChange={(e) => setRewardableOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-amber-500"
            />
            Hanya Kartu Hadiah Pertarungan
          </label>
        </div>

        {/* Tab Karakter / Warna Kartu (Default: ironclad) */}
        <div className="flex flex-wrap gap-1.5">
          {CARD_COLOR_TABS.map((tab) => {
            const active = selectedColorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedColorTab(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "border border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bar Pencarian & Filter Kriteria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          <div className="lg:col-span-4 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama kartu, efek deskripsi, atau keyword..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter Tipe Kartu"
            className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="Attack">Attack</option>
            <option value="Skill">Skill</option>
            <option value="Power">Power</option>
            <option value="Status">Status</option>
            <option value="Curse">Curse</option>
            <option value="Quest">Quest</option>
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            aria-label="Filter Rarity Kartu"
            className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Semua Rarity</option>
            <option value="Basic">Basic</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Ancient">Ancient</option>
            <option value="Event">Event</option>
            <option value="Token">Token</option>
            <option value="Status">Status</option>
            <option value="Curse">Curse</option>
          </select>

          <select
            value={selectedCost}
            onChange={(e) => setSelectedCost(e.target.value)}
            aria-label="Filter Biaya Energi"
            className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Semua Cost</option>
            <option value="0">0 Energy</option>
            <option value="1">1 Energy</option>
            <option value="2">2 Energy</option>
            <option value="3+">3+ Energy</option>
            <option value="x">X / Unplayable</option>
          </select>

          <select
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            aria-label="Filter Keyword"
            className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Semua Keyword</option>
            {availableKeywords.map((kw) => (
              <option key={kw} value={kw}>
                {kw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Kartu (Chunked Rendering 36 Item per Batch) */}
      {visibleCards.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
          <Filter className="mx-auto h-8 w-8 text-slate-500 mb-2" />
          Tidak ada kartu yang cocok dengan kombinasi filter pencarian Anda.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {visibleCards.map((card) => (
              <CardGridItem
                key={card.card_id}
                card={card}
                onSelect={setSelectedCard}
              />
            ))}
          </div>

          {visibleCount < filteredCards.length && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-6 text-xs text-slate-400"
            >
              Menampilkan {visibleCards.length} dari {filteredCards.length} kartu — gulir ke bawah untuk memuat lainnya...
            </div>
          )}
        </>
      )}

      <EntityDetailModal
        entity={selectedCard ? { kind: "card", data: selectedCard } : null}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}
