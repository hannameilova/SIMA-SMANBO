const KATEGORI_LABEL = {
  habis_pakai: "Habis Pakai",
  tidak_habis_pakai: "Tidak Habis Pakai",
};

export const MOCK_SUMMARY = {
  totalJenis: 1248,
  totalUnit: 3842,
  totalRuangan: 31,
  kondisiBaik: 3490,
  persenLayak: 90,
  perluPerbaikan: 352,
  rusakRingan: 200,
  rusakBerat: 112,
};

export const MOCK_LOKASI_FILTER = [
  { id: 1, nama_lokasi: "Gudang Utama" },
  { id: 2, nama_lokasi: "Ruang A Baru" },
  { id: 3, nama_lokasi: "Gudang Sarpras" },
  { id: 4, nama_lokasi: "Lab Audio Visual" },
  { id: 5, nama_lokasi: "Lab Komputer" },
  { id: 6, nama_lokasi: "Ruang Guru" },
];

const INITIAL_ASET = [
  {
    id_barang: 1,
    kode_barang: "ELK-PRJ-004",
    nama_barang: "Epson EB-X400 3LCD Projector",
    kategori: "tidak_habis_pakai",
    total_jumlah: 10,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "projector",
    status_penggunaan: "aktif",
    lokasi_ids: [3, 4, 1],
  },
  {
    id_barang: 2,
    kode_barang: "LAB-KOM-012",
    nama_barang: "PC Desktop Lenovo V50t Core i5",
    kategori: "tidak_habis_pakai",
    total_jumlah: 36,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "pc",
    status_penggunaan: "aktif",
    lokasi_ids: [5, 1, 6],
  },
  {
    id_barang: 3,
    kode_barang: "MBL-MJA-008",
    nama_barang: "Meja Siswa Kayu Jati Standar",
    kategori: "tidak_habis_pakai",
    total_jumlah: 36,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "meja",
    status_penggunaan: "aktif",
    lokasi_ids: [6, 2, 5],
  },
  {
    id_barang: 4,
    kode_barang: "MBL-KRS-008",
    nama_barang: "Kursi Siswa Kayu Jati Standar",
    kategori: "tidak_habis_pakai",
    total_jumlah: 36,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "kursi",
    status_penggunaan: "aktif",
    lokasi_ids: [6, 2, 5],
  },
  {
    id_barang: 5,
    kode_barang: "MBL-MGR-008",
    nama_barang: "Meja Guru Kayu Jati Standar",
    kategori: "tidak_habis_pakai",
    total_jumlah: 36,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "meja-guru",
    status_penggunaan: "aktif",
    lokasi_ids: [6, 2, 1],
  },
  {
    id_barang: 6,
    kode_barang: "LAB-IPA-005",
    nama_barang: "Mikroskop Binokuler CX23",
    kategori: "tidak_habis_pakai",
    total_jumlah: 12,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "mikroskop",
    status_penggunaan: "aktif",
    lokasi_ids: [4, 1, 3],
  },
  {
    id_barang: 7,
    kode_barang: "LAB-IPA-006",
    nama_barang: "Selain Mikroskop Binokuler",
    kategori: "tidak_habis_pakai",
    total_jumlah: 12,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "mikroskop",
    status_penggunaan: "aktif",
    lokasi_ids: [4, 1, 3],
  },
  {
    id_barang: 8,
    kode_barang: "ATK-SPD-021",
    nama_barang: "Spidol Whiteboard Snowman Hitam",
    kategori: "habis_pakai",
    total_jumlah: 50,
    total_lokasi: 3,
    satuan: "Kotak",
    ikon: "spidol",
    status_penggunaan: "aktif",
    lokasi_ids: [1, 6, 2],
  },
  {
    id_barang: 9,
    kode_barang: "ATK-SPD-022",
    nama_barang: "Tinta Spidol Whiteboard Snowman Hitam",
    kategori: "habis_pakai",
    total_jumlah: 50,
    total_lokasi: 3,
    satuan: "Kotak",
    ikon: "spidol",
    status_penggunaan: "aktif",
    lokasi_ids: [1, 6, 2],
  },
  {
    id_barang: 10,
    kode_barang: "ELK-AC-014",
    nama_barang: "AC Split Wall Panasonic 2 PK",
    kategori: "tidak_habis_pakai",
    total_jumlah: 2,
    total_lokasi: 3,
    satuan: "Unit",
    ikon: "ac",
    status_penggunaan: "aktif",
    lokasi_ids: [5, 6, 4],
  },
  {
    id_barang: 11,
    kode_barang: "ELK-PRJ-005",
    nama_barang: "Infocus IN114AA Projector",
    kategori: "tidak_habis_pakai",
    total_jumlah: 4,
    total_lokasi: 2,
    satuan: "Unit",
    ikon: "projector",
    status_penggunaan: "aktif",
    lokasi_ids: [3, 6],
  },
  {
    id_barang: 12,
    kode_barang: "ATK-KTS-010",
    nama_barang: "Kertas HVS A4 70gsm",
    kategori: "habis_pakai",
    total_jumlah: 80,
    total_lokasi: 2,
    satuan: "Kotak",
    ikon: "spidol",
    status_penggunaan: "aktif",
    lokasi_ids: [1, 3],
  },
];

