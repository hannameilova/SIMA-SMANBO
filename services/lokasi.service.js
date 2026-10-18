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

module.exports = {
  getAllLokasi,
  createLokasi,
  updateLokasi,
};