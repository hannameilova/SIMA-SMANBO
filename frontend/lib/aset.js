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