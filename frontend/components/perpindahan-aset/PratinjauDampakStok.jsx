"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Info,
  Loader2,
  Package,
  MapPin,
} from "lucide-react";

import {
  formatAngka,
  infoKondisi,
  infoStatusPenggunaan,
} from "@/lib/perpindahan-aset/utils";

function KartuRingkasanLokasi({
  jenis,
  namaLokasi,
  sebelum,
  perubahan,
  sesudah,
  loading = false,
  error = false,
}) {
  const isAsal = jenis === "asal";
  const Icon = isAsal ? ArrowUpRight : ArrowDownLeft;

  const warna = isAsal
    ? {
        icon: "bg-rose-50 text-rose-600",
        label: "text-rose-700",
        perubahan: "text-rose-600",
      }
    : {
        icon: "bg-emerald-50 text-emerald-600",
        label: "text-emerald-700",
        perubahan: "text-emerald-600",
      };

  const nilaiTujuan = loading
    ? "…"
    : error
      ? "—"
      : formatAngka(sesudah);

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
      {/* Identitas lokasi */}
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${warna.icon}`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${warna.label}`}
          >
            {isAsal
              ? "Lokasi asal · Stok keluar"
              : "Lokasi tujuan · Stok masuk"}
          </p>

          <p className="mt-1 break-words text-sm font-bold leading-5 text-slate-800">
            {namaLokasi}
          </p>
        </div>
      </div>

      {/* Perbandingan stok */}
      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-3">
        {/* Sebelum */}
        <div className="pr-2">
          <p className="text-[10px] font-medium text-slate-500 sm:text-xs">
            Sebelum
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl">
            {formatAngka(sebelum)}
          </p>

          <p className="text-[10px] text-slate-400">unit</p>
        </div>

        {/* Perubahan */}
        <div className="px-2 text-center">
          <p className="text-[10px] font-medium text-slate-500 sm:text-xs">
            Perubahan
          </p>

          <p
            className={`mt-1 text-lg font-semibold sm:text-xl ${warna.perubahan}`}
          >
            {perubahan}
          </p>

          <p className="text-[10px] text-slate-400">unit</p>
        </div>

        {/* Sesudah */}
        <div className="pl-2 text-right">
          <p className="text-[10px] font-medium text-slate-500 sm:text-xs">
            Sesudah
          </p>

          <p
            className={`mt-1 text-lg font-semibold sm:text-xl ${
              loading || error ? "text-slate-400" : "text-slate-900"
            }`}
          >
            {isAsal ? formatAngka(sesudah) : nilaiTujuan}
          </p>

          <p className="text-[10px] text-slate-400">unit</p>
        </div>
      </div>
    </div>
  );
}

