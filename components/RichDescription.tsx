"use client";

import React from "react";

interface RichDescriptionProps {
  text: string | null | undefined;
  className?: string;
}

const TAG_CLASS_MAP: Record<string, string> = {
  gold: "text-amber-400 font-medium",
  red: "text-red-400",
  blue: "text-sky-400 font-semibold",
  green: "text-emerald-400 font-semibold",
  purple: "text-purple-400 font-medium",
  orange: "text-orange-400 font-medium",
  aqua: "text-cyan-400 font-medium",
  b: "font-bold text-slate-100",
  i: "italic",
};

const TOKEN_REGEX =
  /(\[(?:gold|red|blue|green|purple|orange|aqua|b|i)\]|\[\/(?:gold|red|blue|green|purple|orange|aqua|b|i)\]|\[energy:\d+\]|\[star:\d+\])/gi;

export function RichDescription({ text, className = "" }: RichDescriptionProps) {
  if (!text) return null;

  const tokens = text.split(TOKEN_REGEX).filter((t) => t !== "");
  const activeTags: string[] = [];
  const elements: React.ReactNode[] = [];

  tokens.forEach((token, idx) => {
    const openMatch = token.match(
      /^\[(gold|red|blue|green|purple|orange|aqua|b|i)\]$/i
    );
    if (openMatch) {
      activeTags.push(openMatch[1].toLowerCase());
      return;
    }

    const closeMatch = token.match(
      /^\[\/(gold|red|blue|green|purple|orange|aqua|b|i)\]$/i
    );
    if (closeMatch) {
      const target = closeMatch[1].toLowerCase();
      const lastIdx = activeTags.lastIndexOf(target);
      if (lastIdx !== -1) {
        activeTags.splice(lastIdx, 1);
      }
      return;
    }

    const energyMatch = token.match(/^\[energy:(\d+)\]$/i);
    if (energyMatch) {
      const count = Math.min(10, Math.max(1, Number(energyMatch[1])));
      elements.push(
        <span
          key={`energy-${idx}`}
          className="inline-flex items-center gap-0.5 align-middle mx-0.5"
          title={`${count} Energy`}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/25 border border-amber-400 text-[10px] font-bold text-amber-300 leading-none"
            >
              ⚡
            </span>
          ))}
        </span>
      );
      return;
    }

    const starMatch = token.match(/^\[star:(\d+)\]$/i);
    if (starMatch) {
      const count = Math.min(10, Math.max(1, Number(starMatch[1])));
      elements.push(
        <span
          key={`star-${idx}`}
          className="inline-flex items-center gap-0.5 align-middle mx-0.5 text-yellow-300"
          title={`${count} Star`}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="text-xs leading-none">
              ✦
            </span>
          ))}
        </span>
      );
      return;
    }

    const combinedClasses = activeTags
      .map((t) => TAG_CLASS_MAP[t] || "")
      .filter(Boolean)
      .join(" ");

    if (combinedClasses) {
      elements.push(
        <span key={`txt-${idx}`} className={combinedClasses}>
          {token}
        </span>
      );
    } else {
      elements.push(<React.Fragment key={`txt-${idx}`}>{token}</React.Fragment>);
    }
  });

  return (
    <span className={`whitespace-pre-line leading-relaxed ${className}`}>
      {elements}
    </span>
  );
}
