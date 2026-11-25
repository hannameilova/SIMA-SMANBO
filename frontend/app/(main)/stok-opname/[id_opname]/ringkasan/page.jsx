"use client";

import { useParams } from "next/navigation";
import RingkasanSesiView from "@/components/stok-opname/RingkasanSesiView";

export default function RingkasanSesiPage() {
  const params = useParams();
  const nilai = params?.id_opname;
  const idOpname = Number(Array.isArray(nilai) ? nilai[0] : nilai);
  const idValid = Number.isSafeInteger(idOpname) && idOpname > 0;

  return <RingkasanSesiView idOpname={idValid ? idOpname : 0} />;
}
