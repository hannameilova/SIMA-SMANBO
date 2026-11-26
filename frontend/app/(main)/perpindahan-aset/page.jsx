import { Suspense } from "react";
import PerpindahanAsetAccessGuard from "@/components/perpindahan-aset/PerpindahanAsetAccessGuard";
import RiwayatPerpindahanView from "@/components/perpindahan-aset/RiwayatPerpindahanView";

export const instant = false;

export default function PerpindahanAsetPage() {
  return (
    <PerpindahanAsetAccessGuard>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
            Memuat halaman perpindahan aset...
          </div>
        }
      >
        <RiwayatPerpindahanView />
      </Suspense>
    </PerpindahanAsetAccessGuard>
  );
}
