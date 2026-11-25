const db = require("../config/database");

// Mengambil daftar ruangan yang memiliki inventaris
const getLokasiUntukStokOpname = async (search, kategori) => {
  let query = `
    SELECT
      l.id,
      l.nama_lokasi,
      l.kategori,
      l.kategori_lainnya,

      sesi_terakhir.id_opname AS id_opname,

      CASE
        WHEN sesi_terakhir.status IS NULL
          THEN 'belum_diperiksa'
        WHEN sesi_terakhir.status IN ('draft', 'berlangsung')
          THEN 'berlangsung'
        WHEN sesi_terakhir.status = 'selesai'
          THEN 'selesai_opname'
        ELSE 'belum_diperiksa'
      END AS status_opname,

      riwayat_opname.terakhir_opname AS terakhir_opname,

      COUNT(DISTINCT b.id_barang) AS jumlah_jenis_barang,
      COUNT(DISTINCT sl.id_stok) AS jumlah_data_stok,
      COALESCE(SUM(sl.jumlah), 0) AS total_unit

    FROM lokasi l

    INNER JOIN stok_lokasi sl
      ON sl.id_lokasi = l.id

    INNER JOIN pengadaan_barang pb
      ON pb.id_pengadaan = sl.id_pengadaan

    INNER JOIN barang b
      ON b.id_barang = pb.id_barang

    LEFT JOIN (
      SELECT
        so.id_opname,
        so.id_lokasi,
        so.status
      FROM stok_opname so
      INNER JOIN (
        SELECT
          id_lokasi,
          MAX(id_opname) AS id_opname
        FROM stok_opname
        GROUP BY id_lokasi
      ) terbaru
        ON terbaru.id_opname = so.id_opname
    ) sesi_terakhir
      ON sesi_terakhir.id_lokasi = l.id

    LEFT JOIN (
      SELECT
        id_lokasi,
        MAX(tanggal_selesai) AS terakhir_opname
      FROM stok_opname
      WHERE
        status = 'selesai'
        AND tanggal_selesai IS NOT NULL
      GROUP BY id_lokasi
    ) riwayat_opname
      ON riwayat_opname.id_lokasi = l.id

    WHERE sl.jumlah > 0
  `;

  const conditions = [];
  const params = [];

  // Filter berdasarkan nama ruangan
  if (search) {
    conditions.push("l.nama_lokasi LIKE ?");
    params.push(`%${search}%`);
  }

  // Filter berdasarkan kategori ruangan
  if (kategori) {
    conditions.push("l.kategori = ?");
    params.push(kategori);
  }

  // Tambahkan kondisi pencarian
  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  query += `
    GROUP BY
      l.id,
      l.nama_lokasi,
      l.kategori,
      l.kategori_lainnya,
      sesi_terakhir.id_opname,
      sesi_terakhir.status,
      riwayat_opname.terakhir_opname

    ORDER BY l.nama_lokasi ASC
  `;

  const [lokasi] = await db.query(query, params);

  return lokasi.map((item) => ({
    ...item,
    id_opname:
      item.id_opname === null ? null : Number(item.id_opname),
    jumlah_jenis_barang: Number(item.jumlah_jenis_barang),
    jumlah_data_stok: Number(item.jumlah_data_stok),
    total_unit: Number(item.total_unit),
  }));
};

