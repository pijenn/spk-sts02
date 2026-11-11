import type {
  AdaptiveWeights,
  CandidateScore,
  Card,
  GameStateRequest,
  RecommendationResponse,
  Relic,
} from "@/lib/types";

export const BASE_WEIGHTS = {
  C1_cost: 3.0,
  C2_offensive: 4.0,
  C3_defensive: 4.0,
  C4_rarity: 2.0,
  C5_synergy: 3.0,
} as const;

export const HP_CRITICAL_THRESHOLD_PCT = 30.0;
export const SYNERGY_STRONG_THRESHOLD = 0.5;
export const DEFAULT_SKIP_THRESHOLD = 1.2;

export const DSW_MULTIPLIERS = {
  "R-01": { C1_cost: 1.0, C2_offensive: 0.8, C3_defensive: 2.0, C4_rarity: 1.0, C5_synergy: 0.8 },
  "R-02": { C1_cost: 1.0, C2_offensive: 1.0, C3_defensive: 1.0, C4_rarity: 1.0, C5_synergy: 1.0 },
  "R-03": { C1_cost: 1.0, C2_offensive: 1.5, C3_defensive: 1.0, C4_rarity: 0.8, C5_synergy: 0.8 },
  "R-04": { C1_cost: 1.0, C2_offensive: 1.0, C3_defensive: 1.25, C4_rarity: 1.0, C5_synergy: 1.0 },
  "R-05": { C1_cost: 1.0, C2_offensive: 0.8, C3_defensive: 1.0, C4_rarity: 1.25, C5_synergy: 1.75 },
  "R-06": { C1_cost: 0.7, C2_offensive: 1.0, C3_defensive: 1.0, C4_rarity: 1.0, C5_synergy: 1.0 },
  "R-07": { C1_cost: 1.0, C2_offensive: 1.0, C3_defensive: 1.0, C4_rarity: 1.0, C5_synergy: 1.0 },
  "R-08": { C1_cost: 1.0, C2_offensive: 1.0, C3_defensive: 1.0, C4_rarity: 1.0, C5_synergy: 1.4 },
  "R-09": { C1_cost: 1.0, C2_offensive: 1.15, C3_defensive: 0.8, C4_rarity: 1.0, C5_synergy: 1.25 },
  "R-10": { C1_cost: 1.0, C2_offensive: 0.8, C3_defensive: 1.15, C4_rarity: 1.0, C5_synergy: 1.25 },
  "R-11": { C1_cost: 1.0, C2_offensive: 1.0, C3_defensive: 1.0, C4_rarity: 1.0, C5_synergy: 1.3 },
} as const;

export const ENERGY_RELICS = new Set([
  "cursed_key",
  "coffee_dripper",
  "fusion_hammer",
  "busted_crown",
  "ectoplasm",
  "philosophers_stone",
  "philosopher_stone",
  "sozu",
  "velvet_choker",
  "runic_dome",
  "slavers_collar",
  "mark_of_pain",
  "nuclear_battery",
  "holy_water",
  "violet_lotus",
  "hovering_kite",
  "snecko_eye",
  "ice_cream",
  "lantern",
  "happy_flower",
  "ancient_tea_set",
  "art_of_war",
  "sundial",
  "gremlin_horn",
  "mummified_hand",
  "blessed_antler",
  "blood_soaked_rose",
]);

export const DEFENSIVE_RELICS = new Set([
  "anchor",
  "fake_anchor",
  "belt_buckle",
  "bone_flute",
  "bronze_scales",
  "captains_wheel",
  "cloak_clasp",
  "daughter_of_the_wind",
  "fresnel_lens",
  "galactic_dust",
  "helical_dart",
  "horn_cleat",
  "intimidating_helmet",
  "kunai",
  "oddly_smooth_stone",
  "orichalcum",
  "fake_orichalcum",
  "ornamental_fan",
  "paels_legion",
  "permafrost",
  "regalite",
  "ripple_basin",
  "sai",
  "self_forming_clay",
  "sturdy_clamp",
  "the_abacus",
  "thread_and_needle",
  "torii",
  "tough_bandages",
  "tuning_fork",
  "tungsten_rod",
  "vambrace",
]);

