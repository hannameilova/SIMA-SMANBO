"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { formatTanggalJakarta } from "@/lib/perpindahan-aset/utils";

function formatIsoToDisplay(value) {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return "";

  return `${match[3]}/${match[2]}/${match[1]}`;
}

// Otomatis menambahkan garis miring saat pengguna mengetik angka.
function formatTypedDate(value) {
  const digits = String(value)
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Mengubah DD/MM/YYYY menjadi YYYY-MM-DD.
function parseDisplayToIso(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (day < 1 || month < 1 || month > 12 || year < 1) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  // Memastikan tanggal benar-benar valid.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function DateFilterInput({
  value,
  min,
  max,
  onChange,
  ariaLabel,
}) {
  const [display, setDisplay] = useState(
    () => formatIsoToDisplay(value)
  );

  const [invalid, setInvalid] = useState(false);
  const dateInputRef = useRef(null);

  useEffect(() => {
    setDisplay(formatIsoToDisplay(value));
    setInvalid(false);
  }, [value]);

  const isWithinRange = (isoDate) => {
    if (min && isoDate < min) return false;
    if (max && isoDate > max) return false;

    return true;
  };

  const handleTextChange = (e) => {
    const nextValue = formatTypedDate(e.target.value);

    setDisplay(nextValue);

    if (!nextValue) {
      setInvalid(false);
      onChange("");
      return;
    }

    const isoDate = parseDisplayToIso(nextValue);

    // Tanggal belum lengkap.
    if (!isoDate) {
      setInvalid(nextValue.length === 10);
      return;
    }

    // Validasi rentang tanggal.
    if (!isWithinRange(isoDate)) {
      setInvalid(true);
      return;
    }

    setInvalid(false);
    onChange(isoDate);
  };

  const handleBlur = () => {
    if (!display.trim()) {
      setInvalid(false);
      return;
    }

    const isoDate = parseDisplayToIso(display);

    if (!isoDate || !isWithinRange(isoDate)) {
      setInvalid(true);
      return;
    }

    setDisplay(formatIsoToDisplay(isoDate));
    setInvalid(false);
    onChange(isoDate);
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;

    if (!input) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.click();
      }
    } catch {
      input.click();
    }
  };

  const handleNativeDateChange = (e) => {
    const isoDate = e.target.value;

    if (!isoDate) return;

    if (!isWithinRange(isoDate)) {
      setInvalid(true);
      return;
    }

    setDisplay(formatIsoToDisplay(isoDate));
    setInvalid(false);
    onChange(isoDate);
  };

  return (
    <div className="relative min-w-0">
      {/* Input tanggal format DD/MM/YYYY */}
      <div
        className={`flex h-[42px] min-w-0 items-center rounded-xl border bg-white transition-colors ${
          invalid
            ? "border-red-300 focus-within:border-red-400"
            : "border-slate-200 focus-within:border-blue-600"
        }`}
      >
        <button
          type="button"
          onClick={openDatePicker}
          className="ml-2.5 flex shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-blue-600"
          aria-label={`Pilih ${ariaLabel.toLowerCase()}`}
        >
          <Calendar size={15} />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="dd/mm/yyyy"
          maxLength={10}
          autoComplete="off"
          aria-label={ariaLabel}
          aria-invalid={invalid}
          className="h-full w-full min-w-0 bg-transparent px-2 text-xs text-slate-700 outline-none placeholder:text-slate-400"
        />

        {/* Native date picker */}
        <input
          ref={dateInputRef}
          type="date"
          lang="id-ID"
          value={value || ""}
          min={min || undefined}
          max={max || undefined}
          onChange={handleNativeDateChange}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
        />
      </div>

      {invalid && (
        <p className="mt-1 text-[10px] leading-4 text-red-500">
          Masukkan tanggal DD/MM/YYYY yang valid dan sesuai rentang.
        </p>
      )}
    </div>
  );
}

/**
 * Kolom pencarian, filter lokasi asal, lokasi tujuan,
 * rentang waktu WIB, serta chip filter aktif.
 */
