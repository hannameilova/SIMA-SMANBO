
const db = require("../config/database");
const crypto = require("crypto");

// Membuat error dengan status HTTP
const buatError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Mengambil rincian stok barang berdasarkan lokasi asal
const getStokBarangUntukPerpindahan = async (
  idBarang,
  idLokasiAsal
) => {
  const [rows] = await db.query(
    `SELECT
        sl.id_stok,
        sl.id_pengadaan,
        sl.id_lokasi,
        b.id_barang,
        b.kode_barang,
        b.nama_barang,
        pb.tahun_pengadaan,
        l.nama_lokasi,
        sl.jumlah,
        sl.kondisi,
        sl.status_penggunaan
     FROM stok_lokasi sl
     INNER JOIN pengadaan_barang pb
        ON pb.id_pengadaan = sl.id_pengadaan
     INNER JOIN barang b
        ON b.id_barang = pb.id_barang
     INNER JOIN lokasi l
        ON l.id = sl.id_lokasi
     WHERE
        pb.id_barang = ?
        AND sl.id_lokasi = ?
        AND sl.jumlah > 0
     ORDER BY
        pb.tahun_pengadaan ASC,
        sl.kondisi ASC,
        sl.status_penggunaan ASC,
        sl.id_stok ASC`,
    [idBarang, idLokasiAsal]
  );

  return rows.map((item) => ({
    ...item,
    id_stok: Number(item.id_stok),
    id_pengadaan: Number(item.id_pengadaan),
    id_lokasi: Number(item.id_lokasi),
    id_barang: Number(item.id_barang),
    tahun_pengadaan: Number(item.tahun_pengadaan),
    jumlah: Number(item.jumlah),
  }));
};


