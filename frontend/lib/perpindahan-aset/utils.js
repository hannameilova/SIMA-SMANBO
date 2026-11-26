const JAKARTA_TZ = "Asia/Jakarta";

export const OPSI_ALASAN_PERPINDAHAN = [
  { value: "kebutuhan_kelas", label: "Kebutuhan kelas" },
  { value: "penataan_ulang_ruangan", label: "Penataan ulang ruangan" },
  { value: "perbaikan", label: "Perbaikan" },
  { value: "dipindah_ke_gudang", label: "Dipindah ke gudang" },
  { value: "lainnya", label: "Lainnya" },
];

const ALASAN_MAP = Object.fromEntries(
  OPSI_ALASAN_PERPINDAHAN.map((item) => [item.value, item.label])
);

const KONDISI_MAP = {
  baik: {
    label: "Baik",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  rusak_ringan: {
    label: "Rusak Ringan",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  rusak_berat: {
    label: "Rusak Berat",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
};

const STATUS_PENGGUNAAN_MAP = {
  aktif: {
    label: "Aktif",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  nonaktif: {
    label: "Nonaktif",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
  digunakan: {
    label: "Digunakan",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  dipinjam: {
    label: "Dipinjam",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  disimpan: {
    label: "Disimpan",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  tidak_digunakan: {
    label: "Tidak Digunakan",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export function labelAlasanPerpindahan(value) {
  return ALASAN_MAP[value] || value || "—";
}

export function infoKondisi(kondisi) {
  const key = String(kondisi || "").toLowerCase();
  return (
    KONDISI_MAP[key] || {
      label: kondisi || "—",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
    }
  );
}

export function infoStatusPenggunaan(status) {
  const key = String(status || "").trim().toLowerCase();
  if (STATUS_PENGGUNAAN_MAP[key]) {
    return STATUS_PENGGUNAAN_MAP[key];
  }

  const label = key
    ? key
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
    : "—";

  return {
    label,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

export function formatAngka(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function getJakartaParts(dateObj) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dateObj);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: map.year,
    month: map.month,
    day: map.day,
  };
}

/**
 * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD sesuai timezone Asia/Jakarta.
 */
export function getTodayJakartaYMD() {
  const { year, month, day } = getJakartaParts(new Date());
  return `${year}-${month}-${day}`;
}

/**
 * Mengonversi nilai tanggal dari API (ISO UTC atau YYYY-MM-DD) menjadi YYYY-MM-DD di Asia/Jakarta.
 */
export function toJakartaDateKey(value) {
  if (!value) return "";

  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return "";

  const { year, month, day } = getJakartaParts(date);
  return `${year}-${month}-${day}`;
}

/**
 * Memformat tanggal (contoh: 23 November 2026) dalam zona waktu Asia/Jakarta.
 */
export function formatTanggalJakarta(
  value,
  options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
) {
  if (!value) return "—";

  const str = String(value).trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(str)
    ? new Date(`${str}T00:00:00+07:00`)
    : new Date(str);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    ...options,
  }).format(date);
}

/**
 * Memformat tanggal dan waktu WIB (contoh: 23 Nov 2026, 09:30 WIB).
 */
export function formatTanggalWaktuJakarta(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const formatted = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${formatted.replace(".", ":")} WIB`;
}

/**
 * Memeriksa apakah nilai tanggal termasuk pada bulan & tahun berjalan di Asia/Jakarta.
 */
export function isCurrentMonthJakarta(value) {
  const dateKey = toJakartaDateKey(value);
  if (!dateKey) return false;

  const todayKey = getTodayJakartaYMD();
  return dateKey.slice(0, 7) === todayKey.slice(0, 7);
}

export function getCurrentMonthLabelJakarta() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/**
 * Pemeriksaan nama lokasi Gudang secara case-insensitive (selaras dengan regex backend /gudang/i).
 */
export function isLokasiGudang(namaLokasi) {
  return /gudang/i.test(String(namaLokasi || "").trim());
}

/**
 * Aturan bisnis checkbox tidak layak pakai:
 * Hanya aktif jika lokasi tujuan mengandung "Gudang" (case-insensitive) DAN alasan === "dipindah_ke_gudang".
 */
export function isCheckboxTidakLayakBerlaku(namaLokasiTujuan, alasan) {
  return isLokasiGudang(namaLokasiTujuan) && alasan === "dipindah_ke_gudang";
}

/**
 * Menghitung statistik ringkasan secara dinamis dari data riwayat API.
 */
export function hitungStatistikPerpindahan(riwayat = []) {
  let bulanIni = 0;
  let totalUnit = 0;
  const ruanganSet = new Set();

  for (const item of riwayat) {
    if (isCurrentMonthJakarta(item.tanggal_perpindahan)) {
      bulanIni += 1;
    }

    totalUnit += Number(item.jumlah_dipindahkan || 0);

    if (item.id_lokasi_asal) {
      ruanganSet.add(Number(item.id_lokasi_asal));
    }
    if (item.id_lokasi_tujuan) {
      ruanganSet.add(Number(item.id_lokasi_tujuan));
    }
  }

  return {
    bulanIni,
    totalUnit,
    ruanganTerlibat: ruanganSet.size,
    periodeLabel: getCurrentMonthLabelJakarta(),
  };
}

/**
 * Kunci pengelompokan stok yang digunakan backend:
 * id_pengadaan + id_lokasi + kondisi + status_penggunaan
 */
export function buildStockKey({
  id_pengadaan,
  id_lokasi,
  kondisi,
  status_penggunaan,
}) {
  return `${Number(id_pengadaan)}:${Number(id_lokasi)}:${String(kondisi)}:${String(status_penggunaan)}`;
}

/**
 * Menghitung pratinjau dampak stok lokasi asal dan tujuan secara akurat per kelompok stok.
 */
export function hitungPratinjauDampakStok({
  stokAsalList = [],
  stokTujuanList = [],
  jumlahPerStok = {},
  idLokasiTujuan,
  tandaiTidakLayak = false,
}) {
  const tujuanIdNum = Number(idLokasiTujuan);
  const totalAsalSebelum = stokAsalList.reduce(
    (sum, item) => sum + Number(item.jumlah || 0),
    0
  );
  const totalTujuanSebelum = stokTujuanList.reduce(
    (sum, item) => sum + Number(item.jumlah || 0),
    0
  );

  // Petakan stok tujuan berdasarkan kunci unik backend
  const mapTujuan = new Map();
  for (const item of stokTujuanList) {
    const key = buildStockKey({
      id_pengadaan: item.id_pengadaan,
      id_lokasi: item.id_lokasi ?? tujuanIdNum,
      kondisi: item.kondisi,
      status_penggunaan: item.status_penggunaan,
    });
    mapTujuan.set(key, Number(item.jumlah || 0));
  }

  // Agregasi tambahan per kunci tujuan apabila beberapa kelompok asal (mis. status berbeda)
  // dipindahkan dengan checkbox nonaktif ke kunci tujuan yang sama.
  const tambahanPerKunciTujuan = new Map();
  const rincianKelompok = [];
  let totalDipindahkan = 0;

  for (const stok of stokAsalList) {
    const qty = Number(jumlahPerStok[stok.id_stok] || 0);
    if (qty <= 0) continue;

    totalDipindahkan += qty;

    const statusTujuan = tandaiTidakLayak
      ? "nonaktif"
      : stok.status_penggunaan;

    const keyTujuan = buildStockKey({
      id_pengadaan: stok.id_pengadaan,
      id_lokasi: tujuanIdNum,
      kondisi: stok.kondisi,
      status_penggunaan: statusTujuan,
    });

    const sebelumTujuanKelompok = mapTujuan.get(keyTujuan) ?? 0;
    const akumulasiSebelumnya = tambahanPerKunciTujuan.get(keyTujuan) ?? 0;
    const sesudahAkumulasiTujuan =
      sebelumTujuanKelompok + akumulasiSebelumnya + qty;
    tambahanPerKunciTujuan.set(keyTujuan, akumulasiSebelumnya + qty);

    const asalSebelum = Number(stok.jumlah || 0);

    rincianKelompok.push({
      id_stok: stok.id_stok,
      id_pengadaan: stok.id_pengadaan,
      tahun_pengadaan: stok.tahun_pengadaan,
      kondisi: stok.kondisi,
      status_penggunaan_asal: stok.status_penggunaan,
      status_penggunaan_tujuan: statusTujuan,
      jumlahDipindahkan: qty,
      asalSebelum,
      asalSesudah: asalSebelum - qty,
      tujuanSebelum: sebelumTujuanKelompok + akumulasiSebelumnya,
      tujuanSesudah: sesudahAkumulasiTujuan,
    });
  }

  return {
    totalDipindahkan,
    totalAsalSebelum,
    totalAsalSesudah: totalAsalSebelum - totalDipindahkan,
    totalTujuanSebelum,
    totalTujuanSesudah: totalTujuanSebelum + totalDipindahkan,
    rincianKelompok,
  };
}

/**
 * Mengubah error dari API menjadi pesan yang ramah pengguna.
 */
export function formatApiErrorMessage(err, fallback = "Terjadi kesalahan.") {
  if (!err) return fallback;
  if (err.status === 401) {
    return "Sesi login Anda telah berakhir atau token tidak valid. Silakan login kembali.";
  }
  if (err.status === 403) {
    return "Anda tidak memiliki izin untuk mengakses fitur Perpindahan Aset (khusus Wakasek Sarpras).";
  }
  return err.message || fallback;
}