export const OFFENSIVE_RELICS = new Set([
  "akabeko",
  "bag_of_marbles",
  "brimstone",
  "charons_ashes",
  "ember_tea",
  "festive_popper",
  "forgotten_soul",
  "girya",
  "hand_drill",
  "infused_core",
  "kusarigama",
  "letter_opener",
  "lost_wisp",
  "mercury_hourglass",
  "metronome",
  "mini_regent",
  "miniature_cannon",
  "mutagenic_strength",
  "mystic_lighter",
  "necronomicon",
  "paper_krane",
  "paper_phrog",
  "parrying_shield",
  "pen_nib",
  "red_skull",
  "reptile_trinket",
  "ruined_helmet",
  "screaming_flagon",
  "shuriken",
  "sling_of_courage",
  "snecko_skull",
  "stone_calendar",
  "strike_dummy",
  "fake_strike_dummy",
  "sword_of_jade",
  "tingsha",
  "toasty_mittens",
  "twisted_funnel",
  "vajra",
  "wrist_blade",
]);

export const RELIC_KEYWORDS_MAP: Record<string, string[]> = {
  akabeko: ["Vigor"],
  anchor: ["Block_Scaling"],
  fake_anchor: ["Block_Scaling"],
  bag_of_marbles: ["Vulnerable"],
  bag_of_preparation: ["Draw"],
  belt_buckle: ["Dexterity"],
  big_hat: ["Ethereal"],
  bone_flute: ["Osty", "Block_Scaling"],
  book_repair_knife: ["Doom"],
  bookmark: ["Retain"],
  brimstone: ["Strength"],
  bronze_scales: ["Thorns"],
  burning_sticks: ["Exhaust"],
  captains_wheel: ["Block_Scaling"],
  centennial_puzzle: ["Draw"],
  charons_ashes: ["Exhaust"],
  champion_belt: ["Vulnerable", "Weak"],
  cloak_clasp: ["Block_Scaling", "Retain"],
  data_disk: ["Focus"],
  dead_branch: ["Exhaust"],
  ember_tea: ["Strength"],
  forgotten_soul: ["Exhaust"],
  girya: ["Strength"],
  gold_plated_cables: ["Channel", "Lightning", "Frost"],
  hand_drill: ["Vulnerable"],
  helical_dart: ["Shiv", "Dexterity"],
  horn_cleat: ["Block_Scaling"],
  hovering_kite: ["Sly"],
  infused_core: ["Channel", "Lightning"],
  kunai: ["Dexterity", "Shiv"],
  mini_regent: ["Strength"],
  ninja_scroll: ["Shiv"],
  nuclear_battery: ["Channel", "Plasma"],
  oddly_smooth_stone: ["Dexterity"],
  orichalcum: ["Block_Scaling"],
  ornamental_fan: ["Block_Scaling", "Shiv"],
  paper_crane: ["Weak"],
  paper_krane: ["Weak"],
  paper_phrog: ["Vulnerable"],
  permafrost: ["Block_Scaling"],
  red_skull: ["Strength"],
  reptile_trinket: ["Strength"],
  ruined_helmet: ["Strength"],
  runic_capacitor: ["Channel"],
  shuriken: ["Strength", "Shiv"],
  sling_of_courage: ["Strength"],
  snecko_skull: ["Poison"],
  sparkling_rouge: ["Strength", "Dexterity"],
  sturdy_clamp: ["Block_Scaling"],
  symbiotic_virus: ["Channel", "Dark"],
  sword_of_jade: ["Strength"],
  the_abacus: ["Block_Scaling", "Draw"],
  the_specimen: ["Poison"],
  tingsha: ["Sly"],
  toasty_mittens: ["Exhaust", "Strength"],
  tough_bandages: ["Sly", "Block_Scaling"],
  twisted_funnel: ["Poison"],
  undying_sigil: ["Doom"],
  vajra: ["Strength"],
  vambrace: ["Block_Scaling"],
  wrist_blade: ["Shiv"],
};

