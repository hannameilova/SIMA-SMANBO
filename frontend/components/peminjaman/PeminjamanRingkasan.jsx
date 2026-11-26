"use client";

function StatSkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-3 w-32 rounded bg-slate-200" />
      <div className="mt-3 h-8 w-24 rounded bg-slate-200" />
      <div className="mt-2.5 h-3 w-40 rounded bg-slate-100" />
    </div>
  );
}

export default function PeminjamanRingkasan({
  ringkasan,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatSkeletonCard />
        <StatSkeletonCard />
        <StatSkeletonCard />
      </div>
    );
  }

  const {
    unitDipinjam = 0,
    transaksiAktif = 0,
    terlambat = 0,
  } = ringkasan || {};

  const cards = [
    {
      judul: "UNIT SEDANG DIPINJAM",
      angka: unitDipinjam,
      satuan: "Unit",
      keterangan: `Dari ${transaksiAktif} transaksi aktif`,
    },
    {
      judul: "TRANSAKSI AKTIF",
      angka: transaksiAktif,
      satuan: "Transaksi",
      keterangan: "Transaksi yang masih berstatus dipinjam",
    },
    {
      judul: "LEWAT ESTIMASI PENGEMBALIAN",
      angka: terlambat,
      satuan: "Transaksi",
      keterangan:
        terlambat > 0
          ? `${terlambat} transaksi perlu ditindaklanjuti`
          : "Semua transaksi tepat waktu",
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

          <p className="mt-2 text-xs text-slate-500">
            {card.keterangan}
          </p>
        </div>
      ))}
    </div>
  );
}