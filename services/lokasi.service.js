const db = require("../config/database");

const getAllLokasi = async (search, kategori) => {
  let query = `
    SELECT
      id,
      nama_lokasi,
      kategori,
      created_at,
      updated_at
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