function extractRelicKeywordsFromRelic(relic: Relic): string[] {
  const kws = new Set<string>();
  const cid = relic.codex_id.toLowerCase();
  if (RELIC_KEYWORDS_MAP[cid]) {
    RELIC_KEYWORDS_MAP[cid].forEach((k) => kws.add(k));
  }
  const desc = (relic.description_clean || relic.description || "").toLowerCase();
  const patterns: Array<[string, RegExp]> = [
    ["Exhaust", /\bexhaust(?:ed|s| pile)?\b/],
    ["Vulnerable", /\bvulnerable\b/],
    ["Strength", /\bstrength\b/],
    ["Weak", /\bweak\b/],
    ["Dexterity", /\bdexterity\b/],
    ["Poison", /\bpoison\b/],
    ["Shiv", /\bshivs?\b/],
    ["Retain", /\bretain(?:ed|s)?\b/],
    ["Ethereal", /\bethereal\b/],
    ["Sly", /\bsly\b|\bdiscard(?:ed|s)?\b(?!\s+pile)/],
    ["Channel", /\bchannel(?:ed|s)?\b|\bevok(?:e|ed)\b|\borbs?\b/],
    ["Lightning", /\blightning\b/],
    ["Frost", /\bfrost\b/],
    ["Dark", /\bdark\b/],
    ["Plasma", /\bplasma\b/],
    ["Focus", /\bfocus\b/],
    ["Osty", /\bosty\b|\bsummon(?:ed|s)?\b/],
    ["Doom", /\bdoom\b/],
    ["Forge", /\bforge\b/],
    ["Soul", /\bsouls?\b/],
    ["Thorns", /\bthorns\b/],
    ["Vigor", /\bvigor\b/],
    ["Draw", /\bdraw\s+(?:\d+|a|an)\s+(?:additional\s+)?cards?\b/],
    ["Block_Scaling", /block persists|doubles? block|gain \d+ block|start each combat with \d+ block/],
  ];
  for (const [canon, pat] of patterns) {
    if (pat.test(desc)) kws.add(canon);
  }
  return Array.from(kws);
}

function calculateKeywordOverlap(cardKeywords: string[], deckKeywords: string[]): number {
  if (!cardKeywords.length || !deckKeywords.length) return 0.0;
  const cardSet = new Set(cardKeywords.map((k) => k.trim().toLowerCase()).filter(Boolean));
  const deckSet = new Set(deckKeywords.map((k) => k.trim().toLowerCase()).filter(Boolean));
  if (!cardSet.size || !deckSet.size) return 0.0;
  let overlap = 0;
  cardSet.forEach((k) => {
    if (deckSet.has(k)) overlap += 1;
  });
  return Number((overlap / cardSet.size).toFixed(4));
}

