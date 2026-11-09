import { NextRequest, NextResponse } from "next/server";
import { getAllCardsCatalog } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const color = searchParams.get("color")?.toLowerCase();
  const type = searchParams.get("type")?.toLowerCase();
  const rarity = searchParams.get("rarity")?.toLowerCase();
  const keyword = searchParams.get("keyword")?.toLowerCase();
  const costParam = searchParams.get("cost");
  const rewardableParam = searchParams.get("is_rewardable");
  const search = searchParams.get("search")?.trim().toLowerCase();

  let cards = await getAllCardsCatalog();

  if (color && color !== "all") {
    cards = cards.filter((c) => c.color.toLowerCase() === color);
  }
  if (type && type !== "all") {
    cards = cards.filter((c) => c.type.toLowerCase() === type);
  }
  if (rarity && rarity !== "all") {
    cards = cards.filter((c) => c.rarity.toLowerCase() === rarity);
  }
  if (keyword) {
    cards = cards.filter((c) =>
      c.keywords.some((kw) => kw.toLowerCase().includes(keyword))
    );
  }
  if (costParam !== null && costParam !== "" && costParam !== "all") {
    const parsedCost = Number(costParam);
    if (!Number.isNaN(parsedCost)) {
      cards = cards.filter((c) => c.cost === parsedCost);
    }
  }
  if (rewardableParam === "true" || rewardableParam === "false") {
    const target = rewardableParam === "true";
    cards = cards.filter((c) => c.is_rewardable === target);
  }
  if (search) {
    cards = cards.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.keywords.some((kw) => kw.toLowerCase().includes(search))
    );
  }

  return NextResponse.json(cards, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
