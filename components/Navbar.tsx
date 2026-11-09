"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LogIn, LogOut, User } from "lucide-react";
import { useAppContext } from "@/components/providers/AppProviders";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Card Helper",
    assetIcon: "/assets/reward_icon_special_card.webp",
  },
  {
    href: "/cards",
    label: "Galeri Kartu",
    assetIcon: "/assets/reward_icon_card.webp",
  },
  {
    href: "/relics",
    label: "Galeri Relik",
    assetIcon: "/assets/reward_icon_shared_relic.webp",
  },
  {
    href: "/history",
    label: "Riwayat Sesi",
    assetIcon: null,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, openAuthModal, cards, relics } = useAppContext();

  return (
    <header className="sticky top-0 z-40 border-b-4 border-[#0e151a] bg-[#1b2a32]/95 backdrop-blur-md shadow-[0_6px_16px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border-3 border-[#0e151a] bg-[#2a414d] shadow-[0_4px_0_#0e151a] transition-transform group-hover:scale-105">
            <Image
              unoptimized
              src="/assets/reward_icon_special_card.webp"
              alt="Slay the Spire 2"
              width={34}
              height={34}
              className="h-8 w-8 object-contain drop-shadow"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-wide text-amber-100 cartoon-text-shadow group-hover:text-amber-300 transition">
                Slay the Spire 2
              </span>
              <span className="hidden md:inline-block rounded-lg border-2 border-[#0e151a] bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-950 shadow-[0_2px_0_#0e151a]">
                Card Helper
              </span>
            </div>
            <p className="hidden sm:block text-xs text-amber-100/70">
              Asisten Kartu Hadiah • {cards.length || 577} Kartu &amp; {relics.length || 296} Relik
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2 rounded-2xl border-3 border-[#0e151a] bg-[#131e24] p-1.5 shadow-inner">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-bold transition ${
                  active
                    ? "border-2 border-[#0e151a] bg-amber-400 text-slate-950 shadow-[0_3px_0_#0e151a]"
                    : "text-amber-100/80 hover:bg-[#22343e] hover:text-amber-200"
                }`}
              >
                {item.assetIcon ? (
                  <Image
                    unoptimized
                    src={item.assetIcon}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                ) : (
                  <History className="h-4 w-4" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="flex items-center gap-1.5 rounded-xl border-2 border-[#0e151a] bg-[#244a3c] px-3 py-1.5 text-sm font-bold text-emerald-200 shadow-[0_3px_0_#0e151a] hover:bg-[#2c5a49] transition"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[110px] truncate">{user.username}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Keluar Sesi"
                className="flex items-center gap-1 rounded-xl border-2 border-[#0e151a] bg-[#3b2325] px-3 py-1.5 text-sm font-bold text-red-200 shadow-[0_3px_0_#0e151a] hover:bg-[#522e31] transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="relative flex items-center justify-center px-5 py-2 text-sm font-bold text-amber-100 transition hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundImage: "url('/assets/ftue_confirm_button.webp')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <LogIn className="h-4 w-4 mr-1.5 drop-shadow" />
              <span className="cartoon-text-shadow">Masuk / Daftar</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigasi Mobile */}
      <nav className="flex md:hidden items-center justify-around border-t-3 border-[#0e151a] bg-[#141f26] px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
                active
                  ? "bg-amber-400/20 text-amber-300"
                  : "text-amber-100/70 hover:text-amber-100"
              }`}
            >
              {item.assetIcon ? (
                <Image
                  unoptimized
                  src={item.assetIcon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <History className="h-4 w-4" />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
