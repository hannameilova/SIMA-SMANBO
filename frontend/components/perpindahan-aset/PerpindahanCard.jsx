"use client";

import {
  ArrowRight,
  ArrowDown,
  CalendarDays,
  FileText,
  MapPin,
  MessageSquare,
  UserRound,
  Eye,
} from "lucide-react";

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatJumlah(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return Number(value).toLocaleString("id-ID");
}

function formatAlasan(alasan) {
  if (!alasan || !String(alasan).trim()) return "-";

  const teks = String(alasan)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("id-ID");

  return teks.charAt(0).toLocaleUpperCase("id-ID") + teks.slice(1);
}

function InfoItem({ icon: Icon, label, children }) {
  if (!children || children === "-") return null;

  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 break-words text-xs font-medium leading-5 text-slate-700 sm:text-sm">
          {children}
        </p>
      </div>
    </div>
  );
}

function StockImpact({ label, before, after }) {
  if (
    before === undefined ||
    before === null ||
    after === undefined ||
    after === null
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-3">
        <div>
          <p className="text-[10px] text-slate-400">
            Sebelum
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-700">
            {formatJumlah(before)}
          </p>
        </div>

        <ArrowRight size={16} className="shrink-0 text-slate-400" />

        <div>
          <p className="text-[10px] text-slate-400">
            Sesudah
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-blue-700">
            {formatJumlah(after)}
          </p>
        </div>

        <span className="ml-auto text-[10px] text-slate-400">
          Unit
        </span>
      </div>
    </div>
  );
}

export default function PerpindahanCard({ item, onSelect }) {
  const kodeMutasi =
    item.nomor_mutasi || item.kode_mutasi || "-";

  const namaBarang =
    item.nama_barang || "-";

  const kodeBarang =
    item.kode_barang || "-";

  const lokasiAsal =
    item.lokasi_asal?.nama ||
    item.nama_lokasi_asal ||
    "-";

  const lokasiTujuan =
    item.lokasi_tujuan?.nama ||
    item.nama_lokasi_tujuan ||
    "-";

  const jumlah =
    item.jumlah ??
    item.jumlah_pindah ??
    item.jumlah_dipindahkan ??
    0;

  const stokAsalSebelum =
    item.stok_asal?.sebelum ??
    item.stok_sebelum_asal ??
    item.jumlah_awal_asal;

  const stokAsalSesudah =
    item.stok_asal?.sesudah ??
    item.stok_sesudah_asal ??
    item.jumlah_akhir_asal;

  const stokTujuanSebelum =
    item.stok_tujuan?.sebelum ??
    item.stok_sebelum_tujuan ??
    item.jumlah_awal_tujuan;

  const stokTujuanSesudah =
    item.stok_tujuan?.sesudah ??
    item.stok_sesudah_tujuan ??
    item.jumlah_akhir_tujuan;

  const alasan = formatAlasan(item.alasan);
  const keterangan = item.keterangan || "";

  const petugas =
    typeof item.petugas === "string"
      ? item.petugas
      : item.petugas?.nama ||
        item.nama_petugas ||
        "-";

  const status = item.status || "tercatat";

  const statusLabel =
    status.toLowerCase() === "selesai"
      ? "Tercatat"
      : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      {/* Identitas transaksi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {kodeMutasi}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={14} className="shrink-0" />
          <span>{formatTanggal(item.tanggal_perpindahan)}</span>
        </div>
      </div>

      {/* Informasi barang */}
      <div className="mt-4">
        <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
          {namaBarang}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Kode Barang:{" "}
          <span className="font-semibold text-slate-700">
            {kodeBarang}
          </span>
        </p>
      </div>

      {/* Informasi rute dan stok */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-700">
            Rute Perpindahan
          </p>

          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {formatJumlah(jumlah)} Unit Dipindahkan
          </span>
        </div>

        {/* Lokasi asal dan tujuan */}
        <div className="mt-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Dari Lokasi
            </p>

            <div className="mt-1.5 flex items-start gap-2">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-slate-400"
              />
              <p className="text-sm font-semibold leading-5 text-slate-800">
                {lokasiAsal}
              </p>
            </div>
          </div>

          <div className="flex justify-center text-blue-600">
            <ArrowRight size={19} className="hidden sm:block" />
            <ArrowDown size={19} className="sm:hidden" />
          </div>

          <div className="min-w-0 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
              Ke Lokasi
            </p>

            <div className="mt-1.5 flex items-start gap-2">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-blue-500"
              />
              <p className="text-sm font-semibold leading-5 text-blue-800">
                {lokasiTujuan}
              </p>
            </div>
          </div>
        </div>

        {/* Dampak perubahan stok */}
        {(stokAsalSebelum !== undefined ||
          stokTujuanSebelum !== undefined) && (
          <div className="mt-4 border-t border-slate-200 pt-3.5">
            <p className="mb-2.5 text-xs font-bold text-slate-700">
              Perubahan Stok
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <StockImpact
                label="Stok Lokasi Asal"
                before={stokAsalSebelum}
                after={stokAsalSesudah}
              />

              <StockImpact
                label="Stok Lokasi Tujuan"
                before={stokTujuanSebelum}
                after={stokTujuanSesudah}
              />
            </div>
          </div>
        )}
      </div>

      {/* Informasi tambahan */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoItem icon={FileText} label="Alasan Perpindahan">
          {alasan}
        </InfoItem>

        <InfoItem icon={UserRound} label="Petugas">
          {petugas}
        </InfoItem>

        {keterangan && (
          <div className="sm:col-span-2">
            <InfoItem
              icon={MessageSquare}
              label="Keterangan Tambahan"
            >
              {keterangan}
            </InfoItem>
          </div>
        )}
      </div>

      {/* Tombol detail */}
      <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onSelect?.(item)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Eye size={15} />
          Lihat Detail
        </button>
      </div>
    </article>
  );
}