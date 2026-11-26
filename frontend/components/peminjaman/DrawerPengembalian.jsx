"use client";

import { useState, useEffect } from "react";
import {
  X,
  Search,
  ChevronDown,
  AlertCircle,
  Loader2,
  Info,
  MapPin,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { createPengembalian } from "@/lib/peminjaman/api";
import {
  formatTanggalJamPendek,
  formatTanggalPendek,
  hariIniISO,
  jamSekarang,
  labelKategoriBarang,
  labelKategoriPeminjam,
} from "@/lib/peminjaman/utils";

// ============================
// FIELD HELPERS
// ============================
function FieldLabel({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function FieldError({ pesan }) {
  if (!pesan) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
      <AlertCircle size={11} />
      {pesan}
    </p>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-xs font-medium text-slate-700">{value || "–"}</span>
    </div>
  );
}

// ============================
// DRAWER PENGEMBALIAN
// ============================
export default function DrawerPengembalian({
  open,
  onClose,
  daftarPeminjaman = [],
  transaksiAwal = null,  // Jika dibuka dari halaman detail dengan transaksi sudah terpilih
  onBerhasil,
}) {
  const [idPeminjaman, setIdPeminjaman] = useState("");
  const [transaksiTerpilih, setTransaksiTerpilih] = useState(null);

  const [tanggalPengembalian, setTanggalPengembalian] = useState("");
  const [jamPengembalian, setJamPengembalian] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // State dropdown transaksi
  const [openDropdown, setOpenDropdown] = useState(false);
  const [queryDropdown, setQueryDropdown] = useState("");

  // Set nilai awal ketika drawer dibuka
  useEffect(() => {
    if (!open) return;

    setTanggalPengembalian(hariIniISO());
    setJamPengembalian(jamSekarang());
    setErrors({});
    setSubmitError("");
    setQueryDropdown("");

    if (transaksiAwal) {
      setIdPeminjaman(String(transaksiAwal.id_peminjaman));
      setTransaksiTerpilih(transaksiAwal);
    } else {
      setIdPeminjaman("");
      setTransaksiTerpilih(null);
    }
  }, [open, transaksiAwal]);

  // Reset form ketika ditutup
  useEffect(() => {
    if (open) return;
    setIdPeminjaman("");
    setTransaksiTerpilih(null);
    setTanggalPengembalian("");
    setJamPengembalian("");
    setErrors({});
    setSubmitError("");
    setQueryDropdown("");
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    if (!openDropdown) return;
    function handleClick(e) {
      if (!e.target.closest("[data-dropdown-transaksi]")) setOpenDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  if (!open) return null;

  // Filter daftar transaksi aktif untuk dropdown
  const transaksiAktif = daftarPeminjaman.filter((p) => p.status === "dipinjam");

  const transaksiFiltered = queryDropdown.trim()
    ? transaksiAktif.filter(
        (p) =>
          (p.kode_transaksi || "").toLowerCase().includes(queryDropdown.toLowerCase()) ||
          (p.nama_barang || "").toLowerCase().includes(queryDropdown.toLowerCase()) ||
          (p.nama_peminjam || "").toLowerCase().includes(queryDropdown.toLowerCase())
      )
    : transaksiAktif;

  function pilihTransaksi(item) {
    setIdPeminjaman(String(item.id_peminjaman));
    setTransaksiTerpilih(item);
    setOpenDropdown(false);
    setQueryDropdown("");
    setErrors((e) => ({ ...e, idPeminjaman: undefined }));
  }

  function validate() {
    const e = {};

    if (!idPeminjaman) e.idPeminjaman = "Pilih transaksi peminjaman yang akan dikembalikan.";
    if (!tanggalPengembalian) e.tanggalPengembalian = "Tanggal pengembalian wajib diisi.";
    if (!jamPengembalian) e.jamPengembalian = "Jam pengembalian wajib diisi.";

    // Validasi waktu pengembalian harus setelah waktu peminjaman
    if (transaksiTerpilih && tanggalPengembalian && jamPengembalian) {
      const tglPinjam = transaksiTerpilih.tanggal_pinjam;
      if (tglPinjam) {
        // Ambil bagian tanggal dari tanggal_pinjam
        let tglPinjamStr, jamPinjamStr;

        const tglPinjamDate = new Date(tglPinjam);
        if (!isNaN(tglPinjamDate.getTime())) {
          // ISO format — konversi ke WIB untuk perbandingan
          const wibFormatter = new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const wibTimeFormatter = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          tglPinjamStr = wibFormatter.format(tglPinjamDate);
          jamPinjamStr = wibTimeFormatter.format(tglPinjamDate);
        } else {
          // Format lokal MySQL "YYYY-MM-DD HH:mm:ss"
          const parts = String(tglPinjam).split(" ");
          tglPinjamStr = parts[0] || "";
          jamPinjamStr = (parts[1] || "").substring(0, 5);
        }

        const waktuPinjam = `${tglPinjamStr} ${jamPinjamStr}`;
        const waktuKembali = `${tanggalPengembalian} ${jamPengembalian}`;

        if (waktuKembali <= waktuPinjam) {
          e.jamPengembalian = "Waktu pengembalian harus setelah waktu peminjaman.";
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        id_peminjaman: Number(idPeminjaman),
        tanggal_pengembalian: tanggalPengembalian,
        jam_pengembalian: jamPengembalian,
      };

      await createPengembalian(payload);
      onBerhasil("Pengembalian berhasil dicatat.");
    } catch (err) {
      setSubmitError(err.message || "Gagal mencatat pengembalian.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={() => { if (!submitting) onClose(); }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col bg-white shadow-2xl sm:w-[560px]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Catat Pengembalian Aset</h2>
          <button
            type="button"
            onClick={() => { if (!submitting) onClose(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Error submit */}
          {submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {submitError}
            </div>
          )}

          <form id="form-pengembalian" onSubmit={handleSubmit} noValidate>
            {/* ===== PILIH TRANSAKSI ===== */}
            <div className="mb-5">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Pilih Transaksi Peminjaman
              </h3>

              <FieldLabel label="Transaksi yang Dikembalikan" required>
                <div className="relative" data-dropdown-transaksi>
                  <button
                    type="button"
                    disabled={!!transaksiAwal}
                    onClick={() => setOpenDropdown((v) => !v)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                      transaksiAwal
                        ? "cursor-default border-slate-100 bg-slate-50 text-slate-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="truncate">
                      {transaksiTerpilih ? (
                        <span>
                          <span className="font-mono font-semibold text-blue-700">
                            {transaksiTerpilih.kode_transaksi}
                          </span>
                          {" "}— {transaksiTerpilih.nama_barang} · {transaksiTerpilih.nama_peminjam}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {transaksiAktif.length === 0
                            ? "Tidak ada transaksi aktif"
                            : "Cari dan pilih transaksi..."}
                        </span>
                      )}
                    </span>
                    {!transaksiAwal && (
                      <ChevronDown size={14} className="shrink-0 text-slate-400" />
                    )}
                  </button>

                  {openDropdown && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            autoFocus
                            type="text"
                            value={queryDropdown}
                            onChange={(e) => setQueryDropdown(e.target.value)}
                            placeholder="Cari kode transaksi, nama barang, atau peminjam..."
                            className="w-full rounded border border-slate-200 py-1.5 pl-7 pr-3 text-xs focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      <ul className="max-h-64 overflow-y-auto py-1">
                        {transaksiFiltered.length === 0 ? (
                          <li className="px-3 py-3 text-xs text-slate-400">
                            {transaksiAktif.length === 0
                              ? "Tidak ada transaksi peminjaman aktif."
                              : "Transaksi tidak ditemukan."}
                          </li>
                        ) : (
                          transaksiFiltered.map((item) => (
                            <li key={item.id_peminjaman}>
                              <button
                                type="button"
                                onClick={() => pilihTransaksi(item)}
                                className={`w-full px-3 py-2.5 text-left text-xs transition-colors hover:bg-blue-50 ${
                                  String(item.id_peminjaman) === idPeminjaman
                                    ? "bg-blue-50 font-semibold"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-mono font-semibold text-blue-700">
                                      {item.kode_transaksi}
                                    </span>
                                    <p className="mt-0.5 font-semibold text-slate-800">
                                      {item.nama_barang} · {item.jumlah_pinjam} unit
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      {item.nama_peminjam} · {item.lokasi_pakai}
                                    </p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <p className="text-[11px] text-slate-400">
                                      Pinjam: {formatTanggalPendek(item.tanggal_pinjam)}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      Batas: {formatTanggalPendek(item.batas_pengembalian)}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <FieldError pesan={errors.idPeminjaman} />
              </FieldLabel>
            </div>

            {/* ===== INFO TRANSAKSI TERPILIH ===== */}
            {transaksiTerpilih && (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Info size={14} className="text-blue-500" />
                  <p className="text-xs font-semibold text-slate-700">
                    Informasi Transaksi
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Nama Barang" value={transaksiTerpilih.nama_barang} />
                  <InfoRow
                    label="Kategori Barang"
                    value={labelKategoriBarang(transaksiTerpilih.kategori_barang)}
                  />
                  <InfoRow
                    label="Jumlah Barang"
                    value={`${transaksiTerpilih.jumlah_pinjam} unit`}
                  />
                  <InfoRow label="Nama Peminjam" value={transaksiTerpilih.nama_peminjam} />
                  <InfoRow
                    label="Kategori Peminjam"
                    value={labelKategoriPeminjam(transaksiTerpilih)}
                  />
                  {transaksiTerpilih.keperluan && (
                    <InfoRow label="Keperluan" value={transaksiTerpilih.keperluan} />
                  )}
                  <InfoRow label="Lokasi Penggunaan" value={transaksiTerpilih.lokasi_pakai} />
                  <InfoRow
                    label="Tanggal Pinjam"
                    value={formatTanggalJamPendek(transaksiTerpilih.tanggal_pinjam)}
                  />
                  <InfoRow
                    label="Batas Pengembalian"
                    value={formatTanggalPendek(transaksiTerpilih.batas_pengembalian)}
                  />
                </div>
              </div>
            )}

            {/* ===== WAKTU PENGEMBALIAN ===== */}
            <div className="mb-5">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Waktu Pengembalian
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FieldLabel label="Tanggal Pengembalian" required>
                  <input
                    type="date"
                    value={tanggalPengembalian}
                    onChange={(e) => {
                      setTanggalPengembalian(e.target.value);
                      setErrors((er) => ({ ...er, tanggalPengembalian: undefined }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.tanggalPengembalian} />
                </FieldLabel>

                <FieldLabel label="Jam Pengembalian" required>
                  <input
                    type="time"
                    value={jamPengembalian}
                    onChange={(e) => {
                      setJamPengembalian(e.target.value);
                      setErrors((er) => ({ ...er, jamPengembalian: undefined }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.jamPengembalian} />
                </FieldLabel>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { if (!submitting) onClose(); }}
              disabled={submitting}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="form-pengembalian"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Menyimpan..." : "Simpan Pengembalian"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
