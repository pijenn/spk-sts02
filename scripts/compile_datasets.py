#!/usr/bin/env python3
"""
Kompilator Dataset Kartu & Relik Slay the Spire 2 (PRD 02 & PRD 03)
Mengubah raw_cards.json & raw_relics.json menjadi:
1. spk-sts02/data/cards.json (Sesuai skema tabel public.cards PRD 02)
2. spk-sts02/data/relics.json (Sesuai skema tabel public.relics PRD 02)
3. spk-sts02/supabase/seed_cards_relics.sql (Opsional: SQL UPSERT langsung ke Supabase)
"""

from __future__ import annotations

import json
import re
import uuid
from pathlib import Path
from typing import Any

NAMESPACE_STS2 = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

REWARDABLE_COLORS = {"ironclad", "silent", "defect", "necrobinder", "regent", "colorless"}
REWARDABLE_RARITIES = {"Common", "Uncommon", "Rare"}
REWARDABLE_TYPES = {"Attack", "Skill", "Power"}

OFFENSIVE_POWERS = {
    "Strength", "Vigor", "Vulnerable", "Poison", "Doom", "Focus",
    "Thorns", "Ritual", "Envenom", "Accuracy", "Cruelty", "Lethality",
}
DEFENSIVE_POWERS = {
    "Dexterity", "Weak", "Plated Armor", "Buffer", "Intangible",
    "Blur", "Thorns", "Artifact", "Metallicize", "Regen", "Frail",
}
SYNERGY_TERMS = (
    "exhaust", "sly", "discard", "shiv", "poison", "orb", "channel",
    "focus", "evoke", "doom", "summon", "osty", "star", "forge",
    "retain", "ethereal", "stance", "vigor", "strength", "dexterity",
)


def generate_deterministic_uuid(entity_type: str, raw_id: str) -> str:
    """Mengubah ID string JSON (misal 'ABRASIVE') menjadi UUID v5 konsisten."""
    return str(uuid.uuid5(NAMESPACE_STS2, f"{entity_type}:{raw_id.upper()}"))


def compute_c1_cost(item: dict[str, Any]) -> int:
    """Skala biaya energi C1 (0 - 4) sesuai CHECK (c1_cost BETWEEN 0 AND 4)."""
    cost = item.get("cost")
    if cost is None or cost < 0:
        if item.get("is_x_cost") or item.get("is_x_star_cost"):
            return 1
        return 4  # Kartu Unplayable (Curse / Status) diberi penalti biaya tertinggi
    return min(max(int(cost), 0), 4)


def compute_c2_offensive(item: dict[str, Any]) -> int:
    """Skala potensi ofensif C2 (1 - 5)."""
    card_type = item.get("type", "")
    if card_type in {"Curse", "Status"}:
        return 1

    damage = item.get("damage") or 0
    hits = max(1, item.get("hit_count") or 1)
    eff_dmg = damage * hits

    if eff_dmg > 0 and item.get("target") == "AllEnemies":
        eff_dmg += 4

    powers = item.get("powers_applied") or []
    desc_clean = (item.get("description_clean") or "").lower()

    power_offense = 0
    for p in powers:
        p_name = p.get("power") or ""
        amt = abs(p.get("amount") or 1)
        if p_name in OFFENSIVE_POWERS:
            power_offense += max(4, amt * 2)

    if "damage" in desc_clean and eff_dmg == 0:
        nums = [int(n) for n in re.findall(r"\b(\d+)\b", desc_clean)]
        power_offense += max(nums[:2], default=6)
    if any(k in desc_clean for k in ("vulnerable", "strength", "poison", "doom", "shiv", "lightning", "dark")):
        power_offense += 4

    total = eff_dmg + power_offense
    if total >= 22:
        return 5
    if total >= 14:
        return 4
    if total >= 9:
        return 3
    if total >= 1:
        return 2
    return 1


