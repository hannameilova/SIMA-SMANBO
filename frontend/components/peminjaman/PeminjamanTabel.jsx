"use client";

import Link from "next/link";
import { Eye, AlertCircle, Clock, MapPin, ChevronRight } from "lucide-react";
import {
  formatTanggalJamPendek,
  formatTanggalPendek,
  isTerlambat,
  labelKategoriBarang,
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${kelas}`}
    >
      {kategori}
    </span>
  );
}

function BadgeStatus({ status }) {
  if (status === "dipinjam") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Sedang Dipinjam
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Dikembalikan
    </span>
  );
}

function RowKosong({ kolom, pesan }) {
  return (
    <tr>
      <td
        colSpan={kolom}
        className="py-16 text-center text-sm text-slate-400"
      >
        <div className="flex flex-col items-center gap-2">
          <AlertCircle size={32} className="text-slate-300" strokeWidth={1.5} />
          <p>{pesan}</p>
        </div>
      </td>
    </tr>
  );
}

export default function PeminjamanTabel({ data, loading, tab }) {
  const kolom = 7;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">ID Transaksi</th>
            <th className="px-4 py-3">Nama Barang</th>
            <th className="px-4 py-3">Peminjaman & Keperluan</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Lokasi Pakai</th>
            <th className="px-4 py-3">Tanggal Pinjam & Batas</th>
            <th className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: kolom }).map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-4 rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <RowKosong
              kolom={kolom}
              pesan={
                tab === "dipinjam"
                  ? "Belum ada transaksi peminjaman aktif."
                  : "Belum ada riwayat pengembalian."
              }
            />
          ) : (
            data.map((item) => {
              const terlambat = isTerlambat(item);

              return (
                <tr
                  key={item.id_peminjaman}
                  className="group transition-colors hover:bg-slate-50"
                >
                  {/* ID Transaksi */}
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                      {item.kode_transaksi}
                    </span>
                  </td>

                  {/* Nama Barang */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">
                      {item.nama_barang}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {labelKategoriBarang(item.kategori_barang)} ·{" "}
                      <span className="font-medium text-slate-500">
                        Dipinjam: {item.jumlah_pinjam} Unit
                      </span>
                    </p>
                  </td>

                  {/* Peminjaman & Keperluan */}
                  <td className="max-w-[180px] px-4 py-3.5">
                    <p className="font-semibold text-slate-800">
                      {item.nama_peminjam}
                    </p>
                    <p
                      className="mt-0.5 truncate text-[11px] text-slate-400"
                      title={item.keperluan}
                    >
                      {item.keperluan}
                    </p>
                  </td>

                  {/* Kategori */}
                  <td className="px-4 py-3.5">
                    <BadgeKategori kategori={item.kategori_peminjam} />
                    {item.kategori_peminjam === "Lainnya" &&
                      item.kategori_peminjam_lainnya && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.kategori_peminjam_lainnya}
                        </p>
                      )}
                  </td>

                  {/* Lokasi Pakai */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span>{item.lokasi_pakai || "-"}</span>
                    </div>
                  </td>

                  {/* Tanggal Pinjam & Batas */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock size={12} className="shrink-0 text-slate-400" />
                      <span>
                        {formatTanggalJamPendek(item.tanggal_pinjam)}
                      </span>
                    </div>
                    <div
                      className={`mt-1 flex items-center gap-1 text-[11px] ${
                        terlambat
                          ? "font-semibold text-red-600"
                          : "text-slate-400"
                      }`}
                    >
                      {terlambat && (
                        <AlertCircle size={11} className="shrink-0" />
                      )}
                      <span>
                        Batas: {formatTanggalPendek(item.batas_pengembalian)}
                      </span>
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-3.5 text-center">
                    <Link
                      href={`/peminjaman/${item.id_peminjaman}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye size={13} />
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
