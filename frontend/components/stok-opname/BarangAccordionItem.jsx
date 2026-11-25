
"use client";

import {
  AlertCircle,
  Armchair,
  BookOpen,
  ChevronDown,
  FlaskConical,
  Minus,
  Monitor,
  Package,
  Pencil,
  Plus,
  Printer,
  Wrench,
} from "lucide-react";
import StatusBadge from "@/components/stok-opname/StatusBadge";
import {
  OPSI_KONDISI,
  formatAngka,
  labelPeringatanSelisih,
  labelStatus,
  ringkasKelompok,
} from "@/lib/stok-opname/utils";

const BORDER_STATUS = {
  belum_diperiksa: "border-l-slate-300",
  sesuai: "border-l-emerald-500",
  ada_temuan: "border-l-red-500",
};

const WARNA_KONDISI = {
  baik: {
    text: "text-emerald-700",
    border: "border-emerald-200",
    background: "bg-emerald-50",
    button: "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  },
  rusak_ringan: {
    text: "text-amber-700",
    border: "border-amber-200",
    background: "bg-amber-50",
    button: "border-amber-200 text-amber-700 hover:bg-amber-100",
  },
  rusak_berat: {
    text: "text-red-700",
    border: "border-red-200",
    background: "bg-red-50",
    button: "border-red-200 text-red-700 hover:bg-red-100",
  },
};

const IKON_KELAS = "h-[18px] w-[18px] sm:h-5 sm:w-5";

function ikonKategori(kategori) {
  const nilai = kategori?.toLowerCase() ?? "";

  if (/(komputer|laptop|elektronik|\bit\b)/.test(nilai)) {
    return <Monitor className={IKON_KELAS} strokeWidth={1.9} />;
  }

  if (/(cetak|printer)/.test(nilai)) {
    return <Printer className={IKON_KELAS} strokeWidth={1.9} />;
  }

  if (/(buku|perpustakaan|literasi)/.test(nilai)) {
    return <BookOpen className={IKON_KELAS} strokeWidth={1.9} />;
  }

  if (/(lab|praktik|kimia|fisika|biologi)/.test(nilai)) {
    return <FlaskConical className={IKON_KELAS} strokeWidth={1.9} />;
  }

  if (/(mebel|kursi|meja|lemari|furnitur)/.test(nilai)) {
    return <Armchair className={IKON_KELAS} strokeWidth={1.9} />;
  }

  if (/(alat|perkakas|bengkel|tool)/.test(nilai)) {
    return <Wrench className={IKON_KELAS} strokeWidth={1.9} />;
  }

  return <Package className={IKON_KELAS} strokeWidth={1.9} />;
}

export default function BarangAccordionItem({
  item,
  open,
  disabled = false,
  onToggle,
  onTambahKondisi,
  onKurangiKondisi,
  onCatatanChange,
}) {
  const panelId = `detail-barang-${item.kelompok.id_detail}`;
  const catatanId = `catatan-barang-${item.kelompok.id_detail}`;

  const peringatanSelisih = labelPeringatanSelisih(item.selisih);

  const jumlahFisik = item.draft.jumlah_fisik;

  const totalFisik =
    (Number(jumlahFisik.baik) || 0) +
    (Number(jumlahFisik.rusak_ringan) || 0) +
    (Number(jumlahFisik.rusak_berat) || 0);

  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm transition-shadow ${
        open ? "shadow-md ring-1 ring-slate-100" : ""
      } ${BORDER_STATUS[item.status] ?? "border-l-slate-300"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-2.5 p-3.5 text-left sm:gap-3.5 sm:p-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
          {ikonKategori(item.barang.kategori)}
        </span>

        <span className="block min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 break-words text-xs font-bold leading-5 text-slate-900 sm:text-sm">
              {item.barang.nama_barang}
            </span>

            <StatusBadge status={item.status} label={labelStatus(item)} />
          </span>

          <span className="mt-0.5 block break-words text-[10px] leading-5 text-slate-500 sm:text-xs">
            {item.barang.kategori || "Tanpa Kategori"} •{" "}
            {item.barang.kode_barang || "Tanpa Kode"}
          </span>

          <span className="block text-[10px] leading-5 text-slate-400 sm:text-[11px]">
            {ringkasKelompok(item.kelompok)}
          </span>

          <span className="mt-1 block text-[10px] leading-5 text-slate-500 sm:text-xs">
            Tercatat Sistem:{" "}
            <strong className="font-semibold text-slate-800">
              {formatAngka(item.kelompok.jumlah_sistem)} Unit
            </strong>
          </span>
        </span>

        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 sm:h-5 sm:w-5 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="border-t border-slate-100 px-3.5 pb-4 pt-4 sm:px-5 sm:pb-5"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-900 sm:text-sm">
                Jumlah Fisik Aktual
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-center text-[10px] font-medium text-slate-500 sm:text-xs">
                  Total Unit Fisik
                </p>

                <p className="mt-0.5 text-center text-xl font-extrabold text-slate-900 sm:text-2xl">
                  {formatAngka(totalFisik)}
                </p>

                <p className="text-center text-[10px] text-slate-500">
                  Unit
                </p>
              </div>

              {peringatanSelisih && item.status !== "belum_diperiksa" && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-red-600 sm:text-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {peringatanSelisih}
                </p>
              )}
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-bold text-slate-900 sm:text-sm">
                Distribusi Kondisi Fisik
              </legend>

              <div className="space-y-2">
                {OPSI_KONDISI.map((opsi) => {
                  const jumlah =
                    Number(jumlahFisik[opsi.value]) || 0;

                  const warna =
                    WARNA_KONDISI[opsi.value];

                  const tambahDisabled =
                    disabled ||
                    (
                      opsi.value !== "baik" &&
                      jumlahFisik.baik <= 0
                    );

                  return (
                    <div
                      key={opsi.value}
                      className={`flex min-h-[58px] items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-colors ${
                        warna.background
                      } ${warna.border}`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold sm:text-sm ${warna.text}`}
                        >
                          {opsi.label}
                        </p>

                        {opsi.deskripsi && (
                          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                            {opsi.deskripsi}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onKurangiKondisi(opsi.value)
                          }
                          disabled={disabled || jumlah <= 0}
                          aria-label={`Kurangi ${opsi.label}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus
                            className="h-4 w-4"
                            strokeWidth={2.2}
                          />
                        </button>

                        <span className="w-7 text-center text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                          {formatAngka(jumlah)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onTambahKondisi(opsi.value)
                          }
                          disabled={tambahDisabled}
                          aria-label={`Tambah ${opsi.label}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${warna.button}`}
                        >
                          <Plus
                            className="h-4 w-4"
                            strokeWidth={2.2}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor={catatanId}
                className="mb-2 block text-xs font-bold text-slate-900 sm:text-sm"
              >
                Catatan Pemeriksaan
              </label>

              <div className="relative">
                <input
                  id={catatanId}
                  type="text"
                  value={item.draft.catatan}
                  maxLength={1000}
                  onChange={(event) =>
                    onCatatanChange(event.target.value)
                  }
                  disabled={disabled}
                  placeholder="Tambahkan catatan pemeriksaan..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                />

                <Pencil
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={1.9}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}