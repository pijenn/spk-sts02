import { NextRequest, NextResponse } from "next/server";
import { getAllRelicsCatalog } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pool = searchParams.get("pool")?.toLowerCase();
  const rarityKey = searchParams.get("rarity_key")?.toLowerCase();
  const isEnergyParam = searchParams.get("is_energy_relic");
  const search = searchParams.get("search")?.trim().toLowerCase();

  let relics = await getAllRelicsCatalog();

  if (pool && pool !== "all") {
    relics = relics.filter((r) => r.pool.toLowerCase() === pool);
  }
  if (rarityKey && rarityKey !== "all") {
    relics = relics.filter((r) => r.rarity_key.toLowerCase() === rarityKey);
  }
  if (isEnergyParam === "true" || isEnergyParam === "false") {
    const target = isEnergyParam === "true";
    relics = relics.filter((r) => r.is_energy_relic === target);
  }
  if (search) {
    relics = relics.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.description_clean.toLowerCase().includes(search)
    );
  }

  return NextResponse.json(relics, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
