"use client";

import { Minus, Plus } from "lucide-react";

/**
 * Stepper jumlah (- / angka / +) sesuai gaya visual mockup dengan batas [0, max].
 */
export default function QuantitySelector({
  value = 0,
  max = 0,
  disabled = false,
  onChange,
  ariaLabel = "Jumlah unit dipindahkan",
}) {
  const safeMax = Math.max(0, Number(max) || 0);
  const safeVal = Math.max(0, Math.min(safeMax, Number(value) || 0));

  function handleDecrement() {
    if (disabled || safeVal <= 0) return;
    onChange(safeVal - 1);
  }

  function handleIncrement() {
    if (disabled || safeVal >= safeMax) return;
    onChange(safeVal + 1);
  }

  function handleInputChange(event) {
    if (disabled) return;
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      onChange(0);
      return;
    }

    const parsed = Number(raw);
    onChange(Math.max(0, Math.min(safeMax, parsed)));
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-1.5">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || safeVal <= 0}
        aria-label={`Kurangi ${ariaLabel}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={14} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={safeVal}
        disabled={disabled}
        onChange={handleInputChange}
        aria-label={ariaLabel}
        className="w-12 bg-transparent text-center text-sm font-extrabold text-blue-600 outline-none disabled:text-slate-400"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || safeVal >= safeMax}
        aria-label={`Tambah ${ariaLabel}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
