-- ============================================================================
-- DDL SQL Script: SPK Pemilihan Kartu Hadiah Slay the Spire 2
-- Referensi: PRD 02 (Backend Services & Database - Supabase PostgreSQL)
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Users (Kebutuhan F-09)
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Cards (~577 Kartu Spire Codex) (Kebutuhan F-01)
CREATE TABLE IF NOT EXISTS public.cards (
    card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codex_id VARCHAR(100) UNIQUE NOT NULL,
    id_lower VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL,
    type VARCHAR(20) NOT NULL,
    rarity VARCHAR(30) NOT NULL,
    cost SMALLINT NULL,
    damage INTEGER NULL,
    block INTEGER NULL,
    c1_cost SMALLINT NOT NULL CHECK (c1_cost BETWEEN 0 AND 4),
    c2_offensive SMALLINT NOT NULL CHECK (c2_offensive BETWEEN 1 AND 5),
    c3_defensive SMALLINT NOT NULL CHECK (c3_defensive BETWEEN 1 AND 5),
    c4_rarity SMALLINT NOT NULL CHECK (c4_rarity IN (1, 3, 5)),
    c5_synergy SMALLINT NOT NULL CHECK (c5_synergy BETWEEN 1 AND 5),
    cards_draw SMALLINT NULL,
    energy_gain SMALLINT NULL,
    keywords TEXT[] DEFAULT '{}',
    is_rewardable BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_color ON public.cards(color);
CREATE INDEX IF NOT EXISTS idx_cards_type ON public.cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON public.cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_is_rewardable ON public.cards(is_rewardable);
CREATE INDEX IF NOT EXISTS idx_cards_keywords ON public.cards USING GIN (keywords);

-- 3. Tabel Relics (~296 Relics Spire Codex) (Kebutuhan F-01, F-02)
CREATE TABLE IF NOT EXISTS public.relics (
    relic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codex_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    description_raw TEXT NULL,
    description_clean TEXT NOT NULL,
    flavor TEXT NULL,
    rarity VARCHAR(50) NOT NULL,
    rarity_key VARCHAR(30) NOT NULL,
    pool VARCHAR(30) NOT NULL DEFAULT 'shared',
    merchant_price INTEGER NULL,
    image_url TEXT NOT NULL,
    image_variants JSONB NULL,
    name_variants JSONB NULL,
    notes TEXT NULL,
    compendium_order INTEGER NULL,
    is_energy_relic BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_relics_pool ON public.relics(pool);
CREATE INDEX IF NOT EXISTS idx_relics_rarity_key ON public.relics(rarity_key);
CREATE INDEX IF NOT EXISTS idx_relics_compendium_order ON public.relics(compendium_order);
CREATE INDEX IF NOT EXISTS idx_relics_is_energy ON public.relics(is_energy_relic);

-- 4. Tabel Run Histories (Kebutuhan F-08, F-10)
CREATE TABLE IF NOT EXISTS public.run_histories (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_code VARCHAR(16) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    character VARCHAR(30) NOT NULL,
    act_level SMALLINT NOT NULL CHECK (act_level IN (1, 2, 3)),
    hp_ratio FLOAT NOT NULL,
    active_relics JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
    offered_cards JSONB NOT NULL,
    recommended_card VARCHAR(100) NOT NULL,
    vector_scores JSONB NOT NULL,
    tactical_reason TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_run_histories_run_code ON public.run_histories(run_code);
CREATE INDEX IF NOT EXISTS idx_run_histories_user_id ON public.run_histories(user_id);

-- 5. Row Level Security (RLS) Policies agar API & Anon/Service Key berfungsi aman
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_histories ENABLE ROW LEVEL SECURITY;

-- Katalog Kartu & Relik bersifat publik untuk dibaca (Read-Only untuk publik)
DROP POLICY IF EXISTS "Allow public read cards" ON public.cards;
CREATE POLICY "Allow public read cards" ON public.cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read relics" ON public.relics;
CREATE POLICY "Allow public read relics" ON public.relics FOR SELECT USING (true);

-- Riwayat sesi dapat dibaca melalui run_code & disimpan oleh aplikasi
DROP POLICY IF EXISTS "Allow public read run_histories" ON public.run_histories;
CREATE POLICY "Allow public read run_histories" ON public.run_histories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow app insert run_histories" ON public.run_histories;
CREATE POLICY "Allow app insert run_histories" ON public.run_histories FOR INSERT WITH CHECK (true);

-- Tabel users untuk modul autentikasi kustom (F-09)
DROP POLICY IF EXISTS "Allow app select users" ON public.users;
CREATE POLICY "Allow app select users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow app insert users" ON public.users;
CREATE POLICY "Allow app insert users" ON public.users FOR INSERT WITH CHECK (true);
