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

  // Tab aktif: "dipinjam" | "dikembalikan"
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

  // Hitung ringkasan dari seluruh daftar (bukan hanya yang difilter)
  const ringkasan = useMemo(() => hitungRingkasan(daftar), [daftar]);

  // Jumlah per tab (badge)
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
    const filtered = filterPeminjaman(daftar, { query, kategori, tab });
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
    <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
      {/* BREADCRUMB */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-slate-400">
        <span>SIM Sarpras</span>
        <span className="mx-1">›</span>
        <span className="font-medium text-slate-600">
          Peminjaman & Pengembalian Aset
        </span>
      </nav>

      {/* HEADER */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Logistik Peminjaman & Pengembalian Sarpras
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">
            Pencatatan sirkulasi unit peralatan sekolah untuk guru, staf tata
            usaha, dan perwakilan OSIS/MPK.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerPengembalian(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <CheckSquare size={15} />
            Catat Pengembalian Aset
          </button>

          <button
            type="button"
            onClick={() => setDrawerPeminjaman(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus size={15} />
            Catat Peminjaman Baru
          </button>
        </div>
      </div>

      {/* NOTIFIKASI */}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          <CheckSquare size={15} />
          {notice}
        </div>
      )}

      {/* ERROR GLOBAL */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <AlertCircle size={15} />
          {error}
          <button
            type="button"
            onClick={() => loadData()}
            className="ml-auto inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-[11px] hover:bg-red-100"
          >
            <RefreshCw size={11} />
            Coba lagi
          </button>
        </div>
      )}

      {/* KARTU RINGKASAN */}
      <PeminjamanRingkasan ringkasan={ringkasan} loading={loading} />

      {/* TABEL TRANSAKSI */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* TAB */}
        <div className="flex gap-0 border-b border-slate-200 px-4">
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

        {/* FILTER BAR */}
        <PeminjamanFilterBar
          query={query}
          onQueryChange={setQuery}
          kategori={kategori}
          onKategoriChange={setKategori}
          urutan={urutan}
          onUrutanChange={setUrutan}
          onHapusFilter={hapusFilter}
        />

        {/* TABEL */}
        <PeminjamanTabel
          data={dataHalaman}
          loading={loading}
          tab={tab}
        />

        {/* PAGINATION */}
        <PeminjamanPagination
          total={dataFiltered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          label={tab === "dipinjam" ? "Transaksi Peminjaman" : "Transaksi Pengembalian"}
        />
      </div>

      {/* DRAWER PEMINJAMAN */}
      <DrawerPeminjaman
        open={drawerPeminjaman}
        onClose={() => setDrawerPeminjaman(false)}
        onBerhasil={(pesan) => {
          setDrawerPeminjaman(false);
          setelahBerhasil(pesan);
        }}
      />

      {/* DRAWER PENGEMBALIAN */}
      <DrawerPengembalian
        open={drawerPengembalian}
        onClose={() => setDrawerPengembalian(false)}
        daftarPeminjaman={daftar.filter((p) => p.status === "dipinjam")}
        onBerhasil={(pesan) => {
          setDrawerPengembalian(false);
          setelahBerhasil(pesan);
        }}
      />
    </div>
  );
}
