
"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { formatAngka } from "@/lib/stok-opname/utils";

function ambilLabelTombol(room) {
  if (!room) return "Pilih Ruangan Terlebih Dahulu";

  const status =
    room.status_opname ?? room.status ?? "belum_diperiksa";

  if (
    status === "berlangsung" ||
    status === "draft" ||
    status === "sedang_berlangsung"
  ) {
    return "Lanjutkan Pemeriksaan";
  }

  if (status === "selesai" || status === "selesai_opname") {
    return "Mulai Opname Baru";
  }

  return "Mulai Pengecekan Barang";
}

export default function PilihRuanganStickyBar({
  selectedRoom,
  isCreatingSession,
  onCancel,
  onProceed,
}) {
  const labelTombol = ambilLabelTombol(selectedRoom);

  return (
    <div className="sticky bottom-0 z-30 mt-6 pb-4 pt-2">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Informasi ruangan terpilih */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                selectedRoom
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-slate-600">
                Ruangan Terpilih:
              </p>

              {selectedRoom ? (
                <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                  {selectedRoom.judulTampil}
                  <span className="ml-2 font-normal text-slate-400">
                    •
                  </span>
                  <span className="ml-2 font-semibold text-blue-600">
                    {formatAngka(selectedRoom.totalTarget)} Jenis Aset
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-600 sm:text-base">
                  Pilih salah satu ruangan untuk melakukan Stok Opname
                </p>
              )}
            </div>
          </div>

          {/* Tombol aksi utama */}
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
            <button
              type="button"
              onClick={onProceed}
              disabled={!selectedRoom || isCreatingSession}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:text-sm"
            >
              {isCreatingSession ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Membuat Sesi...</span>
                </>
              ) : (
                <>
                  <span>{labelTombol}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}