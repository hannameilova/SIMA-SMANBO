import PerpindahanAsetAccessGuard from "@/components/perpindahan-aset/PerpindahanAsetAccessGuard";
import FormPerpindahanView from "@/components/perpindahan-aset/FormPerpindahanView";

export const instant = false;

export default function CatatPerpindahanBaruPage() {
  return (
    <PerpindahanAsetAccessGuard>
      <FormPerpindahanView />
    </PerpindahanAsetAccessGuard>
  );
}
