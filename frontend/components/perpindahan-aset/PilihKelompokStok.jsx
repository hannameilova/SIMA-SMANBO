"use client";

import { AlertCircle, Layers, PackageOpen, RefreshCw } from "lucide-react";
import QuantitySelector from "@/components/perpindahan-aset/QuantitySelector";
import {
  formatAngka,
  infoKondisi,
  infoStatusPenggunaan,
} from "@/lib/perpindahan-aset/utils";

/**
 * Komponen pemilihan kelompok stok manual (non-FIFO).
 * Menampilkan semua kelompok stok yang tersedia pada lokasi asal.
 */
export default function PilihKelompokStok({
  idBarang,
  idLokasiAsal,
  namaLokasiAsal = "",
  stokList = [],
  jumlahPerStok = {},
  loading = false,
  error = "",
  disabled = false,
  onJumlahChange,
  onRetry,
}) {
  const totalTersedia = stokList.reduce(
    (sum, item) => sum + Number(item.jumlah || 0),
    0
  );
  const totalDipilih = stokList.reduce(
    (sum, item) => sum + Number(jumlahPerStok[item.id_stok] || 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
            Pilih Kelompok Stok & Jumlah Dipindahkan
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {!idBarang || !idLokasiAsal
              ? "Pilih barang dan lokasi asal terlebih dahulu untuk menampilkan kelompok stok yang tersedia."
              : loading
                ? "Memuat kelompok stok tersedia..."
                : `Maksimum ${formatAngka(totalTersedia)} unit tersedia di ${namaLokasiAsal || "lokasi asal"} — tentukan jumlah per kelompok stok secara manual.`}
          </p>
        </div>

        {idBarang && idLokasiAsal && !loading && !error && stokList.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Total Dipindahkan:{" "}
            <span className="font-extrabold">{formatAngka(totalDipilih)}</span>{" "}
            Unit
          </div>
        )}
      </div>

      {/* Belum memilih barang atau lokasi asal */}
      {(!idBarang || !idLokasiAsal) && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-500">
          <Layers className="mx-auto mb-2 h-5 w-5 text-slate-300" />
          Daftar kelompok stok akan muncul setelah Barang dan Lokasi Asal
          dipilih.
        </div>
      )}

      {/* Loading */}
      {idBarang && idLokasiAsal && loading && (
        <div className="space-y-2.5">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        </div>
      )}

      {/* Error */}
      {idBarang && idLokasiAsal && !loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
          <p className="mt-1.5 text-xs font-semibold text-red-800">
            Gagal Memuat Stok Lokasi Asal
          </p>
          <p className="mt-0.5 text-xs text-red-600">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              <RefreshCw size={13} />
              Muat Ulang Stok
            </button>
          )}
        </div>
      )}

      {/* Empty stock */}
      {idBarang &&
        idLokasiAsal &&
        !loading &&
        !error &&
        stokList.length === 0 && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-6 text-center">
            <PackageOpen className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-2 text-xs font-bold text-amber-900">
              Tidak ada stok tersedia di lokasi asal
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Barang ini tidak memiliki unit tersedia pada{" "}
              {namaLokasiAsal || "lokasi yang dipilih"}.
            </p>
          </div>
        )}

      {/* Daftar kelompok stok */}
      {idBarang &&
        idLokasiAsal &&
        !loading &&
        !error &&
        stokList.length > 0 && (
          <div className="space-y-2.5">
            {stokList.map((stok) => {
              const kondisi = infoKondisi(stok.kondisi);
              const status = infoStatusPenggunaan(stok.status_penggunaan);
              const selectedQty = Number(jumlahPerStok[stok.id_stok] || 0);
              const isSelected = selectedQty > 0;

              return (
                <div
                  key={stok.id_stok}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-colors sm:flex-row sm:items-center ${
                    isSelected
                      ? "border-blue-300 bg-blue-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                        Tahun {stok.tahun_pengadaan}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${kondisi.badgeClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${kondisi.dotClass}`}
                        />
                        {kondisi.label}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Stok tersedia:{" "}
                      <span className="font-bold text-slate-800">
                        {formatAngka(stok.jumlah)} Unit
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-[11px] font-medium text-slate-500 sm:hidden">
                      Dipindahkan:
                    </span>
                    <QuantitySelector
                      value={selectedQty}
                      max={stok.jumlah}
                      disabled={disabled}
                      onChange={(qty) => onJumlahChange(stok.id_stok, qty)}
                      ariaLabel={`Jumlah kelompok tahun ${stok.tahun_pengadaan} kondisi ${kondisi.label}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
