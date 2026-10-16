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

module.exports = {
  getAllLokasi,
  createLokasi,
  updateLokasi,
};