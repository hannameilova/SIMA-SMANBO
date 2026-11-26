"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Package, Search, X } from "lucide-react";
import { formatAngka } from "@/lib/perpindahan-aset/utils";

/**
 * Dropdown pilih barang dengan fitur pencarian interaktif berdasarkan nama atau kode barang.
 */
export default function SearchableBarangSelect({
  barangOptions = [],
  value = "",
  loading = false,
  error = "",
  disabled = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedItem = useMemo(
    () =>
      barangOptions.find(
        (item) => String(item.id_barang) === String(value)
      ) || null,
    [barangOptions, value]
  );

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return barangOptions;

    return barangOptions.filter((item) => {
      const teks = `${item.nama_barang || ""} ${item.kode_barang || ""}`.toLowerCase();
      return teks.includes(keyword);
    });
  }, [barangOptions, query]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleToggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setQuery("");
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return next;
    });
  }

  function handleSelect(item) {
    onChange(String(item.id_barang));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id="pilih-barang-trigger"
        disabled={disabled || loading}
        onClick={handleToggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-xs transition-colors outline-none sm:text-sm ${
          open
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-slate-200 hover:border-slate-300"
        } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
      >
        <span className="min-w-0 truncate">
          {loading ? (
            <span className="text-slate-400">Memuat daftar barang...</span>
          ) : selectedItem ? (
            <span className="font-medium text-slate-800">
              {selectedItem.nama_barang} ({selectedItem.kode_barang})
            </span>
          ) : (
            <span className="text-slate-400">Pilih barang...</span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>
      )}

      {open && !loading && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* Kolom pencarian */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama barang atau kode..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Bersihkan pencarian barang"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Daftar pilihan */}
          <ul
            role="listbox"
            aria-label="Daftar barang"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-slate-500">
                <Package className="mx-auto mb-1.5 h-5 w-5 text-slate-300" />
                {barangOptions.length === 0
                  ? "Belum ada data barang tersedia."
                  : "Barang tidak ditemukan."}
              </li>
            ) : (
              filteredOptions.map((item) => {
                const isSelected = String(item.id_barang) === String(value);

                return (
                  <li key={item.id_barang}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0 truncate">
                        {item.nama_barang}{" "}
                        <span className="text-slate-500">
                          ({item.kode_barang})
                        </span>
                      </span>

                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Total: {formatAngka(item.total_jumlah ?? 0)}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}