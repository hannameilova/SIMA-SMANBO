import { apiRequest } from "@/lib/api";

/**
 * Mengambil seluruh riwayat perpindahan aset.
 * Endpoint: GET /perpindahan-aset
 */
export async function getRiwayatPerpindahan(signal) {
  const response = await apiRequest("/perpindahan-aset", {
    method: "GET",
    signal,
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Mengambil detail satu transaksi perpindahan aset beserta rincian stoknya.
 * Endpoint: GET /perpindahan-aset/:idPerpindahan
 */
export async function getDetailPerpindahan(idPerpindahan, signal) {
  const response = await apiRequest(
    `/perpindahan-aset/${encodeURIComponent(idPerpindahan)}`,
    {
      method: "GET",
      signal,
    }
  );

  return response?.data ?? null;
}

/**
 * Mengambil kelompok stok barang pada lokasi tertentu.
 * Endpoint: GET /perpindahan-aset/stok/:idBarang?id_lokasi_asal=:idLokasi
 */
export async function getStokPerpindahan(idBarang, idLokasi, signal) {
  const params = new URLSearchParams({
    id_lokasi_asal: String(idLokasi),
  });

  const response = await apiRequest(
    `/perpindahan-aset/stok/${encodeURIComponent(idBarang)}?${params.toString()}`,
    {
      method: "GET",
      signal,
    }
  );

  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Mengambil lokasi yang memiliki stok aktif untuk barang tertentu.
 * Maksimal 5 request dijalankan secara bersamaan.
 */
export async function getLokasiAsalDenganStok(
  idBarang,
  lokasiOptions = [],
  signal
) {
  if (!idBarang || !Array.isArray(lokasiOptions) || lokasiOptions.length === 0) {
    return [];
  }

  const hasil = new Array(lokasiOptions.length);
  let indexBerikutnya = 0;
  let requestError = null;

  async function worker() {
    while (!signal?.aborted && !requestError) {
      const index = indexBerikutnya++;

      if (index >= lokasiOptions.length) {
        return;
      }

      const lokasi = lokasiOptions[index];

      try {
        const stokList = await getStokPerpindahan(
          idBarang,
          lokasi.id,
          signal
        );

        const memilikiStok = stokList.some((stok) => {
          const jumlah = Number(stok.jumlah || 0);
          const status = String(
            stok.status_penggunaan || "aktif"
          ).toLowerCase();

          return jumlah > 0 && status === "aktif";
        });

        if (memilikiStok) {
          hasil[index] = lokasi;
        }
      } catch (error) {
        requestError = error;
        return;
      }
    }
  }

  const jumlahWorker = Math.min(5, lokasiOptions.length);

  await Promise.all(
    Array.from({ length: jumlahWorker }, () => worker())
  );

  if (requestError) {
    throw requestError;
  }

  if (signal?.aborted) {
    return [];
  }

  return hasil.filter(Boolean);
}

/**
 * Menyimpan transaksi perpindahan aset baru.
 * Endpoint: POST /perpindahan-aset
 */
export async function createPerpindahanAset(payload) {
  const response = await apiRequest("/perpindahan-aset", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response;
}

/**
 * Mengambil seluruh daftar barang dari Master Inventaris.
 * Endpoint: GET /aset
 */
export async function getDaftarBarang(signal) {
  const response = await apiRequest("/aset", {
    method: "GET",
    signal,
  });

  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Mengambil seluruh daftar lokasi/ruangan.
 * Endpoint: GET /lokasi
 */
export async function getDaftarLokasi(signal) {
  const response = await apiRequest("/lokasi", {
    method: "GET",
    signal,
  });

  return Array.isArray(response?.data) ? response.data : [];
}