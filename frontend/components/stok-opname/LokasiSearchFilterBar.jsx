"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { OPSI_TAB_LOKASI, formatAngka } from "@/lib/stok-opname/utils";

function ambilJumlahTab(tabValue, counts) {
  if (tabValue === "semua") return counts.semua;
  if (tabValue === "belum_diperiksa") return counts.belum_diperiksa;
  if (tabValue === "sedang_berlangsung") return counts.sedang_berlangsung;
  return counts.selesai_opname;
}

export default function LokasiSearchFilterBar({
  search,
  selectedGedung,
  selectedKategori,
  activeTab,
  gedungOptions,
  kategoriOptions,
  counts,
  onSearchChange,
  onGedungChange,
  onKategoriChange,
  onTabChange,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <label htmlFor="pencarian-lokasi-opname" className="sr-only">
            Cari nama ruangan
          </label>
          <input
            id="pencarian-lokasi-opname"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama ruangan..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:flex md:shrink-0">
          <div className="relative min-w-0 md:w-44 lg:w-48">
            <label htmlFor="filter-kategori-opname" className="sr-only">
              Filter kategori ruangan
            </label>
            <select
              id="filter-kategori-opname"
              value={selectedKategori}
              onChange={(event) => onKategoriChange(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filter status opname ruangan"
        className="mt-3.5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {OPSI_TAB_LOKASI.map((tab) => {
          const aktif = activeTab === tab.value;
          const jumlah = ambilJumlahTab(tab.value, counts);

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => onTabChange(tab.value)}
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                aktif
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>
                {tab.label} ({formatAngka(jumlah)})
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}