// Menyimpan transaksi perpindahan aset
const createPerpindahanAset = async ({
  idBarang,
  tanggalPerpindahan,
  idLokasiAsal,
  idLokasiTujuan,
  rincianStok,
  alasan,
  keterangan,
  tandaiTidakLayak,
  idUser,
}) => {

  // 1. Validasi ID
  idBarang = Number(idBarang);
  idLokasiAsal = Number(idLokasiAsal);
  idLokasiTujuan = Number(idLokasiTujuan);
  idUser = Number(idUser);

  if (
    !Number.isSafeInteger(idBarang) || idBarang <= 0 ||
    !Number.isSafeInteger(idLokasiAsal) || idLokasiAsal <= 0 ||
    !Number.isSafeInteger(idLokasiTujuan) || idLokasiTujuan <= 0 ||
    !Number.isSafeInteger(idUser) || idUser <= 0
  ) {
    throw buatError("Data ID perpindahan tidak valid.");
  }

  // 2. Validasi lokasi asal dan tujuan
  if (idLokasiAsal === idLokasiTujuan) {
    throw buatError("Lokasi asal dan tujuan tidak boleh sama.");
  }

  // 3. Validasi tanggal
  if (
    typeof tanggalPerpindahan !== "string" ||
    Number.isNaN(Date.parse(tanggalPerpindahan))
  ) {
    throw buatError("Tanggal perpindahan tidak valid.");
  }

  // 4. Validasi alasan
  const alasanValid = [
    "kebutuhan_kelas",
    "penataan_ulang_ruangan",
    "perbaikan",
    "dipindah_ke_gudang",
    "lainnya",
  ];

  if (!alasanValid.includes(alasan)) {
    throw buatError("Alasan perpindahan tidak valid.");
  }

  // 5. Validasi keterangan
  if (
    keterangan !== undefined &&
    keterangan !== null &&
    typeof keterangan !== "string"
  ) {
    throw buatError("Keterangan harus berupa teks.");
  }

  const keteranganBersih =
    typeof keterangan === "string"
      ? keterangan.trim()
      : "";

  if (keteranganBersih.length > 500) {
    throw buatError("Keterangan maksimal 500 karakter.");
  }

  if (alasan === "lainnya" && !keteranganBersih) {
    throw buatError(
      "Keterangan wajib diisi jika memilih alasan lainnya."
    );
  }

  // 6. Validasi rincian stok yang dipindahkan
  if (!Array.isArray(rincianStok) || rincianStok.length === 0) {
    throw buatError("Rincian stok yang dipindahkan wajib diisi.");
  }

  const rincianBersih = rincianStok.map((item) => {
    const idStok = Number(item.id_stok);
    const jumlah = Number(item.jumlah);

    if (
      !Number.isSafeInteger(idStok) || idStok <= 0 ||
      !Number.isSafeInteger(jumlah) || jumlah <= 0
    ) {
      throw buatError("Rincian stok tidak valid.");
    }

    return {
      idStok,
      jumlah,
    };
  });

  // Pastikan ID stok tidak dikirim dua kali
  const daftarIdStok = rincianBersih.map(
    (item) => item.idStok
  );

  if (new Set(daftarIdStok).size !== daftarIdStok.length) {
    throw buatError("Terdapat rincian stok yang duplikat.");
  }

  const jumlahDipindahkan = rincianBersih.reduce(
    (total, item) => total + item.jumlah,
    0
  );

  if (!Number.isSafeInteger(jumlahDipindahkan)) {
    throw buatError("Total jumlah perpindahan tidak valid.");
  }

  // Checkbox hanya menerima boolean
  if (
    tandaiTidakLayak !== undefined &&
    typeof tandaiTidakLayak !== "boolean"
  ) {
    throw buatError("Status tandai tidak layak tidak valid.");
  }

  // 7. Siapkan nomor mutasi
  const tanggalKode = tanggalPerpindahan
    .slice(0, 10)
    .replace(/\D/g, "");

  if (tanggalKode.length !== 8) {
    throw buatError("Format tanggal perpindahan tidak valid.");
  }

  const nomorMutasi =
    `MUT-${tanggalKode}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  const connection = await db.getConnection();
  let transaksiDimulai = false;

  try {
    await connection.beginTransaction();
    transaksiDimulai = true;

    // 8. Periksa lokasi asal dan tujuan
    const [lokasiRows] = await connection.execute(
      `SELECT id, nama_lokasi
       FROM lokasi
       WHERE id IN (?, ?)
       FOR UPDATE`,
      [idLokasiAsal, idLokasiTujuan]
    );

    if (lokasiRows.length !== 2) {
      throw buatError("Lokasi asal atau tujuan tidak ditemukan.", 404);
    }

    const lokasiAsal = lokasiRows.find(
      (item) => Number(item.id) === idLokasiAsal
    );

    const lokasiTujuan = lokasiRows.find(
      (item) => Number(item.id) === idLokasiTujuan
    );

    // 9. Tentukan apakah unit tujuan menjadi nonaktif
    const tujuanGudang = /gudang/i.test(
      lokasiTujuan.nama_lokasi
    );

    const tandaiEfektif =
      tandaiTidakLayak === true &&
      tujuanGudang &&
      alasan === "dipindah_ke_gudang";

    // 10. Kunci stok barang di kedua lokasi
    const [stokTerkunci] = await connection.execute(
      `SELECT
          sl.id_stok,
          sl.id_pengadaan,
          sl.id_lokasi,
          sl.jumlah,
          sl.kondisi,
          sl.status_penggunaan,
          pb.tahun_pengadaan
       FROM stok_lokasi sl
       INNER JOIN pengadaan_barang pb
          ON pb.id_pengadaan = sl.id_pengadaan
       WHERE
          pb.id_barang = ?
          AND sl.id_lokasi IN (?, ?)
       ORDER BY sl.id_stok
       FOR UPDATE`,
      [idBarang, idLokasiAsal, idLokasiTujuan]
    );

    // 11. Periksa rincian stok asal
    const daftarStokAsal = new Map(
      stokTerkunci
        .filter(
          (item) => Number(item.id_lokasi) === idLokasiAsal
        )
        .map((item) => [Number(item.id_stok), item])
    );

    for (const item of rincianBersih) {
      const stok = daftarStokAsal.get(item.idStok);

      if (!stok) {
        throw buatError(
          `Stok dengan ID ${item.idStok} tidak ditemukan di lokasi asal.`
        );
      }

      if (item.jumlah > Number(stok.jumlah)) {
        throw buatError(
          `Jumlah stok ID ${item.idStok} melebihi stok yang tersedia.`
        );
      }
    }

    // 12. Hitung total stok sebelum perpindahan
    const jumlahAsalSebelum = stokTerkunci
      .filter(
        (item) => Number(item.id_lokasi) === idLokasiAsal
      )
      .reduce(
        (total, item) => total + Number(item.jumlah),
        0
      );

    const jumlahTujuanSebelum = stokTerkunci
      .filter(
        (item) => Number(item.id_lokasi) === idLokasiTujuan
      )
      .reduce(
        (total, item) => total + Number(item.jumlah),
        0
      );

    // 13. Simpan header transaksi
    const [headerResult] = await connection.execute(
      `INSERT INTO perpindahan_aset (
          nomor_mutasi,
          id_barang,
          tanggal_perpindahan,
          id_lokasi_asal,
          id_lokasi_tujuan,
          jumlah_dipindahkan,
          jumlah_asal_sebelum,
          jumlah_asal_sesudah,
          jumlah_tujuan_sebelum,
          jumlah_tujuan_sesudah,
          alasan,
          keterangan,
          tandai_tidak_layak,
          id_user
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomorMutasi,
        idBarang,
        tanggalPerpindahan,
        idLokasiAsal,
        idLokasiTujuan,
        jumlahDipindahkan,
        jumlahAsalSebelum,
        jumlahAsalSebelum - jumlahDipindahkan,
        jumlahTujuanSebelum,
        jumlahTujuanSebelum + jumlahDipindahkan,
        alasan,
        keteranganBersih || null,
        tandaiEfektif ? 1 : 0,
        idUser,
      ]
    );

    const idPerpindahan = headerResult.insertId;

    const rincianTersimpan = [];

    // 14. Pindahkan setiap rincian stok
    for (const item of rincianBersih) {
      const stokAsal = daftarStokAsal.get(item.idStok);

      // Kurangi stok lokasi asal
      const [updateAsal] = await connection.execute(
        `UPDATE stok_lokasi
         SET jumlah = jumlah - ?
         WHERE id_stok = ?
           AND jumlah >= ?`,
        [item.jumlah, item.idStok, item.jumlah]
      );

      if (updateAsal.affectedRows !== 1) {
        throw buatError(
          "Gagal mengurangi stok di lokasi asal."
        );
      }

      // Status stok di lokasi tujuan
      const statusTujuan = tandaiEfektif
        ? "nonaktif"
        : stokAsal.status_penggunaan;

      // Tambahkan stok tujuan.
      // Jika kombinasi stok sudah ada, jumlahnya ditambahkan.
      // Jika belum ada, sistem membuat baris baru.
      const [tujuanResult] = await connection.execute(
        `INSERT INTO stok_lokasi (
            id_pengadaan,
            id_lokasi,
            jumlah,
            kondisi,
            status_penggunaan
         ) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            jumlah = jumlah + ?,
            id_stok = LAST_INSERT_ID(id_stok)`,
        [
          Number(stokAsal.id_pengadaan),
          idLokasiTujuan,
          item.jumlah,
          stokAsal.kondisi,
          statusTujuan,
          item.jumlah,
        ]
      );

      const idStokTujuan = Number(tujuanResult.insertId);

      if (!idStokTujuan) {
        throw buatError(
          "Gagal mendapatkan data stok di lokasi tujuan.",
          500
        );
      }

      // Simpan rincian perpindahan
      await connection.execute(
        `INSERT INTO perpindahan_aset_detail (
            id_perpindahan,
            id_stok_asal,
            id_stok_tujuan,
            jumlah_dipindahkan
         ) VALUES (?, ?, ?, ?)`,
        [
          idPerpindahan,
          item.idStok,
          idStokTujuan,
          item.jumlah,
        ]
      );

      rincianTersimpan.push({
        id_stok_asal: item.idStok,
        id_stok_tujuan: idStokTujuan,
        tahun_pengadaan: Number(stokAsal.tahun_pengadaan),
        kondisi: stokAsal.kondisi,
        status_penggunaan_tujuan: statusTujuan,
        jumlah_dipindahkan: item.jumlah,
      });
    }

    // 15. Simpan seluruh perubahan secara permanen
    await connection.commit();
    transaksiDimulai = false;

    return {
      id_perpindahan: Number(idPerpindahan),
      nomor_mutasi: nomorMutasi,
      jumlah_dipindahkan: jumlahDipindahkan,
      jumlah_asal_sebelum: jumlahAsalSebelum,
      jumlah_asal_sesudah:
        jumlahAsalSebelum - jumlahDipindahkan,
      jumlah_tujuan_sebelum: jumlahTujuanSebelum,
      jumlah_tujuan_sesudah:
        jumlahTujuanSebelum + jumlahDipindahkan,
      tandai_tidak_layak: tandaiEfektif,
      rincian: rincianTersimpan,
    };

  } catch (error) {
    if (transaksiDimulai) {
      await connection.rollback();
    }

    throw error;

  } finally {
    connection.release();
  }
};


