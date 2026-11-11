"use client";

import React from "react";
import Image from "next/image";

const CRITICAL_HP_PERCENT = 30;
const MAX_ALLOWED_HP = 999;
const ACT_LEVELS = [1, 2, 3] as const;

interface HpAndActSectionProps {
  currentHp: number;
  maxHp: number;
  onChangeHp: (current: number, max: number) => void;
  actLevel: 1 | 2 | 3;
  onChangeActLevel: (act: 1 | 2 | 3) => void;
}

export function HpAndActSection({
  currentHp,
  maxHp,
  onChangeHp,
  actLevel,
  onChangeActLevel,
}: HpAndActSectionProps) {
  const safeMaxHp = Math.max(1, maxHp);
  const hpRatio = Math.min(100, Math.max(0, (currentHp / safeMaxHp) * 100));
  const isCriticalHp = hpRatio <= CRITICAL_HP_PERCENT;

  const handleCurrentHpInput = (rawValue: string) => {
    const nextCurrent = Math.max(
      0,
      Math.min(safeMaxHp, Number(rawValue) || 0)
    );
    onChangeHp(nextCurrent, safeMaxHp);
  };

  const handleMaxHpInput = (rawValue: string) => {
    const nextMax = Math.max(
      1,
      Math.min(MAX_ALLOWED_HP, Number(rawValue) || 1)
    );
    onChangeHp(Math.min(currentHp, nextMax), nextMax);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
              ⚠️ HP Darurat (&le; {CRITICAL_HP_PERCENT}%) • Prioritas Pertahanan!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-500/60 px-3 py-1 text-xs font-bold text-emerald-200 shadow">
              ✓ Kondisi HP Aman ({currentHp} / {safeMaxHp})
            </span>
          )}
        </div>
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
            <span>Batas Kritis ({CRITICAL_HP_PERCENT}%)</span>
            <span>Max: {safeMaxHp} HP</span>
          </div>
        </div>
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
              onChange={(e) => handleCurrentHpInput(e.target.value)}
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
              max={MAX_ALLOWED_HP}
              value={maxHp}
              onChange={(e) => handleMaxHpInput(e.target.value)}
              className="w-20 rounded-lg border-2 border-[#0e161b] bg-[#0e161b] px-2.5 py-1 text-center text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 cartoon-panel p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-100 cartoon-text-shadow mb-1">
            Act Level (Babak Permainan)
          </h2>
          <p className="text-xs text-amber-100/75 mb-3">
            Pilih babak permainan yang sedang kamu jalani saat ini:
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {ACT_LEVELS.map((act) => {
              const isActive = actLevel === act;
              return (
                <button
                  key={act}
                  type="button"
                  onClick={() => onChangeActLevel(act)}
                  className={`rounded-2xl border-3 py-3 px-2 text-sm sm:text-base font-bold transition cursor-pointer cartoon-button-shadow ${
                    isActive
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
  );
}