def compute_c3_defensive(item: dict[str, Any]) -> int:
    """Skala potensi defensif & mitigasi C3 (1 - 5)."""
    card_type = item.get("type", "")
    if card_type in {"Curse", "Status"}:
        return 1

    block = item.get("block") or 0
    hits = max(1, item.get("hit_count") or 1) if block > 0 else 1
    eff_block = block * hits

    powers = item.get("powers_applied") or []
    desc_clean = (item.get("description_clean") or "").lower()

    def_bonus = 0
    for p in powers:
        p_name = p.get("power") or ""
        amt = abs(p.get("amount") or 1)
        if p_name == "Intangible" or p_name == "Buffer":
            def_bonus += 20
        elif p_name == "Dexterity":
            def_bonus += 8 + amt * 3
        elif p_name in DEFENSIVE_POWERS:
            def_bonus += 4 + amt * 2

    if "block" in desc_clean and eff_block == 0:
        nums = [int(n) for n in re.findall(r"\b(\d+)\b", desc_clean)]
        def_bonus += max(nums[:2], default=5)
    if any(k in desc_clean for k in ("intangible", "buffer", "heal", "max hp")):
        def_bonus += 10
    elif any(k in desc_clean for k in ("weak", "frost", "dexterity", "thorns", "plated")):
        def_bonus += 5

    total = eff_block + def_bonus
    if total >= 18:
        return 5
    if total >= 12:
        return 4
    if total >= 8:
        return 3
    if total >= 1:
        return 2
    return 1


def compute_c4_rarity(item: dict[str, Any]) -> int:
    """Skala kelangkaan C4 IN (1, 3, 5) sesuai PRD 02."""
    rarity = item.get("rarity", "Common")
    if rarity in {"Rare", "Ancient"}:
        return 5
    if rarity in {"Uncommon", "Event", "Quest"}:
        return 3
    return 1


def compute_c5_synergy(item: dict[str, Any], merged_keywords: list[str]) -> int:
    """Skala sinergi dek & kombo C5 (1 - 5)."""
    card_type = item.get("type", "")
    rarity = item.get("rarity", "")
    if card_type in {"Curse", "Status"}:
        return 1
    if rarity == "Basic" and not merged_keywords:
        return 1

    score = 1
    meaningful_kw = [k for k in merged_keywords if k not in {"Unplayable", "Eternal"}]
    score += min(2, len(meaningful_kw))

    draw = item.get("cards_draw") or 0
    energy = item.get("energy_gain") or 0
    if draw >= 2 or energy >= 2:
        score += 2
    elif draw >= 1 or energy >= 1:
        score += 1

    if item.get("spawns_cards"):
        score += 1
    if card_type == "Power":
        score += 1

    desc_clean = (item.get("description_clean") or "").lower()
    term_hits = sum(1 for t in SYNERGY_TERMS if t in desc_clean)
    if term_hits >= 2:
        score += 1

    return min(max(score, 1), 5)


