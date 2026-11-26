
"use client";

import Link from "next/link";
import { Eye, AlertCircle, Clock, MapPin } from "lucide-react";
import {
  formatTanggalPendek,
  isTerlambat,
} from "@/lib/peminjaman/utils";

function BadgeKategori({ kategori }) {
  const map = {
    Guru: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    "OSIS/MPK": "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
    Lainnya: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };

  const kelas = map[kategori] || map.Lainnya;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-medium ${kelas}`}
    >
      {kategori}
    </span>
  );
}

function InfoBatas({ item }) {
  const terlambat = isTerlambat(item);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${
          terlambat ? "text-red-600" : "text-slate-700"
        }`}
      >
        {terlambat ? (
          <AlertCircle size={13} className="shrink-0" />
        ) : (
          <Clock size={13} className="shrink-0 text-slate-400" />
        )}

        <span>
          {formatTanggalPendek(item.batas_pengembalian)}
        </span>
      </div>

      {terlambat && (
        <p className="mt-1 pl-5 text-[10px] font-semibold text-red-600">
          Terlambat
        </p>
      )}
    </div>
  );
}

function TombolDetail({ item }) {
  return (
    <Link
      href={`/peminjaman/${item.id_peminjaman}`}
      aria-label={`Lihat detail transaksi ${item.kode_transaksi}`}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
    >
      <Eye size={14} />
      Detail
    </Link>
  );
}

function RowKosong({ pesan }) {
  return (
    <tr>
      <td colSpan={6} className="px-5 py-16 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {pesan}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Data transaksi akan ditampilkan di sini setelah tersedia.
        </p>
      </td>
    </tr>
  );
}

function SkeletonTabel() {
  return Array.from({ length: 4 }).map((_, index) => (
    <tr key={index}>
      {Array.from({ length: 6 }).map((_, col) => (
        <td
          key={col}
          className="border-b border-slate-100 px-3 py-5"
        >
          <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}

function SkeletonMobile() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div
      key={index}
      className="animate-pulse rounded-xl border border-slate-200 p-4"
    >
      <div className="h-3 w-32 rounded bg-slate-100" />
      <div className="mt-4 h-4 w-40 rounded bg-slate-100" />
      <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
    </div>
  ));
}

function KartuTransaksi({ item }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      {/* ID Transaksi */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="break-all text-[11px] font-semibold text-slate-500">
          {item.kode_transaksi}
        </span>
        <TombolDetail item={item} />
      </div>

      {/* Barang */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Barang
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {item.nama_barang}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Jumlah dipinjam: {item.jumlah_pinjam} Unit
        </p>
      </div>

      <div className="my-3 border-t border-slate-100" />

      {/* Peminjam */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Peminjam
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-800">
          {item.nama_peminjam}
        </p>

        <div className="mt-2">
          <BadgeKategori kategori={item.kategori_peminjam} />
          {item.kategori_peminjam === "Lainnya" &&
            item.kategori_peminjam_lainnya && (
              <span className="ml-2 text-[10px] text-slate-500">
                {item.kategori_peminjam_lainnya}
              </span>
            )}
        </div>
      </div>

      <div className="my-3 border-t border-slate-100" />

      {/* Lokasi dan Batas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Lokasi Pakai
          </p>

          <div className="mt-2 flex items-start gap-1.5">
            <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <span className="text-xs leading-5 text-slate-600">
              {item.lokasi_pakai || "-"}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Batas Pengembalian
          </p>
          <InfoBatas item={item} />
        </div>
      </div>
    </article>
  );
}

export default function PeminjamanTabel({ data, loading, tab }) {
  const daftar = Array.isArray(data) ? data : [];

  const pesanKosong =
    tab === "dipinjam"
      ? "Belum ada transaksi peminjaman aktif"
      : "Belum ada riwayat pengembalian";

  return (
    <>
      {/* TABEL DESKTOP */}
      <div className="hidden overflow-hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[18%]" />
            <col className="w-[19%]" />
            <col className="w-[16%]" />
            <col className="w-[19%]" />
            <col className="w-[11%]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr>
              {[
                "ID TRANSAKSI",
                "NAMA BARANG",
                "PEMINJAM",
                "LOKASI PAKAI",
                "BATAS PENGEMBALIAN",
                "AKSI",
              ].map((judul) => (
                <th
                  key={judul}
                  scope="col"
                  className="border-b border-slate-200 px-3 py-4 text-center text-[9px] font-bold tracking-wider text-slate-500"
                >
                  {judul}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonTabel />
            ) : daftar.length === 0 ? (
              <RowKosong pesan={pesanKosong} />
            ) : (
              daftar.map((item) => (
                <tr
                  key={item.id_peminjaman}
                  className="transition-colors hover:bg-slate-50"
                >
                  {/* ID Transaksi */}
                  <td className="border-b border-slate-100 px-3 py-4 text-center">
                    <span className="break-all text-[11px] font-semibold leading-4 text-slate-600">
                      {item.kode_transaksi}
                    </span>
                  </td>

                  {/* Nama Barang */}
                  <td className="border-b border-slate-100 px-3 py-4">
                    <p className="break-words text-xs font-semibold leading-5 text-slate-800">
                      {item.nama_barang}
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      Dipinjam: {item.jumlah_pinjam} Unit
                    </p>
                  </td>

                  {/* Peminjam */}
                  <td className="border-b border-slate-100 px-3 py-4">
                    <p className="break-words text-xs font-semibold leading-5 text-slate-800">
                      {item.nama_peminjam}
                    </p>

                    <div className="mt-2">
                      <BadgeKategori kategori={item.kategori_peminjam} />
                    </div>

                    {item.kategori_peminjam === "Lainnya" &&
                      item.kategori_peminjam_lainnya && (
                        <p className="mt-1 text-[10px] text-slate-500">
                          {item.kategori_peminjam_lainnya}
                        </p>
                      )}
                  </td>

                  {/* Lokasi Pakai */}
                  <td className="border-b border-slate-100 px-3 py-4">
                    <div className="flex items-start gap-1.5">
                      <MapPin
                        size={13}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <span className="break-words text-xs leading-5 text-slate-600">
                        {item.lokasi_pakai || "-"}
                      </span>
                    </div>
                  </td>

                  {/* Batas Pengembalian */}
                  <td className="border-b border-slate-100 px-3 py-4">
                    <InfoBatas item={item} />
                  </td>

                  {/* Aksi */}
                  <td className="border-b border-slate-100 px-3 py-4 text-center">
                    <TombolDetail item={item} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* KARTU MOBILE */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <SkeletonMobile />
        ) : daftar.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {pesanKosong}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Data transaksi akan ditampilkan di sini setelah tersedia.
            </p>
          </div>
        ) : (
          daftar.map((item) => (
            <KartuTransaksi
              key={item.id_peminjaman}
              item={item}
            />
          ))
        )}
      </div>
    </>
  );
}