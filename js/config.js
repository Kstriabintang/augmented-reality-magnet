// Konfigurasi Supabase untuk menyimpan hasil kuis Magnet & Listrik (adindautami).
// anon key AMAN di sini (publik); keamanan dijaga RLS: siswa hanya bisa MENYIMPAN, admin login untuk MEMBACA.
// Proyek Supabase KHUSUS Utami (terpisah dari chensqy). Tabel -> hasil_kuis_utami.
export const SUPABASE_URL = "https://ypknxmrsnfnqzrvvzbhb.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa254bXJzbmZucXpydnZ6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDM2NTcsImV4cCI6MjEwMDI3OTY1N30.aPoYGVRrq2dStg-IKh2rb79LYqEi45BrzYrVSSAv0io";
export const TABLE = "hasil_kuis_utami";
export const isConfigured = () =>
  /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL) && !/REPLACE/.test(SUPABASE_URL) && !/REPLACE/.test(SUPABASE_ANON_KEY);
