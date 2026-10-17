const db = require("../config/database");

const getAllAset = async (search, kategori, lokasiId) => {
  let query = `
    SELECT
      b.id_barang,
      b.kode_barang,
      b.nama_barang,
      b.kategori,
      COALESCE(SUM(sl.jumlah), 0) AS total_jumlah
    FROM barang b
    LEFT JOIN pengadaan_barang pb
      ON pb.id_barang = b.id_barang
    LEFT JOIN stok_lokasi sl
      ON sl.id_pengadaan = pb.id_pengadaan
  `;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(`
      (
        b.kode_barang LIKE ?
        OR b.nama_barang LIKE ?
      )
    `);

    const keyword = `%${search}%`;
    params.push(keyword, keyword);
  }

  if (kategori) {
    conditions.push("b.kategori = ?");
    params.push(kategori);
  }

  if (lokasiId) {
    conditions.push("sl.id_lokasi = ?");
    params.push(lokasiId);
  }

  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }

  query += `
    GROUP BY
      b.id_barang,
      b.kode_barang,
      b.nama_barang,
      b.kategori
    ORDER BY b.nama_barang ASC
  `;

  const [aset] = await db.query(query, params);

  return aset;
};

const createAset = async ({
  nama_barang,
  kategori,
  tahun_pengadaan,
  id_lokasi,
  jumlah,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validasi lokasi
    const [lokasi] = await connection.query(
    `
        SELECT id
        FROM lokasi
        WHERE id = ?
        LIMIT 1
    `,
    [id_lokasi]
    );

    if (lokasi.length === 0) {
        throw new Error("Lokasi tidak ditemukan.");
    }

    // 1. Validasi apakah nama barang sudah ada
    const [existingBarang] = await connection.query(
      `
        SELECT id_barang, kode_barang
        FROM barang
        WHERE LOWER(nama_barang) = LOWER(?)
        LIMIT 1
      `,
      [nama_barang]
    );

    if (existingBarang.length > 0) {
      throw new Error(
        `Barang "${nama_barang}" sudah terdaftar dengan kode ${existingBarang[0].kode_barang}.`
      );
    }

    // 2. Generate kode barang
    const [lastBarang] = await connection.query(
      `
        SELECT kode_barang
        FROM barang
        ORDER BY id_barang DESC
        LIMIT 1
      `
    );

    let nextNumber = 1;

    if (lastBarang.length > 0) {
      const lastCode = lastBarang[0].kode_barang;
      const number = parseInt(lastCode.replace("BRG-", ""), 10);

      if (!isNaN(number)) {
        nextNumber = number + 1;
      }
    }

    const kode_barang = `BRG-${String(nextNumber).padStart(3, "0")}`;

    // 3. Buat master barang
    const [barangResult] = await connection.query(
      `
        INSERT INTO barang (
          kode_barang,
          nama_barang,
          kategori
        )
        VALUES (?, ?, ?)
      `,
      [
        kode_barang,
        nama_barang,
        kategori,
      ]
    );

    const id_barang = barangResult.insertId;

    // 4. Buat data pengadaan
    const [pengadaanResult] = await connection.query(
      `
        INSERT INTO pengadaan_barang (
          id_barang,
          tahun_pengadaan
        )
        VALUES (?, ?)
      `,
      [
        id_barang,
        tahun_pengadaan,
      ]
    );

    const id_pengadaan = pengadaanResult.insertId;

    // 5. Buat stok awal
    await connection.query(
      `
        INSERT INTO stok_lokasi (
          id_pengadaan,
          id_lokasi,
          jumlah,
          kondisi,
          status_penggunaan
        )
        VALUES (?, ?, ?, 'baik', 'aktif')
      `,
      [
        id_pengadaan,
        id_lokasi,
        jumlah,
      ]
    );

    await connection.commit();

    return {
      id_barang,
      kode_barang,
      nama_barang,
      kategori,
      tahun_pengadaan,
      id_lokasi,
      jumlah,
      kondisi: "baik",
      status_penggunaan: "aktif",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAsetById = async (id) => {
  // Ambil informasi dasar barang
  const [barang] = await db.query(
    `
      SELECT
        id_barang,
        kode_barang,
        nama_barang,
        kategori
      FROM barang
      WHERE id_barang = ?
      LIMIT 1
    `,
    [id]
  );

  if (barang.length === 0) {
    return null;
  }

  // Ambil rincian pengadaan dan stok
  const [rincian] = await db.query(
    `
      SELECT
        pb.id_pengadaan,
        pb.tahun_pengadaan,
        sl.id_stok,
        sl.id_lokasi,
        l.nama_lokasi,
        sl.jumlah,
        sl.kondisi,
        sl.status_penggunaan
      FROM pengadaan_barang pb
      LEFT JOIN stok_lokasi sl
        ON sl.id_pengadaan = pb.id_pengadaan
      LEFT JOIN lokasi l
        ON l.id = sl.id_lokasi
      WHERE pb.id_barang = ?
      ORDER BY
        pb.tahun_pengadaan DESC,
        l.nama_lokasi ASC
    `,
    [id]
  );

  // Hitung total jumlah
  const totalJumlah = rincian.reduce(
    (total, item) => total + Number(item.jumlah || 0),
    0
  );

  // Kelompokkan berdasarkan tahun pengadaan
  const pengadaanMap = {};

  for (const item of rincian) {
    const tahun = item.tahun_pengadaan;

    if (!pengadaanMap[tahun]) {
      pengadaanMap[tahun] = {
        tahun_pengadaan: tahun,
        total_jumlah: 0,
        lokasi: [],
      };
    }

    const jumlah = Number(item.jumlah || 0);

    pengadaanMap[tahun].total_jumlah += jumlah;

    if (item.id_stok !== null) {
      pengadaanMap[tahun].lokasi.push({
        id_stok: item.id_stok,
        id_lokasi: item.id_lokasi,
        nama_lokasi: item.nama_lokasi,
        jumlah,
        kondisi: item.kondisi,
        status_penggunaan: item.status_penggunaan,
      });
    }
  }

  return {
    ...barang[0],
    total_jumlah: totalJumlah,
    pengadaan: Object.values(pengadaanMap),
  };
};

const updateAset = async (id, { nama_barang, kategori }) => {
  // Pastikan aset ada
  const [existing] = await db.query(
    `
      SELECT id_barang
      FROM barang
      WHERE id_barang = ?
      LIMIT 1
    `,
    [id]
  );

  if (existing.length === 0) {
    return null;
  }

  // Cek apakah nama barang sudah digunakan barang lain
  const [duplicate] = await db.query(
    `
      SELECT id_barang
      FROM barang
      WHERE LOWER(nama_barang) = LOWER(?)
        AND id_barang <> ?
      LIMIT 1
    `,
    [nama_barang, id]
  );

  if (duplicate.length > 0) {
    throw new Error(
      "Nama barang sudah digunakan oleh aset lain."
    );
  }

  await db.query(
    `
      UPDATE barang
      SET
        nama_barang = ?,
        kategori = ?
      WHERE id_barang = ?
    `,
    [
      nama_barang,
      kategori,
      id,
    ]
  );

  const [updated] = await db.query(
    `
      SELECT
        id_barang,
        kode_barang,
        nama_barang,
        kategori
      FROM barang
      WHERE id_barang = ?
      LIMIT 1
    `,
    [id]
  );

  return updated[0];
};

module.exports = {
  getAllAset,
  getAsetById,
  createAset,
  updateAset,
};