// Membuat sesi Stok Opname baru
const createSesiStokOpname = async (idLokasi, nipPengguna) => {
  const connection = await db.getConnection();
  let transaksiAktif = false;

  try {
    await connection.beginTransaction();
    transaksiAktif = true;

    // 1. Periksa lokasi dan kunci baris lokasi selama transaksi
    const [lokasiRows] = await connection.query(
      `SELECT id, nama_lokasi
       FROM lokasi
       WHERE id = ?
       FOR UPDATE`,
      [idLokasi]
    );

    if (lokasiRows.length === 0) {
      const error = new Error("Ruangan tidak ditemukan.");
      error.code = "LOKASI_NOT_FOUND";
      throw error;
    }

    const lokasi = lokasiRows[0];

    // 2. Periksa apakah masih ada sesi yang belum selesai
    const [sesiAktifRows] = await connection.query(
      `SELECT id_opname, status
       FROM stok_opname
       WHERE id_lokasi = ?
         AND status IN ('draft', 'berlangsung')
       ORDER BY id_opname DESC
       LIMIT 1
       FOR UPDATE`,
      [idLokasi]
    );

    if (sesiAktifRows.length > 0) {
      const error = new Error(
        "Masih ada sesi Stok Opname yang belum selesai untuk lokasi ini."
      );

      error.code = "LOKASI_HAS_ACTIVE_SESSION";
      error.idOpname = sesiAktifRows[0].id_opname;

      throw error;
    }

    // Sesi sebelumnya berstatus selesai tidak menghalangi sesi baru.

    // 3. Ambil ID pengguna yang sedang login
    const [userRows] = await connection.query(
      `SELECT id
       FROM users
       WHERE nip = ?
         AND is_active = 1
       LIMIT 1`,
      [nipPengguna]
    );

    if (userRows.length === 0) {
      const error = new Error(
        "Pengguna tidak ditemukan atau tidak aktif."
      );

      error.code = "USER_NOT_FOUND";
      throw error;
    }

    const idUser = userRows[0].id;

    // 4. Ambil stok terkini pada lokasi yang dipilih
    const [stokRows] = await connection.query(
      `SELECT
         id_stok,
         jumlah,
         kondisi
       FROM stok_lokasi
       WHERE id_lokasi = ?
         AND jumlah > 0
       ORDER BY id_stok ASC
       FOR UPDATE`,
      [idLokasi]
    );

    if (stokRows.length === 0) {
      const error = new Error(
        "Ruangan ini belum memiliki inventaris untuk diperiksa."
      );

      error.code = "EMPTY_LOCATION";
      throw error;
    }

    // 5. Buat sesi Stok Opname baru
    const [opnameResult] = await connection.query(
      `INSERT INTO stok_opname (
         id_lokasi,
         id_user,
         status
       ) VALUES (?, ?, 'berlangsung')`,
      [idLokasi, idUser]
    );

    const idOpname = opnameResult.insertId;

    // 6. Simpan snapshot stok terkini sebagai detail sesi baru
    for (const stok of stokRows) {
      await connection.query(
        `INSERT INTO stok_opname_detail (
           id_opname,
           id_stok,
           jumlah_sistem,
           kondisi_sistem
         ) VALUES (?, ?, ?, ?)`,
        [
          idOpname,
          stok.id_stok,
          stok.jumlah,
          stok.kondisi,
        ]
      );
    }

    // 7. Simpan transaksi
    await connection.commit();
    transaksiAktif = false;

    return {
      id_opname: idOpname,
      id_lokasi: lokasi.id,
      nama_lokasi: lokasi.nama_lokasi,
      id_user: idUser,
      status: "berlangsung",
      jumlah_data_stok: stokRows.length,
    };
  } catch (error) {
    if (transaksiAktif) {
      await connection.rollback();
    }

    throw error;
  } finally {
    connection.release();
  }
};

