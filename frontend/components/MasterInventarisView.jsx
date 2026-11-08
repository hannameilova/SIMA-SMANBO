"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLokasi, createLokasi, updateLokasi, deleteLokasi } from "@/lib/lokasi";
import { apiRequest } from "@/lib/api";
import LocationDrawer from "@/components/LocationDrawer";
import DataAsetPanel from "@/components/DataAsetPanel";
import { formatAngka } from "@/lib/aset";
import {
  Building2,
  ClipboardList,
  Plus,
  Search,
  Pencil,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

const KATEGORI = [
  "Ruang Kelas",
  "Ruang Administrasi",
  "Ruang Penunjang",
  "Lainnya",
];

export default function MasterInventarisView() {
  const [lokasi, setLokasi] = useState([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [selectedLokasi, setSelectedLokasi] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteLokasi, setSelectedDeleteLokasi] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAlasan, setDeleteAlasan] = useState("kesalahan_input");
  const [deleteKeterangan, setDeleteKeterangan] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [tab, setTab] = useState("aset");
  const [openCreateAsetSignal, setOpenCreateAsetSignal] = useState(0);
  const [summaryAset, setSummaryAset] = useState(null);

useEffect(() => {
  const isAnyModalOpen = drawerOpen || deleteModalOpen;

  if (!isAnyModalOpen) return;

  const previousBodyOverflow = document.body.style.overflow;
  const previousHtmlOverflow = document.documentElement.style.overflow;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousHtmlOverflow;
  };
  }, [drawerOpen, deleteModalOpen]);

  const loadLokasi = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLokasi({ search, kategori });
      setLokasi(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Gagal mengambil data lokasi.");
    } finally {
      setLoading(false);
    }
  }, [search, kategori]);

  useEffect(() => {
    loadLokasi();
  }, [loadLokasi]);

  useEffect(() => {
    const controller = new AbortController();

    apiRequest("/aset/summary", { signal: controller.signal })
      .then((response) => setSummaryAset(response.data || null))
      .catch(() => {
        if (!controller.signal.aborted) setSummaryAset(null);
      });

    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(lokasi.length / pageSize));

  const dataHalaman = useMemo(() => {
    const start = (page - 1) * pageSize;
    return lokasi.slice(start, start + pageSize);
  }, [lokasi, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function bukaTambah() {
    setDrawerMode("create");
    setSelectedLokasi(null);
    setNotice("");
    setDrawerOpen(true);
  }

  function bukaEdit(item) {
    setDrawerMode("edit");
    setSelectedLokasi(item);
    setNotice("");
    setDrawerOpen(true);
  }

  function bukaHapus(item) {
  setSelectedDeleteLokasi(item);
  setDeletePassword("");
  setDeleteAlasan("kesalahan_input");
  setDeleteKeterangan("");
  setDeleteError("");
  setShowDeletePassword(false);
  setDeleteModalOpen(true);
  }

  function tutupHapus() {
  if (deleting) return;

  setDeleteModalOpen(false);
  setSelectedDeleteLokasi(null);
  setDeletePassword("");
  setDeleteKeterangan("");
  setDeleteError("");
  }

  async function simpanLokasi(payload) {
    setSaving(true);
    setNotice("");
    setError("");

    try {
      if (drawerMode === "edit") {
        await updateLokasi(selectedLokasi.id, payload);
        setNotice("Data lokasi berhasil diperbarui.");
      } else {
        await createLokasi(payload);
        setNotice("Lokasi berhasil ditambahkan.");
      }

      setDrawerOpen(false);
      setSelectedLokasi(null);
      setPage(1);
      await loadLokasi();
    } catch (err) {
      setError(err.message || "Gagal menyimpan data lokasi.");
    } finally {
      setSaving(false);
    }
  }

  async function konfirmasiHapusLokasi(event) {
  event.preventDefault();

  if (!selectedDeleteLokasi) return;

  setDeleting(true);
  setDeleteError("");
  setNotice("");
  setError("");

  try {
    await deleteLokasi(selectedDeleteLokasi.id, {
      password: deletePassword,
      alasan: deleteAlasan,
      keterangan: deleteKeterangan.trim(),
    });

    setDeleteModalOpen(false);
    setSelectedDeleteLokasi(null);
    setDeletePassword("");
    setDeleteKeterangan("");

    setNotice(
      `Lokasi "${selectedDeleteLokasi.nama_lokasi}" berhasil dihapus.`
    );

    await loadLokasi();

  } catch (err) {
    setDeleteError(
      err.message || "Gagal menghapus lokasi."
    );
  } finally {
    setDeleting(false);
  }
  }

  const awal = lokasi.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const akhir = Math.min(page * pageSize, lokasi.length);

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
      {/* JUDUL HALAMAN */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Master Inventaris
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">
            Pusat data tunggal (single source of truth) sarana dan prasarana
            SMAN 1 Bojonggede.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (tab === "aset") {
              setOpenCreateAsetSignal((value) => value + 1);
              return;
            }
            bukaTambah();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          {tab === "aset" ? "Tambah Aset Baru" : "Tambah Lokasi/Ruangan Baru"}
        </button>
      </div>

      <div className="mb-5 flex gap-6 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("aset")}
          className={`inline-flex items-center gap-2 border-b-2 py-3 text-xs font-semibold ${
            tab === "aset"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ClipboardList size={15} />
          Data Aset
          <span
            className={`rounded px-2 py-0.5 text-[10px] ${
              tab === "aset"
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {summaryAset ? formatAngka(summaryAset.total_jenis_barang) : "—"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("lokasi")}
          className={`inline-flex items-center gap-2 border-b-2 py-3 text-xs font-semibold ${
            tab === "lokasi"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 size={15} />
          Data Lokasi/Ruangan
          <span
            className={`rounded px-2 py-0.5 text-[10px] ${
              tab === "lokasi"
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {lokasi.length}
          </span>
        </button>
      </div>

      {tab === "aset" && (
        <DataAsetPanel
          setOpenCreateSignal={setOpenCreateAsetSignal}
          openCreateSignal={openCreateAsetSignal}
          summary={summaryAset}
          onAsetChanged={() => {
            apiRequest("/aset/summary")
              .then((response) => setSummaryAset(response.data || null))
              .catch(() => setSummaryAset(null));
          }}
        />
      )}

      {tab === "lokasi" && (
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* FILTER */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
            <Search size={16} className="shrink-0 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama ruangan..."
              aria-label="Cari nama ruangan"
              className="w-full bg-transparent py-3 text-xs outline-none"
            />
          </div>

          <select
            value={kategori}
            onChange={(event) => {
              setKategori(event.target.value);
              setPage(1);
            }}
            aria-label="Filter kategori"
            className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            {KATEGORI.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* NOTIFIKASI */}
        {notice && (
          <div
            role="status"
            className="m-4 rounded-lg bg-green-50 p-3 text-xs text-green-800"
          >
            {notice}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Gagal memuat atau menyimpan data lokasi
            </p>

            <p className="mt-1 text-xs text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadLokasi}
              className="mt-3 inline-flex items-center gap-2 rounded border border-red-200 bg-white px-3 py-2 text-xs hover:bg-red-50"
            >
              <RefreshCw size={14} />
              Coba lagi
            </button>
          </div>
        )}

        {/* TABEL */}
       {/* TABEL DATA LOKASI */}
<div className="overflow-x-auto">
  <table className="w-full min-w-[600px] text-left">
    <thead className="bg-slate-50">
      <tr>
        {[
          "NAMA LOKASI/RUANGAN",
          "KATEGORI",
          "AKSI",
        ].map((kolom) => (
          <th
            key={kolom}
            className="border-b border-slate-200 px-5 py-4 text-center text-[9px] font-bold tracking-wider text-slate-500"
          >
            {kolom}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {/* Loading */}
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <tr key={index}>
            {Array.from({ length: 3 }).map((_, col) => (
              <td
                key={col}
                className="border-b border-slate-100 p-5"
              >
                <div className="h-4 animate-pulse rounded bg-slate-100" />
              </td>
            ))}
          </tr>
        ))
      ) : !error && dataHalaman.length === 0 ? (
        /* Data kosong */
        <tr>
          <td colSpan={3} className="px-5 py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Belum ada data lokasi
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Coba ubah pencarian atau tambahkan lokasi baru.
            </p>
          </td>
        </tr>
      ) : (
        /* Data lokasi */
        dataHalaman.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            {/* Nama lokasi */}
            <td className="border-b border-slate-100 px-5 py-4 text-center">
              <p className="text-xs font-semibold text-slate-800">
                {item.nama_lokasi}
              </p>
            </td>

            {/* Kategori */}
            <td className="border-b border-slate-100 px-5 py-4 text-center">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">
                {item.kategori === "Lainnya"
                  ? item.kategori_lainnya || "Lainnya"
                  : item.kategori}
              </span>
            </td>

            {/* Aksi */}
            <td className="border-b border-slate-100 px-5 py-4 text-center">
              <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => bukaEdit(item)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
              >
                <Pencil size={14} />
                Edit
              </button>

               <button
                type="button"
                onClick={() => bukaHapus(item)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Hapus
              </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

        {/* PAGINATION */}
        <footer className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="jumlah-baris">Baris per halaman:</label>

            <select
              id="jumlah-baris"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded border border-slate-200 bg-white px-2 py-1.5"
            >
              {[5, 10, 20].map((jumlah) => (
                <option key={jumlah} value={jumlah}>
                  {jumlah}
                </option>
              ))}
            </select>

            <span>
              Menampilkan {awal}–{akhir} dari {lokasi.length} ruangan
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-slate-200 px-3 py-2 disabled:opacity-40"
            >
              ‹ Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (nomor) => (
                <button
                  key={nomor}
                  type="button"
                  onClick={() => setPage(nomor)}
                  aria-current={page === nomor ? "page" : undefined}
                  className={`rounded border px-3 py-2 ${
                    page === nomor
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {nomor}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-slate-200 px-3 py-2 disabled:opacity-40"
            >
              Berikutnya ›
            </button>
          </div>
        </footer>
      </section>
      )}

      {/* DRAWER TAMBAH / EDIT */}
      <LocationDrawer
        open={drawerOpen}
        mode={drawerMode}
        initialData={selectedLokasi}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setDrawerOpen(false);
          setSelectedLokasi(null);
        }}
        onSave={simpanLokasi}
      />

      {/* MODAL HAPUS LOKASI */}
      {deleteModalOpen && selectedDeleteLokasi && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-location-title"
            className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
        <form 
          onSubmit={konfirmasiHapusLokasi}
          className="flex min-h-0 flex-1 flex-col"
        >

        {/* HEADER */}
        <div className="shrink-0 border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2
              id="delete-location-title"
              className="text-base font-bold text-slate-900"
            >
              Hapus Lokasi/Ruangan
            </h2>

            <button
              type="button"
              onClick={tutupHapus}
              disabled={deleting}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              aria-label="Tutup modal"
            >
              ✕
            </button>
          </div>

          
          {/* Peringatan */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs leading-5 text-amber-800">
              Lokasi yang masih memiliki stok aset tidak dapat
              dihapus. Penghapusan lokasi bersifat permanen.
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          {/* Informasi lokasi */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Lokasi yang akan dihapus
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {selectedDeleteLokasi.nama_lokasi}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {selectedDeleteLokasi.kategori === "Lainnya"
                ? selectedDeleteLokasi.kategori_lainnya || "Lainnya"
                : selectedDeleteLokasi.kategori}
            </p>
          </div>

          {/* Alasan */}
          <div>
            <label
              htmlFor="delete-alasan"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Alasan Penghapusan
            </label>

            <select
              id="delete-alasan"
              value={deleteAlasan}
              onChange={(event) => {
                setDeleteAlasan(event.target.value);
                setDeleteError("");
              }}
              disabled={deleting}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="kesalahan_input">
                Kesalahan input
              </option>
              <option value="data_duplikat">
                Data duplikat
              </option>
              <option value="lainnya">
                Lainnya
              </option>
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label
              htmlFor="delete-keterangan"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Keterangan{" "}
              {deleteAlasan === "lainnya" && (
                <span className="text-red-500">*</span>
              )}
            </label>

            <textarea
              id="delete-keterangan"
              value={deleteKeterangan}
              onChange={(event) =>
                setDeleteKeterangan(event.target.value)
              }
              disabled={deleting}
              maxLength={500}
              required={deleteAlasan === "lainnya"}
              rows={3}
              placeholder="Masukkan keterangan penghapusan..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-right text-[10px] text-slate-400">
              {deleteKeterangan.length}/500 karakter
            </p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="delete-password"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Password Akun Wakasek Sarpras
            </label>

            <div className="relative">
              <input
                id="delete-password"
                type={showDeletePassword ? "text" : "password"}
                value={deletePassword}
                onChange={(event) =>
                  setDeletePassword(event.target.value)
                }
                disabled={deleting}
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowDeletePassword((value) => !value)
                }
                disabled={deleting}
                aria-label={
                  showDeletePassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50"
              >
                {showDeletePassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {deleteError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              {deleteError}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={tutupHapus}
            disabled={deleting}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2 size={14} />
            {deleting ? "Menghapus..." : "Hapus Lokasi"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
