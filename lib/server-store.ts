import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import cardsData from "@/data/cards.json";
import relicsData from "@/data/relics.json";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Card, Relic, RunHistoryCreateRequest, RunHistoryRecord } from "@/lib/types";

const STATIC_CARDS = cardsData as Card[];
const STATIC_RELICS = relicsData as Relic[];

const STATIC_CARDS_BY_ID = new Map<string, Card>(STATIC_CARDS.map((c) => [c.card_id, c]));
const STATIC_RELICS_BY_ID = new Map<string, Relic>(STATIC_RELICS.map((r) => [r.relic_id, r]));

interface StoredUser {
  user_id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

interface LocalRuntimeStore {
  users: StoredUser[];
  run_histories: RunHistoryRecord[];
}

const RUNTIME_STORE_PATH = path.join(process.cwd(), "data", ".local-runtime-db.json");

function readLocalStore(): LocalRuntimeStore {
  try {
    if (fs.existsSync(RUNTIME_STORE_PATH)) {
      const raw = fs.readFileSync(RUNTIME_STORE_PATH, "utf-8");
      return JSON.parse(raw) as LocalRuntimeStore;
    }
  } catch {
  }
  return { users: [], run_histories: [] };
}

function writeLocalStore(store: LocalRuntimeStore): void {
  try {
    fs.mkdirSync(path.dirname(RUNTIME_STORE_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch {
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, "hex");
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

export function createSessionToken(userId: string, username: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "spk-sts2-local-dev-secret";
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, username, iat: Date.now() })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function generateRunCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `STS2-${suffix}`;
}

export async function getAllCardsCatalog(): Promise<Card[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("color", { ascending: true })
      .order("name", { ascending: true });
    if (!error && data && data.length > 0) {
      return data as Card[];
    }
  }
  return STATIC_CARDS;
}

export async function getCardById(cardId: string): Promise<Card | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("card_id", cardId)
      .maybeSingle();
    if (!error && data) {
      return data as Card;
    }
  }
  return STATIC_CARDS_BY_ID.get(cardId) || null;
}

export async function getAllRelicsCatalog(): Promise<Relic[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("relics")
      .select("*")
      .order("compendium_order", { ascending: true, nullsFirst: false });
    if (!error && data && data.length > 0) {
      return data as Relic[];
    }
  }
  return STATIC_RELICS;
}

export async function getRelicById(relicId: string): Promise<Relic | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("relics")
      .select("*")
      .eq("relic_id", relicId)
      .maybeSingle();
    if (!error && data) {
      return data as Relic;
    }
  }
  return STATIC_RELICS_BY_ID.get(relicId) || null;
}

export function getStaticCatalogMaps(): {
  cardsById: Map<string, Card>;
  relicsById: Map<string, Relic>;
} {
  return {
    cardsById: STATIC_CARDS_BY_ID,
    relicsById: STATIC_RELICS_BY_ID,
  };
}

export async function registerUserAccount(
  username: string,
  password: string
): Promise<{ user_id: string; username: string }> {
  const normalizedUsername = username.trim();
  const passwordHash = hashPassword(password);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data: existing } = await supabase
      .from("users")
      .select("user_id")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (existing) {
      throw new Error("USERNAME_TAKEN");
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: normalizedUsername,
        password_hash: passwordHash,
      })
      .select("user_id, username")
      .single();

    if (error) {
      if (error.code === "23505") throw new Error("USERNAME_TAKEN");
      throw new Error(error.message);
    }
    return data as { user_id: string; username: string };
  }

  const store = readLocalStore();
  if (store.users.some((u) => u.username.toLowerCase() === normalizedUsername.toLowerCase())) {
    throw new Error("USERNAME_TAKEN");
  }
  const newUser: StoredUser = {
    user_id: crypto.randomUUID(),
    username: normalizedUsername,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
  store.users.push(newUser);
  writeLocalStore(store);
  return { user_id: newUser.user_id, username: newUser.username };
}

export async function authenticateUserAccount(
  username: string,
  password: string
): Promise<{ user_id: string; username: string } | null> {
  const normalizedUsername = username.trim();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, username, password_hash")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (error || !data) return null;
    if (!verifyPassword(password, data.password_hash)) return null;
    return { user_id: data.user_id, username: data.username };
  }

  const store = readLocalStore();
  const found = store.users.find(
    (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
  );
  if (!found || !verifyPassword(password, found.password_hash)) return null;
  return { user_id: found.user_id, username: found.username };
}

export async function createRunHistoryEntry(
  req: RunHistoryCreateRequest
): Promise<RunHistoryRecord> {
  const runCode = generateRunCode();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("run_histories")
      .insert({
        run_code: runCode,
        user_id: req.user_id,
        character: req.character,
        act_level: req.act_level,
        hp_ratio: req.hp_ratio,
        active_relics: req.active_relics,
        selected_cards: req.selected_cards,
        offered_cards: req.offered_cards,
        recommended_card: req.recommended_card,
        vector_scores: req.vector_scores,
        tactical_reason: req.tactical_reason,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as RunHistoryRecord;
  }

  const store = readLocalStore();
  const owner = store.users.find((u) => u.user_id === req.user_id);
  const record: RunHistoryRecord = {
    ...req,
    run_id: crypto.randomUUID(),
    run_code: runCode,
    created_at: new Date().toISOString(),
    username: owner?.username,
  };
  store.run_histories.unshift(record);
  writeLocalStore(store);
  return record;
}

export async function getRunHistoryByCode(runCode: string): Promise<RunHistoryRecord | null> {
  const normalized = runCode.trim().toUpperCase();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("run_histories")
      .select("*, users(username)")
      .eq("run_code", normalized)
      .maybeSingle();

    if (error || !data) return null;
    const { users, ...rest } = data as RunHistoryRecord & {
      users?: { username?: string } | null;
    };
    return {
      ...rest,
      username: users?.username,
    };
  }

  const store = readLocalStore();
  return (
    store.run_histories.find((r) => r.run_code.toUpperCase() === normalized) || null
  );
}

export async function listUserRunHistories(userId: string): Promise<RunHistoryRecord[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("run_histories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25);
    if (!error && data) {
      return data as RunHistoryRecord[];
    }
  }
  const store = readLocalStore();
  return store.run_histories.filter((r) => r.user_id === userId).slice(0, 25);
}
