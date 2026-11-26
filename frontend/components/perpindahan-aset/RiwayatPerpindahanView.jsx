"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import AksiNotification from "@/components/stok-opname/AksiNotification";
import PerpindahanAsetHeader from "@/components/perpindahan-aset/PerpindahanAsetHeader";
import RingkasanPerpindahan from "@/components/perpindahan-aset/RingkasanPerpindahan";
import FilterRiwayatPerpindahan from "@/components/perpindahan-aset/FilterRiwayatPerpindahan";
import PerpindahanCard from "@/components/perpindahan-aset/PerpindahanCard";
import DetailPerpindahanModal from "@/components/perpindahan-aset/DetailPerpindahanModal";
import {
  getDaftarLokasi,
  getRiwayatPerpindahan,
} from "@/lib/perpindahan-aset/api";
import {
  formatAngka,
  formatApiErrorMessage,
  hitungStatistikPerpindahan,
  toJakartaDateKey,
} from "@/lib/perpindahan-aset/utils";

const PAGE_SIZE = 5;

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

export default function RiwayatPerpindahanView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [riwayat, setRiwayat] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLokasi, setLoadingLokasi] = useState(true);
  const [error, setError] = useState("");
  const [lokasiError, setLokasiError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // State filter & pencarian
  const [search, setSearch] = useState("");
  const [idLokasiAsal, setIdLokasiAsal] = useState("");
  const [idLokasiTujuan, setIdLokasiTujuan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [page, setPage] = useState(1);

  // Modal detail
  const [selectedIdPerpindahan, setSelectedIdPerpindahan] = useState(null);

  // Notifikasi sukses setelah catat perpindahan baru (dibaca dari query ?created=)
  const [dismissedCreated, setDismissedCreated] = useState(false);
  const createdMutasi = searchParams?.get("created") || "";
  const notifikasi =
    createdMutasi && !dismissedCreated
      ? {
          tipe: "sukses",
          pesan: `Perpindahan aset (${createdMutasi}) berhasil disimpan dan dicatat ke riwayat.`,
        }
      : null;

  // Ambil data riwayat perpindahan dari API
  useEffect(() => {
    const controller = new AbortController();

    async function loadRiwayat() {
      setLoading(true);
      setError("");

      try {
        const data = await getRiwayatPerpindahan(controller.signal);
        if (!controller.signal.aborted) {
          setRiwayat(data);
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setRiwayat([]);
          setError(
            formatApiErrorMessage(
              err,
              "Gagal mengambil data riwayat perpindahan aset."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRiwayat();
    return () => controller.abort();
  }, [reloadKey]);

  // Ambil daftar lokasi untuk dropdown filter
  useEffect(() => {
    const controller = new AbortController();

    async function loadLokasi() {
      setLoadingLokasi(true);
      setLokasiError("");

      try {
        const data = await getDaftarLokasi(controller.signal);
        if (!controller.signal.aborted) {
          setLokasiOptions(data);
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setLokasiOptions([]);
          setLokasiError(
            formatApiErrorMessage(err, "Gagal mengambil daftar lokasi.")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLokasi(false);
        }
      }
    }

    loadLokasi();
    return () => controller.abort();
  }, [reloadKey]);

  // Hitung statistik dari seluruh data API
  const statistik = useMemo(
    () => hitungStatistikPerpindahan(riwayat),
    [riwayat]
  );

  // Filter & pencarian interaktif
  const filteredRiwayat = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return riwayat.filter((item) => {
      if (idLokasiAsal && String(item.id_lokasi_asal) !== String(idLokasiAsal)) {
        return false;
      }

      if (
        idLokasiTujuan &&
        String(item.id_lokasi_tujuan) !== String(idLokasiTujuan)
      ) {
        return false;
      }

      if (tanggalMulai || tanggalSelesai) {
        const itemDateKey = toJakartaDateKey(item.tanggal_perpindahan);
        if (!itemDateKey) return false;
        if (tanggalMulai && itemDateKey < tanggalMulai) return false;
        if (tanggalSelesai && itemDateKey > tanggalSelesai) return false;
      }

      if (keyword) {
        const haystack = [
          item.kode_barang,
          item.nama_barang,
          item.nomor_mutasi,
          item.nama_lokasi_asal,
          item.nama_lokasi_tujuan,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  }, [
    riwayat,
    search,
    idLokasiAsal,
    idLokasiTujuan,
    tanggalMulai,
    tanggalSelesai,
  ]);

  const hasActiveFilter = Boolean(
    search.trim() ||
      idLokasiAsal ||
      idLokasiTujuan ||
      tanggalMulai ||
      tanggalSelesai
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRiwayat.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedRiwayat = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRiwayat.slice(start, start + PAGE_SIZE);
  }, [filteredRiwayat, safePage]);

  const pageNumbers = useMemo(
    () => getPageNumbers(safePage, totalPages),
    [safePage, totalPages]
  );

  // Reset halaman ke 1 saat filter/pencarian berubah
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleLokasiAsalChange = useCallback((value) => {
    setIdLokasiAsal(value);
    setPage(1);
  }, []);

  const handleLokasiTujuanChange = useCallback((value) => {
    setIdLokasiTujuan(value);
    setPage(1);
  }, []);

  const handleTanggalMulaiChange = useCallback((value) => {
    setTanggalMulai(value);
    setPage(1);
  }, []);

  const handleTanggalSelesaiChange = useCallback((value) => {
    setTanggalSelesai(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setIdLokasiAsal("");
    setIdLokasiTujuan("");
    setTanggalMulai("");
    setTanggalSelesai("");
    setPage(1);
  }, []);

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-8 md:py-7">
        {/* Header Halaman */}
        <PerpindahanAsetHeader
          judul="Perpindahan Aset"
          deskripsi="Pencatatan mutasi fisik barang antar-ruangan sekolah secara real-time dengan pratinjau dampak stok otomatis dan jejak audit permanen."
          aksi={
            <Link
              href="/perpindahan-aset/baru"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus size={16} />
              Catat Perpindahan Baru
            </Link>
          }
        />

        {/* Notifikasi Aksi */}
        {notifikasi && (
          <div className="mt-5">
            <AksiNotification
              notifikasi={notifikasi}
              onClose={() => {
                setDismissedCreated(true);
                router.replace("/perpindahan-aset", { scroll: false });
              }}
            />
          </div>
        )}

        {/* Ringkasan Statistik */}
        <section aria-label="Ringkasan statistik perpindahan" className="mt-6">
          <RingkasanPerpindahan statistik={statistik} loading={loading} />
        </section>

        {/* Bagian Riwayat Perpindahan*/}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Riwayat Perpindahan
            </h2>
          </div>

          <div className="mt-4">
            <FilterRiwayatPerpindahan
              search={search}
              idLokasiAsal={idLokasiAsal}
              idLokasiTujuan={idLokasiTujuan}
              tanggalMulai={tanggalMulai}
              tanggalSelesai={tanggalSelesai}
              lokasiOptions={lokasiOptions}
              loadingLokasi={loadingLokasi}
              onSearchChange={handleSearchChange}
              onLokasiAsalChange={handleLokasiAsalChange}
              onLokasiTujuanChange={handleLokasiTujuanChange}
              onTanggalMulaiChange={handleTanggalMulaiChange}
              onTanggalSelesaiChange={handleTanggalSelesaiChange}
              onClearAll={handleClearFilters}
            />
          </div>

          {lokasiError && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Daftar lokasi filter gagal dimuat: {lokasiError}
            </p>
          )}

          {/* Konten Daftar Riwayat */}
          <div className="mt-5">
            {loading ? (
              <div className="space-y-3.5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
                <p className="mt-2 text-sm font-bold text-red-800">
                  Gagal Memuat Riwayat Perpindahan
                </p>
                <p className="mt-1 text-xs text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <RefreshCw size={14} />
                  Coba Lagi
                </button>
              </div>
            ) : filteredRiwayat.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ArrowLeftRight size={22} />
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {hasActiveFilter
                    ? "Tidak ada riwayat perpindahan yang sesuai"
                    : "Belum ada data perpindahan aset"}
                </h3>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                  {hasActiveFilter
                    ? "Coba ubah kata kunci pencarian atau hapus filter yang sedang aktif untuk melihat data lainnya."
                    : "Belum ada mutasi fisik barang yang tercatat. Mulai dengan mencatat perpindahan aset baru."}
                </p>

                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <RotateCcw size={14} />
                    Reset Filter
                  </button>
                ) : (
                  <Link
                    href="/perpindahan-aset/baru"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={14} />
                    Catat Perpindahan Baru
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {paginatedRiwayat.map((item) => (
                  <PerpindahanCard
                    key={item.id_perpindahan}
                    item={item}
                    onSelect={(selected) =>
                      setSelectedIdPerpindahan(selected.id_perpindahan)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredRiwayat.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              <p className="text-xs text-slate-500">
                Menampilkan halaman{" "}
                <span className="font-semibold text-slate-700">{safePage}</span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {totalPages}
                </span>{" "}
                ({formatAngka(filteredRiwayat.length)} data)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Sebelumnya
                </button>

                {pageNumbers.map((num, idx) =>
                  num === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs text-slate-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPage(num)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
                        num === safePage
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal Detail Transaksi */}
      <DetailPerpindahanModal
        idPerpindahan={selectedIdPerpindahan}
        onClose={() => setSelectedIdPerpindahan(null)}
      />
    </div>
  );
}
