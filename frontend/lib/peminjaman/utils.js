/**
 * Utilitas formatting tanggal dan waktu untuk fitur Peminjaman & Pengembalian.
 * Semua tampilan menggunakan zona waktu Asia/Jakarta (WIB).
 *
 * Backend dapat mengirimkan dua format:
 * 1. ISO UTC: "2026-11-25T03:00:00.000Z" → harus dikonversi ke WIB
 * 2. DATETIME lokal MySQL: "2026-11-25 10:00:00" → ditampilkan apa adanya sebagai waktu lokal
 */

const LOCALE = "id-ID";
const TIMEZONE = "Asia/Jakarta";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/**
 * Parse nilai datetime dari backend menjadi objek Date yang benar.
 * Mendeteksi apakah string memiliki penanda UTC (Z atau +offset) atau tidak.
 */
function parseBackendDatetime(value) {
  if (!value) return null;

  const str = String(value).trim();

  // Sudah berupa objek Date
  if (value instanceof Date) return value;

  // Format ISO dengan timezone: "2026-11-25T03:00:00.000Z" atau "2026-11-25T10:00:00+07:00"
  if (/Z$|[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }

  // Format DATETIME lokal MySQL tanpa timezone: "2026-11-25 10:00:00" atau "2026-11-25T10:00:00"
  // Perlakukan sebagai waktu lokal WIB (tidak melakukan konversi zona waktu)
  const normalized = str.replace("T", " ").replace(/\.\d+$/, "");
  const [datePart, timePart = "00:00:00"] = normalized.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = 0] = timePart.split(":").map(Number);

  // Buat Date di zona waktu WIB dengan menggunakan offset +7
  // new Date(Date.UTC(y,m,d,h,i,s)) lalu kurangi 7 jam menghasilkan UTC yg setara WIB
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second));
}

/**
 * Format tanggal lengkap: "25 November 2026"
 */
export function formatTanggal(value) {
  const date = parseBackendDatetime(value);
  if (!date || isNaN(date.getTime())) return "-";

  const options = {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString(LOCALE, options);
}

/**
 * Format jam dalam 24 jam: "10:00"
 */
export function formatJam(value) {
  const date = parseBackendDatetime(value);
  if (!date || isNaN(date.getTime())) return "-";

  const options = {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return date.toLocaleTimeString(LOCALE, options);
}

/**
 * Format tanggal dan jam: "25 November 2026, 10.00 WIB"
 */
export function formatTanggalJam(value) {
  const date = parseBackendDatetime(value);
  if (!date || isNaN(date.getTime())) return "-";

  const tgl = formatTanggal(value);
  const jam = formatJam(value);

  return `${tgl}, ${jam} WIB`;
}

/**
 * Format tanggal pendek: "25 Nov 2026"
 */
export function formatTanggalPendek(value) {
  const date = parseBackendDatetime(value);
  if (!date || isNaN(date.getTime())) return "-";

  const options = {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return date.toLocaleDateString(LOCALE, options);
}

/**
 * Format waktu singkat untuk tabel: "25 Nov 2026 (10:00)"
 */
export function formatTanggalJamPendek(value) {
  const date = parseBackendDatetime(value);
  if (!date || isNaN(date.getTime())) return "-";

  const tgl = formatTanggalPendek(value);
  const jam = formatJam(value);

  return `${tgl} (${jam})`;
}

/**
 * Format range tanggal untuk informasi peminjaman: "25 Nov 2026 → 26 Nov 2026"
 */
export function formatRangeTanggal(awal, akhir) {
  return `${formatTanggalPendek(awal)} → ${formatTanggalPendek(akhir)}`;
}

/**
 * Hitung apakah transaksi terlambat berdasarkan field terlambat dari backend.
 * Backend mengembalikan 1 jika terlambat, 0 jika tidak.
 */
export function isTerlambat(item) {
  return Number(item?.terlambat) === 1;
}

/**
 * Hitung ringkasan dari daftar peminjaman.
 * - unitDipinjam: total jumlah unit pada transaksi status dipinjam
 * - transaksiAktif: jumlah transaksi status dipinjam
 * - terlambat: jumlah transaksi terlambat (field terlambat === 1)
 */
export function hitungRingkasan(daftarPeminjaman) {
  const aktif = daftarPeminjaman.filter((p) => p.status === "dipinjam");

  const unitDipinjam = aktif.reduce(
    (total, p) => total + Number(p.jumlah_pinjam || 0),
    0
  );

  const transaksiAktif = aktif.length;

  const terlambat = aktif.filter((p) => isTerlambat(p)).length;

  return { unitDipinjam, transaksiAktif, terlambat };
}

/**
 * Label tampilan untuk status peminjaman.
 */
export function labelStatus(status) {
  if (status === "dipinjam") return "Sedang Dipinjam";
  if (status === "dikembalikan") return "Telah Dikembalikan";
  return status || "-";
}

/**
 * Label tampilan untuk kategori barang.
 */
export function labelKategoriBarang(kategori) {
  if (kategori === "habis_pakai") return "Habis Pakai";
  if (kategori === "tidak_habis_pakai") return "Tidak Habis Pakai";
  return kategori || "-";
}

/**
 * Label tampilan untuk kategori peminjam.
 * Jika "Lainnya", tampilkan juga keterangannya.
 */
export function labelKategoriPeminjam(item) {
  const kategori = item?.kategori_peminjam || "-";
  if (kategori === "Lainnya" && item?.kategori_peminjam_lainnya) {
    return `Lainnya (${item.kategori_peminjam_lainnya})`;
  }
  return kategori;
}

/**
 * Tanggal hari ini dalam format YYYY-MM-DD untuk default value input date.
 */
export function hariIniISO() {
  const now = new Date();
  const wib = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIMEZONE,
  }).format(now);
  return wib; // "2026-11-25"
}

/**
 * Jam sekarang dalam format HH:mm untuk default value input time.
 */
export function jamSekarang() {
  const now = new Date();
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

/**
 * Validasi apakah waktu batas pengembalian lebih besar dari waktu peminjaman.
 * Menerima format YYYY-MM-DD dan HH:mm.
 */
export function validasiWaktuPengembalian(
  tglPinjam,
  jamPinjam,
  tglKembali,
  jamKembali
) {
  if (!tglPinjam || !jamPinjam || !tglKembali || !jamKembali) return false;
  const pinjam = `${tglPinjam} ${jamPinjam}`;
  const kembali = `${tglKembali} ${jamKembali}`;
  return kembali > pinjam;
}

/**
 * Filter daftar peminjaman berdasarkan query pencarian dan kategori.
 */
export function filterPeminjaman(daftar, { query = "", kategori = "", tab = "dipinjam" }) {
  let hasil = daftar.filter((p) => p.status === tab);

  if (kategori && kategori !== "semua") {
    hasil = hasil.filter((p) => p.kategori_peminjam === kategori);
  }

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    hasil = hasil.filter(
      (p) =>
        (p.kode_transaksi || "").toLowerCase().includes(q) ||
        (p.nama_barang || "").toLowerCase().includes(q) ||
        (p.nama_peminjam || "").toLowerCase().includes(q)
    );
  }

  return hasil;
}

/**
 * Urutkan daftar peminjaman berdasarkan tanggal.
 */
export function urutkanPeminjaman(daftar, urutan = "terbaru") {
  return [...daftar].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return urutan === "terlama" ? dateA - dateB : dateB - dateA;
  });
}
