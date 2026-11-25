"use client";

import { useParams } from "next/navigation";
import PengecekanBarangView from "@/components/stok-opname/PengecekanBarangView";

export default function PengecekanBarangPage() {
  const params = useParams();
  const nilai = params?.id_opname;
  const idOpname = Number(Array.isArray(nilai) ? nilai[0] : nilai);
  const idValid = Number.isSafeInteger(idOpname) && idOpname > 0;

  return <PengecekanBarangView idOpname={idValid ? idOpname : 0} />;
}
