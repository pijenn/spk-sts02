import { NextRequest, NextResponse } from "next/server";
import { createRunHistoryEntry, listUserRunHistories } from "@/lib/server-store";
import type { RunHistoryCreateRequest } from "@/lib/types";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json(
      { detail: "Parameter user_id diperlukan untuk daftar sesi pribadi." },
      { status: 400 }
    );
  }
  const records = await listUserRunHistories(userId);
  return NextResponse.json(records, { status: 200 });
}

export async function POST(request: NextRequest) {
  let body: Partial<RunHistoryCreateRequest>;
  try {
    body = (await request.json()) as Partial<RunHistoryCreateRequest>;
  } catch {
    return NextResponse.json({ detail: "Payload JSON tidak valid." }, { status: 400 });
  }

  if (
    !body.user_id ||
    !body.character ||
    !body.act_level ||
    typeof body.hp_ratio !== "number" ||
    !Array.isArray(body.offered_cards) ||
    body.offered_cards.length !== 3 ||
    !body.recommended_card ||
    !body.vector_scores ||
    !body.tactical_reason
  ) {
    return NextResponse.json(
      { detail: "Data sesi permainan belum lengkap untuk disimpan." },
      { status: 422 }
    );
  }

  try {
    const saved = await createRunHistoryEntry(body as RunHistoryCreateRequest);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Gagal menyimpan riwayat sesi." },
      { status: 500 }
    );
  }
}
