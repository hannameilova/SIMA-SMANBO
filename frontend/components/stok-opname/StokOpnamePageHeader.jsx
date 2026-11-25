import Link from "next/link";
import { ChevronRight } from "lucide-react";
import StokOpnameStepper from "@/components/stok-opname/StokOpnameStepper";

export default function StokOpnamePageHeader({
  tahapAktif,
  judul = "Stok Opname",
  subjudul = "Periksa jumlah dan kondisi fisik barang, catat selisih, lalu konfirmasi hasil pemeriksaan inventaris.",
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[32px]">
          {judul}
        </h1>

        <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
          {subjudul}
        </p>
      </div>

      <StokOpnameStepper tahapAktif={tahapAktif} />
    </div>
  );
}