const getDataKelompokSesi = async (idOpname) => {
  // 1. Ambil informasi sesi
  const [sesiRows] = await db.query(
    `SELECT
        so.id_opname,
        so.id_lokasi,
        so.status,
        so.tanggal_mulai,
        so.tanggal_selesai,
        l.nama_lokasi
     FROM stok_opname so
     JOIN lokasi l ON l.id = so.id_lokasi
     WHERE so.id_opname = ?
     LIMIT 1`,
    [idOpname]
  );

  if (sesiRows.length === 0) {
    const error = new Error("Sesi stok opname tidak ditemukan.");
    error.code = "SESI_NOT_FOUND";
    throw error;
  }

  const sesi = sesiRows[0];

  // 2. Ambil seluruh detail stok dalam sesi
  const [rows] = await db.query(
    `SELECT
        sod.id_detail,
        sod.id_stok,
        sod.jumlah_sistem,
        sod.kondisi_sistem,
        sod.status_pemeriksaan,
        sod.catatan,
        sod.diperiksa_pada,

        sl.status_penggunaan,

        pb.id_pengadaan,
        pb.tahun_pengadaan,

        b.id_barang,
        b.kode_barang,
        b.nama_barang,
        b.kategori,

        sok.kondisi AS kondisi_fisik,
        sok.jumlah_fisik

     FROM stok_opname_detail sod

     JOIN stok_lokasi sl
       ON sl.id_stok = sod.id_stok

     JOIN pengadaan_barang pb
       ON pb.id_pengadaan = sl.id_pengadaan

     JOIN barang b
       ON b.id_barang = pb.id_barang

     LEFT JOIN stok_opname_detail_kondisi sok
       ON sok.id_detail = sod.id_detail

     WHERE sod.id_opname = ?

     ORDER BY
       b.nama_barang ASC,
       pb.tahun_pengadaan DESC,
       sl.status_penggunaan ASC,
       sod.id_detail ASC,
       sok.kondisi ASC`,
    [idOpname]
  );

  // 3. Kelompokkan berdasarkan barang dan pengadaan
  const barangMap = new Map();
  const kelompokMap = new Map();

  for (const row of rows) {
    const idBarang = Number(row.id_barang);
    const idPengadaan = Number(row.id_pengadaan);
    const idDetail = Number(row.id_detail);

    const statusPenggunaan = row.status_penggunaan;

    // Satu kelompok = satu barang, satu pengadaan,
    // dan satu status penggunaan.
    const groupKey = [
      idBarang,
      idPengadaan,
      statusPenggunaan
    ].join("-");

    if (!barangMap.has(idBarang)) {
      barangMap.set(idBarang, {
        id_barang: idBarang,
        kode_barang: row.kode_barang,
        nama_barang: row.nama_barang,
        kategori: row.kategori,
        daftar_pengadaan: []
      });
    }

    if (!kelompokMap.has(groupKey)) {
      const kelompok = {
        id_detail: idDetail,
        detail_ids: [],

        id_pengadaan: idPengadaan,
        tahun_pengadaan: Number(row.tahun_pengadaan),
        status_penggunaan: statusPenggunaan,

        jumlah_sistem: 0,

        jumlah_sistem_per_kondisi: {
          baik: 0,
          rusak_ringan: 0,
          rusak_berat: 0
        },

        jumlah_fisik: {
          baik: 0,
          rusak_ringan: 0,
          rusak_berat: 0
        },

        status_pemeriksaan: "belum_diperiksa",
        catatan: null,
        diperiksa_pada: null,

        _detailDiproses: new Set(),
        _statusDetail: new Set()
      };

      kelompokMap.set(groupKey, kelompok);

      barangMap
        .get(idBarang)
        .daftar_pengadaan
        .push(kelompok);
    }

    const kelompok = kelompokMap.get(groupKey);

    // 4. Hitung data sistem satu kali per id_detail
    if (!kelompok._detailDiproses.has(idDetail)) {
      kelompok._detailDiproses.add(idDetail);
      kelompok.detail_ids.push(idDetail);

      const jumlahSistem = Number(row.jumlah_sistem);

      kelompok.jumlah_sistem += jumlahSistem;

      kelompok.jumlah_sistem_per_kondisi[
        row.kondisi_sistem
      ] += jumlahSistem;

      kelompok._statusDetail.add(
        row.status_pemeriksaan
      );

      if (idDetail === Math.min(...kelompok.detail_ids)) {
        kelompok.catatan = row.catatan;
        kelompok.diperiksa_pada = row.diperiksa_pada;
      }
    }

    // 5. Jumlah fisik dijumlahkan dari hasil yang tersimpan
    if (row.kondisi_fisik !== null) {
      kelompok.jumlah_fisik[row.kondisi_fisik] +=
        Number(row.jumlah_fisik);

      if (
        row.diperiksa_pada &&
        (
          !kelompok.diperiksa_pada ||
          new Date(row.diperiksa_pada) >
            new Date(kelompok.diperiksa_pada)
        )
      ) {
        kelompok.diperiksa_pada = row.diperiksa_pada;
      }
    }
  }

  // 6. Tentukan status setiap kelompok
  for (const kelompok of kelompokMap.values()) {
    const daftarStatus = Array.from(
      kelompok._statusDetail
    );

    if (daftarStatus.includes("belum_diperiksa")) {
      kelompok.status_pemeriksaan = "belum_diperiksa";
    } else if (daftarStatus.includes("ada_temuan")) {
      kelompok.status_pemeriksaan = "ada_temuan";
    } else {
      kelompok.status_pemeriksaan = "sesuai";
    }

    const sudahDiperiksa =
      kelompok.status_pemeriksaan !== "belum_diperiksa";

    kelompok.sudah_ada_hasil = sudahDiperiksa;

    kelompok.total_fisik = sudahDiperiksa
      ? kelompok.jumlah_fisik.baik +
        kelompok.jumlah_fisik.rusak_ringan +
        kelompok.jumlah_fisik.rusak_berat
      : null;

    kelompok.selisih = sudahDiperiksa
      ? kelompok.total_fisik - kelompok.jumlah_sistem
      : null;

    // Hapus properti internal
    delete kelompok._detailDiproses;
    delete kelompok._statusDetail;
  }

  const barang = Array.from(barangMap.values());
  const semuaKelompok = Array.from(kelompokMap.values());

  return {
    sesi,
    barang,
    semuaKelompok
  };
};