export function evaluateCardRewards(
  payload: GameStateRequest,
  cardsById: Map<string, Card>,
  relicsById: Map<string, Relic>
): RecommendationResponse {
  const {
    current_hp,
    max_hp,
    act_level,
    active_relics,
    current_deck_cards,
    reward_card_ids,
  } = payload;

  const hpRatio = Number(((current_hp / Math.max(1, max_hp)) * 100).toFixed(2));
  const isCriticalHp = hpRatio <= HP_CRITICAL_THRESHOLD_PCT;

  const ownedRelics = active_relics
    .map((id) => relicsById.get(id))
    .filter((r): r is Relic => Boolean(r));

  const energyRelics = ownedRelics.filter(
    (r) => r.is_energy_relic || ENERGY_RELICS.has(r.codex_id.toLowerCase())
  );
  const defensiveRelics = ownedRelics.filter((r) => {
    const cid = r.codex_id.toLowerCase();
    const desc = (r.description_clean || r.description || "").toLowerCase();
    return (
      DEFENSIVE_RELICS.has(cid) ||
      /\bgain \d+ block\b|\bstart each combat with \d+ block\b|\bdoubles? block\b|\bblock persists\b|\bgain \d+ dexterity\b|\badditional dexterity\b|\bstart each combat with \d+ dexterity\b|\bthorns\b|\bplated armor\b|\bbuffer\b|\bintangible\b/.test(
        desc
      )
    );
  });
  const offensiveRelics = ownedRelics.filter((r) => {
    const cid = r.codex_id.toLowerCase();
    const desc = (r.description_clean || r.description || "").toLowerCase();
    return (
      OFFENSIVE_RELICS.has(cid) ||
      (/\bdeal \d+ damage\b|\badditional damage\b|\bgain \d+ strength\b|\badditional strength\b|\bstart each (?:elite )?combat with \d+ strength\b|\bgain \d+ vigor\b|\bapply \d+ vulnerable\b|\bvulnerable take\b|\bapply (?:an additional )?\d+ poison\b/.test(
        desc
      ) &&
        !desc.includes("enemies start combat with"))
    );
  });

  const hasEnergyRelic = energyRelics.length > 0;
  const hasDefensiveRelic = defensiveRelics.length > 0;
  const hasOffensiveRelic = offensiveRelics.length > 0;

  const relicKeywordsSet = new Set<string>();
  for (const r of ownedRelics) {
    extractRelicKeywordsFromRelic(r).forEach((kw) => relicKeywordsSet.add(kw));
  }
  const relicKeywords = Array.from(relicKeywordsSet).sort();
  const relicKwLowerMap = new Map(relicKeywords.map((k) => [k.toLowerCase(), k]));

  // Ekstraksi arketipe kata kunci dari kartu-kartu sebelumnya pada dek (current_deck_cards) & relik aktif
  const resolvedDeckCards = current_deck_cards
    .map((cid) => cardsById.get(cid))
    .filter((c): c is Card => Boolean(c));

  const hasDraftedArchetype = resolvedDeckCards.some((c) => c.rarity !== "Basic");
  const deckKeywordsSet = new Set<string>();
  if (hasDraftedArchetype) {
    for (const c of resolvedDeckCards) {
      for (const kw of c.keywords) {
        deckKeywordsSet.add(kw);
      }
    }
  }
  relicKeywords.forEach((kw) => deckKeywordsSet.add(kw));
  const deckKeywords = Array.from(deckKeywordsSet).sort();
  const deckKwLowerMap = new Map(deckKeywords.map((k) => [k.toLowerCase(), k]));

  const candidateCards = reward_card_ids.map((id) => {
    const card = cardsById.get(id);
    if (!card) {
      throw new Error(`Kartu hadiah dengan UUID ${id} tidak ditemukan di katalog.`);
    }
    return card;
  });

  const hpRule = isCriticalHp ? DSW_MULTIPLIERS["R-01"] : DSW_MULTIPLIERS["R-02"];
  const actRule =
    act_level === 1
      ? DSW_MULTIPLIERS["R-03"]
      : act_level === 2
      ? DSW_MULTIPLIERS["R-04"]
      : DSW_MULTIPLIERS["R-05"];
  const neutralVec = {
    C1_cost: 1.0,
    C2_offensive: 1.0,
    C3_defensive: 1.0,
    C4_rarity: 1.0,
    C5_synergy: 1.0,
  };
  const relicEnergyRule = hasEnergyRelic ? DSW_MULTIPLIERS["R-06"] : neutralVec;

  const rawScores = candidateCards.map((card) => {
    const cardKws = card.keywords || [];
    const synRatio = calculateKeywordOverlap(cardKws, deckKeywords);
    const matchedKeywords = cardKws
      .map((k) => deckKwLowerMap.get(k.toLowerCase()))
      .filter((k): k is string => Boolean(k));
    const matchedRelicKeywords = cardKws
      .map((k) => relicKwLowerMap.get(k.toLowerCase()))
      .filter((k): k is string => Boolean(k));

    const relicDefRule = hasDefensiveRelic
      ? {
          C1_cost: DSW_MULTIPLIERS["R-09"].C1_cost,
          C2_offensive: DSW_MULTIPLIERS["R-09"].C2_offensive,
          C3_defensive: DSW_MULTIPLIERS["R-09"].C3_defensive,
          C4_rarity: DSW_MULTIPLIERS["R-09"].C4_rarity,
          C5_synergy: card.c2_offensive >= 2 ? DSW_MULTIPLIERS["R-09"].C5_synergy : 1.0,
        }
      : neutralVec;

    const relicOffRule = hasOffensiveRelic
      ? {
          C1_cost: DSW_MULTIPLIERS["R-10"].C1_cost,
          C2_offensive: DSW_MULTIPLIERS["R-10"].C2_offensive,
          C3_defensive: DSW_MULTIPLIERS["R-10"].C3_defensive,
          C4_rarity: DSW_MULTIPLIERS["R-10"].C4_rarity,
          C5_synergy: card.c3_defensive >= 2 ? DSW_MULTIPLIERS["R-10"].C5_synergy : 1.0,
        }
      : neutralVec;

    const relicKwRule = matchedRelicKeywords.length > 0 ? DSW_MULTIPLIERS["R-11"] : neutralVec;

    const deckRule =
      synRatio >= SYNERGY_STRONG_THRESHOLD
        ? DSW_MULTIPLIERS["R-08"]
        : DSW_MULTIPLIERS["R-07"];

    const adaptiveW = {
      C1_cost: Number(
        (
          BASE_WEIGHTS.C1_cost *
          hpRule.C1_cost *
          actRule.C1_cost *
          relicEnergyRule.C1_cost *
          relicDefRule.C1_cost *
          relicOffRule.C1_cost *
          relicKwRule.C1_cost *
          deckRule.C1_cost
        ).toFixed(6)
      ),
      C2_offensive: Number(
        (
          BASE_WEIGHTS.C2_offensive *
          hpRule.C2_offensive *
          actRule.C2_offensive *
          relicEnergyRule.C2_offensive *
          relicDefRule.C2_offensive *
          relicOffRule.C2_offensive *
          relicKwRule.C2_offensive *
          deckRule.C2_offensive
        ).toFixed(6)
      ),
      C3_defensive: Number(
        (
          BASE_WEIGHTS.C3_defensive *
          hpRule.C3_defensive *
          actRule.C3_defensive *
          relicEnergyRule.C3_defensive *
          relicDefRule.C3_defensive *
          relicOffRule.C3_defensive *
          relicKwRule.C3_defensive *
          deckRule.C3_defensive
        ).toFixed(6)
      ),
      C4_rarity: Number(
        (
          BASE_WEIGHTS.C4_rarity *
          hpRule.C4_rarity *
          actRule.C4_rarity *
          relicEnergyRule.C4_rarity *
          relicDefRule.C4_rarity *
          relicOffRule.C4_rarity *
          relicKwRule.C4_rarity *
          deckRule.C4_rarity
        ).toFixed(6)
      ),
      C5_synergy: Number(
        (
          BASE_WEIGHTS.C5_synergy *
          hpRule.C5_synergy *
          actRule.C5_synergy *
          relicEnergyRule.C5_synergy *
          relicDefRule.C5_synergy *
          relicOffRule.C5_synergy *
          relicKwRule.C5_synergy *
          deckRule.C5_synergy
        ).toFixed(6)
      ),
    };

    const totalW =
      Math.abs(adaptiveW.C1_cost) +
      Math.abs(adaptiveW.C2_offensive) +
      Math.abs(adaptiveW.C3_defensive) +
      Math.abs(adaptiveW.C4_rarity) +
      Math.abs(adaptiveW.C5_synergy);

    const w1 = Math.abs(adaptiveW.C1_cost) / totalW;
    const w2 = Math.abs(adaptiveW.C2_offensive) / totalW;
    const w3 = Math.abs(adaptiveW.C3_defensive) / totalW;
    const w4 = Math.abs(adaptiveW.C4_rarity) / totalW;
    const w5 = Math.abs(adaptiveW.C5_synergy) / totalW;

    const normalizedWeights = {
      C1_cost: Number((-w1).toFixed(4)),
      C2_offensive: Number(w2.toFixed(4)),
      C3_defensive: Number(w3.toFixed(4)),
      C4_rarity: Number(w4.toFixed(4)),
      C5_synergy: Number(w5.toFixed(4)),
    };

    const sExact =
      Math.pow(card.c1_cost + 1.0, -w1) *
      Math.pow(card.c2_offensive, w2) *
      Math.pow(card.c3_defensive, w3) *
      Math.pow(card.c4_rarity, w4) *
      Math.pow(card.c5_synergy, w5);

    return {
      card,
      sExact,
      synRatio,
      matchedKeywords,
      matchedRelicKeywords,
      normalizedWeights,
    };
  });

  const sumVectorS = rawScores.reduce((acc, item) => acc + item.sExact, 0) || 1;
  const sortedScores = [...rawScores].sort((a, b) => b.sExact - a.sExact);

  const rankings: CandidateScore[] = sortedScores.map((item, index) => {
    const vExact = item.sExact / sumVectorS;
    return {
      card_id: item.card.card_id,
      codex_id: item.card.codex_id,
      card_name: item.card.name,
      name: item.card.name,
      rank: index + 1,
      vector_s: Number(item.sExact.toFixed(4)),
      vector_v: Number(vExact.toFixed(4)),
      preference_percentage: Number((vExact * 100).toFixed(2)),
      synergy_ratio: item.synRatio,
      effective_c5_synergy: item.card.c5_synergy,
      matched_deck_keywords: item.matchedKeywords,
      matched_keywords: item.matchedKeywords,
      normalized_weights: item.normalizedWeights,
    };
  });

  const skipThreshold = DEFAULT_SKIP_THRESHOLD;
  const topCandidate = rankings[0];
  const topRaw = sortedScores[0];
  const maxVectorS = topCandidate.vector_s;
  const isSkipRecommended = topRaw.sExact < skipThreshold;

  const activeRules: string[] = [];
  if (isCriticalHp) {
    activeRules.push(
      `Kondisi HP Darurat (${hpRatio.toFixed(1)}%) — Mengutamakan kartu pertahanan & pelindung (Block) sebesar 2x lipat.`
    );
  } else {
    activeRules.push(
      `Kondisi HP Aman (${hpRatio.toFixed(1)}%) — Menjaga keseimbangan antara serangan dan pertahanan.`
    );
  }
  if (act_level === 1) {
    activeRules.push("Babak Awal (Act 1) — Mengutamakan kartu serangan langsung untuk menghadapi musuh & Elite awal.");
  } else if (act_level === 2) {
    activeRules.push("Babak Tengah (Act 2) — Meningkatkan prioritas pertahanan untuk menghadapi musuh yang makin kuat.");
  } else {
    activeRules.push("Babak Akhir (Act 3) — Mengutamakan kecocokan kombo dek & kartu langka menjelang Boss akhir.");
  }
  if (hasEnergyRelic) {
    activeRules.push(
      `Relik Energi Aktif (${energyRelics.map((r) => r.name).join(", ")}) — Kartu berbiaya energi tinggi lebih mudah dimainkan.`
    );
  }
  if (hasDefensiveRelic) {
    activeRules.push(
      `Relik Pertahanan Aktif (${defensiveRelics.map((r) => r.name).join(", ")}) — Pertahanan sudah terbantu relik, sehingga kartu serangan lebih diutamakan.`
    );
  }
  if (hasOffensiveRelic) {
    activeRules.push(
      `Relik Serangan Aktif (${offensiveRelics.map((r) => r.name).join(", ")}) — Serangan sudah terbantu relik, sehingga kartu pertahanan lebih diutamakan.`
    );
  }
  if (topRaw.matchedRelicKeywords.length > 0) {
    activeRules.push(
      `Kombo Relik Aktif — Efek kartu sangat cocok dengan relik milikmu (${topRaw.matchedRelicKeywords.join(", ")}).`
    );
  }
  if (topRaw.synRatio >= SYNERGY_STRONG_THRESHOLD) {
    activeRules.push(
      `Kombo Dek Kuat — Efek kartu sangat menyatu dengan kartu di dek saat ini (${topRaw.matchedKeywords.join(", ")}).`
    );
  } else {
    activeRules.push(
      `Kombo Dek Standar — Menilai kartu berdasarkan kekuatan dan kegunaan utamanya.`
    );
  }

  const topNormW = topRaw.normalizedWeights;
  const weights: AdaptiveWeights = {
    w1_cost: Math.abs(topNormW.C1_cost),
    w2_offensive: Math.abs(topNormW.C2_offensive),
    w3_defensive: Math.abs(topNormW.C3_defensive),
    w4_rarity: Math.abs(topNormW.C4_rarity),
    w5_synergy: Math.abs(topNormW.C5_synergy),
    active_rules: activeRules,
  };

  let tacticalReason = "";
  if (isSkipRecommended) {
    tacticalReason =
      `Skor kekuatan kartu tertinggi (${topCandidate.name}, bernilai ${maxVectorS.toFixed(2)}) masih berada di bawah batas minimal kelayakan ` +
      `(${skipThreshold.toFixed(2)}). Disarankan untuk melewati hadiah kartu ini (Skip Card) agar dek kamu tidak penuh dengan kartu yang kurang cocok dan putaran kartu tetap lancar.`;
  } else if (isCriticalHp) {
    tacticalReason =
      `Sisa HP kamu sedang kritis (${hpRatio.toFixed(1)}%), sehingga kartu pertahanan/pelindung ${topCandidate.name} sangat disarankan agar kamu bisa bertahan hidup di pertarungan berikutnya.`;
  } else if (topRaw.matchedRelicKeywords.length > 0) {
    tacticalReason =
      `Kartu ${topCandidate.name} punya kombo langsung pada efek [${topRaw.matchedRelicKeywords.join(", ")}] dengan relik yang kamu miliki, menjadikannya pilihan paling pas di Act ${act_level}.`;
  } else if (topRaw.synRatio >= SYNERGY_STRONG_THRESHOLD) {
    tacticalReason =
      `Kartu ${topCandidate.name} sangat cocok dan menyatu dengan kombo dek kamu saat ini pada efek [${topRaw.matchedKeywords.join(", ")}], menjadikannya pilihan terbaik di Act ${act_level}.`;
  } else if (act_level === 1) {
    tacticalReason =
      `Di babak awal (Act 1, HP ${hpRatio.toFixed(1)}%), kamu membutuhkan daya serang cepat dan hemat energi; ` +
      `${topCandidate.name} adalah pilihan paling unggul dengan tingkat kecocokan ${topCandidate.preference_percentage.toFixed(1)}%.`;
  } else if (act_level === 3) {
    tacticalReason =
      `Memasuki babak akhir (Act 3) menjelang Boss terakhir, kamu membutuhkan kartu berefek besar dan kombo kuat; ` +
      `${topCandidate.name} terpilih sebagai kartu paling cocok (${topCandidate.preference_percentage.toFixed(1)}%).`;
  } else {
    tacticalReason =
      `Untuk kondisi permainan di Act ${act_level} (HP ${hpRatio.toFixed(1)}%), kartu ${topCandidate.name} memiliki ` +
      `presentase kecocokan tertinggi sebesar ${topCandidate.preference_percentage.toFixed(1)}%.`;
  }

  const recommendedName = isSkipRecommended ? "Skip Card" : topCandidate.name;

  return {
    status: "success",
    inference_engine: "nextjs-wp-dsw-fallback",
    rankings,
    evaluations: rankings,
    recommended_card_id: isSkipRecommended ? null : topCandidate.card_id,
    recommended_card: recommendedName,
    recommended_card_name: recommendedName,
    is_skip_recommended: isSkipRecommended,
    skip_threshold: skipThreshold,
    max_vector_s: maxVectorS,
    hp_ratio: hpRatio,
    is_critical_hp: isCriticalHp,
    has_energy_relic: hasEnergyRelic,
    adaptive_weights_normalized: topNormW,
    weights,
    tactical_reason: tacticalReason,
    game_state_summary: {
      hp_ratio: hpRatio,
      hp_status: isCriticalHp ? "critical" : "normal",
      act_level,
      energy_relic_active: hasEnergyRelic,
      deck_archetype_keywords: deckKeywords,
      synergy_detected: sortedScores.some(
        (s) => s.synRatio >= SYNERGY_STRONG_THRESHOLD || s.matchedRelicKeywords.length > 0
      ),
    },
  };
}

