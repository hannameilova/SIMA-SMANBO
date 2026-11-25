
"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import AksiNotification from "@/components/stok-opname/AksiNotification";
import LokasiGridSkeleton from "@/components/stok-opname/LokasiGridSkeleton";
import LokasiRoomCard from "@/components/stok-opname/LokasiRoomCard";
import LokasiSearchFilterBar from "@/components/stok-opname/LokasiSearchFilterBar";
import PilihRuanganStickyBar from "@/components/stok-opname/PilihRuanganStickyBar";
import StokOpnamePageHeader from "@/components/stok-opname/StokOpnamePageHeader";

import { useLokasiOpname } from "@/hooks/useLokasiOpname";

// Mengambil ID sesi dari format frontend maupun backend
function ambilIdOpname(room) {
  return room?.idOpname ?? room?.id_opname ?? null;
}

// Menyamakan format status dari backend dan frontend
function ambilStatusRuangan(room) {
  const status =
    room?.status_opname ?? room?.status ?? "belum_diperiksa";

  if (status === "berlangsung" || status === "draft") {
    return "sedang_berlangsung";
  }

  return status;
}

export default function PilihRuanganView() {
  const router = useRouter();

  const {
    filteredLokasi,
    gedungOptions,
    kategoriOptions,
    counts,
    isLoading,
    isEmpty,
    hasActiveFilters,
    error,
    actionError,
    isCreatingSession,
    search,
    selectedGedung,
    selectedKategori,
    activeTab,
    selectedRoom,
    setSearch,
    setSelectedGedung,
    setSelectedKategori,
    setActiveTab,
    selectRoom,
    resetFilters,
    refresh,
    clearActionError,
    setActionError,
    startOpnameSession,
  } = useLokasiOpname();

  // Memulai sesi baru atau melanjutkan sesi yang sudah berjalan
  async function handleProceed() {
    if (!selectedRoom || isCreatingSession) return;

    const status = ambilStatusRuangan(selectedRoom);
    const idOpname = ambilIdOpname(selectedRoom);

    // Lanjutkan sesi yang masih berlangsung
    if (status === "sedang_berlangsung") {
      if (idOpname) {
        router.push(`/stok-opname/${idOpname}/pengecekan`);
      } else {
        setActionError(
          "ID sesi opname yang sedang berlangsung tidak ditemukan. Silakan muat ulang daftar ruangan."
        );
      }

      return;
    }

    // Buat sesi baru untuk ruangan yang belum diperiksa
    // maupun ruangan yang sudah selesai opname
    if (
      status === "belum_diperiksa" ||
      status === "selesai_opname"
    ) {
      const hasil = await startOpnameSession(selectedRoom.id);

      if (hasil?.idOpname) {
        router.push(`/stok-opname/${hasil.idOpname}/pengecekan`);
      }

      return;
    }

    setActionError("Status ruangan tidak dikenali. Silakan muat ulang daftar ruangan.");
  }

  // Melihat hasil sesi opname terakhir
  function handleViewResult(room) {
    const idOpname = ambilIdOpname(room);

    if (!idOpname) {
      setActionError(
        "ID sesi opname tidak tersedia. Data sesi terakhir belum diterima dari server."
      );
      return;
    }

    router.push(`/stok-opname/${idOpname}/ringkasan`);
  }

  function handleCancel() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1500px] px-3.5 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-7">
        <StokOpnamePageHeader
          tahapAktif={1}
          subjudul="Pilih ruangan yang akan dilakukan pemeriksaan fisik dan inventarisasi stok opname barang."
        />

        <div className="mt-5 space-y-4">
          <AksiNotification
            errorAksi={actionError}
            onClose={clearActionError}
          />

          <LokasiSearchFilterBar
            search={search}
            selectedGedung={selectedGedung}
            selectedKategori={selectedKategori}
            activeTab={activeTab}
            gedungOptions={gedungOptions}
            kategoriOptions={kategoriOptions}
            counts={counts}
            onSearchChange={setSearch}
            onGedungChange={setSelectedGedung}
            onKategoriChange={setSelectedKategori}
            onTabChange={setActiveTab}
          />

          {isLoading ? (
            <LokasiGridSkeleton />
          ) : error ? (
            <ErrorState pesan={error} onRetry={refresh} />
          ) : isEmpty ? (
            <EmptyState
              judul="Belum ada ruangan tersedia"
              deskripsi="Belum ditemukan ruangan yang memiliki inventaris untuk dilakukan stok opname."
              onRetry={refresh}
            />
          ) : filteredLokasi.length === 0 ? (
            <EmptyState
              judul="Tidak ada ruangan yang cocok"
              deskripsi="Coba ubah kata kunci pencarian, pilihan gedung, kategori, atau filter status ruangan."
              onReset={hasActiveFilters ? resetFilters : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLokasi.map((room) => (
                <LokasiRoomCard
                  key={room.id}
                  room={room}
                  selected={selectedRoom?.id === room.id}
                  disabled={isCreatingSession}
                  onSelect={selectRoom}
                  onViewResult={handleViewResult}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && !isEmpty && (
            <PilihRuanganStickyBar
              selectedRoom={selectedRoom}
              isCreatingSession={isCreatingSession}
              onCancel={handleCancel}
              onProceed={handleProceed}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ pesan, onRetry }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
        Daftar ruangan tidak dapat dimuat
      </h2>

      <p className="mx-auto mt-1.5 max-w-lg break-words text-xs leading-6 text-slate-500 sm:text-sm">
        {pesan}
      </p>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition-colors hover:bg-blue-700 sm:text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
      </div>
    </section>
  );
}

function EmptyState({ judul, deskripsi, onRetry, onReset }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Building2 className="h-7 w-7" strokeWidth={1.7} />
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
          className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:text-sm"
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