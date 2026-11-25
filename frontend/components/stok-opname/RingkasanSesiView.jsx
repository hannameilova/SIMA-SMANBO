
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import StokOpnamePageHeader from "@/components/stok-opname/StokOpnamePageHeader";
import {
  confirmSesiStokOpname,
  getRingkasanSesi,
} from "@/lib/stok-opname/api";
import { getUser } from "@/lib/auth";
import {
  formatAngka,
  formatTanggalWaktu,
  labelStatusPenggunaan,
} from "@/lib/stok-opname/utils";

const LABEL_KONDISI = {
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
};

export default function RingkasanSesiView({ idOpname }) {
  const router = useRouter();
  const idValid = Number.isSafeInteger(idOpname) && idOpname > 0;

  const [data, setData] = useState(null);
  const [pengguna, setPengguna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorAksi, setErrorAksi] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Dibaca setelah mount agar hasil render server dan klien tetap sama.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPengguna(getUser());
  }, []);

  useEffect(() => {
    if (!idValid) return;

    const controller = new AbortController();

    async function muat() {
      setLoading(true);
      setError("");

      try {
        const hasil = await getRingkasanSesi(
          idOpname,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setData(hasil);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Ringkasan stok opname gagal dimuat."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    muat();

    return () => controller.abort();
  }, [idOpname, idValid, reloadKey]);

  const pesanError = idValid ? error : "ID sesi stok opname tidak valid.";

  // Menentukan mode halaman berdasarkan status sesi dari backend
  const statusSesi = data?.sesi?.status;
  const sesiSelesai = statusSesi === "selesai";
  const sesiBerlangsung = statusSesi === "berlangsung";

  const baris = useMemo(() => {
    if (!data) return [];

    const hasil = [];

    for (const barang of data.barang) {
      for (const pengadaan of barang.daftar_pengadaan) {
        hasil.push({
          key: `${barang.id_barang}-${pengadaan.id_detail}`,
          barang,
          pengadaan,
        });
      }
    }

    return hasil;
  }, [data]);

  // Konfirmasi hanya dapat dilakukan pada sesi yang sedang berlangsung
  const konfirmasi = useCallback(async () => {
    if (!data || data.sesi?.status !== "berlangsung") return;

    setConfirming(true);
    setErrorAksi("");

    try {
      await confirmSesiStokOpname(idOpname);
      setBerhasil(true);
    } catch (err) {
      setErrorAksi(
        err instanceof Error
          ? err.message
          : "Stok opname gagal dikonfirmasi."
      );
    } finally {
      setConfirming(false);
    }
  }, [data, idOpname]);

  if (berhasil) {
    return (
      <div className="min-h-full bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1500px] px-3.5 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-7">
          <StokOpnamePageHeader tahapAktif={3} />

          <section className="mt-4 rounded-2xl border border-emerald-200 bg-white px-5 py-10 text-center shadow-sm sm:mt-5 sm:px-8 sm:py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-8 w-8" strokeWidth={1.8} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
              Stok opname berhasil dikonfirmasi
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-slate-500 sm:text-sm">
              Hasil pemeriksaan fisik sudah disahkan dan stok ruangan telah
              diperbarui sesuai data opname.
            </p>

            <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
              <Link
                href="/stok-opname"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-bold text-white transition-colors hover:bg-blue-800 sm:text-sm"
              >
                Kembali ke Stok Opname
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 sm:text-sm"
              >
                Buka Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1500px] px-3.5 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-7">
        <StokOpnamePageHeader
          tahapAktif={3}
          subjudul={
            sesiSelesai
              ? "Berikut adalah hasil akhir pemeriksaan fisik stok opname pada ruangan ini."
              : "Tinjau seluruh hasil pemeriksaan fisik sebelum mengonfirmasi dan menyelesaikan sesi stok opname."
          }
        />

        <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
          {idValid && loading ? (
            <div className="space-y-3.5" aria-busy="true">
              <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            </div>
          ) : pesanError || !data ? (
            <section className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-900">
                Ringkasan tidak dapat dimuat
              </h2>

              <p className="mx-auto mt-1.5 max-w-lg text-xs leading-6 text-slate-500 sm:text-sm">
                {pesanError || "Data ringkasan tidak tersedia."}
              </p>

              <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
                {idValid && (
                  <button
                    type="button"
                    onClick={() => setReloadKey((nilai) => nilai + 1)}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 sm:text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Coba Lagi
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      idValid ? `/stok-opname/${idOpname}` : "/stok-opname"
                    )
                  }
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {idValid
                    ? "Kembali ke Pengecekan"
                    : "Kembali ke Stok Opname"}
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* Informasi sesi */}
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">Ruangan</p>
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      {data.sesi.nama_lokasi}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 sm:text-xs">
                      Sesi #{data.sesi.id_opname}
                    </span>

                    {sesiSelesai && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selesai
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 sm:text-xs">
                  <ClipboardCheck className="h-3.5 w-3.5 text-blue-600" />
                  Mulai {formatTanggalWaktu(data.sesi.tanggal_mulai)} • Auditor{" "}
                  {pengguna?.nama ?? "—"}
                </p>

                {sesiSelesai && data.sesi.tanggal_selesai && (
                  <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                    Selesai {formatTanggalWaktu(data.sesi.tanggal_selesai)}
                  </p>
                )}
              </section>

              {/* Ringkasan hasil pemeriksaan */}
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Hasil Pemeriksaan Fisik
                    </p>

                    <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                      {formatAngka(data.ringkasan.jumlah_sudah_diperiksa)} dari{" "}
                      {formatAngka(data.ringkasan.jumlah_data_stok)} Barang
                      Diperiksa
                    </h2>
                  </div>

                  {data.ringkasan.semua_sudah_diperiksa ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Lengkap
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Belum lengkap
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <RingkasanAngka
                    label="Sesuai"
                    nilai={data.ringkasan.jumlah_sesuai}
                    warna="text-emerald-700"
                  />

                  <RingkasanAngka
                    label="Terdapat Temuan"
                    nilai={data.ringkasan.jumlah_temuan}
                    warna="text-orange-700"
                  />

                  <RingkasanAngka
                    label="Belum Diperiksa"
                    nilai={data.ringkasan.jumlah_belum_diperiksa}
                    warna="text-slate-600"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
                    Total Sistem: {formatAngka(data.ringkasan.total_sistem)} Unit
                  </span>

                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 sm:text-xs">
                    Total Fisik: {formatAngka(data.ringkasan.total_fisik)} Unit
                  </span>

                  <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:text-xs">
                    Selisih:{" "}
                    {formatAngka(
                      data.ringkasan.total_fisik -
                        data.ringkasan.total_sistem
                    )}{" "}
                    Unit
                  </span>
                </div>

                {!sesiSelesai &&
                  !data.ringkasan.semua_sudah_diperiksa && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-700">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Masih ada barang yang belum diperiksa. Lengkapi
                      pemeriksaan terlebih dahulu sebelum konfirmasi.
                    </p>
                  )}
              </section>

              {/* Rincian barang */}
              <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
                <h2 className="mb-2 px-0.5 text-xs font-bold text-slate-900 sm:text-sm">
                  Rincian Barang ({formatAngka(baris.length)})
                </h2>

                <div className="space-y-2">
                  {baris.map((item) => (
                    <RingkasanBarangItem key={item.key} item={item} />
                  ))}
                </div>
              </section>

              {/* Error hanya ditampilkan untuk sesi yang masih berlangsung */}
              {errorAksi && sesiBerlangsung && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[11px] text-red-700 sm:text-xs"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="break-words">{errorAksi}</p>
                </div>
              )}

              {/* Mode lihat hasil untuk sesi yang sudah selesai */}
              {sesiSelesai && (
              <div className="sticky bottom-0 z-30 mt-2 pb-4 pt-2">
                <section className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        Sesi Stok Opname Telah Selesai
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Hasil pemeriksaan ditampilkan dalam mode lihat saja.
                        Data sesi ini tidak dapat diubah atau dikonfirmasi ulang.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/stok-opname"
                    className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Stok Opname
                  </Link>
                </section>
              </div>
              )}

              {/* Sticky bar hanya untuk sesi yang sedang berlangsung */}
              {sesiBerlangsung && (
                <div className="sticky bottom-0 z-30 mt-2 pb-4 pt-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] backdrop-blur sm:p-4">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="hidden text-[11px] text-slate-500 sm:block">
                        Konfirmasi akan memperbarui stok ruangan secara permanen.
                      </p>

                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/stok-opname/${idOpname}`)
                          }
                          disabled={confirming}
                          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 sm:px-4 sm:text-sm"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Kembali
                        </button>

                        <button
                          type="button"
                          onClick={konfirmasi}
                          disabled={
                            confirming ||
                            !data.ringkasan.semua_sudah_diperiksa
                          }
                          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-sm"
                        >
                          {confirming ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}

                          {confirming ? "Mengonfirmasi..." : "Konfirmasi"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status lain selain berlangsung dan selesai */}
              {!sesiBerlangsung && !sesiSelesai && (
                <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-600 sm:text-sm">
                    Sesi ini tidak sedang berlangsung sehingga tidak dapat
                    dikonfirmasi.
                  </p>

                  <Link
                    href="/stok-opname"
                    className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Stok Opname
                  </Link>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RingkasanAngka({ label, nilai, warna }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <p className={`text-base font-extrabold sm:text-lg ${warna}`}>
        {formatAngka(nilai)}
      </p>

      <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}


function formatKategoriBarang(kategori) {
  const kategoriNormal = String(kategori || "")
    .trim()
    .toLowerCase();

  const daftarKategori = {
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };

  if (daftarKategori[kategoriNormal]) {
    return daftarKategori[kategoriNormal];
  }

  return kategoriNormal
    .split("_")
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ");
}

function buatInfoPerubahan(kondisi) {
  return Object.entries(LABEL_KONDISI)
    .map(([key, label]) => {
      const dataKondisi = kondisi?.[key];

      if (
        !dataKondisi ||
        dataKondisi.sesudah === null ||
        dataKondisi.sesudah === undefined
      ) {
        return null;
      }

      const sebelum = Number(dataKondisi.sebelum ?? 0);
      const sesudah = Number(dataKondisi.sesudah ?? 0);
      const selisih = sesudah - sebelum;

      if (selisih === 0) return null;

      // Perubahan baik yang berkurang atau barang rusak yang bertambah
      // dianggap sebagai perubahan yang perlu diperhatikan.
      const perluPerhatian =
        key === "baik" ? selisih < 0 : selisih > 0;

      return {
        key,
        label,
        sebelum,
        sesudah,
        selisih,
        perluPerhatian,
      };
    })
    .filter(Boolean);
}

function RingkasanBarangItem({ item }) {
  const { barang, pengadaan } = item;

  const perubahan = buatInfoPerubahan(pengadaan.kondisi);

  const belumDiperiksa =
    pengadaan.status_pemeriksaan === "belum_diperiksa";

  const adaPerubahan =
    perubahan.length > 0 ||
    pengadaan.status_pemeriksaan === "ada_temuan";

  const statusLabel = belumDiperiksa
    ? "Belum Diperiksa"
    : adaPerubahan
      ? "Ada Perubahan"
      : "Sesuai";

  const statusGaya = belumDiperiksa
    ? "border-l-slate-300"
    : adaPerubahan
      ? "border-l-amber-500"
      : "border-l-emerald-500";

  const badgeGaya = belumDiperiksa
    ? "bg-slate-100 text-slate-600"
    : adaPerubahan
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  const kategoriLabel = formatKategoriBarang(barang.kategori);

  return (
    <article
      className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 sm:p-5 ${statusGaya}`}
    >
      {/* Informasi utama barang */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
            {barang.nama_barang}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {kategoriLabel}
            </span>

            <span className="text-xs text-slate-500">
              Tahun Pengadaan:{" "}
              <strong className="font-semibold text-slate-700">
                {pengadaan.tahun_pengadaan}
              </strong>
            </span>

            <span className="text-xs text-slate-500">
              Status Aset:{" "}
              <strong className="font-semibold text-slate-700">
                {labelStatusPenggunaan(pengadaan.status_penggunaan)}
              </strong>
            </span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${badgeGaya}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Perbandingan jumlah sistem dan fisik */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">
            Jumlah Sistem
          </p>

          <p className="mt-1 text-xl font-extrabold text-slate-800 sm:text-2xl">
            {formatAngka(pengadaan.jumlah_sebelum)}
            <span className="ml-1 text-xs font-medium text-slate-500">
              Unit
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-700">
            Jumlah Fisik
          </p>

          <p className="mt-1 text-xl font-extrabold text-blue-700 sm:text-2xl">
            {pengadaan.jumlah_sesudah === null
              ? "—"
              : formatAngka(pengadaan.jumlah_sesudah)}

            {pengadaan.jumlah_sesudah !== null && (
              <span className="ml-1 text-xs font-medium text-blue-600">
                Unit
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Perubahan kondisi */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-800">
            Perubahan Hasil Opname
          </h4>

          {perubahan.length > 0 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              {perubahan.length} Kondisi Berubah
            </span>
          )}
        </div>

        {perubahan.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {perubahan.map((itemPerubahan) => {
              const gayaPerubahan = itemPerubahan.perluPerhatian
                ? {
                    wrapper:
                      "border-rose-200 bg-rose-50/70",
                    label: "text-rose-700",
                    angka: "text-rose-700",
                    badge:
                      "bg-rose-100 text-rose-700",
                  }
                : {
                    wrapper:
                      "border-emerald-200 bg-emerald-50/70",
                    label: "text-emerald-700",
                    angka: "text-emerald-700",
                    badge:
                      "bg-emerald-100 text-emerald-700",
                  };

              return (
                <div
                  key={itemPerubahan.key}
                  className={`rounded-xl border p-3 ${gayaPerubahan.wrapper}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-sm font-bold ${gayaPerubahan.label}`}
                    >
                      {itemPerubahan.label}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${gayaPerubahan.badge}`}
                    >
                      {itemPerubahan.selisih > 0
                        ? `Bertambah ${formatAngka(itemPerubahan.selisih)}`
                        : `Berkurang ${formatAngka(Math.abs(itemPerubahan.selisih))}`}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Sebelum
                      </p>
                      <p className="text-xl font-bold text-slate-600 sm:text-2xl">
                        {formatAngka(itemPerubahan.sebelum)}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />

                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Sesudah
                      </p>
                      <p
                        className={`text-xl font-extrabold sm:text-2xl ${gayaPerubahan.angka}`}
                      >
                        {formatAngka(itemPerubahan.sesudah)}
                      </p>
                    </div>

                    <span className="ml-auto text-[10px] text-slate-500">
                      Unit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : belumDiperiksa ? (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-500">
            Hasil pemeriksaan fisik belum tersedia.
          </p>
        ) : (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Tidak ada perubahan kondisi. Hasil fisik sesuai dengan data sistem.
          </p>
        )}

        {/* Selisih jumlah keseluruhan */}
        {pengadaan.selisih_jumlah !== null && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">
              Selisih jumlah keseluruhan:
            </span>

            <strong
              className={
                pengadaan.selisih_jumlah === 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              }
            >
              {pengadaan.selisih_jumlah > 0 ? "+" : ""}
              {formatAngka(pengadaan.selisih_jumlah)} Unit
            </strong>
          </div>
        )}
      </div>

      {/* Catatan pemeriksaan */}
      {pengadaan.catatan && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-700">
            Catatan Pemeriksaan
          </p>
          <p className="mt-1 break-words text-xs leading-5 text-slate-600">
            {pengadaan.catatan}
          </p>
        </div>
      )}
    </article>
  );
}