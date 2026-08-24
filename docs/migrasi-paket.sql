-- Migrasi: kolom `paket` pada tabel hasil kuis (jalankan SEKALI di Supabase SQL Editor)
-- Proyek: ypknxmrsnfnqzrvvzbhb (utamiii) → https://supabase.com/dashboard → SQL Editor → Run
-- Aman dijalankan berulang (IF NOT EXISTS). Baris lama tanpa paket otomatis dianggap "utama" oleh situs & admin.
alter table public.hasil_kuis_utami
  add column if not exists paket text;
