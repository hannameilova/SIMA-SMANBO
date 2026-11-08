const db = require("../config/database");

const getAllAset = async (search, kategori, lokasiId) => {
  const params = [];

  let query = `
    SELECT
      b.id_barang,
      b.kode_barang,
      b.nama_barang,
      b.kategori,
      COALESCE(SUM(sl.jumlah), 0) AS total_jumlah,
      COUNT(DISTINCT sl.id_lokasi) AS total_lokasi
    FROM barang b

    LEFT JOIN pengadaan_barang pb
      ON pb.id_barang = b.id_barang

    LEFT JOIN stok_lokasi sl
      ON sl.id_pengadaan = pb.id_pengadaan
  `;

  // Filter lokasi
  if (lokasiId) {
    query += `
      AND sl.id_lokasi = ?
    `;

    params.push(lokasiId);
  }

  const conditions = [];

  // Filter pencarian
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

  // Filter kategori
  if (kategori) {
    conditions.push("b.kategori = ?");
    params.push(kategori);
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
  `;

  if (lokasiId) {
    query += `
      HAVING SUM(sl.jumlah) > 0
    `;
  }

  query += `
    ORDER BY b.nama_barang ASC
  `;

  const [aset] = await db.query(query, params);

  return aset;
};

const getAllLokasi = async () => {
  const [lokasi] = await db.query(
    `
      SELECT
        id,
        nama_lokasi,
        kategori,
        kategori_lainnya
      FROM lokasi
      ORDER BY nama_lokasi ASC
    `
  );

  return lokasi;
};

const getAllKategori = async () => {
  const [kategori] = await db.query(
    `
      SELECT DISTINCT kategori
      FROM barang
      WHERE kategori IS NOT NULL
        AND kategori <> ''
      ORDER BY kategori ASC
    `
  );

  return kategori;
};

const getSummaryAset = async () => {
  const [rows] = await db.query(`
    SELECT
      COUNT(
        DISTINCT CASE
          WHEN sl.id_stok IS NOT NULL THEN b.id_barang
        END
      ) AS total_jenis_barang,

      COUNT(DISTINCT sl.id_lokasi) AS total_ruangan,

      COALESCE(SUM(sl.jumlah), 0) AS total_unit_fisik,

      COALESCE(
        SUM(
          CASE
            WHEN sl.kondisi = 'baik' THEN sl.jumlah
            ELSE 0
          END
        ),
        0
      ) AS total_kondisi_baik,

      COALESCE(
        SUM(
          CASE
            WHEN sl.kondisi = 'rusak_ringan' THEN sl.jumlah
            ELSE 0
          END
        ),
        0
      ) AS total_rusak_ringan,

      COALESCE(
        SUM(
          CASE
            WHEN sl.kondisi = 'rusak_berat' THEN sl.jumlah
            ELSE 0
          END
        ),
        0
      ) AS total_rusak_berat

    FROM barang b
    LEFT JOIN pengadaan_barang pb
      ON pb.id_barang = b.id_barang
    LEFT JOIN stok_lokasi sl
      ON sl.id_pengadaan = pb.id_pengadaan
      AND sl.status_penggunaan = 'aktif'
  `);

  const data = rows[0];

  const totalUnitFisik = Number(data.total_unit_fisik);
  const totalKondisiBaik = Number(data.total_kondisi_baik);
  const totalRusakRingan = Number(data.total_rusak_ringan);
  const totalRusakBerat = Number(data.total_rusak_berat);

  return {
    total_jenis_barang: Number(data.total_jenis_barang),
    total_ruangan: Number(data.total_ruangan),
    total_unit_fisik: totalUnitFisik,
    total_kondisi_baik: totalKondisiBaik,
    persentase_layak:
      totalUnitFisik > 0
        ? Math.round((totalKondisiBaik / totalUnitFisik) * 100)
        : 0,
    total_perlu_perbaikan: totalRusakRingan + totalRusakBerat,
    total_rusak_ringan: totalRusakRingan,
    total_rusak_berat: totalRusakBerat,
  };
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

    // Validasi nama barang
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

    // Generate kode barang
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
      const number = parseInt(
        lastCode.replace("BRG-", ""),
        10
      );

      if (!isNaN(number)) {
        nextNumber = number + 1;
      }
    }

    const kode_barang = `BRG-${String(nextNumber).padStart(3, "0")}`;

    // Buat master barang
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

    // Buat data pengadaan
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

    // Buat stok awal
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

  // Rincian pengadaan dan stok
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

const createPengadaanAset = async (
  idBarang,
  { tahun_pengadaan, id_lokasi, jumlah }
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validasi aset
    const [barang] = await connection.query(
      `
        SELECT
          id_barang,
          kode_barang,
          nama_barang,
          kategori
        FROM barang
        WHERE id_barang = ?
        LIMIT 1
        FOR UPDATE
      `,
      [idBarang]
    );

    if (barang.length === 0) {
      const error = new Error("Aset tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }

    // Validasi lokasi
    const [lokasi] = await connection.query(
      `
        SELECT id, nama_lokasi
        FROM lokasi
        WHERE id = ?
        LIMIT 1
      `,
      [id_lokasi]
    );

    if (lokasi.length === 0) {
      const error = new Error("Lokasi tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }

    // Cari pengadaan pada tahun yang dipilih
    const [pengadaan] = await connection.query(
      `
        SELECT id_pengadaan
        FROM pengadaan_barang
        WHERE id_barang = ?
          AND tahun_pengadaan = ?
        LIMIT 1
      `,
      [idBarang, tahun_pengadaan]
    );

    let idPengadaan;

    if (pengadaan.length > 0) {
      idPengadaan = pengadaan[0].id_pengadaan;
    } else {
      // Buat pengadaan baru
      const [pengadaanBaru] = await connection.query(
        `
          INSERT INTO pengadaan_barang (
            id_barang,
            tahun_pengadaan
          )
          VALUES (?, ?)
        `,
        [idBarang, tahun_pengadaan]
      );

      idPengadaan = pengadaanBaru.insertId;
    }

    // Tambahkan stok pada lokasi yang dipilih
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
        ON DUPLICATE KEY UPDATE
          jumlah = jumlah + VALUES(jumlah)
      `,
      [idPengadaan, id_lokasi, jumlah]
    );

    // Ambil jumlah stok terbaru
    const [stok] = await connection.query(
      `
        SELECT id_stok, jumlah
        FROM stok_lokasi
        WHERE id_pengadaan = ?
          AND id_lokasi = ?
          AND kondisi = 'baik'
          AND status_penggunaan = 'aktif'
        LIMIT 1
      `,
      [idPengadaan, id_lokasi]
    );

    await connection.commit();

    return {
      id_barang: barang[0].id_barang,
      kode_barang: barang[0].kode_barang,
      nama_barang: barang[0].nama_barang,
      kategori: barang[0].kategori,
      id_pengadaan: idPengadaan,
      tahun_pengadaan,
      id_lokasi: lokasi[0].id,
      nama_lokasi: lokasi[0].nama_lokasi,
      jumlah_ditambahkan: Number(jumlah),
      jumlah_stok_lokasi: Number(stok[0].jumlah),
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

const updateAset = async (id, { nama_barang, kategori }) => {
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

  // Validasi nama barang
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

async function deleteAset({
  idBarang,
  alasan,
  keterangan,
  nipPenghapus,
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Ambil data aset dan kunci baris selama transaksi
    const [asetRows] = await connection.query(
      `SELECT id_barang, kode_barang, nama_barang
       FROM barang
       WHERE id_barang = ?
       FOR UPDATE`,
      [idBarang]
    );

    if (asetRows.length === 0) {
      const error = new Error("Data aset tidak ditemukan.");
      error.code = "ASET_NOT_FOUND";
      throw error;
    }

    const aset = asetRows[0];

    // 2. Ambil identitas pengguna yang menghapus
    const [userRows] = await connection.query(
      `SELECT nip, nama
       FROM users
       WHERE nip = ? AND is_active = 1
       LIMIT 1`,
      [nipPenghapus]
    );

    if (userRows.length === 0) {
      const error = new Error("Data pengguna tidak ditemukan.");
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    const pengguna = userRows[0];

    // 3. Simpan catatan penghapusan
    await connection.query(
      `INSERT INTO penghapusan_data (
        jenis_data,
        id_data_asal,
        kode_data,
        nama_data,
        alasan,
        keterangan,
        nip_penghapus,
        nama_penghapus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "aset",
        aset.id_barang,
        aset.kode_barang,
        aset.nama_barang,
        alasan,
        keterangan,
        pengguna.nip,
        pengguna.nama,
      ]
    );

    // 4. Hapus stok lokasi milik aset
    // Tidak ada lagi pemeriksaan jumlah harus 0.
    await connection.query(
      `DELETE sl
       FROM stok_lokasi sl
       INNER JOIN pengadaan_barang pb
         ON pb.id_pengadaan = sl.id_pengadaan
       WHERE pb.id_barang = ?`,
      [idBarang]
    );

    // 5. Hapus data pengadaan aset
    await connection.query(
      `DELETE FROM pengadaan_barang
       WHERE id_barang = ?`,
      [idBarang]
    );

    // 6. Hapus data master barang
    await connection.query(
      `DELETE FROM barang
       WHERE id_barang = ?`,
      [idBarang]
    );

    await connection.commit();

    return {
      id_barang: aset.id_barang,
      kode_barang: aset.kode_barang,
      nama_barang: aset.nama_barang,
    };
  } catch (error) {
    await connection.rollback();

    // Data masih digunakan oleh tabel lain yang memiliki FK RESTRICT
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      const conflictError = new Error(
        "Aset tidak dapat dihapus karena masih memiliki keterkaitan dengan data lain atau riwayat transaksi."
      );

      conflictError.code = "ASET_HAS_REFERENCE";
      throw conflictError;
    }

    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllAset,
  getAllLokasi,
  getAllKategori,
  getSummaryAset,
  getAsetById,
  createAset,
  createPengadaanAset,
  updateAset,
  deleteAset,
};