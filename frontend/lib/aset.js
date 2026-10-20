import { apiRequest } from "./api";

const KATEGORI_LABEL = {
  habis_pakai: "Habis Pakai",
  tidak_habis_pakai: "Tidak Habis Pakai",
};

export function labelKategori(kategori) {
  return KATEGORI_LABEL[kategori] || kategori;
}

export function formatAngka(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export function groupLokasiPengadaan(lokasi = []) {
  const map = new Map();

  for (const row of lokasi) {
    if (!map.has(row.id_lokasi)) {
      map.set(row.id_lokasi, {
        id_lokasi: row.id_lokasi,
        nama_lokasi: row.nama_lokasi,
        jumlah: 0,
        kondisi: { baik: 0, rusak_ringan: 0, rusak_berat: 0 },
      });
    }

    const entry = map.get(row.id_lokasi);
    const jumlah = Number(row.jumlah || 0);
    entry.jumlah += jumlah;

    if (entry.kondisi[row.kondisi] !== undefined) {
      entry.kondisi[row.kondisi] += jumlah;
    }
  }

  return Array.from(map.values());
}

export async function getAset({ search = "", kategori = "", lokasi = "" } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("search", search.trim());
  }
  if (kategori) {
    params.set("kategori", kategori);
  }
  if (lokasi !== "") {
    params.set("lokasi", String(lokasi));
  }

  const query = params.toString();

  const response = await apiRequest(`/aset?${query ? `?${query}` : ""}`, {
    method: "GET",
  });

  return response.data.map((item) => ({
    ...item,
    total_jumlah: Number(item.total_jumlah ?? 0),
    total_lokasi: Number(item.total_lokasi ?? 0),
  }));
}

export async function getAsetById(id) {
    return apiRequest(`/aset/${id}`, {
      method: "GET",
    });
}

export async function createAset({ nama_barang, kategori, lokasiId, jumlahBarang }) {
  return apiRequest("/aset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAset(id, payload) {
    return apiRequest(`/aset/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function getSummaryAset() {
  const response = await apiRequest("/aset/summary", {
    method: "GET",
  });
    return response.data;
}