const getBarangSesi = async (idOpname) => {
  const hasil = await getDataKelompokSesi(idOpname);

  const kelompok = hasil.semuaKelompok;

  const sudahDiperiksa = kelompok.filter(
    item => item.status_pemeriksaan !== "belum_diperiksa"
  ).length;

  return {
    sesi: hasil.sesi,

    ringkasan: {
      jumlah_jenis_barang: hasil.barang.length,
      jumlah_data_stok: kelompok.length,
      jumlah_sudah_diperiksa: sudahDiperiksa,
      jumlah_belum_diperiksa:
        kelompok.length - sudahDiperiksa
    },

    barang: hasil.barang
  };
};



const saveHasilPemeriksaan = async (
  idDetail,
  jumlahFisik,
  catatan
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Temukan detail stok yang dipilih
    const [detailRows] = await connection.query(
      `SELECT
          sod.id_detail,
          sod.id_opname,

          sl.id_pengadaan,
          sl.id_lokasi,
          sl.status_penggunaan,

          so.status AS status_opname

       FROM stok_opname_detail sod

       JOIN stok_lokasi sl
         ON sl.id_stok = sod.id_stok

       JOIN stok_opname so
         ON so.id_opname = sod.id_opname

       WHERE sod.id_detail = ?

       FOR UPDATE`,
      [idDetail]
    );

    if (detailRows.length === 0) {
      const error = new Error(
        "Detail pemeriksaan tidak ditemukan."
      );
      error.code = "DETAIL_NOT_FOUND";
      throw error;
    }

    const detail = detailRows[0];

    if (detail.status_opname !== "berlangsung") {
      const error = new Error(
        "Sesi stok opname tidak aktif."
      );
      error.code = "SESI_NOT_ACTIVE";
      throw error;
    }

    // 2. Ambil seluruh detail dalam kelompok yang sama
    const [groupRows] = await connection.query(
      `SELECT
          sod.id_detail,
          sod.jumlah_sistem,
          sod.kondisi_sistem

       FROM stok_opname_detail sod

       JOIN stok_lokasi sl
         ON sl.id_stok = sod.id_stok

       WHERE
          sod.id_opname = ?
          AND sl.id_pengadaan = ?
          AND sl.id_lokasi = ?
          AND sl.status_penggunaan = ?

       ORDER BY sod.id_detail ASC

       FOR UPDATE`,
      [
        detail.id_opname,
        detail.id_pengadaan,
        detail.id_lokasi,
        detail.status_penggunaan
      ]
    );

    if (groupRows.length === 0) {
      throw new Error("Data kelompok stok tidak ditemukan.");
    }

    const detailIds = groupRows.map(
      row => Number(row.id_detail)
    );

    // ID detail terkecil menjadi ID utama kelompok
    const primaryIdDetail = Math.min(...detailIds);

    // 3. Hitung jumlah sistem berdasarkan kondisi
    const jumlahSistem = {
      baik: 0,
      rusak_ringan: 0,
      rusak_berat: 0
    };

    for (const row of groupRows) {
      jumlahSistem[row.kondisi_sistem] +=
        Number(row.jumlah_sistem);
    }

    // 4. Bandingkan kondisi sistem dan fisik
    const kondisiValid = [
      "baik",
      "rusak_ringan",
      "rusak_berat"
    ];

    if (
      !jumlahFisik ||
      typeof jumlahFisik !== "object" ||
      Array.isArray(jumlahFisik) ||
      Object.keys(jumlahFisik).length !== 3 ||
      !kondisiValid.every(kondisi =>
        Number.isSafeInteger(jumlahFisik[kondisi]) &&
        jumlahFisik[kondisi] >= 0
      )
    ) {
      const error = new Error("Jumlah fisik tidak valid.");
      error.code = "INVALID_JUMLAH";
      throw error;
    }

    const sesuai = kondisiValid.every(
      kondisi =>
        jumlahFisik[kondisi] === jumlahSistem[kondisi]
    );

    const statusPemeriksaan = sesuai
      ? "sesuai"
      : "ada_temuan";

    // 5. Bersihkan hasil pemeriksaan sebelumnya
    // agar hanya ada satu hasil untuk satu kelompok
    await connection.query(
      `DELETE FROM stok_opname_detail_kondisi
       WHERE id_detail IN (?)`,
      [detailIds]
    );

    // 6. Simpan tiga kondisi pada ID detail utama
    for (const kondisi of kondisiValid) {
      await connection.query(
        `INSERT INTO stok_opname_detail_kondisi
          (id_detail, kondisi, jumlah_fisik)

         VALUES (?, ?, ?)`,
        [
          primaryIdDetail,
          kondisi,
          jumlahFisik[kondisi]
        ]
      );
    }

    // 7. Tandai seluruh detail kelompok sudah diperiksa
    await connection.query(
      `UPDATE stok_opname_detail
       SET
          status_pemeriksaan = ?,
          catatan = ?,
          diperiksa_pada = CURRENT_TIMESTAMP

       WHERE id_detail IN (?)`,
      [
        statusPemeriksaan,
        catatan || null,
        detailIds
      ]
    );

    await connection.commit();

    const totalSistem =
      jumlahSistem.baik +
      jumlahSistem.rusak_ringan +
      jumlahSistem.rusak_berat;

    const totalFisik =
      jumlahFisik.baik +
      jumlahFisik.rusak_ringan +
      jumlahFisik.rusak_berat;

    return {
      id_detail: primaryIdDetail,
      detail_ids: detailIds,

      jumlah_sistem: totalSistem,
      jumlah_sistem_per_kondisi: jumlahSistem,

      jumlah_fisik: jumlahFisik,
      total_fisik: totalFisik,

      selisih: totalFisik - totalSistem,
      status_pemeriksaan: statusPemeriksaan
    };

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
};

