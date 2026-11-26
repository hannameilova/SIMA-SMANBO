"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  ChevronDown,
  AlertCircle,
  Loader2,
  Package,
  Info,
} from "lucide-react";
import { createPeminjaman, getDaftarBarangPeminjaman, getDaftarLokasiPeminjaman } from "@/lib/peminjaman/api";
import { hariIniISO, jamSekarang, validasiWaktuPengembalian } from "@/lib/peminjaman/utils";

// ============================
// SearchableSelect — Dropdown Searchable
// ============================
function SearchableSelect({ options, value, onChange, placeholder = "Pilih...", renderOption, getLabel, renderSelected, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? options.filter((opt) => getLabel(opt).toLowerCase().includes(q.toLowerCase()))
    : options;

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (!e.target.closest("[data-searchable-select]")) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" data-searchable-select>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          disabled
            ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        }`}
      >
        <span className="truncate">
          {selected ? (renderSelected ? renderSelected(selected) : getLabel(selected)) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={14} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari..."
                className="w-full rounded border border-slate-200 py-1.5 pl-7 pr-3 text-xs focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-slate-400">Tidak ada hasil.</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => { onChange(opt.value, opt); setOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-blue-50 ${
                      opt.value === value ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700"
                    }`}
                  >
                    {renderOption ? renderOption(opt) : getLabel(opt)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================
// FIELD SECTION
// ============================
function FieldSection({ judul, children }) {
  return (
    <div className="mb-5">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {judul}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

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

// ============================
// DRAWER PEMINJAMAN
// ============================
export default function DrawerPeminjaman({ open, onClose, onBerhasil }) {
  // Data master
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [daftarLokasi, setDaftarLokasi] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [errorMaster, setErrorMaster] = useState("");

  // Form state
  const [idBarang, setIdBarang] = useState("");
  const [barangTerpilih, setBarangTerpilih] = useState(null);
  const [jumlahPinjam, setJumlahPinjam] = useState("");
  const [idLokasi, setIdLokasi] = useState("");
  const [kategoriPeminjam, setKategoriPeminjam] = useState("");
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [kategoriLainnya, setKategoriLainnya] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [tanggalPinjam, setTanggalPinjam] = useState("");
  const [jamPinjam, setJamPinjam] = useState("");
  const [batasPengembalian, setBatasPengembalian] = useState("");
  const [jamBatas, setJamBatas] = useState("");

  // Error per field
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load master data saat drawer dibuka
  const loadMaster = useCallback(async (signal) => {
    setLoadingMaster(true);
    setErrorMaster("");
    try {
      const [barang, lokasi] = await Promise.all([
        getDaftarBarangPeminjaman(signal),
        getDaftarLokasiPeminjaman(signal),
      ]);
      setDaftarBarang(barang);
      setDaftarLokasi(lokasi);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setErrorMaster(err.message || "Gagal mengambil data master.");
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    loadMaster(controller.signal);

    // Set default waktu
    setTanggalPinjam(hariIniISO());
    setJamPinjam(jamSekarang());
    setBatasPengembalian(hariIniISO());
    setJamBatas("");

    return () => controller.abort();
  }, [open, loadMaster]);

  // Reset form ketika drawer ditutup
  useEffect(() => {
    if (open) return;
    setIdBarang("");
    setBarangTerpilih(null);
    setJumlahPinjam("");
    setIdLokasi("");
    setKategoriPeminjam("");
    setNamaPeminjam("");
    setNomorSurat("");
    setKategoriLainnya("");
    setKeperluan("");
    setTanggalPinjam("");
    setJamPinjam("");
    setBatasPengembalian("");
    setJamBatas("");
    setErrors({});
    setSubmitError("");
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

  if (!open) return null;

  // Opsi barang untuk dropdown
  const opsiBarang = daftarBarang.map((b) => ({
    value: String(b.id_barang),
    label: b.nama_barang,
    kategori: b.kategori,
    stok_tersedia: b.stok_tersedia,
    raw: b,
  }));

  // Opsi lokasi untuk dropdown
  const opsiLokasi = daftarLokasi.map((l) => ({
    value: String(l.id || l.id_lokasi),
    label: l.nama_lokasi,
    raw: l,
  }));

  function validate() {
    const e = {};

    if (!idBarang) e.idBarang = "Pilih barang yang akan dipinjam.";
    if (!jumlahPinjam || isNaN(Number(jumlahPinjam)) || Number(jumlahPinjam) <= 0)
      e.jumlahPinjam = "Jumlah harus lebih dari 0.";
    if (jumlahPinjam && barangTerpilih?.stok_tersedia !== undefined) {
      const stok = Number(barangTerpilih.stok_tersedia ?? 0);
      if (Number(jumlahPinjam) > stok)
        e.jumlahPinjam = `Jumlah melebihi stok tersedia (${stok} unit).`;
    }
    if (!Number.isInteger(Number(jumlahPinjam)) || String(jumlahPinjam).includes("."))
      e.jumlahPinjam = "Jumlah harus berupa angka bulat.";

    if (!idLokasi) e.idLokasi = "Pilih lokasi penggunaan.";

    if (!kategoriPeminjam) e.kategoriPeminjam = "Pilih kategori peminjam.";
    if (!namaPeminjam.trim()) e.namaPeminjam = "Nama peminjam wajib diisi.";

    if (kategoriPeminjam === "OSIS/MPK" || kategoriPeminjam === "Lainnya") {
      if (!nomorSurat.trim()) e.nomorSurat = "Nomor surat pengajuan wajib diisi.";
    }

    if (kategoriPeminjam === "Lainnya") {
      if (!kategoriLainnya.trim())
        e.kategoriLainnya = "Keterangan kategori lainnya wajib diisi.";
    }

    if (!keperluan.trim()) e.keperluan = "Keperluan wajib diisi.";

    if (!tanggalPinjam) e.tanggalPinjam = "Tanggal pinjam wajib diisi.";
    if (!jamPinjam) e.jamPinjam = "Jam pinjam wajib diisi.";
    if (!batasPengembalian) e.batasPengembalian = "Batas pengembalian wajib diisi.";
    if (!jamBatas) e.jamBatas = "Jam batas pengembalian wajib diisi.";

    if (tanggalPinjam && jamPinjam && batasPengembalian && jamBatas) {
      if (!validasiWaktuPengembalian(tanggalPinjam, jamPinjam, batasPengembalian, jamBatas)) {
        e.jamBatas = "Waktu pengembalian harus setelah waktu peminjaman.";
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
        id_barang: Number(idBarang),
        id_lokasi_pakai: Number(idLokasi),
        nama_peminjam: namaPeminjam.trim(),
        kategori_peminjam: kategoriPeminjam,
        kategori_peminjam_lainnya: kategoriPeminjam === "Lainnya" ? kategoriLainnya.trim() : null,
        nomor_surat: kategoriPeminjam === "Guru" ? null : nomorSurat.trim(),
        keperluan: keperluan.trim(),
        jumlah_pinjam: Number(jumlahPinjam),
        tanggal_pinjam: tanggalPinjam,
        jam_pinjam: jamPinjam,
        batas_pengembalian: batasPengembalian,
        jam_batas_pengembalian: jamBatas,
      };

      await createPeminjaman(payload);
      onBerhasil("Peminjaman berhasil dicatat.");
    } catch (err) {
      setSubmitError(err.message || "Gagal mencatat peminjaman.");
    } finally {
      setSubmitting(false);
    }
  }

  const stokTersedia = barangTerpilih?.stok_tersedia;

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
          <h2 className="text-sm font-bold text-slate-900">Catat Peminjaman</h2>
          <button
            type="button"
            onClick={() => { if (!submitting) onClose(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Error master */}
          {errorMaster && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal memuat data master</p>
                <p className="mt-0.5">{errorMaster}</p>
                <p className="mt-1 text-amber-600">
                  Pastikan Anda memiliki akses ke endpoint /aset dan /lokasi.
                </p>
              </div>
            </div>
          )}

          {/* Error submit */}
          {submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {submitError}
            </div>
          )}

          <form id="form-peminjaman" onSubmit={handleSubmit} noValidate>
            {/* ===== INFORMASI BARANG ===== */}
            <FieldSection judul="Informasi Barang">
              <FieldLabel label="Pilih Aset" required>
                {loadingMaster ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-400">
                    <Loader2 size={13} className="animate-spin" />
                    Memuat daftar barang...
                  </div>
                ) : (
                  <SearchableSelect
                    options={opsiBarang}
                    value={idBarang}
                    onChange={(val, opt) => {
                      setIdBarang(val);
                      setBarangTerpilih(opt);
                      setErrors((e) => ({ ...e, idBarang: undefined }));
                    }}
                    placeholder="Cari dan pilih barang..."
                    getLabel={(opt) => opt.label}
                    renderOption={(opt) => (
                      <div>
                        <p className="font-semibold text-slate-800">{opt.label}</p>
                        <p className="text-[11px] text-slate-400">
                          {opt.kategori === "habis_pakai" ? "Habis Pakai" : "Tidak Habis Pakai"}
                          {opt.stok_tersedia !== undefined && (
                            <> · Stok tersedia: {opt.stok_tersedia} unit</>
                          )}
                        </p>
                      </div>
                    )}
                    renderSelected={(opt) => (
                      <span className="font-medium text-slate-800">{opt.label}</span>
                    )}
                  />
                )}
                <FieldError pesan={errors.idBarang} />
              </FieldLabel>

              {/* Info stok tersedia */}
              {barangTerpilih && stok_tersedia !== undefined && (
                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">
                  <Info size={13} />
                  Stok tersedia saat ini: <strong>{barangTerpilih.stok_tersedia} unit</strong>
                </div>
              )}

              <FieldLabel label="Jumlah Unit" required>
                <input
                  type="number"
                  min={1}
                  value={jumlahPinjam}
                  onChange={(e) => {
                    setJumlahPinjam(e.target.value);
                    setErrors((er) => ({ ...er, jumlahPinjam: undefined }));
                  }}
                  placeholder="Contoh: 2"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {barangTerpilih && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Stok tersedia: {barangTerpilih.stok_tersedia ?? "–"} unit
                  </p>
                )}
                <FieldError pesan={errors.jumlahPinjam} />
              </FieldLabel>
            </FieldSection>

            {/* ===== INFORMASI PEMINJAM ===== */}
            <FieldSection judul="Informasi Peminjam">
              <FieldLabel label="Kategori Peminjam" required>
                <div className="flex gap-2">
                  {["Guru", "OSIS/MPK", "Lainnya"].map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => {
                        setKategoriPeminjam(kat);
                        setErrors((e) => ({ ...e, kategoriPeminjam: undefined }));
                      }}
                      className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                        kategoriPeminjam === kat
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
                <FieldError pesan={errors.kategoriPeminjam} />
              </FieldLabel>

              <FieldLabel label="Nama Peminjam" required>
                <input
                  type="text"
                  value={namaPeminjam}
                  onChange={(e) => {
                    setNamaPeminjam(e.target.value);
                    setErrors((er) => ({ ...er, namaPeminjam: undefined }));
                  }}
                  placeholder="Masukkan nama lengkap peminjam"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <FieldError pesan={errors.namaPeminjam} />
              </FieldLabel>

              {/* Nomor Surat — tampil untuk OSIS/MPK dan Lainnya */}
              {(kategoriPeminjam === "OSIS/MPK" || kategoriPeminjam === "Lainnya") && (
                <FieldLabel label="Nomor Surat Pengajuan" required>
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => {
                      setNomorSurat(e.target.value);
                      setErrors((er) => ({ ...er, nomorSurat: undefined }));
                    }}
                    placeholder="Contoh: 001/OSIS/XI/2026"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.nomorSurat} />
                </FieldLabel>
              )}

              {/* Keterangan Lainnya — tampil hanya untuk kategori Lainnya */}
              {kategoriPeminjam === "Lainnya" && (
                <FieldLabel label="Keterangan Kategori Lainnya" required>
                  <input
                    type="text"
                    value={kategoriLainnya}
                    onChange={(e) => {
                      setKategoriLainnya(e.target.value);
                      setErrors((er) => ({ ...er, kategoriLainnya: undefined }));
                    }}
                    placeholder="Contoh: Panitia Acara, Komite Sekolah, dll."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.kategoriLainnya} />
                </FieldLabel>
              )}
            </FieldSection>

            {/* ===== INFORMASI PENGGUNAAN ===== */}
            <FieldSection judul="Informasi Penggunaan">
              <FieldLabel label="Keperluan" required>
                <textarea
                  value={keperluan}
                  onChange={(e) => {
                    setKeperluan(e.target.value);
                    setErrors((er) => ({ ...er, keperluan: undefined }));
                  }}
                  rows={3}
                  placeholder="Jelaskan keperluan penggunaan barang..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <FieldError pesan={errors.keperluan} />
              </FieldLabel>

              <FieldLabel label="Lokasi Penggunaan" required>
                {loadingMaster ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-400">
                    <Loader2 size={13} className="animate-spin" />
                    Memuat daftar lokasi...
                  </div>
                ) : (
                  <SearchableSelect
                    options={opsiLokasi}
                    value={idLokasi}
                    onChange={(val) => {
                      setIdLokasi(val);
                      setErrors((e) => ({ ...e, idLokasi: undefined }));
                    }}
                    placeholder="Cari dan pilih lokasi..."
                    getLabel={(opt) => opt.label}
                    renderOption={(opt) => (
                      <span className="text-slate-800">{opt.label}</span>
                    )}
                    renderSelected={(opt) => (
                      <span className="font-medium text-slate-800">{opt.label}</span>
                    )}
                  />
                )}
                <FieldError pesan={errors.idLokasi} />
              </FieldLabel>
            </FieldSection>

            {/* ===== WAKTU PEMINJAMAN ===== */}
            <FieldSection judul="Waktu Peminjaman">
              <div className="grid grid-cols-2 gap-3">
                <FieldLabel label="Tanggal Pinjam" required>
                  <input
                    type="date"
                    value={tanggalPinjam}
                    onChange={(e) => {
                      setTanggalPinjam(e.target.value);
                      setErrors((er) => ({ ...er, tanggalPinjam: undefined }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.tanggalPinjam} />
                </FieldLabel>

                <FieldLabel label="Jam Pinjam" required>
                  <input
                    type="time"
                    value={jamPinjam}
                    onChange={(e) => {
                      setJamPinjam(e.target.value);
                      setErrors((er) => ({ ...er, jamPinjam: undefined }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.jamPinjam} />
                </FieldLabel>

                <FieldLabel label="Batas Pengembalian" required>
                  <input
                    type="date"
                    value={batasPengembalian}
                    onChange={(e) => {
                      setBatasPengembalian(e.target.value);
                      setErrors((er) => ({ ...er, batasPengembalian: undefined }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.batasPengembalian} />
                </FieldLabel>

                <FieldLabel label="Jam Batas Pengembalian" required>
                  <input
                    type="time"
                    value={jamBatas}
                    onChange={(e) => {
                      setJamBatas(e.target.value);
                      setErrors((er) => ({ ...er, jamBatas: undefined }));
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <FieldError pesan={errors.jamBatas} />
                </FieldLabel>
              </div>
            </FieldSection>
          </form>
        </div>

        {/* Footer (fixed) */}
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
              form="form-peminjaman"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Menyimpan..." : "Simpan Peminjaman"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
