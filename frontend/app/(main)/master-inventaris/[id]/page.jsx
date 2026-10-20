import AsetDetailView from "@/components/AsetDetailView";
import MasterInventarisAccessGuard from "@/components/MasterInventarisAccessGuard";

export default function AsetDetailPage() {
  return (
    <MasterInventarisAccessGuard>
      <AsetDetailView />
    </MasterInventarisAccessGuard>
  );
}