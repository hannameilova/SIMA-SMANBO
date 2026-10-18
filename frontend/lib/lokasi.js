
import { apiRequest } from "@/lib/api";

const ALLOWED_CATEGORIES = [
  "Ruang Kelas",
  "Ruang Administrasi",
  "Ruang Penunjang",
  "Lainnya",
];

export async function getLokasi({ search = "", kategori = "" } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) params.set("search", search.trim());
  if (kategori) params.set("kategori", kategori);

  const query = params.toString();
  const result = await apiRequest(`/lokasi${query ? `?${query}` : ""}`);

  return Array.isArray(result.data) ? result.data : [];
}

export async function createLokasi(payload) {
  validateLokasi(payload);

  return apiRequest("/lokasi", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLokasi(id, payload) {
  if (!id) throw new Error("ID lokasi tidak valid.");

  validateLokasi(payload);

  return apiRequest(`/lokasi/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function validateLokasi(payload) {
  const nama = String(payload.nama_lokasi || "").trim();

  if (!nama) throw new Error("Nama ruangan wajib diisi.");
  if (nama.length > 150) {
    throw new Error("Nama ruangan maksimal 150 karakter.");
  }

  if (!ALLOWED_CATEGORIES.includes(payload.kategori)) {
    throw new Error("Pilih kategori yang valid.");
  }

  const kategoriLainnya = String(payload.kategori_lainnya || "").trim();

  if (payload.kategori === "Lainnya" && !kategoriLainnya) {
    throw new Error("Nama kategori lainnya wajib diisi.");
  }
}
