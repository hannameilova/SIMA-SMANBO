"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { OPSI_FILTER_STATUS, formatAngka } from "@/lib/stok-opname/utils";

function jumlahUntukFilter(filter, statistik) {
  if (filter === "semua") return statistik.total;
  if (filter === "belum") return statistik.belum;
  if (filter === "temuan") return statistik.temuan;
  return statistik.sesuai;
}

export default function SearchFilterBar({
  search,
  kategori,
  status,
  kategoriOptions,
  statistik,
  onSearchChange,
  onKategoriChange,
  onStatusChange,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <label htmlFor="pencarian-barang" className="sr-only">
            Cari kode atau nama barang
          </label>
          <input
            id="pencarian-barang"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari kode atau nama barang di ruangan ini..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-base text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative min-w-0 md:w-44 lg:w-48">
          <label htmlFor="filter-kategori" className="sr-only">
            Filter kategori
          </label>
          <select
            id="filter-kategori"
            value={kategori}
            onChange={(event) => onKategoriChange(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-base font-medium text-slate-600 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-sm"
          >
            <option value="">Semua Kategori</option>
            {kategoriOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative min-w-0 md:w-44 lg:w-48">
          <label htmlFor="filter-status" className="sr-only">
            Filter status cek
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-base font-medium text-slate-600 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-sm"
          >
            <option value="semua">Semua Status Cek</option>
            <option value="belum">Belum Dicek</option>
            <option value="temuan">Ada Selisih / Berubah</option>
            <option value="sesuai">Sesuai</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter cepat status barang"
        className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {OPSI_FILTER_STATUS.map((opsi) => {
          const aktif = status === opsi.value;
          const jumlah = jumlahUntukFilter(opsi.value, statistik);

          return (
            <button
              key={opsi.value}
              type="button"
              aria-pressed={aktif}
              onClick={() => onStatusChange(opsi.value)}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-semibold transition-colors sm:text-xs ${
                aktif
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{opsi.label}</span>
              <span
                className={
                  aktif
                    ? "text-blue-100"
                    : opsi.value === "temuan"
                      ? "text-orange-500"
                      : "text-slate-400"
                }
              >
                ({formatAngka(jumlah)})
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
