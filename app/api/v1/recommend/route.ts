import { NextRequest, NextResponse } from "next/server";
import type { CharacterId, GameStateRequest, RecommendationResponse } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_CHARACTERS: Set<CharacterId> = new Set([
  "ironclad",
  "silent",
  "defect",
  "necrobinder",
  "regent",
]);

function isValidUuidList(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((id) => typeof id === "string" && UUID_REGEX.test(id));
}

function getMlApiUrl(): string {
  return (
    process.env.ML_API_URL ||
    process.env.NEXT_PUBLIC_ML_API_URL ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  let body: Partial<GameStateRequest>;
  try {
    body = (await request.json()) as Partial<GameStateRequest>;
  } catch {
    return NextResponse.json(
      { detail: "Payload JSON tidak valid." },
      { status: 400 }
    );
  }

  const {
    character,
    current_hp,
    max_hp,
    act_level,
    active_relics = [],
    current_deck_cards = [],
    reward_card_ids,
  } = body;

  if (!character || !VALID_CHARACTERS.has(character)) {
    return NextResponse.json(
      { detail: "Karakter tidak valid." },
      { status: 422 }
    );
  }
  if (
    typeof current_hp !== "number" ||
    typeof max_hp !== "number" ||
    !Number.isFinite(current_hp) ||
    !Number.isFinite(max_hp) ||
    current_hp < 0 ||
    max_hp <= 0 ||
    current_hp > max_hp
  ) {
    return NextResponse.json(
      {
        detail:
          "Input HP tidak valid: current_hp harus bernilai >= 0 dan tidak melebihi max_hp (> 0).",
      },
      { status: 422 }
    );
  }
  if (act_level !== 1 && act_level !== 2 && act_level !== 3) {
    return NextResponse.json(
      { detail: "act_level wajib bernilai 1, 2, atau 3." },
      { status: 422 }
    );
  }
  if (
    !isValidUuidList(active_relics) ||
    !isValidUuidList(current_deck_cards) ||
    !isValidUuidList(reward_card_ids) ||
    reward_card_ids.length !== 3
  ) {
    return NextResponse.json(
      {
        detail:
          "Format UUID tidak valid atau jumlah reward_card_ids tidak tepat 3 kartu hadiah.",
      },
      { status: 422 }
    );
  }

  const validPayload: GameStateRequest = {
    character,
    current_hp,
    max_hp,
    act_level,
    active_relics,
    current_deck_cards,
    reward_card_ids,
  };

  // Wajib memanggil FastAPI ML Inference Engine (ML/api_server.py) tanpa fallback lokal
  const mlBaseUrl = getMlApiUrl();
  try {
    const mlRes = await fetch(`${mlBaseUrl}/api/v1/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
      cache: "no-store",
    });

    if (mlRes.ok) {
      const mlData = (await mlRes.json()) as RecommendationResponse;
      return NextResponse.json(mlData, { status: 200 });
    }

    const errBody = (await mlRes.json().catch(() => ({}))) as {
      detail?: string;
    };
    return NextResponse.json(
      {
        detail:
          errBody.detail ||
          `Server Machine Learning (FastAPI) mengembalikan error HTTP ${mlRes.status}.`,
      },
      { status: mlRes.status }
    );
  } catch {
    return NextResponse.json(
      {
        detail: `Server Machine Learning (FastAPI) sedang mati atau tidak dapat dihubungi di ${mlBaseUrl}. Pastikan Anda sudah menyalakan server ML terlebih dahulu (jalankan perintah: npm run dev:ml).`,
      },
      { status: 503 }
    );
  }
}
