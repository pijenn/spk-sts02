/**
 * Spesifikasi OpenAPI 3.0 untuk seluruh endpoint REST Next.js (/api/v1/*).
 * Disajikan oleh GET /api/v1/openapi dan dirender Swagger UI di /api-docs.
 */

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const jsonBody = (schema: object, example?: unknown) => ({
  required: true,
  content: { "application/json": { schema, ...(example ? { example } : {}) } },
});
const jsonRes = (description: string, schema: object) => ({
  description,
  content: { "application/json": { schema } },
});
const err = (description: string) => jsonRes(description, ref("ErrorResponse"));

const strQuery = (name: string, description: string, extra: object = {}) => ({
  name,
  in: "query",
  required: false,
  description,
  schema: { type: "string", ...extra },
});
const boolQuery = (name: string, description: string) => ({
  name,
  in: "query",
  required: false,
  description,
  schema: { type: "boolean" },
});

const UUID_EX = "5ab7a996-9c1d-5b6e-9004-47433643fb13";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SPK Slay the Spire 2 - REST API",
    version: "1.0.0",
    description:
      "Dokumentasi endpoint backend Sistem Pendukung Keputusan pemilihan kartu hadiah Slay the Spire 2 (metode WP-DSW).\n\n" +
      "Endpoint `/recommend` meneruskan permintaan ke FastAPI inference engine (`ML/api_server.py`, port 8000, dokumentasi di `http://localhost:8000/docs`). " +
      "Endpoint `/history` dan `/auth/*` menyimpan data ke Supabase PostgreSQL.",
  },
  servers: [{ url: "/api/v1", description: "Server saat ini" }],
  tags: [
    { name: "Rekomendasi", description: "Evaluasi 3 kartu hadiah dengan WP-DSW" },
    { name: "Autentikasi", description: "Registrasi dan login pengguna" },
    { name: "Riwayat", description: "Penyimpanan dan pengambilan sesi permainan" },
    { name: "Katalog", description: "Data kartu dan relik" },
  ],
  paths: {
    "/recommend": {
      post: {
        tags: ["Rekomendasi"],
        summary: "Hitung rekomendasi kartu (WP-DSW)",
        description:
          "Memvalidasi state permainan lalu meneruskannya ke FastAPI. Wajib tepat 3 kartu hadiah dengan format UUID.",
        requestBody: jsonBody(ref("GameStateRequest"), {
          character: "silent",
          current_hp: 20,
          max_hp: 80,
          act_level: 2,
          active_relics: [],
          current_deck_cards: [],
          reward_card_ids: [UUID_EX, UUID_EX, UUID_EX],
        }),
        responses: {
          "200": jsonRes("Hasil peringkat dan rekomendasi", ref("RecommendationResponse")),
          "400": err("Payload JSON tidak valid"),
          "422": err("Validasi gagal (karakter, HP, act, UUID, jumlah kartu)"),
          "502": err("FastAPI mengembalikan error atau tidak dapat dihubungi"),
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Autentikasi"],
        summary: "Registrasi akun",
        description: "Username 3-50 karakter, password minimal 6 karakter. Password disimpan sebagai hash scrypt.",
        requestBody: jsonBody(ref("AuthRequest"), { username: "rafie", password: "rahasia123" }),
        responses: {
          "201": jsonRes("Akun dibuat", ref("AuthUser")),
          "400": err("Input tidak valid atau username sudah terdaftar"),
          "500": err("Kesalahan server"),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Autentikasi"],
        summary: "Login",
        requestBody: jsonBody(ref("AuthRequest"), { username: "rafie", password: "rahasia123" }),
        responses: {
          "200": jsonRes("Login berhasil", ref("AuthUser")),
          "400": err("Username/password kosong"),
          "401": err("Username atau kata sandi salah"),
        },
      },
    },
    "/history": {
      get: {
        tags: ["Riwayat"],
        summary: "Daftar 25 sesi terakhir milik pengguna",
        parameters: [
          { name: "user_id", in: "query", required: true, description: "UUID pengguna", schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": jsonRes("Daftar sesi", { type: "array", items: ref("RunHistoryRecord") }),
          "400": err("Parameter user_id tidak ada"),
        },
      },
      post: {
        tags: ["Riwayat"],
        summary: "Simpan sesi rekomendasi",
        description: "Menyimpan ke tabel `run_histories` dan menghasilkan `run_code` unik berformat STS2-XXXXXX.",
        requestBody: jsonBody(ref("RunHistoryCreateRequest")),
        responses: {
          "201": jsonRes("Sesi tersimpan", ref("RunHistoryRecord")),
          "400": err("Payload JSON tidak valid"),
          "422": err("Data sesi tidak lengkap (offered_cards harus 3)"),
          "500": err("Gagal menyimpan ke database"),
        },
      },
    },
    "/history/{run_code}": {
      get: {
        tags: ["Riwayat"],
        summary: "Ambil sesi berdasarkan kode unik",
        parameters: [
          { name: "run_code", in: "path", required: true, schema: { type: "string", example: "STS2-AB23CD" } },
        ],
        responses: {
          "200": jsonRes("Detail sesi", ref("RunHistoryRecord")),
          "404": err("Kode sesi tidak terdaftar"),
        },
      },
    },
    "/cards": {
      get: {
        tags: ["Katalog"],
        summary: "Daftar kartu (577) dengan filter",
        parameters: [
          strQuery("color", "ironclad, silent, defect, necrobinder, regent, colorless, ... atau all"),
          strQuery("type", "Attack, Skill, Power, ... atau all"),
          strQuery("rarity", "Basic, Common, Uncommon, Rare, ... atau all"),
          strQuery("keyword", "Substring kata kunci mekanik, mis. Exhaust"),
          { name: "cost", in: "query", required: false, description: "Biaya energi", schema: { type: "integer" } },
          boolQuery("is_rewardable", "Hanya kartu yang bisa menjadi hadiah"),
          strQuery("search", "Cari pada nama, deskripsi, dan kata kunci"),
        ],
        responses: { "200": jsonRes("Daftar kartu", { type: "array", items: ref("Card") }) },
      },
    },
    "/cards/{card_id}": {
      get: {
        tags: ["Katalog"],
        summary: "Detail satu kartu",
        parameters: [{ name: "card_id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": jsonRes("Detail kartu", ref("Card")),
          "404": err("Kartu tidak ditemukan"),
        },
      },
    },
    "/relics": {
      get: {
        tags: ["Katalog"],
        summary: "Daftar relik (296) dengan filter",
        parameters: [
          strQuery("pool", "Kolam relik atau all"),
          strQuery("rarity_key", "Kunci rarity atau all"),
          boolQuery("is_energy_relic", "Hanya relik pemberi energi"),
          strQuery("search", "Cari pada nama dan deskripsi"),
        ],
        responses: { "200": jsonRes("Daftar relik", { type: "array", items: ref("Relic") }) },
      },
    },
    "/relics/{relic_id}": {
      get: {
        tags: ["Katalog"],
        summary: "Detail satu relik",
        parameters: [{ name: "relic_id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": jsonRes("Detail relik", ref("Relic")),
          "404": err("Relik tidak ditemukan"),
        },
      },
    },
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: { detail: { type: "string" } },
        required: ["detail"],
      },
      GameStateRequest: {
        type: "object",
        required: ["character", "current_hp", "max_hp", "act_level", "reward_card_ids"],
        properties: {
          character: { type: "string", enum: ["ironclad", "silent", "defect", "necrobinder", "regent"] },
          current_hp: { type: "integer", minimum: 0 },
          max_hp: { type: "integer", minimum: 1 },
          act_level: { type: "integer", enum: [1, 2, 3] },
          active_relics: { type: "array", items: { type: "string", format: "uuid" }, default: [] },
          current_deck_cards: { type: "array", items: { type: "string", format: "uuid" }, default: [] },
          reward_card_ids: { type: "array", items: { type: "string", format: "uuid" }, minItems: 3, maxItems: 4 },
        },
      },
      AdaptiveWeights: {
        type: "object",
        properties: {
          w1_cost: { type: "number" },
          w2_offensive: { type: "number" },
          w3_defensive: { type: "number" },
          w4_rarity: { type: "number" },
          w5_synergy: { type: "number" },
          active_rules: { type: "array", items: { type: "string" } },
        },
      },
      CandidateScore: {
        type: "object",
        properties: {
          rank: { type: "integer" },
          card_id: { type: "string", format: "uuid" },
          codex_id: { type: "string" },
          card_name: { type: "string" },
          name: { type: "string" },
          vector_s: { type: "number", description: "Skor Weighted Product S_i" },
          vector_v: { type: "number", description: "Preferensi relatif V_i" },
          preference_percentage: { type: "number" },
          synergy_ratio: { type: "number" },
          effective_c5_synergy: { type: "number" },
          matched_deck_keywords: { type: "array", items: { type: "string" } },
          matched_keywords: { type: "array", items: { type: "string" } },
          normalized_weights: { type: "object", additionalProperties: { type: "number" } },
        },
      },
      RecommendationResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          inference_engine: { type: "string" },
          hp_ratio: { type: "number" },
          is_critical_hp: { type: "boolean" },
          has_energy_relic: { type: "boolean" },
          is_skip_recommended: { type: "boolean" },
          skip_threshold: { type: "number", example: 1.2 },
          max_vector_s: { type: "number" },
          recommended_card_id: { type: "string", format: "uuid", nullable: true },
          recommended_card: { type: "string" },
          recommended_card_name: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          adaptive_weights_normalized: { type: "object", additionalProperties: { type: "number" } },
          weights: ref("AdaptiveWeights"),
          rankings: { type: "array", items: ref("CandidateScore") },
          evaluations: { type: "array", items: ref("CandidateScore") },
          tactical_reason: { type: "string" },
          game_state_summary: { type: "object", additionalProperties: true },
        },
      },
      AuthRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 50 },
          password: { type: "string", minLength: 6, format: "password" },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          user_id: { type: "string", format: "uuid" },
          username: { type: "string" },
          token: { type: "string", description: "Token sesi bertanda tangan HMAC-SHA256" },
        },
      },
      RunHistoryVectorScores: {
        type: "object",
        properties: {
          rankings: { type: "array", items: ref("CandidateScore") },
          weights: ref("AdaptiveWeights"),
          is_skip_recommended: { type: "boolean" },
          skip_threshold: { type: "number" },
          max_vector_s: { type: "number" },
        },
      },
      RunHistoryCreateRequest: {
        type: "object",
        required: ["user_id", "character", "act_level", "hp_ratio", "offered_cards", "recommended_card", "vector_scores", "tactical_reason"],
        properties: {
          user_id: { type: "string", format: "uuid" },
          character: { type: "string", enum: ["ironclad", "silent", "defect", "necrobinder", "regent"] },
          act_level: { type: "integer", enum: [1, 2, 3] },
          hp_ratio: { type: "number" },
          active_relics: { type: "array", items: { type: "string" } },
          selected_cards: { type: "array", items: { type: "string" } },
          offered_cards: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
          recommended_card: { type: "string" },
          vector_scores: ref("RunHistoryVectorScores"),
          tactical_reason: { type: "string" },
        },
      },
      RunHistoryRecord: {
        allOf: [
          ref("RunHistoryCreateRequest"),
          {
            type: "object",
            properties: {
              run_id: { type: "string", format: "uuid" },
              run_code: { type: "string", example: "STS2-AB23CD" },
              created_at: { type: "string", format: "date-time" },
              username: { type: "string" },
            },
          },
        ],
      },
      Card: {
        type: "object",
        properties: {
          card_id: { type: "string", format: "uuid" },
          codex_id: { type: "string" },
          id_lower: { type: "string" },
          name: { type: "string" },
          color: { type: "string" },
          type: { type: "string" },
          rarity: { type: "string" },
          cost: { type: "integer", nullable: true },
          damage: { type: "integer", nullable: true },
          block: { type: "integer", nullable: true },
          c1_cost: { type: "integer", minimum: 0, maximum: 4 },
          c2_offensive: { type: "integer", minimum: 1, maximum: 5 },
          c3_defensive: { type: "integer", minimum: 1, maximum: 5 },
          c4_rarity: { type: "integer", enum: [1, 3, 5] },
          c5_synergy: { type: "integer", minimum: 1, maximum: 5 },
          cards_draw: { type: "integer", nullable: true },
          energy_gain: { type: "integer", nullable: true },
          keywords: { type: "array", items: { type: "string" } },
          is_rewardable: { type: "boolean" },
          description: { type: "string" },
          image_url: { type: "string", format: "uri" },
        },
      },
      Relic: {
        type: "object",
        properties: {
          relic_id: { type: "string", format: "uuid" },
          codex_id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          description_raw: { type: "string", nullable: true },
          description_clean: { type: "string" },
          flavor: { type: "string", nullable: true },
          rarity: { type: "string" },
          rarity_key: { type: "string" },
          pool: { type: "string" },
          merchant_price: { type: "integer", nullable: true },
          image_url: { type: "string", format: "uri" },
          notes: { type: "string", nullable: true },
          compendium_order: { type: "integer", nullable: true },
          is_energy_relic: { type: "boolean" },
        },
      },
    },
  },
} as const;
