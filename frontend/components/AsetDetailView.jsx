"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Info, Plus } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatAngka, groupLokasiPengadaan, labelKategori } from "@/lib/aset";

const KONDISI_STYLE = {
  baik: "bg-emerald-50 text-emerald-700",
  rusak_ringan: "bg-amber-50 text-amber-700",
  rusak_berat: "bg-rose-50 text-rose-700",
};

const KONDISI_LABEL = {
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
};

const KONDISI_DOT = {
  baik: "bg-emerald-500",
  rusak_ringan: "bg-amber-400",
  rusak_berat: "bg-rose-500",
};

export default function AsetDetailView() {
  const params = useParams();
  const id = params?.id;
  const [aset, setAset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [showTambahPengadaan, setShowTambahPengadaan] = useState(false);
  const [daftarLokasi, setDaftarLokasi] = useState([]);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [savingPengadaan, setSavingPengadaan] = useState(false);
  const [errorPengadaan, setErrorPengadaan] = useState("");

  const [formPengadaan, setFormPengadaan] = useState({
    tahun_pengadaan: String(new Date().getFullYear()),
    id_lokasi: "",
    jumlah: "",
  });

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function loadAset() {
      try {
        const response = await apiRequest(`/aset/${id}`, {
          signal: controller.signal,
        });
        setAset(response.data || null);
        setError("");
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setAset(null);
          setError(requestError.message || "Gagal memuat detail aset.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAset();
    return () => controller.abort();
  }, [id, retry]);

  useEffect(() => {
  if (!showTambahPengadaan) return;

  const controller = new AbortController();

  async function loadLokasi() {
    setLoadingLokasi(true);
    setErrorPengadaan("");

    try {
      const response = await apiRequest("/aset/filter/lokasi", {
        signal: controller.signal,
      });

      setDaftarLokasi(response.data || []);
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setErrorPengadaan(
          requestError.message || "Gagal memuat daftar lokasi."
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
}, [showTambahPengadaan]);

const handleTambahPengadaan = async (event) => {
  event.preventDefault();

  if (
    !Number.isInteger(Number(formPengadaan.tahun_pengadaan)) ||
    !formPengadaan.id_lokasi ||
    !Number.isInteger(Number(formPengadaan.jumlah)) ||
    Number(formPengadaan.jumlah) <= 0
  ) {
    setErrorPengadaan("Periksa kembali tahun, lokasi, dan jumlah pengadaan.");
    return;
  }

  setSavingPengadaan(true);
  setErrorPengadaan("");

  try {
    await apiRequest(`/aset/${id}/pengadaan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tahun_pengadaan: Number(formPengadaan.tahun_pengadaan),
        id_lokasi: Number(formPengadaan.id_lokasi),
        jumlah: Number(formPengadaan.jumlah),
      }),
    });

    setShowTambahPengadaan(false);

    setFormPengadaan({
      tahun_pengadaan: String(new Date().getFullYear()),
      id_lokasi: "",
      jumlah: "",
    });

    setRetry((value) => value + 1);
  } catch (requestError) {
    setErrorPengadaan(
      requestError.message || "Gagal mencatat pengadaan aset."
    );
  } finally {
    setSavingPengadaan(false);
  }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
        <p role="status" className="text-sm text-slate-500">
          Memuat detail aset...
        </p>
      </div>
    );
  }

  if (error || !aset) {
    return (
      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
        <p role="alert" className="text-sm font-semibold text-slate-800">
          {error || "Data aset tidak ditemukan."}
        </p>
        {error && (
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRetry((value) => value + 1);
            }}
            className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Coba lagi
          </button>
        )}
        <Link
          href="/master-inventaris"
          className="mt-3 block text-xs font-semibold text-blue-600"
        >
          Kembali ke Master Inventaris
        </Link>
      </div>
    );
  }

  const satuan = aset.satuan || "Unit";
  const stok = (aset.pengadaan || []).flatMap((item) => item.lokasi || []);
  const totalAktif = stok.reduce(
    (total, item) =>
      total + (item.status_penggunaan === "aktif" ? Number(item.jumlah || 0) : 0),
    0,
  );
  const totalNonaktif = stok.reduce(
    (total, item) =>
      total + (item.status_penggunaan === "nonaktif" ? Number(item.jumlah || 0) : 0),
    0,
  );
  const ringkasanKondisi = stok.reduce(
    (summary, item) => {
      if (summary[item.kondisi] !== undefined) {
        summary[item.kondisi] += Number(item.jumlah || 0);
      }
      return summary;
    },
    { baik: 0, rusak_ringan: 0, rusak_berat: 0 },
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
      <nav className="text-[11px] text-slate-400">
        <span>SIM Sarpras</span>
        <span className="mx-1.5">›</span>
        <Link href="/master-inventaris" className="hover:text-slate-600">
          Master Inventaris
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/master-inventaris" className="hover:text-slate-600">
          Data Aset
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-semibold text-blue-600">Detail Aset</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {aset.nama_barang}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-700">
          {aset.kode_barang}
        </span>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-medium text-sky-700">
          {labelKategori(aset.kategori)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Aktif
        </span>
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:grid-cols-3">
        <div className="px-4">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400">
            TOTAL UNIT
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {aset.total_jumlah} {satuan}
          </p>
        </div>
        <div className="border-slate-100 px-4 sm:border-l">
          <p className="text-[10px] font-semibold tracking-wider text-emerald-600/80">
            STOK AKTIF
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatAngka(totalAktif)} {satuan}
          </p>
        </div>
        <div className="border-slate-100 px-4 sm:border-l">
          <p className="text-[10px] font-semibold tracking-wider text-blue-600/80">
            STOK NONAKTIF
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {formatAngka(totalNonaktif)} {satuan}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-base font-bold text-slate-900">Ringkasan Kondisi</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400">
              BAIK
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatAngka(ringkasanKondisi.baik)}
              <span className="ml-1 text-sm font-medium text-slate-400">
                {satuan}
              </span>
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400">
              RUSAK RINGAN
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-500">
              {formatAngka(ringkasanKondisi.rusak_ringan)}
              <span className="ml-1 text-sm font-medium text-slate-400">
                {satuan}
              </span>
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400">
              RUSAK BERAT
            </p>
            <p className="mt-3 text-3xl font-bold text-rose-500">
              {formatAngka(ringkasanKondisi.rusak_berat)}
              <span className="ml-1 text-sm font-medium text-slate-400">
                {satuan}
              </span>
            </p>
          </article>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Rincian Tahun Pengadaan
          </h2>

          <button
            type="button"
            onClick={() => setShowTambahPengadaan(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={16} strokeWidth={2.5} />
            Tambah Pengadaan
          </button>
        </div>  
    
        <div className="mt-5 space-y-8">
          {[...(aset.pengadaan || [])]
            .sort((a, b) => Number(b.tahun_pengadaan) - Number(a.tahun_pengadaan))
            .map((pengadaan) => {
              const grouped = groupLokasiPengadaan(pengadaan.lokasi);

              return (
                <div key={pengadaan.tahun_pengadaan}>
                  <p className="mb-3 text-center text-sm font-bold text-slate-800 md:text-left">
                    {pengadaan.tahun_pengadaan}
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500">
                            NAMA RUANGAN
                          </th>
                          <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500">
                            JUMLAH
                          </th>
                          <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500">
                            KONDISI FISIK
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.map((row) => (
                          <tr key={row.id_lokasi} className="border-t border-slate-100">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <Building2 size={16} className="text-slate-400" />
                                {row.nama_lokasi}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                              {row.jumlah} {satuan}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(row.kondisi)
                                  .filter(([, count]) => count > 0)
                                  .map(([kunci, count]) => (
                                    <span
                                      key={kunci}
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${KONDISI_STYLE[kunci]}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${KONDISI_DOT[kunci]}`}
                                      />
                                      {KONDISI_LABEL[kunci]} {count}
                                    </span>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-3 flex items-start gap-2 text-[11px] text-slate-400">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    Jumlah dan kondisi diperbarui melalui Stok Opname &amp; Form
                    Perpindahan.
                  </p>
                </div>
              );
            })}
        </div>
      </section>
            {showTambahPengadaan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-tambah-pengadaan"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="judul-tambah-pengadaan"
                  className="text-lg font-bold text-slate-900"
                >
                  Tambah Pengadaan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {aset.nama_barang} · {aset.kode_barang}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTambahPengadaan(false)}
                disabled={savingPengadaan}
                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100"
                aria-label="Tutup formulir"
              >
                ×
              </button>
            </div>

            {errorPengadaan && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
              >
                {errorPengadaan}
              </p>
            )}

            <form
              onSubmit={handleTambahPengadaan}
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="tahun-pengadaan"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Tahun Pengadaan
                </label>

                <input
                  id="tahun-pengadaan"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  step="1"
                  required
                  value={formPengadaan.tahun_pengadaan}
                  onChange={(event) =>
                    setFormPengadaan((form) => ({
                      ...form,
                      tahun_pengadaan: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lokasi-pengadaan"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Lokasi/Ruangan
                </label>

                <select
                  id="lokasi-pengadaan"
                  required
                  value={formPengadaan.id_lokasi}
                  onChange={(event) =>
                    setFormPengadaan((form) => ({
                      ...form,
                      id_lokasi: event.target.value,
                    }))
                  }
                  disabled={loadingLokasi || daftarLokasi.length === 0}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingLokasi
                      ? "Memuat lokasi..."
                      : daftarLokasi.length === 0
                        ? "Lokasi tidak tersedia"
                        : "Pilih lokasi"}
                  </option>

                  {daftarLokasi.map((lokasi) => (
                    <option key={lokasi.id} value={lokasi.id}>
                      {lokasi.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="jumlah-pengadaan"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Jumlah Unit
                </label>

                <input
                  id="jumlah-pengadaan"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formPengadaan.jumlah}
                  onChange={(event) =>
                    setFormPengadaan((form) => ({
                      ...form,
                      jumlah: event.target.value,
                    }))
                  }
                  placeholder="Masukkan jumlah unit"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTambahPengadaan(false)}
                  disabled={savingPengadaan}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    savingPengadaan ||
                    loadingLokasi ||
                    daftarLokasi.length === 0
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPengadaan ? "Menyimpan..." : "Simpan Pengadaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