function RincianKelompokStok({
  item,
  loadingTujuan,
  errorTujuan,
}) {
  const kondisi = infoKondisi(item.kondisi);
  const statusAsal = infoStatusPenggunaan(item.status_penggunaan_asal);
  const statusTujuan = infoStatusPenggunaan(item.status_penggunaan_tujuan);

  const nilaiTujuanSebelum = loadingTujuan
    ? "…"
    : errorTujuan
      ? "—"
      : formatAngka(item.tujuanSebelum);

  const nilaiTujuanSesudah = loadingTujuan
    ? "…"
    : errorTujuan
      ? "—"
      : formatAngka(item.tujuanSesudah);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
      {/* Informasi kelompok stok */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
          Tahun {item.tahun_pengadaan}
        </span>

        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          {kondisi.label}
        </span>
      </div>

      {/* Perubahan status penggunaan */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Status penggunaan:</span>

        <span className="font-semibold text-slate-700">
          {statusAsal.label}
        </span>

        <ArrowRight size={14} className="text-slate-400" />

        <span className="font-semibold text-blue-700">
          {statusTujuan.label}
        </span>
      </div>

      {/* Dampak jumlah per lokasi */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Lokasi asal */}
        <div className="rounded-lg bg-rose-50/70 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-rose-600" />

            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">
              Lokasi asal
            </p>
          </div>

          <p className="mt-1.5 text-xs font-semibold text-slate-800">
            {formatAngka(item.asalSebelum)}
            <ArrowRight
              size={13}
              className="mx-1 inline-block text-slate-400"
            />
            {formatAngka(item.asalSesudah)}
            <span className="ml-1 text-[10px] font-normal text-slate-500">
              unit
            </span>
          </p>
        </div>

        {/* Lokasi tujuan */}
        <div className="rounded-lg bg-emerald-50/70 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-emerald-600" />

            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Lokasi tujuan
            </p>
          </div>

          <p className="mt-1.5 text-xs font-semibold text-slate-800">
            {nilaiTujuanSebelum}
            <ArrowRight
              size={13}
              className="mx-1 inline-block text-slate-400"
            />
            {nilaiTujuanSesudah}
            <span className="ml-1 text-[10px] font-normal text-slate-500">
              unit
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PratinjauDampakStok({
  namaBarang = "",
  namaLokasiAsal = "",
  namaLokasiTujuan = "",
  pratinjau,
  loadingTujuan = false,
  errorTujuan = "",
}) {
  if (!namaLokasiAsal || !namaLokasiTujuan || !pratinjau) {
    return null;
  }

  const {
    totalDipindahkan = 0,
    totalAsalSebelum = 0,
    totalAsalSesudah = 0,
    totalTujuanSebelum = 0,
    totalTujuanSesudah = 0,
    rincianKelompok = [],
  } = pratinjau;

  const jumlahDipindahkan = Number(totalDipindahkan || 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Package size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Dampak Stok
              </h3>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Perubahan jumlah stok setelah perpindahan dilakukan.
              </p>
            </div>
          </div>

          {loadingTujuan && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700">
              <Loader2 size={12} className="animate-spin" />
              Memuat stok tujuan
            </div>
          )}
        </div>

        {/* Informasi error */}
        {errorTujuan && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-800">
                Data stok lokasi tujuan belum tersedia
              </p>

              <p className="mt-0.5 break-words text-[11px] leading-5 text-amber-700">
                {errorTujuan}
              </p>
            </div>
          </div>
        )}

        {/* Ringkasan perpindahan */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <KartuRingkasanLokasi
            jenis="asal"
            namaLokasi={namaLokasiAsal}
            sebelum={totalAsalSebelum}
            perubahan={
              jumlahDipindahkan > 0
                ? `-${formatAngka(jumlahDipindahkan)}`
                : "0"
            }
            sesudah={totalAsalSesudah}
          />

          <KartuRingkasanLokasi
            jenis="tujuan"
            namaLokasi={namaLokasiTujuan}
            sebelum={totalTujuanSebelum}
            perubahan={
              jumlahDipindahkan > 0
                ? `+${formatAngka(jumlahDipindahkan)}`
                : "0"
            }
            sesudah={totalTujuanSesudah}
            loading={loadingTujuan}
            error={Boolean(errorTujuan)}
          />
        </div>

        {/* Ringkasan aktivitas */}
        <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
          {jumlahDipindahkan > 0 ? (
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <ArrowRight size={14} />
              </div>

              <div className="min-w-0 text-xs leading-5 text-slate-600">
                <p className="font-semibold text-slate-900">
                  {formatAngka(jumlahDipindahkan)} unit{" "}
                  {namaBarang || "barang"}
                </p>

                <p className="mt-0.5">
                  Akan dipindahkan dari{" "}
                  <span className="font-semibold text-slate-800">
                    {namaLokasiAsal}
                  </span>{" "}
                  ke{" "}
                  <span className="font-semibold text-slate-800">
                    {namaLokasiTujuan}
                  </span>
                  .
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p className="text-xs leading-5 text-slate-500">
                Pilih jumlah unit pada kelompok stok yang ingin dipindahkan.
                Ringkasan perubahan akan ditampilkan di sini.
              </p>
            </div>
          )}
        </div>

        {/* Rincian kelompok stok */}
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Rincian Kelompok Stok
              </h4>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Detail perubahan berdasarkan tahun pengadaan dan kondisi.
              </p>
            </div>

            {rincianKelompok.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                {rincianKelompok.length} kelompok
              </span>
            )}
          </div>

          {rincianKelompok.length > 0 ? (
            <div className="space-y-2.5">
              {rincianKelompok.map((item) => (
                <RincianKelompokStok
                  key={item.id_stok}
                  item={item}
                  loadingTujuan={loadingTujuan}
                  errorTujuan={Boolean(errorTujuan)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center">
              <Package size={22} className="mx-auto text-slate-300" />

              <p className="mt-2 text-xs font-semibold text-slate-600">
                Belum ada kelompok stok yang dipilih
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Rincian perubahan akan muncul setelah jumlah unit ditentukan.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}