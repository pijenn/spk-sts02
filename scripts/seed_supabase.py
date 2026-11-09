#!/usr/bin/env python3
"""
Pipeline Seeding JSON ke Supabase PostgreSQL (PRD 02 Bagian 4)
Menggunakan UUID v5 deterministik dan melakukan batch upsert ke public.cards & public.relics
melalui Supabase PostgREST API (tanpa ketergantungan C-extension berat, cukup Python 3 standar
atau library `supabase` jika tersedia).

Cara menjalankan:
  export SUPABASE_URL="https://<project-ref>.supabase.co"
  export SUPABASE_SERVICE_ROLE_KEY="<service-role-secret-key>"
  python3 scripts/seed_supabase.py
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path
from typing import Any

from compile_datasets import compile_cards, compile_relics

NAMESPACE_STS2 = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def generate_deterministic_uuid(entity_type: str, raw_id: str) -> str:
    """Mengubah ID string JSON (misal 'ABRASIVE') menjadi UUID konsisten."""
    return str(uuid.uuid5(NAMESPACE_STS2, f"{entity_type}:{raw_id.upper()}"))


def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


def upsert_batch(
    supabase_url: str,
    api_key: str,
    table: str,
    conflict_col: str,
    rows: list[dict[str, Any]],
    batch_size: int = 100,
) -> None:
    base = supabase_url.rstrip("/")
    for idx in range(0, len(rows), batch_size):
        chunk = rows[idx : idx + batch_size]
        url = f"{base}/rest/v1/{table}?on_conflict={conflict_col}"
        payload = json.dumps(chunk, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            method="POST",
            headers={
                "apikey": api_key,
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status not in (200, 201, 204):
                    raise RuntimeError(f"Unexpected HTTP {resp.status} for {table}")
        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Failed upserting {table} (HTTP {exc.code}): {err_body}") from exc
        print(f"  [{table}] Upserted rows {idx + 1}..{idx + len(chunk)} / {len(rows)}")


def main() -> None:
    app_root = Path(__file__).resolve().parent.parent
    workspace_root = app_root.parent

    load_env_file(app_root / ".env.local")
    load_env_file(app_root / ".env")

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_KEY")
        or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    )

    data_cards_path = app_root / "data" / "cards.json"
    data_relics_path = app_root / "data" / "relics.json"

    if data_cards_path.exists() and data_relics_path.exists():
        cards = json.loads(data_cards_path.read_text(encoding="utf-8"))
        relics = json.loads(data_relics_path.read_text(encoding="utf-8"))
    else:
        raw_cards = json.loads((workspace_root / "raw_cards.json").read_text(encoding="utf-8"))
        raw_relics = json.loads((workspace_root / "raw_relics.json").read_text(encoding="utf-8"))
        cards = compile_cards(raw_cards)
        relics = compile_relics(raw_relics)

    if not supabase_url or not service_key:
        print("ERROR: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum disetel.", file=sys.stderr)
        print("Silakan isi di berkas spk-sts02/.env.local lalu jalankan ulang skrip ini.", file=sys.stderr)
        sys.exit(1)

    print(f"Menjalankan seeding ke {supabase_url} ...")
    upsert_batch(supabase_url, service_key, "cards", "card_id", cards, batch_size=100)
    upsert_batch(supabase_url, service_key, "relics", "relic_id", relics, batch_size=100)
    print(f"Selesai! {len(cards)} kartu dan {len(relics)} relik berhasil di-seed ke Supabase.")


if __name__ == "__main__":
    main()
