const asetService = require("../services/aset.service");

const getAllAset = async (req, res) => {
  try {
    const {
        search,
        kategori,
        lokasi
    } = req.query;

    const aset = await asetService.getAllAset(
        search,
        kategori,
        lokasi
    );

    res.status(200).json({
      message: "Data aset berhasil diambil.",
      data: aset,
    });
  } catch (error) {
    console.error("Get aset error:", error.message);

    res.status(500).json({
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
    if (!nama_barang || !nama_barang.trim()) {
      return res.status(400).json({
        message: "Nama barang wajib diisi.",
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
      nama_barang: nama_barang.trim(),
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
    if (!nama_barang || !nama_barang.trim()) {
      return res.status(400).json({
        message: "Nama barang wajib diisi.",
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
      nama_barang: nama_barang.trim(),
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

module.exports = {
  getAllAset,
  getAllLokasi,
  getAllKategori,
  getAsetById,
  createAset,
  updateAset,
};