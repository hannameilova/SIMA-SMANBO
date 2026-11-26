"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { getDetailPerpindahan } from "@/lib/perpindahan-aset/api";
import {
  formatAngka,
  formatApiErrorMessage,
  formatTanggalJakarta,
  formatTanggalWaktuJakarta,
  infoKondisi,
  infoStatusPenggunaan,
  labelAlasanPerpindahan,
} from "@/lib/perpindahan-aset/utils";

function DetailPerpindahanDialog({ idPerpindahan, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Kunci scroll halaman saat modal terbuka
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  // Tutup dengan tombol Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetail() {
      setLoading(true);
      setError("");

      try {
        const data = await getDetailPerpindahan(
          idPerpindahan,
          controller.signal
        );
        if (!controller.signal.aborted) {
          if (!data) {
            setError("Detail transaksi perpindahan aset tidak ditemukan.");
            setDetail(null);
          } else {
            setDetail(data);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setDetail(null);
          setError(
            formatApiErrorMessage(err, "Gagal memuat detail perpindahan aset.")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDetail();
    return () => controller.abort();
  }, [idPerpindahan, retryCount]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-perpindahan-title"
    >
      {/* Backdrop click */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Tutup modal detail"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Detail Transaksi Mutasi
            </p>
            <h2
              id="detail-perpindahan-title"
              className="mt-0.5 text-lg font-bold text-slate-900"
            >
              {detail?.nomor_mutasi || "Memuat rincian perpindahan..."}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup detail"
          >
            <X size={18} />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <AlertCircle className="mx-auto h-7 w-7 text-red-500" />
              <p className="mt-2 text-sm font-semibold text-red-800">
                Gagal Mengambil Detail
              </p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <RefreshCw size={14} />
                Coba Lagi
              </button>
            </div>
          ) : detail ? (
            <div className="space-y-5">
              {/* Info Barang & Jumlah */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Informasi Barang
                    </p>
                    <h3 className="mt-0.5 text-base font-bold text-slate-900">
                      {detail.nama_barang}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Kode Barang:{" "}
                      <span className="font-semibold text-slate-700">
                        {detail.kode_barang}
                      </span>
                    </p>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    {formatAngka(detail.jumlah_dipindahkan)} Unit Dipindahkan
                  </span>
                </div>

                {/* Alur Lokasi */}
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold">
                  <span className="text-slate-700">
                    {detail.nama_lokasi_asal}
                  </span>
                  <ArrowRight size={15} className="text-blue-600" />
                  <span className="text-blue-700">
                    {detail.nama_lokasi_tujuan}
                  </span>
                </div>
              </div>

              {/* Metadata Transaksi */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400">
                    TANGGAL PERPINDAHAN
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Calendar size={14} className="text-slate-400" />
                    {formatTanggalJakarta(detail.tanggal_perpindahan)}
                  </p>
                  {detail.created_at && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Dicatat: {formatTanggalWaktuJakarta(detail.created_at)}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400">
                    PETUGAS PENCATAT
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <User size={14} className="text-slate-400" />
                    {detail.nama_petugas}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400">
                    ALASAN PERPINDAHAN
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {labelAlasanPerpindahan(detail.alasan)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400">
                    TANDAI TIDAK LAYAK PAKAI
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                    {detail.tandai_tidak_layak ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <CheckCircle2 size={14} />
                        Ya (Unit tujuan menjadi nonaktif)
                      </span>
                    ) : (
                      <span className="text-slate-700">
                        Tidak (Mengikuti status penggunaan asal)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Keterangan */}
              <div className="rounded-xl border border-slate-200 p-3.5">
                <p className="text-[11px] font-semibold text-slate-400">
                  KETERANGAN
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-slate-700">
                  {detail.keterangan?.trim() || "Tidak ada keterangan tambahan."}
                </p>
              </div>

              {/* Rincian Stok yang Dipindahkan */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rincian Kelompok Stok Dipindahkan
                </h3>

                {!Array.isArray(detail.rincian_stok) ||
                detail.rincian_stok.length === 0 ? (
                  <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    Tidak ada rincian stok yang tercatat.
                  </p>
                ) : (
                  <div className="mt-2.5 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[520px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="border-b border-slate-200 px-3.5 py-3">
                            Tahun Pengadaan
                          </th>
                          <th className="border-b border-slate-200 px-3.5 py-3">
                            Kondisi
                          </th>
                          <th className="border-b border-slate-200 px-3.5 py-3 text-center">
                            Jumlah
                          </th>
                          <th className="border-b border-slate-200 px-3.5 py-3">
                            Status Asal
                          </th>
                          <th className="border-b border-slate-200 px-3.5 py-3">
                            Status Tujuan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {detail.rincian_stok.map((row) => {
                          const kondisi = infoKondisi(row.kondisi);
                          const statusAsal = infoStatusPenggunaan(
                            row.status_penggunaan_asal
                          );
                          const statusTujuan = infoStatusPenggunaan(
                            row.status_penggunaan_tujuan
                          );

                          return (
                            <tr key={row.id_detail}>
                              <td className="px-3.5 py-3 font-semibold text-slate-800">
                                {row.tahun_pengadaan}
                              </td>
                              <td className="px-3.5 py-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${kondisi.badgeClass}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${kondisi.dotClass}`}
                                  />
                                  {kondisi.label}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 text-center font-bold text-blue-700">
                                {formatAngka(row.jumlah_dipindahkan)} Unit
                              </td>
                              <td className="px-3.5 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusAsal.badgeClass}`}
                                >
                                  {statusAsal.label}
                                </span>
                              </td>
                              <td className="px-3.5 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusTujuan.badgeClass}`}
                                >
                                  {statusTujuan.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Modal */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal detail transaksi perpindahan aset yang mengambil data langsung dari GET /perpindahan-aset/:idPerpindahan.
 */
export default function DetailPerpindahanModal({ idPerpindahan, onClose }) {
  if (!idPerpindahan) return null;

  return (
    <DetailPerpindahanDialog
      key={idPerpindahan}
      idPerpindahan={idPerpindahan}
      onClose={onClose}
    />
  );
}
