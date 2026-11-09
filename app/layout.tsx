import type { Metadata } from "next";
import { Kreon } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const kreon = Kreon({
  variable: "--font-kreon",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Slay the Spire 2 — Card Reward Helper",
  description:
    "Asisten pemilihan kartu hadiah Slay the Spire 2 untuk menemukan kartu terbaik yang paling cocok dengan kondisi HP, relik, dan kombo dek kamu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${kreon.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
        <AppProviders>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="relative z-10 border-t-4 border-[#131c22] bg-[#162229]/95 py-3.5 px-4 text-center text-sm text-amber-100/80 shadow-inner">
            <strong>Slay the Spire 2 Card Reward Helper</strong> • Panduan Pintar Pemilihan Kartu &amp; Kombo Dek • Aset <em>Spire Codex</em>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
