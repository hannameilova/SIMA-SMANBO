import { apiRequest } from "@/lib/api";

/**
 * Backend menempelkan seluruh route Stok Opname pada prefix /stok-opname
 * (lihat server.js). Route controller yang dipakai:
 *
 * GET    /stok-opname/lokasi
 * POST   /stok-opname/sesi
 * GET    /stok-opname/sesi/:id_opname/barang
 * PUT    /stok-opname/detail/:id_detail
 * GET    /stok-opname/sesi/:id_opname/ringkasan
 * POST   /stok-opname/sesi/:id_opname/konfirmasi
 */
const BASE = "/stok-opname";

function ambilData(response, pesanGagal) {
  if (response?.data === undefined || response?.data === null) {
    throw new Error(pesanGagal);
  }

  return response.data;
}

export async function getLokasiStokOpname(params = {}, signal) {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.kategori?.trim()) {
    query.set("kategori", params.kategori.trim());
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiRequest(`${BASE}/lokasi${suffix}`, { signal });
  const data = ambilData(response, "Daftar ruangan tidak tersedia.");

  return Array.isArray(data) ? data : [];
}

export async function createSesiStokOpname(idLokasi) {
  const response = await apiRequest(`${BASE}/sesi`, {
    method: "POST",
    body: JSON.stringify({ id_lokasi: idLokasi }),
  });

  return ambilData(response, "Sesi stok opname gagal dibuat.");
}

export async function getBarangSesi(idOpname, signal) {
  const response = await apiRequest(
    `${BASE}/sesi/${encodeURIComponent(idOpname)}/barang`,
    { signal }
  );

  return ambilData(
    response,
    "Data barang pada sesi ini tidak tersedia."
  );
}

export async function savePemeriksaan(idDetail, payload) {
  const response = await apiRequest(
    `${BASE}/detail/${encodeURIComponent(idDetail)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  return ambilData(response, "Hasil pemeriksaan gagal disimpan.");
}

export async function getRingkasanSesi(idOpname, signal) {
  const response = await apiRequest(
    `${BASE}/sesi/${encodeURIComponent(idOpname)}/ringkasan`,
    { signal }
  );

  return ambilData(response, "Ringkasan sesi tidak tersedia.");
}

export async function confirmSesiStokOpname(idOpname) {
  const response = await apiRequest(
    `${BASE}/sesi/${encodeURIComponent(idOpname)}/konfirmasi`,
    { method: "POST" }
  );

  return ambilData(response, "Stok opname gagal dikonfirmasi.");
}
