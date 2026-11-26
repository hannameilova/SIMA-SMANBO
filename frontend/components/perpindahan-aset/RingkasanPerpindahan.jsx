"use client";

import { formatAngka } from "@/lib/perpindahan-aset/utils";

function StatSkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-3 w-32 rounded bg-slate-200" />
      <div className="mt-3 h-8 w-24 rounded bg-slate-200" />
      <div className="mt-2.5 h-3 w-40 rounded bg-slate-100" />
    </div>
  );
}

/**
 * Menampilkan 3 card statistik ringkasan perpindahan aset dari data API sebenarnya.
 */
export default function RingkasanPerpindahan({ statistik, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatSkeletonCard />
        <StatSkeletonCard />
        <StatSkeletonCard />
      </div>
    );
  }

  const cards = [
    {
      judul: "PERPINDAHAN BULAN INI",
      angka: formatAngka(statistik?.bulanIni ?? 0),
      satuan: "Mutasi",
      keterangan: statistik?.periodeLabel
        ? `Periode ${statistik.periodeLabel}`
        : "Bulan berjalan",
    },
    {
      judul: "TOTAL UNIT BERPINDAH",
      angka: formatAngka(statistik?.totalUnit ?? 0),
      satuan: "Unit Fisik",
      keterangan: "Akumulasi seluruh unit yang dipindahkan",
    },
    {
      judul: "RUANGAN TERLIBAT",
      angka: formatAngka(statistik?.ruanganTerlibat ?? 0),
      satuan: "Ruangan Aktif",
      keterangan: "Lokasi asal & tujuan unik tercatat",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.judul}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-[11px] font-bold tracking-wider text-slate-400">
            {card.judul}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {card.angka}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {card.satuan}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-500">{card.keterangan}</p>
        </div>
      ))}
    </div>
  );
}
