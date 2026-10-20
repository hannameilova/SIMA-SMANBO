
"use client";

import { useEffect, useState } from "react";

const CATEGORIES = [
  "Ruang Kelas",
  "Ruang Administrasi",
  "Ruang Penunjang",
  "Lainnya",
];

function formatNama(value) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (!word) return "";

      return word
        .split("-")
        .map((part) => {
          if (!part) return "";

          if (/^[a-z]+\d+$/i.test(part)) {
            return part.toUpperCase();
          }

          if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)$/i.test(part)) {
            return part.toUpperCase();
          }

          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join("-");
    })
    .join(" ");
}

export default function LocationDrawer({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSave,
  saving = false,
}) {
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [kategoriLainnya, setKategoriLainnya] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setNama(initialData?.nama_lokasi || "");
    setKategori(initialData?.kategori || "");
    setKategoriLainnya(initialData?.kategori_lainnya || "");
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const namaLokasi = formatNama(nama.trim());
    const lainnya = kategoriLainnya.trim();

    if (namaLokasi.length < 2) {
      setError("Nama ruangan minimal 2 karakter.");
      return;
    }

    if (namaLokasi.length > 150) {
      setError("Nama ruangan maksimal 150 karakter.");
      return;
    }

    if (!/^[\p{L}][\p{L}\p{M}\p{N}\s-]*$/u.test(namaLokasi)) {
      setError("Nama ruangan harus diawali huruf dan hanya boleh berisi huruf, angka, spasi, dan tanda strip (-).");
      return;
    }

    if (!CATEGORIES.includes(kategori)) {
      setError("Silakan pilih kategori.");
      return;
    }

    if (kategori === "Lainnya" && !lainnya) {
      setError("Nama kategori lainnya wajib diisi.");
      return;
    }

    try {
      await onSave({
        nama_lokasi: namaLokasi,
        kategori,
        kategori_lainnya: kategori === "Lainnya" ? lainnya : null,
      });
    } catch (err) {
      setError(err.message || "Gagal menyimpan lokasi.");
    }
  }

  const isEdit = mode === "edit";

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
        aria-labelledby="location-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2
            id="location-drawer-title"
            className="text-base font-bold text-slate-900"
          >
            {isEdit ? "Ubah Data Lokasi Ruangan" : "Tambah Lokasi Ruangan"}
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
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <div>
              <label
                htmlFor="nama-lokasi"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                Nama Ruangan
              </label>

              <input
                id="nama-lokasi"
                type="text"
                value={nama}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
                    .replace(/\s+/g, " ")
                    .replace(/^\s+/, "");

                  setNama(value);
                }}
                placeholder="Contoh: XII Sains-2"
                minLength={2}
                maxLength={150}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                Nama ruangan harus unik per tahun ajaran.
              </p>
            </div>

            <div>
              <label
                htmlFor="kategori-lokasi"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                Kategori
              </label>

              <select
                id="kategori-lokasi"
                value={kategori}
                onChange={(event) => setKategori(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Pilih Kategori</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {kategori === "Lainnya" && (
              <div>
                <label
                  htmlFor="kategori-lainnya"
                  className="mb-2 block text-xs font-semibold text-slate-800"
                >
                  Nama Kategori Lainnya
                </label>
                <input
                  id="kategori-lainnya"
                  maxLength={100}
                  value={kategoriLainnya}
                  onChange={(event) =>
                    setKategoriLainnya(event.target.value)
                  }
                  required
                  placeholder="Masukkan nama kategori"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            <p className="text-xs leading-5 text-slate-500">
              Status dan jumlah barang belum tersedia pada API lokasi saat ini.
              Informasi tersebut tidak akan diubah melalui form ini.
            </p>

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
                  : "Simpan Lokasi/Ruangan"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