// Mengambil seluruh riwayat perpindahan aset
const getAllPerpindahanAset = async () => {
  const [rows] = await db.query(
    `SELECT
        p.id_perpindahan,
        p.nomor_mutasi,
        p.tanggal_perpindahan,

        p.id_barang,
        b.kode_barang,
        b.nama_barang,

        p.id_lokasi_asal,
        la.nama_lokasi AS nama_lokasi_asal,

        p.id_lokasi_tujuan,
        lt.nama_lokasi AS nama_lokasi_tujuan,

        p.jumlah_dipindahkan,

        p.jumlah_asal_sebelum,
        p.jumlah_asal_sesudah,

        p.jumlah_tujuan_sebelum,
        p.jumlah_tujuan_sesudah,

        p.alasan,
        p.keterangan,
        p.tandai_tidak_layak,

        p.id_user,
        u.nama AS nama_petugas,

        p.created_at

     FROM perpindahan_aset p

     INNER JOIN barang b
        ON b.id_barang = p.id_barang

     INNER JOIN lokasi la
        ON la.id = p.id_lokasi_asal

     INNER JOIN lokasi lt
        ON lt.id = p.id_lokasi_tujuan

     INNER JOIN users u
        ON u.id = p.id_user

     ORDER BY
        p.tanggal_perpindahan DESC,
        p.id_perpindahan DESC`
  );

  return rows.map((item) => ({
    ...item,
    id_perpindahan: Number(item.id_perpindahan),
    id_barang: Number(item.id_barang),
    id_lokasi_asal: Number(item.id_lokasi_asal),
    id_lokasi_tujuan: Number(item.id_lokasi_tujuan),
    jumlah_dipindahkan: Number(item.jumlah_dipindahkan),
    jumlah_asal_sebelum: Number(item.jumlah_asal_sebelum),
    jumlah_asal_sesudah: Number(item.jumlah_asal_sesudah),
    jumlah_tujuan_sebelum: Number(item.jumlah_tujuan_sebelum),
    jumlah_tujuan_sesudah: Number(item.jumlah_tujuan_sesudah),
    id_user: Number(item.id_user),
    tandai_tidak_layak: Boolean(item.tandai_tidak_layak),
  }));
};

