"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const GAYA = {
  sukses: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
    ikon: "text-emerald-600",
  },
  info: {
    wrapper: "border-blue-200 bg-blue-50 text-blue-800",
    ikon: "text-blue-600",
  },
  error: {
    wrapper: "border-red-200 bg-red-50 text-red-800",
    ikon: "text-red-600",
  },
};

export default function AksiNotification({
  notifikasi,
  errorAksi,
  onClose,
}) {
  if (!notifikasi && !errorAksi) return null;

  const tipe = errorAksi ? "error" : notifikasi?.tipe ?? "info";
  const gaya = GAYA[tipe];
  const pesan = notifikasi?.pesan ?? "Terjadi kesalahan.";
  const Ikon =
    tipe === "sukses"
      ? CheckCircle2
      : tipe === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      role={tipe === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs sm:text-sm ${gaya.wrapper}`}
    >
      <Ikon className={`mt-0.5 h-4 w-4 shrink-0 ${gaya.ikon}`} />

      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-5">{pesan}</p>
        {errorAksi && (
          <p className="mt-0.5 break-words text-[11px] leading-5 opacity-90">
            {errorAksi}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-current opacity-60 transition-opacity hover:opacity-100"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