const getRingkasanSesi = async (idOpname) => {
  const hasil = await getDataKelompokSesi(idOpname);

  const barang = hasil.barang;
  const kelompok = hasil.semuaKelompok;

  // 1. Siapkan rincian per tahun pengadaan
  const daftarBarang = barang.map(item => ({
    id_barang: item.id_barang,
    kode_barang: item.kode_barang,
    nama_barang: item.nama_barang,
    kategori: item.kategori,

    daftar_pengadaan: item.daftar_pengadaan.map(p => {
      const jumlahSebelum = p.jumlah_sistem;

      const jumlahSesudah = p.sudah_ada_hasil
        ? p.total_fisik
        : null;

      const kondisi = {};

      const kondisiValid = [
        "baik",
        "rusak_ringan",
        "rusak_berat"
      ];

      for (const namaKondisi of kondisiValid) {
        const sebelum =
          p.jumlah_sistem_per_kondisi[namaKondisi];

        const sesudah = p.sudah_ada_hasil
          ? p.jumlah_fisik[namaKondisi]
          : null;

        kondisi[namaKondisi] = {
          sebelum,
          sesudah,
          selisih: sesudah === null
            ? null
            : sesudah - sebelum
        };
      }

      return {
        id_detail: p.id_detail,
        detail_ids: p.detail_ids,

        id_pengadaan: p.id_pengadaan,
        tahun_pengadaan: p.tahun_pengadaan,
        status_penggunaan: p.status_penggunaan,

        jumlah_sebelum: jumlahSebelum,
        jumlah_sesudah: jumlahSesudah,

        selisih_jumlah: jumlahSesudah === null
          ? null
          : jumlahSesudah - jumlahSebelum,

        kondisi,

        catatan: p.catatan,
        status_pemeriksaan: p.status_pemeriksaan,
        diperiksa_pada: p.diperiksa_pada
      };
    })
  }));

  // 2. Hitung statistik pemeriksaan
  const jumlahSudahDiperiksa = kelompok.filter(
    p => p.status_pemeriksaan !== "belum_diperiksa"
  ).length;

  const jumlahBelumDiperiksa =
    kelompok.length - jumlahSudahDiperiksa;

  const jumlahSesuai = kelompok.filter(
    p => p.status_pemeriksaan === "sesuai"
  ).length;

  const jumlahTemuan = kelompok.filter(
    p => p.status_pemeriksaan === "ada_temuan"
  ).length;

  const totalSistem = kelompok.reduce(
    (total, p) => total + p.jumlah_sistem,
    0
  );

  const totalFisik = kelompok.reduce(
    (total, p) => total + (p.total_fisik ?? 0),
    0
  );

  return {
    sesi: hasil.sesi,

    ringkasan: {
      jumlah_jenis_barang: barang.length,
      jumlah_data_stok: kelompok.length,

      jumlah_sudah_diperiksa: jumlahSudahDiperiksa,
      jumlah_belum_diperiksa: jumlahBelumDiperiksa,

      jumlah_sesuai: jumlahSesuai,
      jumlah_temuan: jumlahTemuan,

      total_sistem: totalSistem,
      total_fisik: totalFisik,

      semua_sudah_diperiksa:
        jumlahBelumDiperiksa === 0
    },

    barang: daftarBarang
  };
};


