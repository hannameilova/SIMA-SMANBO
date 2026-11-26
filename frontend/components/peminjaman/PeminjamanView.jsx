"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardList,
  History,
  Plus,
  RefreshCw,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { getDaftarPeminjaman } from "@/lib/peminjaman/api";
import {
  hitungRingkasan,
  filterPeminjaman,
  urutkanPeminjaman,
} from "@/lib/peminjaman/utils";
import PerpindahanAsetHeader from "@/components/perpindahan-aset/PerpindahanAsetHeader";
import PeminjamanRingkasan from "./PeminjamanRingkasan";
import PeminjamanTabel from "./PeminjamanTabel";
import PeminjamanPagination from "./PeminjamanPagination";
import PeminjamanFilterBar from "./PeminjamanFilterBar";
import DrawerPeminjaman from "./DrawerPeminjaman";
import DrawerPengembalian from "./DrawerPengembalian";

export default function PeminjamanView() {
  const [daftar, setDaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tab aktif
  const [tab, setTab] = useState("dipinjam");

  // Filter & urutan
  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState("semua");
  const [urutan, setUrutan] = useState("terbaru");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer
  const [drawerPeminjaman, setDrawerPeminjaman] = useState(false);
  const [drawerPengembalian, setDrawerPengembalian] = useState(false);

  // Notifikasi sukses
  const [notice, setNotice] = useState("");

  // Ambil data dari backend
  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const data = await getDaftarPeminjaman(signal);
      setDaftar(data);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err.message || "Gagal mengambil data peminjaman.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  // Kunci scroll ketika drawer terbuka
  useEffect(() => {
    const isOpen = drawerPeminjaman || drawerPengembalian;

    if (isOpen) {
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
  }, [drawerPeminjaman, drawerPengembalian]);

  // Sembunyikan notice setelah 4 detik
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  // Reset page ketika filter berubah
  useEffect(() => {
    setPage(1);
  }, [query, kategori, urutan, tab]);

  // Hitung ringkasan dari seluruh daftar
  const ringkasan = useMemo(() => hitungRingkasan(daftar), [daftar]);

  // Jumlah per tab
  const jumlahDipinjam = useMemo(
    () => daftar.filter((p) => p.status === "dipinjam").length,
    [daftar]
  );

  const jumlahDikembalikan = useMemo(
    () => daftar.filter((p) => p.status === "dikembalikan").length,
    [daftar]
  );

  // Data setelah filter dan urutan
  const dataFiltered = useMemo(() => {
    const filtered = filterPeminjaman(daftar, {
      query,
      kategori,
      tab,
    });

    return urutkanPeminjaman(filtered, urutan);
  }, [daftar, query, kategori, tab, urutan]);

  // Data untuk halaman saat ini
  const dataHalaman = useMemo(() => {
    const start = (page - 1) * pageSize;
    return dataFiltered.slice(start, start + pageSize);
  }, [dataFiltered, page, pageSize]);

  function hapusFilter() {
    setQuery("");
    setKategori("semua");
    setUrutan("terbaru");
    setPage(1);
  }

  async function setelahBerhasil(pesan) {
    setNotice(pesan);

    const controller = new AbortController();
    await loadData(controller.signal);
  }

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-8 md:py-7">
        {/* Header Halaman */}
        <PerpindahanAsetHeader
          judul="Peminjaman & Pengembalian Sarana Prasarana"
          deskripsi="Pencatatan sirkulasi unit peralatan sekolah untuk seluruh warga sekolah."
          aksi={
            <button
              type="button"
              onClick={() => setDrawerPeminjaman(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus size={16} />
              Catat Peminjaman Baru
            </button>
          }
        />

        {/* Notifikasi Sukses */}
        {notice && (
          <div className="mt-5">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
              <CheckSquare size={15} />
              {notice}
            </div>
          </div>
        )}

        {/* Error Global */}
        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <AlertCircle size={15} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadData()}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              <RefreshCw size={14} />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Ringkasan Statistik */}
        <section
          aria-label="Ringkasan statistik peminjaman"
          className="mt-6"
        >
          <PeminjamanRingkasan
            ringkasan={ringkasan}
            loading={loading}
          />
        </section>

        {/* Daftar Transaksi */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Daftar Transaksi
            </h2>
          </div>

          {/* Tab Transaksi */}
          <div className="mt-4 flex gap-0 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTab("dipinjam")}
              className={`inline-flex items-center gap-2 border-b-2 py-3.5 pr-5 text-xs font-semibold transition-colors ${
                tab === "dipinjam"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardList size={15} strokeWidth={1.8} />
              Sedang Dipinjam

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  tab === "dipinjam"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {loading ? "..." : jumlahDipinjam}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab("dikembalikan")}
              className={`inline-flex items-center gap-2 border-b-2 py-3.5 pr-5 text-xs font-semibold transition-colors ${
                tab === "dikembalikan"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <History size={15} strokeWidth={1.8} />
              Riwayat Dikembalikan

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  tab === "dikembalikan"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {loading ? "..." : jumlahDikembalikan}
              </span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="mt-4">
            <PeminjamanFilterBar
              query={query}
              onQueryChange={setQuery}
              kategori={kategori}
              onKategoriChange={setKategori}
              urutan={urutan}
              onUrutanChange={setUrutan}
              onHapusFilter={hapusFilter}
            />
          </div>

          {/* Tabel Transaksi */}
          <div className="mt-5">
            <PeminjamanTabel
              data={dataHalaman}
              loading={loading}
              tab={tab}
            />
          </div>

          {/* Pagination */}
          <PeminjamanPagination
            total={dataFiltered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            label={
              tab === "dipinjam"
                ? "Transaksi Peminjaman"
                : "Transaksi Pengembalian"
            }
          />
        </section>
      </div>

      {/* Drawer Peminjaman */}
      <DrawerPeminjaman
        open={drawerPeminjaman}
        onClose={() => setDrawerPeminjaman(false)}
        onBerhasil={(pesan) => {
          setDrawerPeminjaman(false);
          setelahBerhasil(pesan);
        }}
      />

      {/* Drawer Pengembalian */}
      <DrawerPengembalian
        open={drawerPengembalian}
        onClose={() => setDrawerPengembalian(false)}
        daftarPeminjaman={daftar.filter(
          (p) => p.status === "dipinjam"
        )}
        onBerhasil={(pesan) => {
          setDrawerPengembalian(false);
          setelahBerhasil(pesan);
        }}
      />
    </div>
  );
}