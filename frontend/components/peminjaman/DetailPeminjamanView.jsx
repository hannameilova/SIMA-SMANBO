"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Circle,
  MapPin,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import { getDetailPeminjaman } from "@/lib/peminjaman/api";
import {
  formatTanggal,
  formatJam,
  formatTanggalJam,
  formatTanggalPendek,
  labelStatus,
  labelKategoriBarang,
  labelKategoriPeminjam,
} from "@/lib/peminjaman/utils";
import DrawerPengembalian from "./DrawerPengembalian";

// ============================
// BADGE STATUS
// ============================
function BadgeStatus({ status }) {
  if (status === "dipinjam") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        Sedang Dipinjam
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Telah Dikembalikan
    </span>
  );
}

function BadgeKategoriBarang({ kategori }) {
  const label = labelKategoriBarang(kategori);
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
      {label}
    </span>
  );
}

// ============================
// INFO ROW
// ============================
function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-50 py-2.5 last:border-0">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-xs font-medium text-slate-800">{value}</span>
    </div>
  );
}

// ============================
// TIMELINE
// ============================
function TimelineItem({ selesai, aktif, judul, deskripsi, ikon: Ikon }) {
  let warnaBulat, warnaGaris, warnaJudul, warnaDesc;

  if (selesai) {
    warnaBulat = "bg-emerald-500 ring-4 ring-emerald-100";
    warnaGaris = "bg-emerald-200";
    warnaJudul = "text-emerald-700 font-semibold";
    warnaDesc = "text-slate-500";
  } else if (aktif) {
    warnaBulat = "bg-blue-500 ring-4 ring-blue-100";
    warnaGaris = "bg-slate-200";
    warnaJudul = "text-blue-700 font-semibold";
    warnaDesc = "text-slate-500";
  } else {
    warnaBulat = "bg-slate-200 ring-4 ring-slate-50";
    warnaGaris = "bg-slate-100";
    warnaJudul = "text-slate-400";
    warnaDesc = "text-slate-300";
  }

  return (
    <div className="flex gap-4">
      {/* Bulat dan garis */}
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${warnaBulat} shrink-0`}>
          <Ikon size={15} className="text-white" strokeWidth={2} />
        </div>
        <div className={`mt-1 h-full w-0.5 ${warnaGaris}`} />
      </div>

      {/* Konten */}
      <div className="pb-7 pt-1">
        <p className={`text-sm ${warnaJudul}`}>{judul}</p>
        {deskripsi && <p className={`mt-0.5 text-xs ${warnaDesc}`}>{deskripsi}</p>}
      </div>
    </div>
  );
}

// ============================
// DETAIL VIEW
// ============================
export default function DetailPeminjamanView({ idPeminjaman }) {
  const router = useRouter();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [drawerPengembalian, setDrawerPengembalian] = useState(false);

  const loadDetail = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const data = await getDetailPeminjaman(idPeminjaman, signal);
        if (!data) throw new Error("Data peminjaman tidak ditemukan.");
        setDetail(data);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err.message || "Gagal mengambil detail transaksi.");
      } finally {
        setLoading(false);
      }
    },
    [idPeminjaman]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadDetail(controller.signal);
    return () => controller.abort();
  }, [loadDetail]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Kunci scroll ketika drawer terbuka
  useEffect(() => {
    if (drawerPengembalian) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [drawerPengembalian]);

  async function setelahPengembalian(pesan) {
    setDrawerPengembalian(false);
    setNotice(pesan);
    const controller = new AbortController();
    await loadDetail(controller.signal);
  }

  // ============================
  // LOADING
  // ============================
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          Memuat detail transaksi...
        </div>
      </div>
    );
  }

  // ============================
  // ERROR
  // ============================
  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
        <Link
          href="/peminjaman"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={14} />
          Kembali ke daftar
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle size={36} className="mx-auto mb-3 text-red-300" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadDetail()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={13} />
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const sudahDikembalikan = detail.status === "dikembalikan";

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
      {/* BREADCRUMB */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-slate-400">
        <Link href="/peminjaman" className="hover:text-slate-600">
          SIM Sarpras
        </Link>
        <span className="mx-1">›</span>
        <Link href="/peminjaman" className="hover:text-slate-600">
          Peminjaman & Pengembalian Aset
        </Link>
        <span className="mx-1">›</span>
        <span className="font-medium text-slate-600">Detail Transaksi</span>
      </nav>

      {/* NOTICE */}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          <CheckSquare size={15} />
          {notice}
        </div>
      )}

      {/* HEADER DETAIL */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Tombol kembali */}
          <Link
            href="/peminjaman"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={13} />
            Kembali ke daftar
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {detail.nama_barang}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
              #{detail.kode_transaksi}
            </span>
            <BadgeKategoriBarang kategori={detail.kategori_barang} />
            <BadgeStatus status={detail.status} />
          </div>
        </div>

        {/* Tombol Catat Pengembalian — hanya jika masih dipinjam */}
        {!sudahDikembalikan && (
          <button
            type="button"
            onClick={() => setDrawerPengembalian(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <CheckSquare size={15} />
            Catat Pengembalian
          </button>
        )}
      </div>

      {/* KONTEN UTAMA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Informasi Peminjaman */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">
              Informasi Peminjaman
            </h2>

            <div className="space-y-0.5">
              <InfoRow label="Nama Barang" value={detail.nama_barang} />
              <InfoRow label="Kategori Barang" value={labelKategoriBarang(detail.kategori_barang)} />
              <InfoRow label="Jumlah Barang" value={`${detail.jumlah_pinjam} Unit`} />
              <InfoRow label="Nama Peminjam" value={detail.nama_peminjam} />
              <InfoRow
                label="Kategori Peminjam"
                value={labelKategoriPeminjam(detail)}
              />
              {detail.kategori_peminjam === "Lainnya" && detail.kategori_peminjam_lainnya && (
                <InfoRow
                  label="Keterangan Kategori"
                  value={detail.kategori_peminjam_lainnya}
                />
              )}
              {detail.nomor_surat && (
                <InfoRow label="Nomor Surat" value={detail.nomor_surat} />
              )}
              <InfoRow label="Keperluan" value={detail.keperluan} />
              <InfoRow label="Lokasi Penggunaan" value={detail.lokasi_pakai} />
              <InfoRow
                label="Tanggal & Jam Pinjam"
                value={formatTanggalJam(detail.tanggal_pinjam)}
              />
              <InfoRow
                label="Batas Pengembalian"
                value={`${formatTanggal(detail.batas_pengembalian)}, ${formatJam(detail.batas_pengembalian)} WIB`}
              />
              {detail.nama_petugas && (
                <InfoRow label="Dicatat Oleh" value={detail.nama_petugas} />
              )}
              {sudahDikembalikan && detail.tanggal_pengembalian && (
                <InfoRow
                  label="Waktu Pengembalian"
                  value={formatTanggalJam(detail.tanggal_pengembalian)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Timeline */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-bold text-slate-900">
              Riwayat Transaksi
            </h2>

            <div className="space-y-0">
              {/* Tahap 1: Peminjaman Dicatat */}
              <TimelineItem
                selesai
                aktif={false}
                ikon={CheckCircle2}
                judul="Peminjaman Dicatat"
                deskripsi={formatTanggal(detail.tanggal_pinjam || detail.created_at)}
              />

              {/* Tahap 2: Menunggu Pengembalian */}
              <TimelineItem
                selesai={sudahDikembalikan}
                aktif={!sudahDikembalikan}
                ikon={Clock}
                judul="Menunggu Pengembalian"
                deskripsi={
                  !sudahDikembalikan
                    ? `Estimasi kembali ${formatTanggalPendek(detail.batas_pengembalian)}`
                    : `Selesai ${formatTanggalPendek(detail.tanggal_pengembalian)}`
                }
              />

              {/* Tahap 3: Barang Telah Dikembalikan */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                      sudahDikembalikan
                        ? "bg-emerald-500 ring-4 ring-emerald-100"
                        : "bg-slate-200 ring-4 ring-slate-50"
                    }`}
                  >
                    <CheckCircle2
                      size={15}
                      className="text-white"
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <p
                    className={`text-sm ${
                      sudahDikembalikan
                        ? "font-semibold text-emerald-700"
                        : "text-slate-400"
                    }`}
                  >
                    Barang Telah Dikembalikan
                  </p>
                  {sudahDikembalikan && detail.tanggal_pengembalian ? (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatTanggalJam(detail.tanggal_pengembalian)}
                    </p>
                  ) : !sudahDikembalikan ? (
                    <p className="mt-0.5 text-xs text-slate-300">
                      Belum dikembalikan.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER PENGEMBALIAN */}
      {!sudahDikembalikan && (
        <DrawerPengembalian
          open={drawerPengembalian}
          onClose={() => setDrawerPengembalian(false)}
          daftarPeminjaman={detail ? [detail] : []}
          transaksiAwal={detail}
          onBerhasil={setelahPengembalian}
        />
      )}
    </div>
  );
}