const confirmSesiStokOpname = async (idOpname) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Kunci sesi stok opname
    const [sesiRows] = await connection.query(
      `SELECT
          id_opname,
          id_lokasi,
          status
       FROM stok_opname
       WHERE id_opname = ?
       FOR UPDATE`,
      [idOpname]
    );

    if (sesiRows.length === 0) {
      const error = new Error(
        "Sesi stok opname tidak ditemukan."
      );
      error.code = "SESI_NOT_FOUND";
      throw error;
    }

    const sesi = sesiRows[0];

    if (sesi.status !== "berlangsung") {
      const error = new Error(
        "Sesi stok opname tidak sedang berlangsung."
      );
      error.code = "SESI_NOT_ACTIVE";
      throw error;
    }

    // 2. Ambil seluruh detail pemeriksaan
    const [detailRows] = await connection.query(
      `SELECT
          sod.id_detail,
          sod.id_stok,
          sod.jumlah_sistem,
          sod.kondisi_sistem,
          sod.status_pemeriksaan,

          sl.id_pengadaan,
          sl.id_lokasi,
          sl.status_penggunaan

       FROM stok_opname_detail sod

       JOIN stok_lokasi sl
         ON sl.id_stok = sod.id_stok

       WHERE sod.id_opname = ?

       ORDER BY sod.id_detail ASC

       FOR UPDATE`,
      [idOpname]
    );

    if (detailRows.length === 0) {
      const error = new Error(
        "Tidak ada data pemeriksaan pada sesi ini."
      );
      error.code = "DETAIL_KOSONG";
      throw error;
    }

    // 3. Pastikan semua detail sudah diperiksa
    const belumDiperiksa = detailRows.some(
      item => item.status_pemeriksaan === "belum_diperiksa"
    );

    if (belumDiperiksa) {
      const error = new Error(
        "Masih ada barang yang belum diperiksa."
      );
      error.code = "PEMERIKSAAN_BELUM_SELESAI";
      throw error;
    }

    // 4. Kelompokkan berdasarkan pengadaan dan status penggunaan
    const kelompokMap = new Map();

    for (const row of detailRows) {
      const key = [
        row.id_pengadaan,
        row.id_lokasi,
        row.status_penggunaan
      ].join("-");

      if (!kelompokMap.has(key)) {
        kelompokMap.set(key, {
          id_pengadaan: row.id_pengadaan,
          id_lokasi: row.id_lokasi,
          status_penggunaan: row.status_penggunaan,

          detail_ids: [],
          jumlah_sistem: {
            baik: 0,
            rusak_ringan: 0,
            rusak_berat: 0
          }
        });
      }

      const kelompok = kelompokMap.get(key);

      kelompok.detail_ids.push(Number(row.id_detail));

      kelompok.jumlah_sistem[row.kondisi_sistem] +=
        Number(row.jumlah_sistem);
    }

    const kondisiValid = [
      "baik",
      "rusak_ringan",
      "rusak_berat"
    ];

    // 5. Proses setiap kelompok pengadaan
    for (const kelompok of kelompokMap.values()) {
      const idUtama = Math.min(...kelompok.detail_ids);

      // Ambil hasil fisik yang tersimpan pada detail utama
      const [hasilRows] = await connection.query(
        `SELECT kondisi, jumlah_fisik
         FROM stok_opname_detail_kondisi
         WHERE id_detail = ?`,
        [idUtama]
      );

      if (hasilRows.length !== 3) {
        const error = new Error(
          "Hasil pemeriksaan belum lengkap."
        );
        error.code = "HASIL_TIDAK_LENGKAP";
        throw error;
      }

      const jumlahFisik = {
        baik: 0,
        rusak_ringan: 0,
        rusak_berat: 0
      };

      for (const row of hasilRows) {
        if (!kondisiValid.includes(row.kondisi)) {
          throw new Error("Kondisi fisik tidak valid.");
        }

        jumlahFisik[row.kondisi] =
          Number(row.jumlah_fisik);
      }

      // 6. Ambil stok resmi yang sudah ada
      const [stokRows] = await connection.query(
        `SELECT
            id_stok,
            kondisi,
            jumlah

         FROM stok_lokasi

         WHERE id_pengadaan = ?
           AND id_lokasi = ?
           AND status_penggunaan = ?

         FOR UPDATE`,
        [
          kelompok.id_pengadaan,
          kelompok.id_lokasi,
          kelompok.status_penggunaan
        ]
      );

      // 7. Perbarui stok berdasarkan kondisi fisik
      for (const kondisi of kondisiValid) {
        const stokAda = stokRows.find(
          item => item.kondisi === kondisi
        );

        if (stokAda) {
          // Jika baris stok sudah ada, perbarui jumlah
          await connection.query(
            `UPDATE stok_lokasi
             SET jumlah = ?
             WHERE id_stok = ?`,
            [
              jumlahFisik[kondisi],
              stokAda.id_stok
            ]
          );

        } else if (jumlahFisik[kondisi] > 0) {
          // Jika belum ada, buat baris stok baru
          await connection.query(
            `INSERT INTO stok_lokasi
              (
                id_pengadaan,
                id_lokasi,
                jumlah,
                kondisi,
                status_penggunaan
              )
             VALUES (?, ?, ?, ?, ?)`,
            [
              kelompok.id_pengadaan,
              kelompok.id_lokasi,
              jumlahFisik[kondisi],
              kondisi,
              kelompok.status_penggunaan
            ]
          );
        }
      }
    }

    // 8. Tandai sesi sebagai selesai
    await connection.query(
      `UPDATE stok_opname
       SET
         status = 'selesai',
         tanggal_selesai = CURRENT_TIMESTAMP
       WHERE id_opname = ?`,
      [idOpname]
    );

    await connection.commit();

    return {
      id_opname: Number(idOpname),
      status: "selesai",
      message: "Stok opname berhasil diselesaikan."
    };

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
};

module.exports = {
  getLokasiUntukStokOpname,
  createSesiStokOpname,
  getBarangSesi,
  saveHasilPemeriksaan,
  getRingkasanSesi,
  confirmSesiStokOpname,
};