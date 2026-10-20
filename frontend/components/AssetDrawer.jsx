"use client";

import { useEffect, useMemo, useState } from "react";
import { labelKategori } from "@/lib/aset";

const KATEGORI_OPTIONS = [
  { value: "tidak_habis_pakai", label: "Tidak Habis Pakai" },
  { value: "habis_pakai", label: "Habis Pakai" },
];

export default function AssetDrawer({
  open,
  mode = "create",
  initialData = null,
  lokasiOptions = [],
  saving = false,
  onClose,
  onSave,
}) {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [tahun, setTahun] = useState("");
  const [idLokasi, setIdLokasi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [error, setError] = useState("");

  const tahunOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, index) => current - index);
  }, []);

  useEffect(() => {
    if (!open) return;

    setNama(initialData?.nama_barang || "");
    setKategori(initialData?.kategori || "");
    setTahun("");
    setIdLokasi("");
    setJumlah("");
    setError("");
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
      if (event.key === "Escape" && !saving) onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, saving, onClose]);

  if (!open) return null;

  const isEdit = mode === "edit";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const namaBarang = nama.trim();

    if (namaBarang.length < 2) {
      setError("Nama barang minimal 2 karakter.");
      return;
    }

    if (namaBarang.length > 150) {
      setError("Nama barang maksimal 150 karakter.");
      return;
    }

    if (!/^[\p{L}][\p{L}\p{M}\p{N}\s-]*$/u.test(namaBarang)) {
      setError(
        "Nama barang harus diawali huruf dan hanya boleh berisi huruf, angka, spasi, dan tanda strip (-)."
      );
      return;
    }

    if (!namaBarang) {
      setError("Nama barang wajib diisi.");
      return;
    }

    if (!/^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u.test(namaBarang)) {
      setError("Nama barang hanya boleh berisi huruf dan spasi.");
      return;
    }

    if (!KATEGORI_OPTIONS.some((item) => item.value === kategori)) {
      setError("Silakan pilih kategori.");
      return;
    }

    if (isEdit) {
      try {
        await onSave({
          nama_barang: namaBarang,
          kategori,
        });
      } catch (err) {
        setError(err.message || "Gagal menyimpan data barang.");
      }
      return;
    }

    const tahunPengadaan = Number(tahun);
    const tahunSekarang = new Date().getFullYear();

    if (
      !Number.isInteger(tahunPengadaan) ||
      tahunPengadaan < 1900 ||
      tahunPengadaan > tahunSekarang
    ) {
      setError("Tahun pengadaan tidak valid.");
      return;
    }

    const lokasiId = Number(idLokasi);
    if (!Number.isInteger(lokasiId) || lokasiId <= 0) {
      setError("Lokasi tidak valid.");
      return;
    }

    const jumlahBarang = Number(jumlah);
    if (!Number.isInteger(jumlahBarang) || jumlahBarang <= 0) {
      setError("Jumlah harus berupa bilangan bulat lebih dari 0.");
      return;
    }

    try {
      await onSave({
        nama_barang: namaBarang,
        kategori,
        tahun_pengadaan: tahunPengadaan,
        id_lokasi: lokasiId,
        jumlah: jumlahBarang,
      });
    } catch (err) {
      setError(err.message || "Gagal menyimpan data barang.");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup drawer"
        onClick={onClose}
        disabled={saving}
        className="absolute inset-0 bg-slate-950/40"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2
            id="asset-drawer-title"
            className="text-base font-bold text-slate-900"
          >
            {isEdit ? "Ubah Data Barang" : "Tambah Aset Baru"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <section>
              <h3 className="text-sm font-semibold text-slate-900">
                Informasi Dasar
              </h3>

              {isEdit && (
                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-medium text-sky-700">
                      {labelKategori(initialData?.kategori)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold text-slate-900">
                    {initialData?.nama_barang}
                  </p>
                </div>
              )}

              {isEdit && (
                <div className="mt-5">
                  <label
                    htmlFor="kode-barang"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    Kode Barang
                  </label>
                  <input
                    id="kode-barang"
                    value={initialData?.kode_barang || ""}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-3 text-sm text-slate-600"
                  />
                </div>
              )}

              <div className={isEdit ? "mt-5" : "mt-4"}>
                <label
                  htmlFor="nama-barang"
                  className="mb-2 block text-xs font-semibold text-slate-800"
                >
                  Nama Barang
                </label>
                <input
                  id="nama-barang"
                  autoFocus
                  type="text"
                  value={nama}
                  onChange={(event) => {
                  const value = event.target.value
                    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
                    .replace(/\s+/g, " ")
                    .replace(/^\s+/, "");

                  setNama(value);
                  }}
                  placeholder="Contoh: Proyektor Epson EB-X600"
                  minLength={2}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                </div>

              <div className="mt-5">
                <label
                  htmlFor="kategori-barang"
                  className="mb-2 block text-xs font-semibold text-slate-800"
                >
                  Kategori
                </label>
                <select
                  id="kategori-barang"
                  value={kategori}
                  onChange={(event) => setKategori(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Pilih Kategori</option>
                  {KATEGORI_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {!isEdit && (
              <section>
                <h3 className="text-sm font-semibold text-slate-900">
                  Rincian Pengadaan Awal
                </h3>

                <div className="mt-4">
                  <label
                    htmlFor="tahun-pengadaan"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    Tahun Pengadaan
                  </label>
                  <input
                    type="number"
                    id="tahun-pengadaan"
                    value={tahun}
                    onChange={(event) => setTahun(event.target.value)}
                    placeholder="Contoh: 2025"
                    min="1900"
                    max={new Date().getFullYear()}
                    step="1"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="lokasi-awal"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    Lokasi
                  </label>
                  <select
                    id="lokasi-awal"
                    value={idLokasi}
                    onChange={(event) => setIdLokasi(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Pilih Lokasi/Ruangan</option>
                    {lokasiOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama_lokasi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="total-jumlah"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    Total Jumlah
                  </label>
                  <input
                    id="total-jumlah"
                    type="number"
                    min="1"
                    step="1"
                    value={jumlah}
                    onChange={(event) => setJumlah(event.target.value)}
                    placeholder="Masukkan jumlah unit"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </section>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              {saving
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Simpan Data Barang"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
