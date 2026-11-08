const db = require("../config/database");

const getAllLokasi = async (search, kategori) => {
  let query = `
    SELECT
      id,
      nama_lokasi,
      kategori,
      kategori_lainnya
    FROM lokasi
  `;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("nama_lokasi LIKE ?");
    params.push(`%${search}%`);
  }

  if (kategori) {
    conditions.push("kategori = ?");
    params.push(kategori);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY nama_lokasi ASC";

  const [lokasi] = await db.query(query, params);

  return lokasi;
};

const createLokasi = async (
  namaLokasi,
  kategori,
  kategoriLainnya
) => {
  const [result] = await db.query(
    `
    INSERT INTO lokasi (nama_lokasi, kategori, kategori_lainnya)
    VALUES (?, ?, ?)
    `,
    [
      namaLokasi,
      kategori,
      kategoriLainnya || null,
    ]
  );

  return {
    id: result.insertId,
    nama_lokasi: namaLokasi,
    kategori,
    kategori_lainnya: kategoriLainnya || null,
  };
};

const updateLokasi = async (
  id,
  namaLokasi,
  kategori,
  kategoriLainnya
) => {
  const [result] = await db.query(
    `
    UPDATE lokasi
    SET nama_lokasi = ?, kategori = ?, kategori_lainnya = ?
    WHERE id = ?
    `,
    [
      namaLokasi,
      kategori,
      kategoriLainnya || null,
      id,
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return {
    id: Number(id),
    nama_lokasi: namaLokasi,
    kategori,
    kategori_lainnya: kategoriLainnya || null,
  };
};

const deleteLokasi = async ({
  idLokasi,
  alasan,
  keterangan,
  nipPenghapus,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Ambil data lokasi dan kunci baris selama transaksi
    const [lokasiRows] = await connection.query(
      `SELECT id, nama_lokasi
       FROM lokasi
       WHERE id = ?
       FOR UPDATE`,
      [idLokasi]
    );

    if (lokasiRows.length === 0) {
      const error = new Error("Lokasi tidak ditemukan.");
      error.code = "LOKASI_NOT_FOUND";
      throw error;
    }

    const lokasi = lokasiRows[0];

    // 2. Periksa stok yang masih terdaftar pada lokasi
    const [stokRows] = await connection.query(
      `SELECT id_stok, jumlah
       FROM stok_lokasi
       WHERE id_lokasi = ?
       FOR UPDATE`,
      [idLokasi]
    );

    // Lokasi tidak boleh dihapus jika masih memiliki stok
    const memilikiStok = stokRows.some(
      (stok) => Number(stok.jumlah) !== 0
    );

    if (memilikiStok) {
      const error = new Error(
        "Lokasi tidak dapat dihapus karena masih memiliki stok aset."
      );
      error.code = "LOKASI_HAS_STOCK";
      throw error;
    }

    // 3. Ambil identitas pengguna yang menghapus
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

    // 4. Simpan catatan penghapusan
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
        "lokasi",
        lokasi.id,
        null,
        lokasi.nama_lokasi,
        alasan,
        keterangan,
        pengguna.nip,
        pengguna.nama,
      ]
    );

    // 5. Hapus catatan stok lokasi yang jumlahnya 0
    // Data barang dan pengadaan tidak ikut dihapus.
    if (stokRows.length > 0) {
      await connection.query(
        `DELETE FROM stok_lokasi
         WHERE id_lokasi = ?`,
        [idLokasi]
      );
    }

    // 6. Hapus data lokasi
    await connection.query(
      `DELETE FROM lokasi
       WHERE id = ?`,
      [idLokasi]
    );

    await connection.commit();

    return {
      id: lokasi.id,
      nama_lokasi: lokasi.nama_lokasi,
    };
  } catch (error) {
    await connection.rollback();

    // Menangani lokasi atau catatan stok yang masih direferensikan
    // oleh tabel lain melalui foreign key.
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      const conflictError = new Error(
        "Lokasi tidak dapat dihapus karena masih memiliki keterkaitan dengan data atau riwayat transaksi lain."
      );

      conflictError.code = "LOKASI_HAS_REFERENCE";
      throw conflictError;
    }

    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllLokasi,
  createLokasi,
  updateLokasi,
  deleteLokasi,
};