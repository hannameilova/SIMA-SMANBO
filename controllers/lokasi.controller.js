const db = require("../config/database");
const bcrypt = require("bcrypt");
const lokasiService = require("../services/lokasi.service");

const getAllLokasi = async (req, res) => {
  try {
    const { search, kategori } = req.query;

    const lokasi = await lokasiService.getAllLokasi(
      search,
      kategori
    );

    res.status(200).json({
      message: "Data lokasi berhasil diambil.",
      data: lokasi,
    });
  } catch (error) {
    console.error("Get lokasi error:", error.message);

    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const createLokasi = async (req, res) => {
  try {
    const {
        nama_lokasi,
        kategori,
        kategori_lainnya,
    } = req.body;

    if (!nama_lokasi) {
      return res.status(400).json({
        message: "Nama lokasi wajib diisi.",
      });
    }

    const kategoriValid = [
        "Ruang Kelas",
        "Ruang Administrasi",
        "Ruang Penunjang",
        "Lainnya",
    ];

    if (!kategoriValid.includes(kategori)) {
      return res.status(400).json({
        message: "Kategori lokasi tidak valid.",
      });
    }

    if (kategori === "Lainnya" && !kategori_lainnya) {
      return res.status(400).json({
        message: "Nama kategori lainnya wajib diisi.",
      });
    }

    const lokasi = await lokasiService.createLokasi(
        nama_lokasi,
        kategori,
        kategori === "Lainnya" ? kategori_lainnya : null
    );

    res.status(201).json({
      message: "Lokasi berhasil ditambahkan.",
      data: lokasi,
    });
  } catch (error) {
    console.error("Create lokasi error:", error.message);

    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const updateLokasi = async (req, res) => {
  try {
    const { id } = req.params;
    const {
        nama_lokasi,
        kategori,
        kategori_lainnya,
    } = req.body;
    
    const kategoriValid = [
        "Ruang Kelas",
        "Ruang Administrasi",
        "Ruang Penunjang",
        "Lainnya",
    ];

    if (!kategoriValid.includes(kategori)) {
      return res.status(400).json({
        message: "Kategori lokasi tidak valid.",
      });
    }

    if (kategori === "Lainnya" && !kategori_lainnya) {
      return res.status(400).json({
        message: "Nama kategori lainnya wajib diisi.",
      });
    }

    if (!nama_lokasi) {
      return res.status(400).json({
        message: "Nama lokasi wajib diisi.",
      });
    }

    const lokasi = await lokasiService.updateLokasi(
        id,
        nama_lokasi,
        kategori,
        kategori === "Lainnya" ? kategori_lainnya : null
    );

    if (!lokasi) {
      return res.status(404).json({
        message: "Lokasi tidak ditemukan.",
      });
    }

    res.status(200).json({
      message: "Lokasi berhasil diperbarui.",
      data: lokasi,
    });
  } catch (error) {
    console.error("Update lokasi error:", error.message);

    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const deleteLokasi = async (req, res) => {
  try {
    const idLokasi = Number(req.params.id);

    const {
      password,
      alasan,
      keterangan,
    } = req.body || {};

    // 1. Validasi ID lokasi
    if (!Number.isSafeInteger(idLokasi) || idLokasi <= 0) {
      return res.status(400).json({
        message: "ID lokasi tidak valid.",
      });
    }

    // 2. Validasi password
    if (
      typeof password !== "string" ||
      password.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Password wajib diisi untuk menghapus lokasi.",
      });
    }

    // 3. Validasi alasan penghapusan
    const daftarAlasan = [
      "kesalahan_input",
      "data_duplikat",
      "lainnya",
    ];

    if (
      typeof alasan !== "string" ||
      !daftarAlasan.includes(alasan)
    ) {
      return res.status(400).json({
        message: "Alasan penghapusan tidak valid.",
      });
    }

    // 4. Validasi keterangan
    if (
      keterangan !== undefined &&
      keterangan !== null &&
      typeof keterangan !== "string"
    ) {
      return res.status(400).json({
        message: "Keterangan harus berupa teks.",
      });
    }

    const keteranganBersih =
      typeof keterangan === "string"
        ? keterangan.trim()
        : "";

    if (keteranganBersih.length > 500) {
      return res.status(400).json({
        message: "Keterangan maksimal 500 karakter.",
      });
    }

    if (alasan === "lainnya" && !keteranganBersih) {
      return res.status(400).json({
        message: "Keterangan wajib diisi jika memilih alasan lainnya.",
      });
    }

    // 5. Ambil hash password pengguna berdasarkan NIP dari token
    const [userRows] = await db.query(
      `SELECT password_hash
       FROM users
       WHERE nip = ? AND is_active = 1
       LIMIT 1`,
      [req.user.nip]
    );

    if (userRows.length === 0) {
      return res.status(401).json({
        message: "Akun pengguna tidak ditemukan atau tidak aktif.",
      });
    }

    // 6. Verifikasi password
    const passwordValid = await bcrypt.compare(
      password,
      userRows[0].password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Password yang dimasukkan tidak sesuai.",
      });
    }

    // 7. Jalankan penghapusan lokasi
    const result = await lokasiService.deleteLokasi({
      idLokasi,
      alasan,
      keterangan: keteranganBersih || null,
      nipPenghapus: req.user.nip,
    });

    return res.status(200).json({
      message: "Lokasi berhasil dihapus secara permanen.",
      data: result,
    });

  } catch (error) {
    console.error("Error delete lokasi:", error.message);

    if (error.code === "LOKASI_NOT_FOUND") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.code === "LOKASI_HAS_STOCK" ||
      error.code === "LOKASI_HAS_REFERENCE"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan saat menghapus lokasi.",
    });
  }
};

module.exports = {
  getAllLokasi,
  createLokasi,
  updateLokasi,
  deleteLokasi,
};