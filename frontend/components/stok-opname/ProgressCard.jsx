import { formatAngka } from "@/lib/stok-opname/utils";

export default function ProgressCard({ statistik }) {
  const warnaBadgePersen =
    statistik.persen >= 75
      ? "bg-emerald-600 text-white"
      : statistik.persen > 0
        ? "bg-orange-500 text-white"
        : "bg-slate-200 text-slate-600";

  const warnaProgres =
    statistik.persen >= 75
      ? "bg-emerald-600"
      : statistik.persen > 0
        ? "bg-orange-500"
        : "bg-slate-300";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
            Progres Pengecekan Fisik
          </p>

          <p className="mt-0.5 text-lg font-extrabold leading-tight text-slate-900 sm:text-xl lg:text-2xl">
            {formatAngka(statistik.checked)} dari{" "}
            {formatAngka(statistik.total)} Barang Dicek
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold sm:text-xs ${warnaBadgePersen}`}
        >
          {statistik.persen}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Progres pengecekan barang"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={statistik.persen}
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:h-2.5"
      >
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-300 ease-out ${warnaProgres}`}
          style={{ width: `${Math.min(100, Math.max(0, statistik.persen))}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:text-xs">
          <strong className="font-extrabold">
            {formatAngka(statistik.sesuai)}
          </strong>
          Sesuai
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700 sm:text-xs">
          <strong className="font-extrabold">
            {formatAngka(statistik.temuan)}
          </strong>
          Terdapat Temuan
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
          <strong className="font-extrabold">
            {formatAngka(statistik.belum)}
          </strong>
          Belum Diperiksa
        </span>
      </div>
    </section>
  );
}
