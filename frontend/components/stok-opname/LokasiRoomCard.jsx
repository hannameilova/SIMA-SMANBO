
"use client";

import {
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  Eye,
  FlaskConical,
  GraduationCap,
  Monitor,
  Server,
  Settings,
  Video,
  Warehouse,
} from "lucide-react";
import { formatAngka } from "@/lib/stok-opname/utils";

const STATUS_CONFIG = {
  belum_diperiksa: {
    label: "Belum Diperiksa",
    badgeClass: "border-amber-200/80 bg-amber-50 text-amber-700",
  },
  sedang_berlangsung: {
    label: "Sedang Berlangsung",
    badgeClass: "border-blue-200/80 bg-blue-50 text-blue-600",
  },
  selesai_opname: {
    label: "Selesai Opname",
    badgeClass: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  },
};

function IkonRuangan({ room }) {
  const teks = `${room.namaLokasi} ${room.kategoriLabel}`.toLowerCase();

  if (
    teks.includes("multimedia") ||
    teks.includes("broadcast") ||
    teks.includes("studio")
  ) {
    return <Video className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (
    teks.includes("server") ||
    teks.includes("data center") ||
    teks.includes("infrastruktur it")
  ) {
    return <Server className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (teks.includes("komputer") || teks.includes("praktikum")) {
    return <Monitor className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (teks.includes("perpustakaan") || teks.includes("belajar")) {
    return <BookOpen className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (
    teks.includes("workshop") ||
    teks.includes("otomotif") ||
    teks.includes("kejuruan")
  ) {
    return <Settings className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (teks.includes("lab") || teks.includes("ipa")) {
    return <FlaskConical className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (teks.includes("kelas")) {
    return <GraduationCap className="h-5 w-5" strokeWidth={1.9} />;
  }

  if (teks.includes("gudang")) {
    return <Warehouse className="h-5 w-5" strokeWidth={1.9} />;
  }

  return <Building2 className="h-5 w-5" strokeWidth={1.9} />;
}

export default function LokasiRoomCard({
  room,
  selected,
  disabled,
  onSelect,
  onViewResult,
}) {
  const statusBackend =
    room.status_opname ?? room.status ?? "belum_diperiksa";

  const statusRuangan =
    statusBackend === "berlangsung" || statusBackend === "draft"
      ? "sedang_berlangsung"
      : statusBackend;

  const statusInfo =
    STATUS_CONFIG[statusRuangan] ?? STATUS_CONFIG.belum_diperiksa;

  function handleSelect() {
    if (disabled) return;
    onSelect(room);
  }

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl bg-white p-5 transition-all ${
        selected
          ? "border border-blue-600 ring-1 ring-blue-600 shadow-sm"
          : "border border-slate-200 shadow-sm hover:border-slate-300"
      }`}
    >
      <div>
        {/* Identitas ruangan dan status */}
        <div className="flex items-start gap-3.5">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
              selected
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {selected ? (
              <Check className="h-5 w-5" strokeWidth={2.5} />
            ) : (
              <IkonRuangan room={room} />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <span className="inline-flex max-w-full items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              <span className="truncate">{room.kategoriLabel}</span>
            </span>

            <span
              className={`inline-flex max-w-full items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.badgeClass}`}
            >
              <span className="truncate">{statusInfo.label}</span>
            </span>
          </div>

          {selected && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
              Dipilih
            </span>
          )}
        </div>

        {/* Nama ruangan */}
        <h2 className="mt-4 break-words text-base font-bold leading-snug text-slate-900">
          {room.judulTampil}
        </h2>

        {/* Informasi ruangan */}
        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3.5 text-xs">
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-slate-600">
              Total Jenis Aset:
            </dt>

            <dd className="min-w-0 text-right font-semibold text-slate-800">
              {formatAngka(room.totalTarget)} Barang Inventaris
            </dd>
          </div>

          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-slate-600">
              Terakhir Opname:
            </dt>

            <dd
              className={`min-w-0 text-right font-medium ${
                room.terakhirHariIni
                  ? "font-semibold text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              {room.terakhirOpname}
            </dd>
          </div>
        </dl>
      </div>

      {/* Aksi kartu */}
      <div className="mt-5 flex flex-col gap-2">
        {/* Lihat hasil hanya untuk sesi yang selesai */}
        {statusRuangan === "selesai_opname" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onViewResult(room)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Lihat Hasil Opname</span>
            <Eye className="h-4 w-4" strokeWidth={2} />
          </button>
        )}

        {/* Pilih ruangan untuk semua status */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleSelect}
          aria-pressed={selected}
          className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            selected
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-slate-200 bg-slate-50/70 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
          }`}
        >
          <span>
            {selected ? "Ruangan Dipilih" : "Pilih Ruangan Ini"}
          </span>

          {selected ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          )}
        </button>
      </div>
    </article>
  );
}