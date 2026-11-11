"use client";

import React from "react";
import Image from "next/image";
import { resolveAssetUrl } from "@/lib/asset-url";
import { CHARACTERS } from "@/lib/constants";
import type { CharacterId, Relic } from "@/lib/types";

interface CharacterSelectionGridProps {
  character: CharacterId;
  byCodexRelic: Map<string, Relic>;
  onSelectCharacter: (next: CharacterId) => void;
}

export function CharacterSelectionGrid({
  character,
  byCodexRelic,
  onSelectCharacter,
}: CharacterSelectionGridProps) {
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
                  <span className="rounded-xl border-2 px-2.5 py-0.5 text-xs font-bold">
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
                  <span className="cartoon-text-shadow">Pilih {char.name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
