"use client";

import { Search, X, ArrowUpDown } from "lucide-react";

const KATEGORI_OPTIONS = [
  { value: "semua", label: "Semua Kategori" },
  { value: "Guru", label: "Guru" },
  { value: "OSIS/MPK", label: "OSIS/MPK" },
  { value: "Lainnya", label: "Lainnya" },
];

const URUTAN_OPTIONS = [
  { value: "terbaru", label: "Tanggal Terbaru" },
  { value: "terlama", label: "Tanggal Terlama" },
];

export default function PeminjamanFilterBar({
  query,
  onQueryChange,
  kategori,
  onKategoriChange,
  urutan,
  onUrutanChange,
  onHapusFilter,
}) {
  const adaFilter = query.trim() !== "" || kategori !== "semua";

  return (
    <div className="border-b border-slate-100 px-4 py-3">
      {/* Baris 1: Search dan Kategori */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cari kode atau nama barang, nama peminjam..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Kategori Peminjam */}
        <select
          value={kategori}
          onChange={(e) => onKategoriChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {KATEGORI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Urutan */}
        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown size={13} className="text-slate-400" />
          <select
            value={urutan}
            onChange={(e) => onUrutanChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {URUTAN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Baris 2: Filter aktif */}
      {adaFilter && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Aktif:</span>

          {kategori !== "semua" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700">
              Kategori: {kategori}
              <button
                type="button"
                onClick={() => onKategoriChange("semua")}
                className="ml-0.5 hover:text-blue-900"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {query.trim() && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
              &ldquo;{query}&rdquo;
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="ml-0.5 hover:text-slate-800"
              >
                <X size={11} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onHapusFilter}
            className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Hapus semua filter
          </button>
        </div>
      )}
    </div>
  );
}
