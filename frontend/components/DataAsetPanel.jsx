"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getAset,
  createAset,
  updateAset,
  getSummaryAset,
  deleteAset,
} from "@/lib/aset";
import { getLokasi } from "@/lib/lokasi";
import {
  AirVent,
  Armchair,
  Eye,
  EyeOff,
  Microscope,
  Monitor,
  Pencil,
  PenLine,
  Presentation,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
} from "lucide-react";
import AssetDrawer from "@/components/AssetDrawer";
import { apiRequest } from "@/lib/api";
import { formatAngka, labelKategori } from "@/lib/aset";

function pageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("...");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("...");
  items.push(total);
  return items;
}

export default function DataAsetPanel({
  setOpenCreateSignal,
  openCreateSignal = 0,
  summary = null,
  onAsetChanged,
}) {
  const [aset, setAset] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notice, setNotice] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [selectedAset, setSelectedAset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteAset, setSelectedDeleteAset] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAlasan, setDeleteAlasan] = useState("kesalahan_input");
  const [deleteKeterangan, setDeleteKeterangan] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [lokasiError, setLokasiError] = useState("");
  const [kategoriError, setKategoriError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [dataAset, setDataAset] = useState([]);
  const [summaryAset, setSummaryAset] = useState(null);
  const [dataLokasi, setDataLokasi] = useState([]);

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
  
  useEffect(() => {
    if (openCreateSignal > 0) {
      setDrawerMode("create");
      setSelectedAset(null);
      setNotice("");
      setDrawerOpen(true);
    }
  }, [openCreateSignal]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAset() {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (kategori) query.set("kategori", kategori);
      if (lokasi) query.set("lokasi", lokasi);

      try {
        const response = await apiRequest(
          `/aset${query.size ? `?${query.toString()}` : ""}`,
          { signal: controller.signal },
        );
        setAset(Array.isArray(response.data) ? response.data : []);
        setListError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setAset([]);
          setListError(error.message || "Gagal memuat data aset.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAset();
    return () => controller.abort();
  }, [search, kategori, lokasi, refreshVersion]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLokasi() {
      try {
        const response = await apiRequest("/aset/filter/lokasi", {
          signal: controller.signal,
        });
        setLokasiOptions(Array.isArray(response.data) ? response.data : []);
        setLokasiError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setLokasiError(error.message || "Gagal memuat daftar lokasi.");
        }
      }
    }

    loadLokasi();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadKategori() {
      try {
        const response = await apiRequest("/aset/filter/kategori", {
          signal: controller.signal,
        });
        setKategoriOptions(
          Array.isArray(response.data)
            ? response.data.map((item) => item.kategori)
            : [],
        );
        setKategoriError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setKategoriError(error.message || "Gagal memuat kategori aset.");
        }
      }
    }

    loadKategori();
    return () => controller.abort();
  }, []);

const sortedAset = [...aset].sort((a, b) =>
  a.kode_barang.localeCompare(b.kode_barang, undefined, {
    numeric: true,
    sensitivity: "base",
  })
);

const totalPages = Math.max(1, Math.ceil(sortedAset.length / pageSize));

useEffect(() => {
  if (page > totalPages) setPage(totalPages);
}, [page, totalPages]);

const dataHalaman = sortedAset.slice(
  (page - 1) * pageSize,
  page * pageSize
);

const awal =
  sortedAset.length === 0 ? 0 : (page - 1) * pageSize + 1;

