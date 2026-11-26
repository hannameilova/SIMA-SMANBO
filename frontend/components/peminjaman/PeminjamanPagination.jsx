"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PILIHAN_UKURAN = [5, 10, 20];

export default function PeminjamanPagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  label = "Transaksi",
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const awal = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const akhir = Math.min(page * pageSize, total);

  function buatHalamanRange() {
    const range = [];
    const delta = 2;
    const left = page - delta;
    const right = page + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= left && i <= right)
      ) {
        range.push(i);
      }
    }

    const result = [];
    let prev = null;

    for (const i of range) {
      if (prev !== null && i - prev > 1) {
        result.push("...");
      }
      result.push(i);
      prev = i;
    }

    return result;
  }

  const halaman = buatHalamanRange();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      {/* Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Baris per halaman:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PILIHAN_UKURAN.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span>
          Menampilkan {awal}–{akhir} dari {total} {label}.
        </span>
      </div>

      {/* Navigasi */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={15} />
        </button>

        {halaman.map((item, idx) =>
          item === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                item === page
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
