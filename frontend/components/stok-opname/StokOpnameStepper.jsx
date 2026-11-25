import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

export default function StokOpnameStepper({ tahapAktif }) {
  return (
    <nav
      aria-label="Tahapan stok opname"
      className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:p-2"
    >
      <ol className="flex w-full items-center gap-0.5 overflow-x-auto [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
        {/* Langkah 1 */}
        <li className="flex-1 min-w-0">
          {tahapAktif === 1 ? (
            <LangkahAktif nomor={1} label="Pilih Ruangan" />
          ) : (
            <Link
              href="/stok-opname"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-emerald-600 transition-colors hover:bg-emerald-50 sm:gap-2 sm:px-3"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:h-6 sm:w-6">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">
                Pilih Ruangan
              </span>
            </Link>
          )}
        </li>

        <li aria-hidden="true" className="shrink-0 px-0.5 text-slate-300">
          <ChevronRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </li>

        {/* Langkah 2 */}
        <li className="flex-1 min-w-0">
          {tahapAktif === 2 ? (
            <LangkahAktif
              nomor={2}
              label="Pengecekan Barang"
              labelPendek="Pengecekan"
            />
          ) : tahapAktif > 2 ? (
            <LangkahSelesai
              nomor={2}
              label="Pengecekan Barang"
              labelPendek="Pengecekan"
            />
          ) : (
            <LangkahNonaktif
              nomor={2}
              label="Pengecekan Barang"
              labelPendek="Pengecekan"
            />
          )}
        </li>

        <li aria-hidden="true" className="shrink-0 px-0.5 text-slate-300">
          <ChevronRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </li>

        {/* Langkah 3 */}
        <li className="flex-1 min-w-0">
          {tahapAktif === 3 ? (
            <LangkahAktif
              nomor={3}
              label="Ringkasan & Konfirmasi"
              labelPendek="Ringkasan"
            />
          ) : (
            <LangkahNonaktif
              nomor={3}
              label="Ringkasan & Konfirmasi"
              labelPendek="Ringkasan"
            />
          )}
        </li>
      </ol>
    </nav>
  );
}

function LangkahAktif({ nomor, label, labelPendek }) {
  return (
    <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-2 py-2 text-white shadow-sm sm:gap-2 sm:px-4">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 sm:h-6 sm:w-6 sm:text-sm">
        {nomor}
      </span>

      <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">
        <span className="sm:hidden">{labelPendek ?? label}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </div>
  );
}

function LangkahSelesai({ nomor, label, labelPendek }) {
  return (
    <div className="flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-emerald-600 sm:gap-2 sm:px-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:h-6 sm:w-6">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>

      <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">
        <span className="sm:hidden">{labelPendek}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </div>
  );
}

function LangkahNonaktif({ nomor, label, labelPendek }) {
  return (
    <div className="flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-slate-400 sm:gap-2 sm:px-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400 sm:h-6 sm:w-6 sm:text-sm">
        {nomor}
      </span>

      <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">
        <span className="sm:hidden">{labelPendek}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </div>
  );
}