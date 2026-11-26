import { apiRequest } from "@/lib/api";

/**
 * Mengambil seluruh daftar transaksi peminjaman.
 * Endpoint: GET /peminjaman
 */
export async function getDaftarPeminjaman(signal) {
  const response = await apiRequest("/peminjaman", {
    method: "GET",
    signal,
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Mengambil detail transaksi peminjaman berdasarkan ID.
 * Endpoint: GET /peminjaman/:id
 */
export async function getDetailPeminjaman(idPeminjaman, signal) {
  const response = await apiRequest(
    `/peminjaman/${encodeURIComponent(idPeminjaman)}`,
    {
      method: "GET",
      signal,
    }
  );

  return response?.data ?? null;
}

/**
 * Membuat transaksi peminjaman baru.
 * Endpoint: POST /peminjaman
 */
export async function createPeminjaman(payload) {
  const response = await apiRequest("/peminjaman", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response;
}

/**
 * Mencatat pengembalian aset.
 * Endpoint: POST /pengembalian
 */
export async function createPengembalian(payload) {
  const response = await apiRequest("/pengembalian", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response;
}

/**
 * Mengambil daftar barang dari Master Inventaris.
 * Endpoint: GET /aset
 */
export async function getDaftarBarangPeminjaman(signal) {
  const response = await apiRequest("/aset", {
    method: "GET",
    signal,
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Mengambil daftar lokasi untuk dropdown.
 * Endpoint: GET /lokasi
 */
export async function getDaftarLokasiPeminjaman(signal) {
  const response = await apiRequest("/lokasi", {
    method: "GET",
    signal,
  });

  return Array.isArray(response?.data) ? response.data : [];
}