// Mengambil detail satu transaksi perpindahan aset
const getDetailPerpindahanAset = async (idPerpindahan) => {
  // Mengambil informasi utama transaksi
  const [headerRows] = await db.query(
    `SELECT
        p.id_perpindahan,
        p.nomor_mutasi,
        p.tanggal_perpindahan,

        p.id_barang,
        b.kode_barang,
        b.nama_barang,

        p.id_lokasi_asal,
        la.nama_lokasi AS nama_lokasi_asal,

        p.id_lokasi_tujuan,
        lt.nama_lokasi AS nama_lokasi_tujuan,

        p.jumlah_dipindahkan,
        p.alasan,
        p.keterangan,
        p.tandai_tidak_layak,

        p.id_user,
        u.nama AS nama_petugas,

        p.created_at

     FROM perpindahan_aset p

     INNER JOIN barang b
        ON b.id_barang = p.id_barang

     INNER JOIN lokasi la
        ON la.id = p.id_lokasi_asal

     INNER JOIN lokasi lt
        ON lt.id = p.id_lokasi_tujuan

     INNER JOIN users u
        ON u.id = p.id_user

     WHERE p.id_perpindahan = ?
     LIMIT 1`,
    [idPerpindahan]
  );

  // Jika transaksi tidak ditemukan
  if (headerRows.length === 0) {
    return null;
  }

  // Mengambil rincian stok yang dipindahkan
  const [detailRows] = await db.query(
    `SELECT
        d.id_detail,
        d.id_stok_asal,
        d.id_stok_tujuan,
        d.jumlah_dipindahkan,

        pb_asal.tahun_pengadaan AS tahun_pengadaan,

        sa.kondisi AS kondisi,
        sa.status_penggunaan AS status_penggunaan_asal,

        st.status_penggunaan AS status_penggunaan_tujuan

     FROM perpindahan_aset_detail d

     INNER JOIN stok_lokasi sa
        ON sa.id_stok = d.id_stok_asal

     INNER JOIN pengadaan_barang pb_asal
        ON pb_asal.id_pengadaan = sa.id_pengadaan

     INNER JOIN stok_lokasi st
        ON st.id_stok = d.id_stok_tujuan

     WHERE d.id_perpindahan = ?

     ORDER BY d.id_detail ASC`,
    [idPerpindahan]
  );

  return {
    ...headerRows[0],

    id_perpindahan: Number(headerRows[0].id_perpindahan),
    id_barang: Number(headerRows[0].id_barang),
    jumlah_dipindahkan: Number(headerRows[0].jumlah_dipindahkan),
    tandai_tidak_layak: Boolean(headerRows[0].tandai_tidak_layak),

    rincian_stok: detailRows.map((item) => ({
      ...item,
      id_detail: Number(item.id_detail),
      id_stok_asal: Number(item.id_stok_asal),
      id_stok_tujuan: Number(item.id_stok_tujuan),
      jumlah_dipindahkan: Number(item.jumlah_dipindahkan),
      tahun_pengadaan: Number(item.tahun_pengadaan),
    })),
  };
};

module.exports = {
  getStokBarangUntukPerpindahan,
  createPerpindahanAset,
  getAllPerpindahanAset,
  getDetailPerpindahanAset,
};
