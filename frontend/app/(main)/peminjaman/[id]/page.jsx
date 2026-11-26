"use client";

import { use } from "react";
import DetailPeminjamanView from "@/components/peminjaman/DetailPeminjamanView";

export default function DetailPeminjamanPage({ params }) {
  const { id } = use(params);

  return <DetailPeminjamanView idPeminjaman={id} />;
}