const INITIAL_DETAIL = {
  1: {
    id_barang: 1,
    kode_barang: "ELK-PRJ-004",
    nama_barang: "Epson EB-X400 3LCD Projector",
    kategori: "tidak_habis_pakai",
    status_penggunaan: "aktif",
    satuan: "Unit",
    total_jumlah: 10,
    tersedia: 8,
    dipinjam: 2,
    pengadaan: [
      {
        tahun_pengadaan: 2025,
        total_jumlah: 8,
        lokasi: [
          {
            id_stok: 101,
            id_lokasi: 3,
            nama_lokasi: "Gudang Sarpras",
            jumlah: 5,
            kondisi: "baik",
            status_penggunaan: "aktif",
          },
          {
            id_stok: 102,
            id_lokasi: 3,
            nama_lokasi: "Gudang Sarpras",
            jumlah: 1,
            kondisi: "rusak_berat",
            status_penggunaan: "aktif",
          },
          {
            id_stok: 103,
            id_lokasi: 4,
            nama_lokasi: "Lab Audio Visual",
            jumlah: 2,
            kondisi: "rusak_ringan",
            status_penggunaan: "aktif",
          },
        ],
      },
      {
        tahun_pengadaan: 2026,
        total_jumlah: 2,
        lokasi: [
          {
            id_stok: 104,
            id_lokasi: 3,
            nama_lokasi: "Gudang Sarpras",
            jumlah: 2,
            kondisi: "baik",
            status_penggunaan: "dipinjam",
          },
        ],
      },
    ],
  },
};

let asetStore = INITIAL_ASET.map((item) => ({ ...item }));
let detailStore = {
  1: structuredClone(INITIAL_DETAIL[1]),
};

export function labelKategori(kategori) {
  return KATEGORI_LABEL[kategori] || kategori;
}

