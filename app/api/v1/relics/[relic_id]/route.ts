import { NextRequest, NextResponse } from "next/server";
import { getRelicById } from "@/lib/server-store";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ relic_id: string }> }
) {
  const { relic_id } = await ctx.params;
  const relic = await getRelicById(relic_id);
  if (!relic) {
    return NextResponse.json(
      { detail: "Relic tidak ditemukan." },
      { status: 404 }
    );
  }
  return NextResponse.json(relic, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
