"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Info } from "lucide-react";
import {
  formatAngka,
  getMockAsetById,
  groupLokasiPengadaan,
  labelKategori,
} from "@/lib/mockAset";

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
  const aset = getMockAsetById(params?.id);

  if (!aset) {
    return (
      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
        <p className="text-sm font-semibold text-slate-800">
          Data aset tidak ditemukan.
        </p>
        <Link
          href="/master-inventaris"
          className="mt-3 inline-block text-xs font-semibold text-blue-600"
        >
          Kembali ke Master Inventaris
        </Link>
      </div>
    );
  }

  const satuan = aset.satuan || "Unit";

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
            TERSEDIA
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {aset.tersedia} {satuan}
          </p>
        </div>
        <div className="border-slate-100 px-4 sm:border-l">
          <p className="text-[10px] font-semibold tracking-wider text-blue-600/80">
            DIPINJAM
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {aset.dipinjam} {satuan}
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
              {formatAngka(aset.ringkasanKondisi.baik)}
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
              {formatAngka(aset.ringkasanKondisi.rusak_ringan)}
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
              {formatAngka(aset.ringkasanKondisi.rusak_berat)}
              <span className="ml-1 text-sm font-medium text-slate-400">
                {satuan}
              </span>
            </p>
          </article>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-bold text-slate-900">
          Rincian Tahun Pengadaan
        </h2>

        <div className="mt-5 space-y-8">
          {[...(aset.pengadaan || [])]
            .sort((a, b) => a.tahun_pengadaan - b.tahun_pengadaan)
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
    </div>
  );
}
