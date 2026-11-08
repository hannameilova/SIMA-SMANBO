const db = require("../config/database");
const bcrypt = require("bcrypt");
const asetService = require("../services/aset.service");

const normalizeNamaBarang = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().replace(/\s+/g, " ");
};

const validateNamaBarang = (value) => {
  if (typeof value !== "string") {
    return "Nama aset harus berupa teks.";
  }

  const nama = normalizeNamaBarang(value);

  if (!nama) {
    return "Nama aset wajib diisi.";
  }

  if ([...nama].length < 2) {
    return "Nama aset minimal 2 karakter.";
  }

  if (!/\p{L}/u.test(nama)) {
    return "Nama aset harus mengandung setidaknya satu huruf.";
  }

  if (!/^[\p{L}\p{N} .,\/&()+-]+$/u.test(nama)) {
    return "Nama aset mengandung karakter yang tidak diperbolehkan.";
  }

  return null;
};

const getAllAset = async (req, res) => {
  try {
    const {
      search,
      kategori,
      lokasi,
    } = req.query;

    const kategoriValid = [
      "habis_pakai",
      "tidak_habis_pakai",
    ];

    // Filter kategori
    if (kategori && !kategoriValid.includes(kategori)) {
      return res.status(400).json({
        message: "Kategori filter tidak valid.",
      });
    }

    // Filter lokasi
    let lokasiId = null;

    if (lokasi !== undefined && lokasi !== "") {
      lokasiId = Number(lokasi);

      if (!Number.isInteger(lokasiId) || lokasiId <= 0) {
        return res.status(400).json({
          message: "ID lokasi filter tidak valid.",
        });
      }
    }

    const aset = await asetService.getAllAset(
      search,
      kategori,
      lokasiId
    );

    return res.status(200).json({
      message: "Data aset berhasil diambil.",
      data: aset,
    });
  } catch (error) {
    console.error("Get aset error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const getSummaryAset = async (req, res) => {
  try {
    const summary = await asetService.getSummaryAset();

    return res.status(200).json({
      message: "Summary aset berhasil diambil.",
      data: summary,
    });
  } catch (error) {
    console.error("Get summary aset error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const getAllLokasi = async (req, res) => {
  try {
    const lokasi = await asetService.getAllLokasi();

    return res.status(200).json({
      message: "Data lokasi berhasil diambil.",
      data: lokasi,
    });
  } catch (error) {
    console.error("Get lokasi filter error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const getAllKategori = async (req, res) => {
  try {
    const kategori = await asetService.getAllKategori();

    return res.status(200).json({
      message: "Data kategori berhasil diambil.",
      data: kategori,
    });
  } catch (error) {
    console.error("Get kategori filter error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const createAset = async (req, res) => {
  try {
    const {
      nama_barang,
      kategori,
      tahun_pengadaan,
      id_lokasi,
      jumlah,
    } = req.body;

    // Validasi nama barang
    const errorNama = validateNamaBarang(nama_barang);

    if (errorNama) {
      return res.status(400).json({
        message: errorNama,
      });
    }
    // Validasi kategori
    const kategoriValid = [
      "habis_pakai",
      "tidak_habis_pakai",
    ];

    if (!kategoriValid.includes(kategori)) {
      return res.status(400).json({
        message:
          "Kategori harus habis_pakai atau tidak_habis_pakai.",
      });
    }

    // Validasi tahun pengadaan
    const tahun = Number(tahun_pengadaan);
    const tahunSekarang = new Date().getFullYear();

    if (
      !Number.isInteger(tahun) ||
      tahun < 1900 ||
      tahun > tahunSekarang
    ) {
      return res.status(400).json({
        message: "Tahun pengadaan tidak valid.",
      });
    }

    // Validasi lokasi
    const lokasiId = Number(id_lokasi);

    if (!Number.isInteger(lokasiId) || lokasiId <= 0) {
      return res.status(400).json({
        message: "Lokasi tidak valid.",
      });
    }

    // Validasi jumlah
    const jumlahBarang = Number(jumlah);

    if (
      !Number.isInteger(jumlahBarang) ||
      jumlahBarang <= 0
    ) {
      return res.status(400).json({
        message: "Jumlah harus berupa bilangan bulat lebih dari 0.",
      });
    }

    const aset = await asetService.createAset({
      nama_barang: normalizeNamaBarang(nama_barang),
      kategori,
      tahun_pengadaan: tahun,
      id_lokasi: lokasiId,
      jumlah: jumlahBarang,
    });

    return res.status(201).json({
      message: "Aset berhasil ditambahkan.",
      data: aset,
    });
  } catch (error) {
    console.error("Create aset error:", error.message);

    return res.status(500).json({
      message: error.message || "Terjadi kesalahan pada server.",
    });
  }
};

const getAsetById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID aset tidak valid.",
      });
    }

    const aset = await asetService.getAsetById(id);

    if (!aset) {
      return res.status(404).json({
        message: "Data aset tidak ditemukan.",
      });
    }

    return res.status(200).json({
      message: "Detail aset berhasil diambil.",
      data: aset,
    });
  } catch (error) {
    console.error("Get aset detail error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const updateAset = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID aset tidak valid.",
      });
    }

    const { nama_barang, kategori } = req.body;

    // Validasi nama barang
    const errorNama = validateNamaBarang(nama_barang);

    if (errorNama) {
      return res.status(400).json({
        message: errorNama,
      });
    }

    // Validasi kategori
    const kategoriValid = [
      "habis_pakai",
      "tidak_habis_pakai",
    ];

    if (!kategoriValid.includes(kategori)) {
      return res.status(400).json({
        message:
          "Kategori harus habis_pakai atau tidak_habis_pakai.",
      });
    }

    const aset = await asetService.updateAset(id, {
      nama_barang: normalizeNamaBarang(nama_barang),
      kategori,
    });

    if (!aset) {
      return res.status(404).json({
        message: "Data aset tidak ditemukan.",
      });
    }

    return res.status(200).json({
      message: "Data aset berhasil diperbarui.",
      data: aset,
    });
  } catch (error) {
    console.error("Update aset error:", error.message);

    return res.status(500).json({
      message: error.message || "Terjadi kesalahan pada server.",
    });
  }
};

const createPengadaanAset = async (req, res) => {
  try {
    const idBarang = Number(req.params.id);

    if (!Number.isInteger(idBarang) || idBarang <= 0) {
      return res.status(400).json({
        message: "ID aset tidak valid.",
      });
    }

    const {
      tahun_pengadaan,
      id_lokasi,
      jumlah,
    } = req.body;

    const tahun = Number(tahun_pengadaan);
    const lokasiId = Number(id_lokasi);
    const jumlahBarang = Number(jumlah);
    const tahunSekarang = new Date().getFullYear();

    // Validasi tahun pengadaan
    if (
      tahun_pengadaan === undefined ||
      tahun_pengadaan === null ||
      !Number.isInteger(tahun) ||
      tahun < 1900 ||
      tahun > tahunSekarang
    ) {
      return res.status(400).json({
        message: `Tahun pengadaan harus berupa tahun valid antara 1900 dan ${tahunSekarang}.`,
      });
    }

    // Validasi lokasi
    if (
      id_lokasi === undefined ||
      id_lokasi === null ||
      id_lokasi === "" ||
      !Number.isInteger(lokasiId) ||
      lokasiId <= 0
    ) {
      return res.status(400).json({
        message: "ID lokasi tidak valid.",
      });
    }

    // Validasi jumlah
    if (
      jumlah === undefined ||
      jumlah === null ||
      !Number.isInteger(jumlahBarang) ||
      jumlahBarang <= 0
    ) {
      return res.status(400).json({
        message: "Jumlah harus berupa bilangan bulat lebih dari 0.",
      });
    }

    const pengadaan = await asetService.createPengadaanAset(
      idBarang,
      {
        tahun_pengadaan: tahun,
        id_lokasi: lokasiId,
        jumlah: jumlahBarang,
      }
    );

    return res.status(201).json({
      message: "Pengadaan aset berhasil dicatat.",
      data: pengadaan,
    });
  } catch (error) {
    console.error("Create pengadaan aset error:", error.message);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Terjadi kesalahan pada server.",
    });
  }
};

