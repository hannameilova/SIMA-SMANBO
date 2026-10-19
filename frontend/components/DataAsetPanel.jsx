"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AirVent,
  Armchair,
  Eye,
  Microscope,
  Monitor,
  Pencil,
  PenLine,
  Presentation,
  Search,
  ShieldCheck,
  Table2,
} from "lucide-react";
import AssetDrawer from "@/components/AssetDrawer";
import {
  MOCK_LOKASI_FILTER,
  MOCK_SUMMARY,
  createMockAset,
  filterMockAset,
  formatAngka,
  labelKategori,
  updateMockAset,
} from "@/lib/mockAset";

const IKON_MAP = {
  projector: Presentation,
  pc: Monitor,
  meja: Table2,
  kursi: Armchair,
  "meja-guru": Table2,
  mikroskop: Microscope,
  spidol: PenLine,
  ac: AirVent,
  lainnya: Presentation,
};

const IKON_STYLE = {
  projector: "bg-blue-50 text-blue-600",
  pc: "bg-sky-50 text-sky-600",
  meja: "bg-amber-50 text-amber-600",
  kursi: "bg-orange-50 text-orange-600",
  "meja-guru": "bg-orange-50 text-orange-600",
  mikroskop: "bg-emerald-50 text-emerald-600",
  spidol: "bg-violet-50 text-violet-600",
  ac: "bg-indigo-50 text-indigo-600",
  lainnya: "bg-slate-100 text-slate-600",
};

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

export default function DataAsetPanel({ openCreateSignal = 0 }) {
  const [versi, setVersi] = useState(0);
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

  useEffect(() => {
    if (openCreateSignal > 0) {
      setDrawerMode("create");
      setSelectedAset(null);
      setNotice("");
      setDrawerOpen(true);
    }
  }, [openCreateSignal]);

  const filtered = useMemo(() => {
    void versi;
    return filterMockAset({ search, kategori, lokasi });
  }, [search, kategori, lokasi, versi]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const dataHalaman = filtered.slice((page - 1) * pageSize, page * pageSize);
  const awal = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const akhir = Math.min(page * pageSize, filtered.length);

  function resetFilter() {
    setSearch("");
    setLokasi("");
    setKategori("");
    setPage(1);
  }

  function bukaEdit(item) {
    setDrawerMode("edit");
    setSelectedAset(item);
    setNotice("");
    setDrawerOpen(true);
  }

  function simpanAset(payload) {
    setSaving(true);
    setNotice("");

    try {
      if (drawerMode === "edit") {
        updateMockAset(selectedAset.id_barang, payload);
        setNotice("Data aset berhasil diperbarui.");
      } else {
        createMockAset(payload);
        setNotice("Aset berhasil ditambahkan.");
        setPage(1);
      }

      setVersi((value) => value + 1);
      setDrawerOpen(false);
      setSelectedAset(null);
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
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
            {formatAngka(MOCK_SUMMARY.totalJenis)}
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
            {formatAngka(MOCK_SUMMARY.totalUnit)}
            <span className="ml-1 text-sm font-medium text-slate-400">Unit</span>
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            Tersebar di seluruh area sekolah
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {MOCK_SUMMARY.totalRuangan} Ruangan
            </span>
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            KONDISI BAIK (SIAP PAKAI)
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight text-emerald-600">
              {formatAngka(MOCK_SUMMARY.kondisiBaik)}
              <span className="ml-1 text-sm font-medium text-slate-400">Unit</span>
            </p>
            <p className="mb-1 text-xs font-semibold text-slate-500">
              {MOCK_SUMMARY.persenLayak}% Layak
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${MOCK_SUMMARY.persenLayak}%` }}
            />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            PERLU PERBAIKAN
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-orange-500">
            {formatAngka(MOCK_SUMMARY.perluPerbaikan)}
            <span className="ml-1 text-sm font-medium text-slate-400">Unit</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {MOCK_SUMMARY.rusakRingan} Rusak Ringan
            </span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              {MOCK_SUMMARY.rusakBerat} Rusak Berat
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
          }}
          aria-label="Filter lokasi"
          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-blue-500"
        >
          <option value="">Semua Lokasi</option>
          {MOCK_LOKASI_FILTER.map((item) => 
            [1, 2].includes(item.id)
          ).map((item) => (
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
          }}
          aria-label="Filter kategori"
          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs outline-none focus:border-blue-500"
        >
          <option value="">Semua Kategori</option>
          <option value="tidak_habis_pakai">Tidak Habis Pakai</option>
          <option value="habis_pakai">Habis Pakai</option>
        </select>

        <button
          type="button"
          onClick={resetFilter}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-3 text-xs text-green-800"
        >
          {notice}
        </div>
      )}

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "KODE",
                  "NAMA BARANG & SPESIFIKASI",
                  "KATEGORI",
                  "TOTAL JUMLAH",
                  "LOKASI / RUANGAN",
                  "AKSI",
                ].map((kolom) => (
                  <th
                    key={kolom}
                    className="border-b border-slate-200 px-5 py-4 text-[9px] font-bold tracking-wider text-slate-500"
                  >
                    {kolom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataHalaman.length === 0 ? (
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
                  const Ikon = IKON_MAP[item.ikon] || Presentation;
                  const ikonClass = IKON_STYLE[item.ikon] || IKON_STYLE.lainnya;
                  const habisPakai = item.kategori === "habis_pakai";

                  return (
                    <tr key={item.id_barang} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700">
                          {item.kode_barang}
                        </span>
                      </td>                
                      <td className="border-b border-slate-100 px-5 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {item.nama_barang}
                        </p>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">                        
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${habisPakai
                              ? "bg-fuchsia-50 text-fuchsia-700"
                              : "bg-sky-50 text-sky-700"  
                            }`}
                          >
                            {labelKategori(item.kategori)}
                          </span>
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-xs font-semibold text-slate-700">
                        {item.total_jumlah} {item.satuan}
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4 text-xs text-slate-600">
                        {item.total_lokasi} Lokasi
                      </td>
                      <td className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/master-inventaris/${item.id_barang}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                          >
                            <Eye size={14} />
                            Detail
                          </Link>
                          <button
                            type="button"
                            onClick={() => bukaEdit(item)}
                            aria-label={`Ubah ${item.nama_barang}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          >
                            <Pencil size={15} />
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
              Menampilkan {awal}-{akhir} dari {filtered.length} barang
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

      <aside className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 text-xs leading-6 text-slate-600">
        <p className="flex items-center gap-2 font-semibold text-blue-700">
          <ShieldCheck size={16} />
          Prinsip Master Inventaris SMAN 1 Bojonggede
        </p>
        <p className="mt-1">
          Jumlah dan kondisi fisik barang diperbarui secara resmi melalui modul
          Stok Opname (BR-08) dan transaksi Perpindahan Aset. Fitur penghapusan
          fisik secara permanen dinonaktifkan demi mempertahankan integritas
          riwayat dan audit trail (DR-04). Barang yang tidak digunakan
          diarsipkan melalui pengaturan status nonaktif.
        </p>
      </aside>

      <AssetDrawer
        open={drawerOpen}
        mode={drawerMode}
        initialData={selectedAset}
        lokasiOptions={MOCK_LOKASI_FILTER}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setDrawerOpen(false);
          setSelectedAset(null);
        }}
        onSave={simpanAset}
      />
    </>
  );
}
