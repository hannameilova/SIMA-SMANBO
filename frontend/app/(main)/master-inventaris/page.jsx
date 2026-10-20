import MasterInventarisView from "@/components/MasterInventarisView";
import MasterInventarisAccessGuard from "@/components/MasterInventarisAccessGuard";

export const instant = false;

export default function MasterInventarisPage() {
  return (
    <MasterInventarisAccessGuard>
      <MasterInventarisView />
    </MasterInventarisAccessGuard>
  );
}
