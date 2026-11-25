"use client";

import { ArrowRight, Loader2, Save } from "lucide-react";
import AksiNotification from "@/components/stok-opname/AksiNotification";

export default function StickyActionBar({
  dirtyCount,
  saving,
  reviewing,
  canReview,
  onSave,
  onReview,
  notifikasi,
  errorAksi,
  onCloseNotification,
}) {
  const sibuk = saving || reviewing;

  return (
    <div className="sticky bottom-0 z-40 mt-4 pb-4 pt-2">
      <div className="space-y-2">
        <AksiNotification
          notifikasi={notifikasi}
          errorAksi={errorAksi}
          onClose={onCloseNotification}
        />

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] backdrop-blur sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p
              className="hidden text-[14px] font-medium text-slate-700 sm:block"
              aria-live="polite"
            >
              {dirtyCount > 0
                ? `${dirtyCount} perubahan belum disimpan`
                : "Semua perubahan pemeriksaan sudah tersimpan"}
            </p>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:justify-end">
              <button
                type="button"
                onClick={onSave}
                disabled={sibuk}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[120px] sm:px-5 sm:text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 sm:hidden" />
                )}
                <span>{saving ? "Menyimpan..." : "Simpan Draf"}</span>
              </button>

              <button
                type="button"
                onClick={onReview}
                disabled={sibuk || !canReview}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[150px] sm:px-5 sm:text-sm"
              >
                {reviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Tinjau Hasil</span>
                )}
                {!reviewing && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}