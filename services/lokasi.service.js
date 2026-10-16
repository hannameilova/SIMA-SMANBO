const db = require("../config/database");

const getAllLokasi = async () => {
  const [lokasi] = await db.query(
    `
    SELECT
      id,
      nama_lokasi,
      kategori,
      created_at,
      updated_at
    FROM lokasi
    ORDER BY nama_lokasi ASC
    `
  );

  return lokasi;
};

const createLokasi = async (namaLokasi, kategori) => {
  const [result] = await db.query(
    `
    INSERT INTO lokasi (nama_lokasi, kategori)
    VALUES (?, ?)
    `,
    [namaLokasi, kategori || null]
  );

  return {
    id: result.insertId,
    nama_lokasi: namaLokasi,
    kategori: kategori || null,
  };
};

const updateLokasi = async (id, namaLokasi, kategori) => {
  const [result] = await db.query(
    `
    UPDATE lokasi
    SET nama_lokasi = ?, kategori = ?
    WHERE id = ?
    `,
    [namaLokasi, kategori || null, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return {
    id: Number(id),
    nama_lokasi: namaLokasi,
    kategori: kategori || null,
  };
};

module.exports = {
  getAllLokasi,
  createLokasi,
  updateLokasi,
};