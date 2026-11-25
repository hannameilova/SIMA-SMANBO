import { Building2, UserCheck } from "lucide-react";
import {
  formatAngka,
  labelKategoriRuangan,
} from "@/lib/stok-opname/utils";

export default function RoomInfoCard({
  sesi,
  lokasi,
  pengguna,
  totalTarget,
}) {
  const kategoriRuangan = labelKategoriRuangan(
    lokasi?.kategori,
    lokasi?.kategori_lainnya
  );

  const penanggungJawab =
    lokasi?.penanggung_jawab?.trim() || "Belum diatur";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm sm:h-12 sm:w-12">
          <Building2 className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.9} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 text-sm font-bold leading-5 text-slate-900 sm:text-base">
              Ruangan: {sesi.nama_lokasi}
            </h2>

            <span className="inline-flex max-w-full items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
              <span className="truncate">{kategoriRuangan}</span>
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-1 text-[11px] leading-5 text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-xs">
            <p className="min-w-0">
              <span>Penanggung Jawab: </span>
              <span className="font-medium text-slate-700">
                {penanggungJawab}
              </span>
            </p>

            <span
              aria-hidden="true"
              className="hidden text-slate-300 sm:inline"
            >
              •
            </span>

            <p>
              <span>Target: </span>
              <span className="font-medium text-slate-700">
                {formatAngka(totalTarget)} Barang Inventaris
              </span>
            </p>
          </div>

          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500 sm:items-center sm:text-xs">
            <UserCheck
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 sm:mt-0"
              strokeWidth={2}
            />
            <span className="min-w-0">
              <span>Auditor: </span>
              <span className="font-medium text-slate-700">
                {pengguna?.nama?.trim() || "Pengguna SIMA"}
              </span>
              {pengguna?.role?.trim() && (
                <span className="text-slate-500">
                  {" "}
                  ({pengguna.role.trim()})
                </span>
              )}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
