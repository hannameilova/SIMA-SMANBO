"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  MapPin,
  Search,
  X,
} from "lucide-react";

/**
 * Dropdown pilih lokasi dengan fitur pencarian berdasarkan nama lokasi.
 */
export default function SearchableLokasiSelect({
  lokasiOptions = [],
  value = "",
  onChange,
  placeholder = "Pilih lokasi...",
  disabled = false,
  error = false,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedLokasi = useMemo(
    () =>
      lokasiOptions.find(
        (lok) => String(lok.id) === String(value)
      ) || null,
    [lokasiOptions, value]
  );

  // Filter lokasi berdasarkan nama
  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return lokasiOptions;

    return lokasiOptions.filter((lok) =>
      String(lok.nama_lokasi || "")
        .toLowerCase()
        .includes(keyword)
    );
  }, [lokasiOptions, query]);

  // Tutup dropdown ketika klik di luar atau tekan Escape
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Fokus ke kolom pencarian saat dropdown dibuka
  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  // Buka atau tutup dropdown
  function handleToggleOpen() {
    if (disabled) return;

    setOpen((prev) => {
      const next = !prev;

      if (next) {
        setQuery("");
      }

      return next;
    });
  }

  // Pilih lokasi
  function handleSelect(lok) {
    onChange(String(lok.id));
    setQuery("");
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Tombol dropdown */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={handleToggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-xs transition-colors outline-none sm:text-sm ${
          error
            ? "border-red-400"
            : open
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-slate-300"
        } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
      >
        <span className="min-w-0 truncate">
          {selectedLokasi ? (
            <span className="font-medium text-slate-800">
              {selectedLokasi.nama_lokasi}
            </span>
          ) : (
            <span className="text-slate-400">
              {placeholder}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown pencarian */}
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* Kolom pencarian */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <Search
              size={14}
              className="shrink-0 text-slate-400"
            />

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama lokasi..."
              aria-label="Cari nama lokasi"
              className="w-full min-w-0 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Bersihkan pencarian lokasi"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Daftar pilihan */}
          <ul
            role="listbox"
            aria-label="Daftar lokasi"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-slate-500">
                <MapPin className="mx-auto mb-1.5 h-5 w-5 text-slate-300" />

                {lokasiOptions.length === 0
                  ? "Belum ada data lokasi tersedia."
                  : "Lokasi tidak ditemukan."}
              </li>
            ) : (
              filteredOptions.map((lok) => {
                const isSelected =
                  String(lok.id) === String(value);

                return (
                  <li key={lok.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(lok)}
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0 truncate">
                        {lok.nama_lokasi}
                      </span>

                      {isSelected && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          Terpilih
                        </span>
                      )}
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