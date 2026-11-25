export default function LokasiGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Memuat daftar ruangan stok opname"
    >
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex animate-pulse flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div>
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-28 rounded-md bg-slate-100" />
                <div className="h-5 w-24 rounded-md bg-slate-100" />
              </div>
            </div>

            <div className="mt-4 h-5 w-4/5 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-2/5 rounded bg-slate-100" />

            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3.5">
              <div className="flex justify-between gap-4">
                <div className="h-3.5 w-28 rounded bg-slate-100" />
                <div className="h-3.5 w-24 rounded bg-slate-100" />
              </div>
              <div className="flex justify-between gap-4">
                <div className="h-3.5 w-24 rounded bg-slate-100" />
                <div className="h-3.5 w-28 rounded bg-slate-100" />
              </div>
              <div className="flex justify-between gap-4">
                <div className="h-3.5 w-24 rounded bg-slate-100" />
                <div className="h-3.5 w-20 rounded bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="mt-5 h-10 w-full rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
