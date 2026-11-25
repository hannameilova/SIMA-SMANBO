const stokOpnameService = require("../services/stokOpname.service");

const getLokasi = async (req, res) => {
  try {
    const { search, kategori } = req.query;

    const lokasi =
      await stokOpnameService.getLokasiUntukStokOpname(
        search,
        kategori
      );

    return res.status(200).json({
      message: "Daftar ruangan berhasil diambil.",
      data: lokasi,
    });

  } catch (error) {
    console.error("Get lokasi Stok Opname error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan saat mengambil daftar ruangan.",
    });
  }
};



// Membuat sesi Stok Opname
const createSesi = async (req, res) => {
  try {
    const idLokasi = Number(req.body?.id_lokasi);

    // Validasi ID lokasi
    if (!Number.isSafeInteger(idLokasi) || idLokasi <= 0) {
      return res.status(400).json({
        message: "ID lokasi tidak valid.",
      });
    }

    // Validasi pengguna yang sedang login
    const nipPengguna = req.user?.nip;

    if (!nipPengguna) {
      return res.status(401).json({
        message: "Data pengguna yang login tidak valid.",
      });
    }

    const sesi = await stokOpnameService.createSesiStokOpname(
      idLokasi,
      nipPengguna
    );

    return res.status(201).json({
      message: "Sesi Stok Opname berhasil dibuat.",
      data: sesi,
    });
  } catch (error) {
    console.error("Create sesi Stok Opname error:", error);

    if (error.code === "LOKASI_NOT_FOUND") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.code === "LOKASI_HAS_ACTIVE_SESSION") {
      return res.status(409).json({
        message: error.message,
        id_opname: error.idOpname,
      });
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (error.code === "EMPTY_LOCATION") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan saat membuat sesi Stok Opname.",
    });
  }
};

// Mengambil daftar barang dalam sesi Stok Opname
const getBarangSesi = async (req, res) => {
  try {
    const idOpname = Number(req.params.id_opname);

    if (
      !Number.isSafeInteger(idOpname) ||
      idOpname <= 0
    ) {
      return res.status(400).json({
        message: "ID stok opname tidak valid."
      });
    }

    const data = await stokOpnameService.getBarangSesi(
      idOpname
    );

    return res.status(200).json({
      message: "Data barang stok opname berhasil diambil.",
      data
    });

  } catch (error) {
    console.error("Get barang stok opname:", error);

    if (error.code === "SESI_NOT_FOUND") {
      return res.status(404).json({
        message: error.message
      });
    }

    if (error.code === "SESI_SELESAI") {
      return res.status(409).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};

const savePemeriksaan = async (req, res) => {
  try {
    const idDetail = Number(req.params.id_detail);

    if (
      !Number.isSafeInteger(idDetail) ||
      idDetail <= 0
    ) {
      return res.status(400).json({
        message: "ID detail pemeriksaan tidak valid."
      });
    }

    const { jumlah_fisik, catatan } = req.body;

    // Validasi jumlah fisik
    const kondisiValid = [
      "baik",
      "rusak_ringan",
      "rusak_berat",
    ];

    if (
      !jumlah_fisik ||
      typeof jumlah_fisik !== "object" ||
      Array.isArray(jumlah_fisik) ||
      Object.keys(jumlah_fisik).length !== 3 ||
      !kondisiValid.every(kondisi =>
        Number.isSafeInteger(jumlah_fisik[kondisi]) &&
        jumlah_fisik[kondisi] >= 0
      )
    ) {
      return res.status(400).json({
        message: "Jumlah fisik harus berisi angka valid untuk ketiga kondisi."
      });
    }

    // Validasi catatan
    if (
      catatan !== undefined &&
      catatan !== null &&
      (
        typeof catatan !== "string" ||
        catatan.length > 1000
      )
    ) {
      return res.status(400).json({
        message: "Catatan maksimal 1000 karakter."
      });
    }

    const data = await stokOpnameService.saveHasilPemeriksaan(
      idDetail,
      jumlah_fisik,
      catatan?.trim() || null
    );

    return res.status(200).json({
      message: "Hasil pemeriksaan berhasil disimpan.",
      data
    });

  } catch (error) {
    console.error("Save pemeriksaan stok opname:", error);

    if (error.code === "DETAIL_NOT_FOUND") {
      return res.status(404).json({
        message: error.message
      });
    }

    if (error.code === "SESI_NOT_ACTIVE") {
      return res.status(409).json({
        message: error.message
      });
    }

    if (error.code === "INVALID_JUMLAH") {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};


const getRingkasanSesi = async (req, res) => {
  try {
    const idOpname = Number(req.params.id_opname);

    if (
      !Number.isSafeInteger(idOpname) ||
      idOpname <= 0
    ) {
      return res.status(400).json({
        message: "ID stok opname tidak valid."
      });
    }

    const data = await stokOpnameService.getRingkasanSesi(
      idOpname
    );

    return res.status(200).json({
      message: "Ringkasan stok opname berhasil diambil.",
      data
    });

  } catch (error) {
    console.error("Get ringkasan stok opname:", error);

    if (error.code === "SESI_NOT_FOUND") {
      return res.status(404).json({
        message: error.message
      });
    }

    if (error.code === "SESI_SELESAI") {
      return res.status(409).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan pada server."
    });
  }
};


const confirmSesi = async (req, res) => {
  try {
    const idOpname = Number(req.params.id_opname);

    if (
      !Number.isSafeInteger(idOpname) ||
      idOpname <= 0
    ) {
      return res.status(400).json({
        message: "ID stok opname tidak valid."
      });
    }

    const data =
      await stokOpnameService.confirmSesiStokOpname(
        idOpname
      );

    return res.status(200).json({
      message: "Stok opname berhasil dikonfirmasi dan diselesaikan.",
      data
    });

  } catch (error) {
    console.error("Konfirmasi stok opname:", error);

    if (error.code === "SESI_NOT_FOUND") {
      return res.status(404).json({
        message: error.message
      });
    }

    if (
      error.code === "SESI_NOT_ACTIVE" ||
      error.code === "PEMERIKSAAN_BELUM_SELESAI"
    ) {
      return res.status(409).json({
        message: error.message
      });
    }

    if (
      error.code === "DETAIL_KOSONG" ||
      error.code === "HASIL_TIDAK_LENGKAP"
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan saat menyelesaikan stok opname."
    });
  }
};

module.exports = {
  getLokasi,
  createSesi,
  getBarangSesi,
  savePemeriksaan,
  getRingkasanSesi,
  confirmSesi,
};