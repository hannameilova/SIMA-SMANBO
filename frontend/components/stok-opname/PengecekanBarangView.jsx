
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Info,
  PackageOpen,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import BarangAccordionItem from "@/components/stok-opname/BarangAccordionItem";
import PengecekanBarangSkeleton from "@/components/stok-opname/PengecekanBarangSkeleton";
import ProgressCard from "@/components/stok-opname/ProgressCard";
import RoomInfoCard from "@/components/stok-opname/RoomInfoCard";
import SearchFilterBar from "@/components/stok-opname/SearchFilterBar";
import StickyActionBar from "@/components/stok-opname/StickyActionBar";
import StokOpnamePageHeader from "@/components/stok-opname/StokOpnamePageHeader";
import { useStockOpname } from "@/hooks/useStockOpname";
import {
  cocokFilterStatus,
  formatAngka,
  kelompokkanKategori,
} from "@/lib/stok-opname/utils";

export default function PengecekanBarangView({ idOpname }) {
  const router = useRouter();

  const {
    sesi,
    ringkasan,
    lokasi,
    pengguna,
    barang,
    statistik,
    jumlahKotor,
    loading,
    error,
    saving,
    reviewing,
    errorAksi,
    notifikasi,
    tambahKondisi,
    kurangiKondisi,
    ubahCatatan,
    simpanDraf,
    tinjauHasil,
    muatUlang,
    bersihkanNotifikasi,
    bersihkanErrorAksi,
  } = useStockOpname(idOpname);

  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [expanded, setExpanded] = useState(new Set());

  const kategoriOptions = useMemo(
    () => kelompokkanKategori(barang),
    [barang]
  );

  const barangTampil = useMemo(() => {
    const kataKunci = search.trim().toLowerCase();

    return barang.filter((item) => {
      const teks = [
        item.barang.nama_barang,
        item.barang.kode_barang,
        item.barang.kategori,
        item.kelompok.tahun_pengadaan,
      ]
        .join(" ")
        .toLowerCase();

      const cocokPencarian =
        !kataKunci || teks.includes(kataKunci);

      const cocokKategori =
        !kategori || item.barang.kategori === kategori;

      return (
        cocokPencarian &&
        cocokKategori &&
        cocokFilterStatus(item.status, statusFilter)
      );
    });
  }, [barang, kategori, search, statusFilter]);

  // Membuka atau menutup accordion barang
  function toggleBarang(idDetail) {
    setExpanded((sebelumnya) => {
      if (sebelumnya.has(idDetail)) {
        return new Set();
      }

      return new Set([idDetail]);
    });
  }

  // Mereset filter pencarian
  function resetFilter() {
    setSearch("");
    setKategori("");
    setStatusFilter("semua");
  }

  // Membuka halaman ringkasan
  async function tanganiTinjauHasil() {
    const hasil = await tinjauHasil();

    if (hasil) {
      router.push(`/stok-opname/${idOpname}/ringkasan`);
    }
  }

  // Menutup notifikasi
  function tutupNotifikasi() {
    bersihkanNotifikasi();
    bersihkanErrorAksi();
  }

  const totalTarget =
    ringkasan?.jumlah_data_stok ?? barang.length;

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1500px] px-3.5 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-7">
        <StokOpnamePageHeader tahapAktif={2} />

        <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
          {loading ? (
            <PengecekanBarangSkeleton />
          ) : error || !sesi ? (
            <ErrorState
              pesan={
                error ||
                "Data sesi stok opname tidak ditemukan."
              }
              onRetry={muatUlang}
            />
          ) : (
            <>
              <RoomInfoCard
                sesi={sesi}
                lokasi={lokasi}
                pengguna={pengguna}
                totalTarget={totalTarget}
              />

              <ProgressCard statistik={statistik} />

              <SearchFilterBar
                search={search}
                kategori={kategori}
                status={statusFilter}
                kategoriOptions={kategoriOptions}
                statistik={statistik}
                onSearchChange={setSearch}
                onKategoriChange={setKategori}
                onStatusChange={setStatusFilter}
              />

              {barang.length === 0 ? (
                <EmptyState
                  judul="Belum ada barang untuk diperiksa"
                  deskripsi="Sesi ini belum memiliki detail stok barang pada ruangan yang dipilih."
                  onRetry={muatUlang}
                />
              ) : barangTampil.length === 0 ? (
                <EmptyState
                  judul="Tidak ada barang yang cocok"
                  deskripsi="Coba ubah kata kunci, kategori, atau status pengecekan untuk menampilkan barang lainnya."
                  onReset={resetFilter}
                />
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {barangTampil.map((item) => (
                    <BarangAccordionItem
                      key={item.key}
                      item={item}
                      open={expanded.has(item.kelompok.id_detail)}
                      disabled={saving || reviewing}
                      onToggle={() =>
                        toggleBarang(item.kelompok.id_detail)
                      }
                      onTambahKondisi={(kondisi) =>
                        tambahKondisi(
                          item.kelompok.id_detail,
                          kondisi
                        )
                      }
                      onKurangiKondisi={(kondisi) =>
                        kurangiKondisi(
                          item.kelompok.id_detail,
                          kondisi
                        )
                      }
                      onCatatanChange={(catatan) =>
                        ubahCatatan(
                          item.kelompok.id_detail,
                          catatan
                        )
                      }
                    />
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[11px] leading-5 text-slate-500 shadow-sm sm:px-4 sm:text-xs">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                <p>
                  Menampilkan{" "}
                  <strong className="font-semibold text-slate-700">
                    {formatAngka(barangTampil.length)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="font-semibold text-slate-700">
                    {formatAngka(barang.length)}
                  </strong>{" "}
                  barang pada ruangan ini.

                  {jumlahKotor > 0
                    ? ` ${formatAngka(jumlahKotor)} perubahan belum disimpan.`
                    : " Seluruh perubahan pemeriksaan sudah tersimpan."}
                </p>
              </div>

              <StickyActionBar
                dirtyCount={jumlahKotor}
                saving={saving}
                reviewing={reviewing}
                canReview={barang.length > 0}
                notifikasi={notifikasi}
                errorAksi={errorAksi}
                onCloseNotification={tutupNotifikasi}
                onSave={() => {
                  void simpanDraf();
                }}
                onReview={() => {
                  void tanganiTinjauHasil();
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ pesan, onRetry }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
        Data sesi tidak dapat dimuat
      </h2>

      <p className="mx-auto mt-1.5 max-w-lg break-words text-xs leading-6 text-slate-500 sm:text-sm">
        {pesan}
      </p>

      <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-bold text-white transition-colors hover:bg-blue-800 sm:text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>

        <Link
          href="/stok-opname"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pilih Ruangan
        </Link>
      </div>
    </section>
  );
}

function EmptyState({ judul, deskripsi, onRetry, onReset }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <PackageOpen className="h-7 w-7" strokeWidth={1.7} />
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
        {judul}
      </h2>

      <p className="mx-auto mt-1.5 max-w-md text-xs leading-6 text-slate-500 sm:text-sm">
        {deskripsi}
      </p>

      {(onRetry || onReset) && (
        <button
          type="button"
          onClick={onRetry ?? onReset}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 sm:text-sm"
        >
          {onRetry ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}

          {onRetry ? "Muat Ulang" : "Reset Filter"}
        </button>
      )}
    </section>
  );
}