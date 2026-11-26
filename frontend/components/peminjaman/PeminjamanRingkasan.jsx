"use client";

import {
  Package,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

function RingkasanCard({ ikon: Ikon, judul, nilai, keterangan, warna = "blue" }) {
  const warnaMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      ring: "ring-blue-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      ring: "ring-emerald-100",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      ring: "ring-orange-100",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      ring: "ring-red-100",
    },
  };

  const c = warnaMap[warna] || warnaMap.blue;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ring-2 ${c.bg} ${c.ring}`}
        >
          <Ikon size={18} className={c.text} strokeWidth={1.8} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {judul}
        </p>
      </div>

      <p className="text-3xl font-bold tracking-tight text-slate-900">
        {nilai}
        <span className="ml-1.5 text-sm font-medium text-slate-400">Unit</span>
      </p>

      {keterangan && (
        <p className="mt-1.5 text-xs text-slate-500">{keterangan}</p>
      )}
    </div>
  );
}

export default function PeminjamanRingkasan({ ringkasan, loading }) {
  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  const { unitDipinjam = 0, transaksiAktif = 0, terlambat = 0 } =
    ringkasan || {};

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <RingkasanCard
        ikon={Package}
        judul="Unit Sedang Dipinjam"
        nilai={unitDipinjam}
        keterangan={`Dari ${transaksiAktif} Transaksi Aktif.`}
        warna="blue"
      />

      <RingkasanCard
        ikon={ClipboardList}
        judul="Transaksi Aktif"
        nilai={transaksiAktif}
        keterangan="Transaksi yang masih berstatus dipinjam."
        warna="green"
      />

      <RingkasanCard
        ikon={AlertTriangle}
        judul="Lewat Estimasi Pengembalian"
        nilai={terlambat}
        keterangan={
          terlambat > 0
            ? `Dari ${terlambat} transaksi perlu ditindaklanjuti.`
            : "Semua transaksi tepat waktu."
        }
        warna={terlambat > 0 ? "red" : "green"}
      />
    </div>
  );
}