const akhir = Math.min(page * pageSize, sortedAset.length);

  function mulaiMemuatFilter() {
    setPage(1);
    setLoading(true);
    setListError("");
  }

  function resetFilter() {
    setSearch("");
    setLokasi("");
    setKategori("");
    mulaiMemuatFilter();
  }

  function bukaEdit(item) {
    setDrawerMode("edit");
    setSelectedAset(item);
    setNotice("");
    setDrawerOpen(true);
  }

  function bukaHapus(item) {
  setSelectedDeleteAset(item);
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
  setSelectedDeleteAset(null);
  setDeletePassword("");
  setDeleteKeterangan("");
  setDeleteError("");
  }

  async function simpanAset(payload) {
    setSaving(true);
    setNotice("");
    try {
      const isEdit = drawerMode === "edit";
      const response = await apiRequest(
        isEdit ? `/aset/${selectedAset.id_barang}` : "/aset",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      setNotice(
        response.message ||
          (isEdit ? "Data aset berhasil diperbarui." : "Aset berhasil ditambahkan."),
      );
      setPage(1);
      setLoading(true);
      setRefreshVersion((value) => value + 1);
      onAsetChanged?.();

      setDrawerOpen(false);
      setSelectedAset(null);
    } catch (err) {
      setNotice("");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function konfirmasiHapusAset(event) {
  event.preventDefault();

  if (!selectedDeleteAset) return;

  setDeleting(true);
  setDeleteError("");
  setNotice("");
  setListError("");

  try {
    const response = await deleteAset(
      selectedDeleteAset.id_barang,
      {
        password: deletePassword,
        alasan: deleteAlasan,
        keterangan: deleteKeterangan.trim() || null,
      }
    );

    setDeleteModalOpen(false);
    setSelectedDeleteAset(null);
    setDeletePassword("");
    setDeleteKeterangan("");

    setNotice(
      response.message || "Data aset berhasil dihapus secara permanen."
    );

    // Perbarui daftar aset dan summary
    setPage(1);
    setLoading(true);
    setRefreshVersion((value) => value + 1);
    onAsetChanged?.();

  } catch (err) {
    setDeleteError(
      err.message || "Gagal menghapus data aset."
    );
  } finally {
    setDeleting(false);
  }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            TOTAL JENIS BARANG
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {summary ? formatAngka(summary.total_jenis_barang) : "—"}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Kategori Habis &amp; Tidak Habis Pakai
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            TOTAL UNIT FISIK
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {summary ? formatAngka(summary.total_unit_fisik) : "—"}
            <span className="ml-1 text-sm font-medium text-slate-400">Unit</span>
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            Tersebar di seluruh area sekolah
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {summary ? `${formatAngka(summary.total_ruangan)} Ruangan` : "—"}
            </span>
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            KONDISI BAIK (SIAP PAKAI)
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight text-emerald-600">
              {summary ? formatAngka(summary.total_kondisi_baik) : "—"}
              <span className="ml-1 text-sm font-medium text-slate-400">Unit</span>
            </p>
            <p className="mb-1 text-xs font-semibold text-slate-500">
              {summary ? `${summary.persentase_layak}% Layak` : "—"}
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${summary?.persentase_layak || 0}%` }}
            />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            PERLU PERBAIKAN
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-orange-500">
            {summary ? formatAngka(summary.total_perlu_perbaikan) : "—"}
            <span className="ml-1 text-sm font-medium text-slate-400">Unit</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {summary ? `${formatAngka(summary.total_rusak_ringan)} Rusak Ringan` : "—"}
            </span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              {summary ? `${formatAngka(summary.total_rusak_berat)} Rusak Berat` : "—"}
            </span>
          </div>
        </article>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setLoading(true);
              setListError("");
            }}
            placeholder="Cari kode atau nama barang (misal: INF-PRJ, Laptop, Kursi)..."
            aria-label="Cari kode atau nama barang"
            className="w-full bg-transparent py-3 text-xs outline-none"
          />
        </div>

        <select
          value={lokasi}
          onChange={(event) => {
            setLokasi(event.target.value);
            setPage(1);
            setLoading(true);
            setListError("");
          }}
          aria-label="Filter lokasi"
          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-blue-500"
        >
          <option value="">Semua Lokasi</option>
          {lokasiOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama_lokasi}
            </option>
          ))}
        </select>

        <select
          value={kategori}
          onChange={(event) => {
            setKategori(event.target.value);
            setPage(1);
            setLoading(true);
            setListError("");
          }}
          aria-label="Filter kategori"
          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-blue-500"
        >
          <option value="">Semua Kategori</option>
          {kategoriOptions.map((value) => (
            <option key={value} value={value}>
              {labelKategori(value)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={resetFilter}
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700"
        >
          Reset
        </button>
      </div>

      {(lokasiError || kategoriError) && (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {lokasiError || kategoriError}
        </p>
      )}

      {notice && (
        <div
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-3 text-xs text-green-800"
        >
          {notice}
        </div>
      )}

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <p className="py-3 text-sm text-slate-500 text-center">Memuat data aset...</p>
        )}
        {listError && (
          <p className="py-3 text-sm text-red-600">
            Gagal memuat data aset: {listError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "KODE",
                  "NAMA BARANG",
                  "KATEGORI",
                  "TOTAL JUMLAH",
                  "LOKASI / RUANGAN",
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-500">
                    Memuat data aset...
                  </td>
                </tr>
              ) : listError ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p role="alert" className="text-sm text-red-700">
                      {listError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true);
                        setRefreshVersion((value) => value + 1);
                      }}
                      className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Coba lagi
                    </button>
                  </td>
                </tr>
              ) : dataHalaman.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Belum ada data aset
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Coba ubah pencarian, filter, atau tambahkan aset baru.
                    </p>
                  </td>
                </tr>
              ) : (
                dataHalaman.map((item) => {
                  const habisPakai = item.kategori === "habis_pakai";

                  return (
                    <tr key={item.id_barang} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-5 py-4 text-center">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700">
                          {item.kode_barang}
                        </span>
                      </td>                
                      <td className="border-b border-slate-100 px-5 py-4 text-center">
                        <p className="text-xs font-semibold text-slate-800">
                          {item.nama_barang}
                        </p>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-center">                        
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${habisPakai
                              ? "bg-fuchsia-50 text-fuchsia-700"
                              : "bg-sky-50 text-sky-700"  
                            }`}
                          >
                            {labelKategori(item.kategori)}
                          </span>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-xs font-semibold text-slate-700 text-center">
                        {item.total_jumlah} {item.satuan || "Unit"}
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-xs text-slate-600 text-center">
                        {item.total_lokasi} Lokasi
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Detail */}
                          <Link
                            href={`/master-inventaris/${item.id_barang}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          >
                            <Eye size={14} />
                          </Link>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => bukaEdit(item)}
                            aria-label={`Edit ${item.nama_barang}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Hapus */}
                          <button
                            type="button"
                            onClick={() => bukaHapus(item)}
                            aria-label={`Hapus ${item.nama_barang}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="jumlah-baris-aset">Baris per halaman:</label>
            <select
              id="jumlah-baris-aset"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded border border-slate-200 bg-white px-2 py-1.5"
            >
              {[10, 20, 50].map((jumlah) => (
                <option key={jumlah} value={jumlah}>
                  {jumlah}
                </option>
              ))}
            </select>
            <span>
              Menampilkan {awal}-{akhir} dari {aset.length} barang
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40"
            >
              &lt; Sebelumnya
            </button>

            {pageNumbers(page, totalPages).map((nomor, index) =>
              nomor === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <button
                  key={nomor}
                  type="button"
                  onClick={() => setPage(nomor)}
                  aria-current={page === nomor ? "page" : undefined}
                  className={`min-w-8 rounded-lg border px-3 py-2 ${
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
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40"
            >
              Berikutnya &gt;
            </button>
          </div>
        </footer>
      </section>

      {/* MODAL HAPUS ASET */}
      {deleteModalOpen && selectedDeleteAset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-asset-title"
            className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <form onSubmit={konfirmasiHapusAset} 
            className="flex min-h-0 flex-1 flex-col"
          >

            {/* HEADER */}
            <div className= "shrink-0 border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <h2
                  id="delete-asset-title"
                  className="text-base font-bold text-slate-900"
                >
                  Hapus Aset
                </h2>

                <button
                  type="button"
                  onClick={tutupHapus}
                  disabled={deleting}
                  aria-label="Tutup modal"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs leading-5 text-amber-800">
                  Penghapusan aset bersifat permanen. Data stok lokasi
                  dan pengadaan yang terkait juga akan dihapus.
                </p>
              </div>
            </div>

            {/* FORM */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-6">

              {/* INFORMASI ASET */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Aset yang akan dihapus
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">   
                  {selectedDeleteAset.nama_barang}
                </p>

                <dl className="mt-3 grid grid-cols-[105px_12px_minmax(0,1fr)] gap-y-2 text-xs text-slate-500">
                  <dt>Kode Barang</dt>
                  <span>:</span>
                  <dd>{selectedDeleteAset.kode_barang}</dd>

                  <dt>Kategori</dt>
                  <span>:</span>
                  <dd>{labelKategori(selectedDeleteAset.kategori)}</dd>

                  <dt>Total Jumlah</dt>
                  <span>:</span>
                  <dd>
                  {formatAngka(selectedDeleteAset.total_jumlah)} Unit
                  </dd>

                  <dt>Lokasi</dt>
                  <span>:</span>
                  <dd>
                  {selectedDeleteAset.total_lokasi} Lokasi
                  </dd>
                </dl>
              </div>

            {/* ALASAN */}
            <div>
            <label
              htmlFor="delete-aset-alasan"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Alasan Penghapusan
            </label>

            <select
              id="delete-aset-alasan"
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

          {/* KETERANGAN */}
          <div>
            <label
              htmlFor="delete-aset-keterangan"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Keterangan{" "}
              {deleteAlasan === "lainnya" && (
                <span className="text-red-500">*</span>
              )}
            </label>

            <textarea
              id="delete-aset-keterangan"
              value={deleteKeterangan}
              onChange={(event) =>
                setDeleteKeterangan(event.target.value)
              }
              disabled={deleting}
              required={deleteAlasan === "lainnya"}
              maxLength={500}
              rows={3}
              placeholder="Masukkan keterangan penghapusan..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-right text-[10px] text-slate-400">
              {deleteKeterangan.length}/500 karakter
            </p>
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="delete-aset-password"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Password Akun Wakasek Sarpras
            </label>

            <div className="relative">
              <input
                id="delete-aset-password"
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
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700"
              >
                {showDeletePassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}
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
            {deleting ? "Menghapus..." : "Hapus Aset"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <AssetDrawer
        open={drawerOpen}
        mode={drawerMode}
        initialData={selectedAset}
        lokasiOptions={lokasiOptions}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setDrawerOpen(false);
          setSelectedAset(null);
          setOpenCreateSignal(0);
        }}
        onSave={simpanAset}
      />
    </>
  );
}