def compile_cards(raw_cards: list[dict[str, Any]], ml_cleaned_cards: dict[str, dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    compiled: list[dict[str, Any]] = []
    for item in raw_cards:
        codex_id = str(item["id"]).strip()
        id_lower = codex_id.lower()
        ml_card = (ml_cleaned_cards or {}).get(codex_id)

        raw_kw = [str(k) for k in (item.get("keywords") or []) if k]
        power_kw = [
            str(p["power"])
            for p in (item.get("powers_applied") or [])
            if isinstance(p, dict) and p.get("power")
        ]
        if ml_card and "keywords" in ml_card:
            keywords = list(ml_card["keywords"])
        else:
            keywords = sorted(set(raw_kw + power_kw))

        description = (item.get("description") or "").strip()
        if not description:
            if raw_kw:
                description = ". ".join(f"[gold]{k}[/gold]" for k in raw_kw) + "."
            else:
                description = "[gold]Unplayable[/gold]."

        image_url = (
            item.get("image_url_card")
            or item.get("image_url")
            or f"https://cdn.spire-codex.com/cards-full/stable/{id_lower}.webp"
        )

        is_rewardable = bool(
            item.get("color") in REWARDABLE_COLORS
            and item.get("rarity") in REWARDABLE_RARITIES
            and item.get("type") in REWARDABLE_TYPES
            and not item.get("multiplayer_only")
        )

        c1_cost = int(ml_card["c1_cost"]) if ml_card else compute_c1_cost(item)
        c2_offensive = int(ml_card["c2_offensive"]) if ml_card else compute_c2_offensive(item)
        c3_defensive = int(ml_card["c3_defensive"]) if ml_card else compute_c3_defensive(item)
        c4_rarity = int(ml_card["c4_rarity"]) if ml_card else compute_c4_rarity(item)
        c5_synergy = int(ml_card["c5_synergy"]) if ml_card else compute_c5_synergy(item, keywords)

        compiled.append(
            {
                "card_id": generate_deterministic_uuid("card", codex_id),
                "codex_id": codex_id,
                "id_lower": id_lower,
                "name": item["name"],
                "color": item["color"],
                "type": item["type"],
                "rarity": item["rarity"],
                "cost": item.get("cost"),
                "damage": item.get("damage"),
                "block": item.get("block"),
                "c1_cost": c1_cost,
                "c2_offensive": c2_offensive,
                "c3_defensive": c3_defensive,
                "c4_rarity": c4_rarity,
                "c5_synergy": c5_synergy,
                "cards_draw": item.get("cards_draw"),
                "energy_gain": item.get("energy_gain"),
                "keywords": keywords,
                "is_rewardable": is_rewardable,
                "description": description,
                "image_url": image_url,
            }
        )

    compiled.sort(key=lambda c: (c["color"], c["name"]))
    return compiled


def compile_relics(raw_relics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    compiled: list[dict[str, Any]] = []
    for item in raw_relics:
        codex_id = str(item["id"]).strip()
        desc = item.get("description") or ""
        desc_clean = item.get("description_clean") or ""

        # Rumus eksak PRD 02 Bagian 4.2 (Aturan R-06 DSW)
        is_energy_relic = "[energy:" in desc.lower() and (
            "each turn" in desc_clean.lower()
            or "start of combat" in desc_clean.lower()
        )

        raw_price = item.get("merchant_price")
        if isinstance(raw_price, dict):
            merchant_price = raw_price.get("base")
        elif isinstance(raw_price, int):
            merchant_price = raw_price
        else:
            merchant_price = None

        compiled.append(
            {
                "relic_id": generate_deterministic_uuid("relic", codex_id),
                "codex_id": codex_id,
                "name": item["name"],
                "description": desc,
                "description_raw": item.get("description_raw"),
                "description_clean": desc_clean,
                "flavor": item.get("flavor"),
                "rarity": item["rarity"],
                "rarity_key": item["rarity_key"],
                "pool": item.get("pool") or "shared",
                "merchant_price": merchant_price,
                "image_url": item["image_url"],
                "image_variants": item.get("image_variants"),
                "name_variants": item.get("name_variants"),
                "notes": item.get("notes"),
                "compendium_order": item.get("compendium_order"),
                "is_energy_relic": is_energy_relic,
            }
        )

    compiled.sort(key=lambda r: (r["compendium_order"] is None, r["compendium_order"] or 9999, r["name"]))
    return compiled


def sql_literal(val: Any) -> str:
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        escaped_items = [sql_literal(v) for v in val]
        return f"ARRAY[{', '.join(escaped_items)}]::TEXT[]"
    if isinstance(val, dict):
        s = json.dumps(val, ensure_ascii=False).replace("'", "''")
        return f"'{s}'::jsonb"
    s = str(val).replace("'", "''")
    return f"'{s}'"


def write_sql_seed(cards: list[dict[str, Any]], relics: list[dict[str, Any]], out_path: Path) -> None:
    lines: list[str] = [
        "-- Auto-generated Deterministic Seed SQL for Supabase PostgreSQL",
        "-- Jalankan setelah supabase/schema.sql",
        "BEGIN;",
        "",
    ]

    card_cols = [
        "card_id", "codex_id", "id_lower", "name", "color", "type", "rarity",
        "cost", "damage", "block", "c1_cost", "c2_offensive", "c3_defensive",
        "c4_rarity", "c5_synergy", "cards_draw", "energy_gain", "keywords",
        "is_rewardable", "description", "image_url",
    ]
    for c in cards:
        vals = ", ".join(sql_literal(c[col]) for col in card_cols)
        update_set = ", ".join(f"{col} = EXCLUDED.{col}" for col in card_cols if col != "card_id")
        lines.append(
            f"INSERT INTO public.cards ({', '.join(card_cols)}) VALUES ({vals}) "
            f"ON CONFLICT (card_id) DO UPDATE SET {update_set};"
        )

    lines.append("")
    relic_cols = [
        "relic_id", "codex_id", "name", "description", "description_raw",
        "description_clean", "flavor", "rarity", "rarity_key", "pool",
        "merchant_price", "image_url", "image_variants", "name_variants",
        "notes", "compendium_order", "is_energy_relic",
    ]
    for r in relics:
        def relic_sql_val(col_name: str, v: Any) -> str:
            if col_name in {"image_variants", "name_variants"} and v is not None:
                s = json.dumps(v, ensure_ascii=False).replace("'", "''")
                return f"'{s}'::jsonb"
            return sql_literal(v)

        vals = ", ".join(relic_sql_val(col, r[col]) for col in relic_cols)
        update_set = ", ".join(f"{col} = EXCLUDED.{col}" for col in relic_cols if col != "relic_id")
        lines.append(
            f"INSERT INTO public.relics ({', '.join(relic_cols)}) VALUES ({vals}) "
            f"ON CONFLICT (relic_id) DO UPDATE SET {update_set};"
        )

    lines.append("")
    lines.append("COMMIT;")
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    app_root = Path(__file__).resolve().parent.parent
    workspace_root = app_root.parent
    repo_root = workspace_root.parent

    raw_cards_path = workspace_root / "raw_cards.json"
    raw_relics_path = workspace_root / "raw_relics.json"
    ml_cleaned_path = repo_root / "ML" / "cleaned_cards.json"

    raw_cards = json.loads(raw_cards_path.read_text(encoding="utf-8"))
    raw_relics = json.loads(raw_relics_path.read_text(encoding="utf-8"))

    ml_cleaned_cards: dict[str, dict[str, Any]] | None = None
    if ml_cleaned_path.exists():
        ml_list = json.loads(ml_cleaned_path.read_text(encoding="utf-8"))
        ml_cleaned_cards = {str(item["id"]).strip(): item for item in ml_list}
        print(f"Loaded ML cleaned criteria & keywords from {ml_cleaned_path} ({len(ml_cleaned_cards)} cards)")

    cards = compile_cards(raw_cards, ml_cleaned_cards)
    relics = compile_relics(raw_relics)

    data_dir = app_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    (data_dir / "cards.json").write_text(
        json.dumps(cards, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (data_dir / "relics.json").write_text(
        json.dumps(relics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    supabase_dir = app_root / "supabase"
    supabase_dir.mkdir(parents=True, exist_ok=True)
    write_sql_seed(cards, relics, supabase_dir / "seed_cards_relics.sql")

    rewardable_count = sum(1 for c in cards if c["is_rewardable"])
    energy_relic_count = sum(1 for r in relics if r["is_energy_relic"])
    print(f"Compiled {len(cards)} cards ({rewardable_count} rewardable) -> {data_dir / 'cards.json'}")
    print(f"Compiled {len(relics)} relics ({energy_relic_count} energy relics) -> {data_dir / 'relics.json'}")
    print(f"Generated SQL seed -> {supabase_dir / 'seed_cards_relics.sql'}")


if __name__ == "__main__":
    main()