const deleteAset = async (req, res) => {
  try {
    const idBarang = Number(req.params.id);

    const {
      password,
      alasan,
      keterangan,
    } = req.body || {};

    // 1. Validasi ID aset
    if (!Number.isSafeInteger(idBarang) || idBarang <= 0) {
      return res.status(400).json({
        message: "ID aset tidak valid.",
      });
    }

    // 2. Validasi password
    if (typeof password !== "string" || password.length === 0) {
      return res.status(400).json({
        message: "Password wajib diisi untuk menghapus aset.",
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
    typeof keterangan === "string" ? keterangan.trim() : "";

    // Maksimal 500 karakter
    if (keteranganBersih.length > 500) {
      return res.status(400).json({
        message: "Keterangan maksimal 500 karakter.",
      });
    }

    // Keterangan wajib jika alasan lainnya
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

    // 7. Jalankan penghapusan permanen
    const result = await asetService.deleteAset({
      idBarang,
      alasan,
      keterangan: keteranganBersih || null,
      nipPenghapus: req.user.nip,
    });

    return res.status(200).json({
      message: "Data aset berhasil dihapus secara permanen.",
      data: result,
    });

  } catch (error) {
    console.error("Error delete aset:", error.message);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Terjadi kesalahan saat menghapus data aset.",
    });
  }
};

module.exports = {
  getAllAset,
  getAllLokasi,
  getAllKategori,
  getSummaryAset,
  getAsetById,
  createAset,
  updateAset,
  createPengadaanAset,
  deleteAset,
};