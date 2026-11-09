const CODEX_BASE_URL =
  process.env.NEXT_PUBLIC_CODEX_ASSET_URL || "https://spire-codex.com";

export function resolveAssetUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "/images/placeholder-card.svg";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${CODEX_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}
