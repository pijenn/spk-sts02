# SPK Slay the Spire 2 (`spk-sts02`)

**Sistem Pendukung Keputusan (SPK) Pemilihan Kartu Hadiah *Slay the Spire 2***  
Berbasis metode hibrida **Dynamic State Weighting (DSW)** & **Weighted Product (WP)** menggunakan **Next.js 16**, **Tailwind CSS 4**, dan **Supabase (PostgreSQL)**.

---

## Fitur Utama (Sesuai PRD 02 & PRD 03)

1. **Kompilasi Deterministik Dataset Spire Codex (`scripts/compile_datasets.py`)**
   - Mengonversi `raw_cards.json` (**577 kartu**, **453 rewardable**) & `raw_relics.json` (**296 relik**, **10 Energy Relics**) menggunakan `uuid.uuid5` deterministik, meratakan `merchant_price.base`, menggabungkan `keywords` + `powers_applied`, serta menghitung skor intrinsik `C1`–`C5` dan flag `is_energy_relic` (Aturan R-06).
2. **Halaman Evaluasi Rekomendasi Kartu (`/`)**
   - **Panel A (`StateInputPanel`)**: Pemilih 5 karakter (`ironclad`, `silent`, `defect`, `necrobinder`, `regent`) dengan *auto Max HP*, slider sisa HP dengan deteksi `CRITICAL STATE (HP <= 30%)`, pemilih `Act 1–3`, pemilih *Active Relics* dengan lencana `ENERGY RELIC (-30% Cost Penalty)`, serta *Current Deck Builder* dengan kalkulator frekuensi *keyword*.
   - **Panel B (`CardRewardSelector`)**: 3 slot hadiah *Choose a Card* yang memfilter `is_rewardable === true` sesuai warna karakter & *colorless*.
   - **Panel C (`RecommendationDashboard`)**: Highlight bersinar `RANK #1 RECOMMENDED`, peringatan *deck bloat* `REKOMENDASI: SKIP CARD` jika $S_{\max} < \theta$, grafik Vektor $V$ (%) & Vektor $S$, transparansi bobot adaptif DSW ($W_1$–$W_5$), alasan taktis naratif, serta aksi siklus lantai (`Ambil Kartu ke Dek`, `Lewati Kartu`, `Simpan Sesi Permainan`).
3. **Galeri Katalog Berkinerja Tinggi (`/cards` & `/relics`)**
   - *Client-Side In-Memory Fetch Cache* (`Map` TTL 5 menit), tab default `ironclad` (~87 kartu), *Chunked Infinite Scroll* (`IntersectionObserver` 36 item/batch), *On-Demand Detail Modal*, dan parser tag BBCode `<RichDescription />`.
4. **Riwayat Sesi & Isolasi Autentikasi (`/history` & `/auth`)**
   - Pencarian kode unik sesi (`run_code` misal `STS2-8X9K2M`) untuk merekonstruksi kondisi permainan historis berdasarkan pencocokan `UUID`, serta modal Login/Register non-destruktif saat *unauthenticated save*.

---

## Cara Menjalankan Proyek

```bash
# 1. Kompilasi ulang dataset JSON & SQL seed (opsional jika raw JSON berubah)
npm run compile:data

# 2. Jalankan server pengembangan Next.js
npm run dev
```

Untuk panduan lengkap pengaturan **Supabase PostgreSQL** dan *seeding* otomatis, baca **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**.
