"use client";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Filter, Gem, Loader2, Search, Zap } from "lucide-react";
import { EntityDetailModal } from "@/components/EntityDetailModal";
import { useAppContext } from "@/components/providers/AppProviders";
import { RelicGridItem } from "@/components/RelicGridItem";
import { RELIC_POOL_TABS } from "@/lib/constants";
import type { Relic } from "@/lib/types";

const CHUNK_SIZE = 36; // PRD 03 Bagian 3.2.B: Render bertahap 36 item per guliran

export default function RelicsGalleryPage() {
  const { relics, isCatalogLoading } = useAppContext();

  const [selectedPool, setSelectedPool] = useState<string>("all");
  const [selectedRarityKey, setSelectedRarityKey] = useState<string>("all");
  const [energyOnly, setEnergyOnly] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");

  const deferredSearch = useDeferredValue(searchInput);

  const filterKey = `${selectedPool}|${selectedRarityKey}|${energyOnly}|${deferredSearch}`;
  const [pagination, setPagination] = useState<{ key: string; count: number }>({
    key: filterKey,
    count: CHUNK_SIZE,
  });
  const visibleCount =
    pagination.key === filterKey ? pagination.count : CHUNK_SIZE;

  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // PRD 03 Bagian 3.2.A: Pencarian terhadap name & description_clean, diurutkan menurut compendium_order
  const filteredRelics = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();

    return relics.filter((relic) => {
      if (selectedPool !== "all" && relic.pool !== selectedPool) return false;
      if (selectedRarityKey !== "all" && relic.rarity_key !== selectedRarityKey) {
        return false;
      }
      if (energyOnly && !relic.is_energy_relic) return false;
      if (q) {
        const matchName = relic.name.toLowerCase().includes(q);
        const matchClean = relic.description_clean.toLowerCase().includes(q);
        if (!matchName && !matchClean) return false;
      }
      return true;
    });
  }, [relics, selectedPool, selectedRarityKey, energyOnly, deferredSearch]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    if (visibleCount >= filteredRelics.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPagination((prev) => {
            const baseCount = prev.key === filterKey ? prev.count : CHUNK_SIZE;
            return {
              key: filterKey,
              count: Math.min(filteredRelics.length, baseCount + CHUNK_SIZE),
            };
          });
        }
      },
      { rootMargin: "320px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, filteredRelics.length, filterKey]);

  const visibleRelics = useMemo(
    () => filteredRelics.slice(0, visibleCount),
    [filteredRelics, visibleCount]
  );

  if (isCatalogLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="text-sm">Memuat galeri relik dari memori klien...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-6 space-y-5">
      <div className="cartoon-panel p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Gem className="h-3.5 w-3.5" />
              Galeri Katalog Relik
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-amber-100 cartoon-text-shadow">
              Katalog Relik Slay the Spire 2 ({filteredRelics.length} / {relics.length})
            </h1>
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-500/50 bg-[#17332b] px-3.5 py-2 text-xs font-bold text-emerald-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={energyOnly}
              onChange={(e) => setEnergyOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-400"
            />
            <Zap className="h-3.5 w-3.5" />
            Hanya Relik Tambahan Energi
          </label>
        </div>

        {/* Filter Pool Karakter */}
        <div className="flex flex-wrap gap-1.5">
          {RELIC_POOL_TABS.map((tab) => {
            const active = selectedPool === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedPool(tab.id)}
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

        {/* Pencarian Teks Cepat (name & description_clean) + Filter Rarity */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-8 relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama relik atau efek bersih (description_clean)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <select
            value={selectedRarityKey}
            onChange={(e) => setSelectedRarityKey(e.target.value)}
            aria-label="Filter Rarity Relik"
            className="sm:col-span-4 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Semua Kategori Rarity</option>
            <option value="Starter">Starter Relic</option>
            <option value="Common">Common Relic</option>
            <option value="Uncommon">Uncommon Relic</option>
            <option value="Rare">Rare Relic</option>
            <option value="Ancient">Ancient Relic (Boss)</option>
            <option value="Shop">Shop Relic</option>
            <option value="Event">Event Relic</option>
          </select>
        </div>
      </div>

      {visibleRelics.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center text-sm text-slate-400">
          <Filter className="mx-auto h-8 w-8 text-slate-500 mb-2" />
          Tidak ada relik yang sesuai dengan kata kunci pencarian Anda.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {visibleRelics.map((relic) => (
              <RelicGridItem
                key={relic.relic_id}
                relic={relic}
                onSelect={setSelectedRelic}
              />
            ))}
          </div>

          {visibleCount < filteredRelics.length && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-6 text-xs text-slate-400"
            >
              Menampilkan {visibleRelics.length} dari {filteredRelics.length} relik — gulir ke bawah untuk memuat lainnya...
            </div>
          )}
        </>
      )}

      <EntityDetailModal
        entity={selectedRelic ? { kind: "relic", data: selectedRelic } : null}
        onClose={() => setSelectedRelic(null)}
      />
    </div>
  );
}
