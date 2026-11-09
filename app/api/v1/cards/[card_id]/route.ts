import { NextRequest, NextResponse } from "next/server";
import { getCardById } from "@/lib/server-store";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ card_id: string }> }
) {
  const { card_id } = await ctx.params;
  const card = await getCardById(card_id);
  if (!card) {
    return NextResponse.json(
      { detail: "Kartu tidak ditemukan." },
      { status: 404 }
    );
  }
  return NextResponse.json(card, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