export default function FilterRiwayatPerpindahan({
  search,
  idLokasiAsal,
  idLokasiTujuan,
  tanggalMulai,
  tanggalSelesai,
  lokasiOptions = [],
  loadingLokasi = false,
  onSearchChange,
  onLokasiAsalChange,
  onLokasiTujuanChange,
  onTanggalMulaiChange,
  onTanggalSelesaiChange,
  onClearAll,
}) {
  const lokasiAsalLabel =
    lokasiOptions.find(
      (item) => String(item.id) === String(idLokasiAsal)
    )?.nama_lokasi || "";

  const lokasiTujuanLabel =
    lokasiOptions.find(
      (item) => String(item.id) === String(idLokasiTujuan)
    )?.nama_lokasi || "";

  const activeChips = [];

  if (search.trim()) {
    activeChips.push({
      key: "search",
      label: `Pencarian: "${search.trim()}"`,
      onRemove: () => onSearchChange(""),
    });
  }

  if (idLokasiAsal) {
    activeChips.push({
      key: "asal",
      label: `Lokasi Asal: ${lokasiAsalLabel || idLokasiAsal}`,
      onRemove: () => onLokasiAsalChange(""),
    });
  }

  if (idLokasiTujuan) {
    activeChips.push({
      key: "tujuan",
      label: `Lokasi Tujuan: ${lokasiTujuanLabel || idLokasiTujuan}`,
      onRemove: () => onLokasiTujuanChange(""),
    });
  }

  if (tanggalMulai || tanggalSelesai) {
    const startText = tanggalMulai
      ? formatTanggalJakarta(tanggalMulai, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "...";

    const endText = tanggalSelesai
      ? formatTanggalJakarta(tanggalSelesai, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "...";

    activeChips.push({
      key: "rentang",
      label: `Rentang Waktu: ${startText} - ${endText}`,
      onRemove: () => {
        onTanggalMulaiChange("");
        onTanggalSelesaiChange("");
      },
    });
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Kolom pencarian */}
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 focus-within:border-blue-600 focus-within:bg-white">
        <Search size={16} className="shrink-0 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode aset, nama barang, nomor mutasi, atau lokasi..."
          aria-label="Cari riwayat perpindahan aset"
          className="w-full min-w-0 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none sm:text-sm"
        />

        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600"
            aria-label="Hapus kata kunci pencarian"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Filter dropdown & rentang tanggal */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">

        {/* Lokasi Asal */}
        <div className="min-w-0">
          <label
            htmlFor="filter-lokasi-asal"
            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
          >
            Lokasi Asal
          </label>

          <div className="relative">
            <select
              id="filter-lokasi-asal"
              value={idLokasiAsal}
              onChange={(e) => onLokasiAsalChange(e.target.value)}
              disabled={loadingLokasi}
              className="w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-xs text-slate-700 outline-none transition-colors focus:border-blue-600 disabled:bg-slate-50"
            >
              <option value="">Semua Lokasi Asal</option>

              {lokasiOptions.map((lok) => (
                <option key={lok.id} value={String(lok.id)}>
                  {lok.nama_lokasi}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Lokasi Tujuan */}
        <div className="min-w-0">
          <label
            htmlFor="filter-lokasi-tujuan"
            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
          >
            Lokasi Tujuan
          </label>

          <div className="relative">
            <select
              id="filter-lokasi-tujuan"
              value={idLokasiTujuan}
              onChange={(e) => onLokasiTujuanChange(e.target.value)}
              disabled={loadingLokasi}
              className="w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-xs text-slate-700 outline-none transition-colors focus:border-blue-600 disabled:bg-slate-50"
            >
              <option value="">Semua Lokasi Tujuan</option>

              {lokasiOptions.map((lok) => (
                <option key={lok.id} value={String(lok.id)}>
                  {lok.nama_lokasi}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Rentang Waktu */}
        <div className="min-w-0 md:col-span-2 xl:col-span-1">
          <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Rentang Waktu (WIB)
          </span>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">

            {/* Tanggal Mulai */}
            <DateFilterInput
              value={tanggalMulai}
              max={tanggalSelesai}
              onChange={onTanggalMulaiChange}
              ariaLabel="Tanggal mulai"
            />

            <span className="pt-3 text-center text-xs text-slate-400">
              –
            </span>

            {/* Tanggal Selesai */}
            <DateFilterInput
              value={tanggalSelesai}
              min={tanggalMulai}
              onChange={onTanggalSelesaiChange}
              ariaLabel="Tanggal selesai"
            />
          </div>
        </div>
      </div>

      {/* Filter aktif dalam bentuk chip */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xs font-medium text-slate-500">
            Filter Aktif:
          </span>

          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700"
            >
              <span>{chip.label}</span>

              <button
                type="button"
                onClick={chip.onRemove}
                className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                aria-label={`Hapus ${chip.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            Hapus Semua
          </button>
        </div>
      )}
    </div>
  );
}