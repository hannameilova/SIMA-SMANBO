"use client";

import { Construction, LayoutDashboard } from "lucide-react";

export default function DashboardView() {
  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 md:p-8">
      <div className="mb-7">
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">
          Ringkasan data inventaris sekolah.
        </p>
      </div>

      <section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Construction size={32} strokeWidth={1.7} />
        </div>

        <span className="mt-6 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Under Construction
        </span>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Dashboard sedang dikembangkan
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Ringkasan inventaris dan statistik aset akan tersedia setelah modul
          dashboard selesai dikembangkan.
        </p>
      </section>
    </div>
  );
}
