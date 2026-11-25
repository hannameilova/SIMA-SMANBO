export default function PengecekanBarangSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat data pemeriksaan">
      <div className="h-[88px] animate-pulse rounded-2xl border border-slate-200 bg-white sm:h-[96px]" />

      <div className="h-[160px] animate-pulse rounded-2xl border border-slate-200 bg-white sm:h-[150px]" />

      <div className="h-[118px] animate-pulse rounded-2xl border border-slate-200 bg-white sm:h-[104px]" />

      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex animate-pulse items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 sm:h-11 sm:w-11" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-100 sm:w-1/2" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>

            <div className="h-4 w-4 shrink-0 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
