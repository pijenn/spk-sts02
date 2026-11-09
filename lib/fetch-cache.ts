import type { Card, Relic } from "@/lib/types";

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 menit (PRD 03 Bagian 3.2.A)

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/$/, "");
}

export async function fetchWithMemoryCache<T>(
  cacheKey: string,
  url: string,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (cached && cached.expiry > now) {
    return cached.data;
  }

  const existingInflight = inflightRequests.get(cacheKey) as Promise<T> | undefined;
  if (existingInflight) {
    return existingInflight;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Gagal memuat data dari ${url}`);
      }
      const data = (await response.json()) as T;
      memoryCache.set(cacheKey, { data, expiry: Date.now() + ttlMs });
      return data;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export async function fetchAllCardsCached(): Promise<Card[]> {
  const base = getApiBaseUrl();
  return fetchWithMemoryCache<Card[]>("catalog:cards:all", `${base}/cards`);
}

export async function fetchAllRelicsCached(): Promise<Relic[]> {
  const base = getApiBaseUrl();
  return fetchWithMemoryCache<Relic[]>("catalog:relics:all", `${base}/relics`);
}

export function clearMemoryCache(): void {
  memoryCache.clear();
}