export function humanizeRuleText(rule: string): string {
  if (rule.startsWith("R-01:")) {
    const match = rule.match(/\(([\d.]+%)/);
    return `Kondisi HP Darurat (${match ? match[1] : "<= 30%"}) — Mengutamakan kartu pertahanan & pelindung (Block) sebesar 2x lipat.`;
  }
  if (rule.startsWith("R-02:")) {
    const match = rule.match(/\(([\d.]+%)/);
    return `Kondisi HP Aman (${match ? match[1] : "> 30%"}) — Menjaga keseimbangan antara serangan dan pertahanan.`;
  }
  if (rule.startsWith("R-03:")) {
    return "Babak Awal (Act 1) — Mengutamakan kartu serangan langsung untuk menghadapi musuh & Elite awal.";
  }
  if (rule.startsWith("R-04:")) {
    return "Babak Tengah (Act 2) — Meningkatkan prioritas pertahanan untuk menghadapi musuh yang makin kuat.";
  }
  if (rule.startsWith("R-05:")) {
    return "Babak Akhir (Act 3) — Mengutamakan kecocokan kombo dek & kartu langka menjelang Boss akhir.";
  }
  if (rule.startsWith("R-06:")) {
    const match = rule.match(/Aktif \(([^)]+)\)/);
    return `Relik Energi Aktif (${match ? match[1] : "Energy Relic"}) — Kartu berbiaya energi tinggi lebih mudah dimainkan.`;
  }
  if (rule.startsWith("R-07:")) {
    return "Kombo Dek Standar — Menilai kartu berdasarkan kekuatan dan kegunaan utamanya.";
  }
  if (rule.startsWith("R-08:")) {
    const match = rule.match(/\[([^\]]+)\]/);
    return `Kombo Dek Kuat — Efek kartu sangat menyatu dengan kartu di dek saat ini (${match ? match[1] : "Sinergi Aktif"}).`;
  }
  if (rule.startsWith("R-09:")) {
    const match = rule.match(/Aktif \(([^)]+)\)/);
    return `Relik Pertahanan Aktif (${match ? match[1] : "Relik Block"}) — Pertahanan sudah terbantu relik, sehingga kartu serangan lebih diutamakan.`;
  }
  if (rule.startsWith("R-10:")) {
    const match = rule.match(/Aktif \(([^)]+)\)/);
    return `Relik Serangan Aktif (${match ? match[1] : "Relik Serangan"}) — Serangan sudah terbantu relik, sehingga kartu pertahanan lebih diutamakan.`;
  }
  if (rule.startsWith("R-11:")) {
    const match = rule.match(/\[([^\]]+)\]/);
    return `Kombo Relik Aktif — Efek kartu sangat cocok dengan relik milikmu (${match ? match[1] : "Efek Relik"}).`;
  }
  return rule;
}

export function humanizeTacticalReason(reason: string): string {
  return reason
    .replace(/Nilai utilitas tertinggi \(([^,]+), S=([\d.]+)\)/g, "Skor kekuatan kartu tertinggi ($1, bernilai $2)")
    .replace(/ambang batas kelayakan \(theta=([\d.]+)\)/g, "batas minimal kelayakan ($1)")
    .replace(/fenomena deck bloat/g, "penumpukan kartu yang kurang cocok")
    .replace(/R-11 aktif,\s*Syn=[\d.]+/g, "kombo relik aktif")
    .replace(/Syn=[\d.]+,\s*R-08 aktif/g, "kombo dek sangat cocok")
    .replace(/\(V=([\d.]+)\)/g, (_, v) => `(Presentase Kecocokan ${(Number(v) * 100).toFixed(1)}%)`)
    .replace(/nilai preferensi tertinggi/g, "presentase kecocokan tertinggi")
    .replace(/unggul dengan preferensi/g, "unggul dengan presentase kecocokan");
}