export function formatAngka(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export function getMockLokasi() {
  return MOCK_LOKASI_FILTER;
}

export function getMockAsetList() {
  return asetStore.map((item) => ({ ...item }));
}

export function filterMockAset({ search = "", kategori = "", lokasi = "" } = {}) {
  const keyword = search.trim().toLowerCase();
  const lokasiId = lokasi ? Number(lokasi) : null;

  return getMockAsetList().filter((item) => {
    const cocokCari =
      !keyword ||
      item.kode_barang.toLowerCase().includes(keyword) ||
      item.nama_barang.toLowerCase().includes(keyword);

    const cocokKategori = !kategori || item.kategori === kategori;
    const cocokLokasi =
      !lokasiId || (item.lokasi_ids || []).includes(lokasiId);

    return cocokCari && cocokKategori && cocokLokasi;
  });
}

function lokasiName(id) {
  return (
    MOCK_LOKASI_FILTER.find((item) => item.id === id)?.nama_lokasi ||
    "Lokasi"
  );
}

function ensureDetail(id) {
  if (detailStore[id]) return detailStore[id];

  const item = asetStore.find((row) => row.id_barang === id);
  if (!item) return null;

  const tahun = new Date().getFullYear();
  const lokasi = (item.lokasi_ids || []).map((id_lokasi, index) => ({
    id_stok: id * 100 + index,
    id_lokasi,
    nama_lokasi: lokasiName(id_lokasi),
    jumlah: Math.max(1, Math.floor(item.total_jumlah / (item.lokasi_ids.length || 1))),
    kondisi: "baik",
    status_penggunaan: "aktif",
  }));

  const total_jumlah = lokasi.reduce((sum, row) => sum + row.jumlah, 0);

  detailStore[id] = {
    id_barang: item.id_barang,
    kode_barang: item.kode_barang,
    nama_barang: item.nama_barang,
    kategori: item.kategori,
    status_penggunaan: item.status_penggunaan || "aktif",
    satuan: item.satuan || "Unit",
    total_jumlah,
    tersedia: total_jumlah,
    dipinjam: 0,
    pengadaan: [
      {
        tahun_pengadaan: tahun,
        total_jumlah,
        lokasi,
      },
    ],
  };

  return detailStore[id];
}

export function getMockAsetById(id) {
  const numericId = Number(id);
  const detail = ensureDetail(numericId);
  if (!detail) return null;

  const ringkasan = { baik: 0, rusak_ringan: 0, rusak_berat: 0 };
  let tersedia = 0;
  let dipinjam = 0;

  for (const pengadaan of detail.pengadaan || []) {
    for (const row of pengadaan.lokasi || []) {
      const jumlah = Number(row.jumlah || 0);
      if (ringkasan[row.kondisi] !== undefined) {
        ringkasan[row.kondisi] += jumlah;
      }
      if (row.status_penggunaan === "dipinjam") dipinjam += jumlah;
      else tersedia += jumlah;
    }
  }

  return {
    ...detail,
    tersedia,
    dipinjam,
    ringkasanKondisi: ringkasan,
  };
}

export function updateMockAset(id, { nama_barang, kategori }) {
  const numericId = Number(id);
  const duplicate = asetStore.find(
    (item) =>
      item.id_barang !== numericId &&
      item.nama_barang.toLowerCase() === nama_barang.toLowerCase(),
  );

  if (duplicate) {
    throw new Error("Nama barang sudah digunakan oleh aset lain.");
  }

  asetStore = asetStore.map((item) =>
    item.id_barang === numericId ? { ...item, nama_barang, kategori } : item,
  );

  if (detailStore[numericId]) {
    detailStore[numericId] = {
      ...detailStore[numericId],
      nama_barang,
      kategori,
    };
  }

  return asetStore.find((item) => item.id_barang === numericId);
}

export function createMockAset({
  nama_barang,
  kategori,
  tahun_pengadaan,
  id_lokasi,
  jumlah,
}) {
  const duplicate = asetStore.find(
    (item) => item.nama_barang.toLowerCase() === nama_barang.toLowerCase(),
  );

  if (duplicate) {
    throw new Error(
      `Barang "${nama_barang}" sudah terdaftar dengan kode ${duplicate.kode_barang}.`,
    );
  }

  const nextId = Math.max(0, ...asetStore.map((item) => item.id_barang)) + 1;
  const kode_barang = `BRG-${String(nextId).padStart(3, "0")}`;
  const lokasi = MOCK_LOKASI_FILTER.find((item) => item.id === Number(id_lokasi));

  const created = {
    id_barang: nextId,
    kode_barang,
    nama_barang,
    kategori,
    total_jumlah: Number(jumlah),
    total_lokasi: 1,
    satuan: "Unit",
    ikon: "lainnya",
    status_penggunaan: "aktif",
    lokasi_ids: [Number(id_lokasi)],
  };

  asetStore = [created, ...asetStore];

  detailStore[nextId] = {
    id_barang: nextId,
    kode_barang,
    nama_barang,
    kategori,
    status_penggunaan: "aktif",
    satuan: "Unit",
    total_jumlah: Number(jumlah),
    tersedia: Number(jumlah),
    dipinjam: 0,
    pengadaan: [
      {
        tahun_pengadaan: Number(tahun_pengadaan),
        total_jumlah: Number(jumlah),
        lokasi: [
          {
            id_stok: nextId * 100,
            id_lokasi: Number(id_lokasi),
            nama_lokasi: lokasi?.nama_lokasi || "Lokasi",
            jumlah: Number(jumlah),
            kondisi: "baik",
            status_penggunaan: "aktif",
          },
        ],
      },
    ],
  };

  return created;
}

export function groupLokasiPengadaan(lokasi = []) {
  const map = new Map();

  for (const row of lokasi) {
    const key = row.id_lokasi;
    if (!map.has(key)) {
      map.set(key, {
        id_lokasi: row.id_lokasi,
        nama_lokasi: row.nama_lokasi,
        jumlah: 0,
        kondisi: { baik: 0, rusak_ringan: 0, rusak_berat: 0 },
      });
    }

    const entry = map.get(key);
    const jumlah = Number(row.jumlah || 0);
    entry.jumlah += jumlah;
    if (entry.kondisi[row.kondisi] !== undefined) {
      entry.kondisi[row.kondisi] += jumlah;
    }
  }

  return Array.from(map.values());
}
