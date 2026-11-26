"use client";

import DetailPeminjamanView from "@/components/peminjaman/DetailPeminjamanView";

export default function DetailPeminjamanPage({ params }) {
  return <DetailPeminjamanView idPeminjaman={params.id} />;
}
