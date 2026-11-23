
const perpindahanAsetService = require("../services/perpindahanAset.service");

// Mengambil rincian stok barang berdasarkan lokasi asal
const getStokBarangUntukPerpindahan = async (req, res) => {
  try {
    const idBarang = Number(req.params.idBarang);
    const idLokasiAsal = Number(req.query.id_lokasi_asal);

    if (!Number.isSafeInteger(idBarang) || idBarang <= 0) {
      return res.status(400).json({
        message: "ID barang tidak valid.",
      });
    }

    if (
      !Number.isSafeInteger(idLokasiAsal) ||
      idLokasiAsal <= 0
    ) {
      return res.status(400).json({
        message: "ID lokasi asal tidak valid.",
      });
    }

    const stok =
      await perpindahanAsetService.getStokBarangUntukPerpindahan(
        idBarang,
        idLokasiAsal
      );

    return res.status(200).json({
      message: "Rincian stok barang berhasil diambil.",
      data: stok,
    });
  } catch (error) {
    console.error("Get stok perpindahan aset error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};


// Menyimpan transaksi perpindahan aset
const createPerpindahanAset = async (req, res) => {
  try {
    const {
      id_barang,
      tanggal_perpindahan,
      id_lokasi_asal,
      id_lokasi_tujuan,
      rincian_stok,
      alasan,
      keterangan,
      tandai_tidak_layak,
    } = req.body;

    // ID barang
    const idBarang = Number(id_barang);

    if (!Number.isSafeInteger(idBarang) || idBarang <= 0) {
      return res.status(400).json({
        message: "ID barang tidak valid.",
      });
    }

    // ID lokasi asal dan tujuan
    const idLokasiAsal = Number(id_lokasi_asal);
    const idLokasiTujuan = Number(id_lokasi_tujuan);

    if (
      !Number.isSafeInteger(idLokasiAsal) ||
      idLokasiAsal <= 0
    ) {
      return res.status(400).json({
        message: "Lokasi asal tidak valid.",
      });
    }

    if (
      !Number.isSafeInteger(idLokasiTujuan) ||
      idLokasiTujuan <= 0
    ) {
      return res.status(400).json({
        message: "Lokasi tujuan tidak valid.",
      });
    }

    // Tanggal perpindahan
    if (
      typeof tanggal_perpindahan !== "string" ||
      !tanggal_perpindahan.trim()
    ) {
      return res.status(400).json({
        message: "Tanggal perpindahan wajib diisi.",
      });
    }

    // Rincian stok
    if (!Array.isArray(rincian_stok) || rincian_stok.length === 0) {
      return res.status(400).json({
        message: "Rincian stok yang dipindahkan wajib diisi.",
      });
    }

    // Validasi format alasan
    const alasanValid = [
      "kebutuhan_kelas",
      "penataan_ulang_ruangan",
      "perbaikan",
      "dipindah_ke_gudang",
      "lainnya",
    ];

    if (!alasanValid.includes(alasan)) {
      return res.status(400).json({
        message: "Alasan perpindahan tidak valid.",
      });
    }

    // ID pengguna diambil dari token autentikasi
    const idUser = Number(req.user.id);

    // Panggil service untuk memproses transaksi
    const result =
      await perpindahanAsetService.createPerpindahanAset({
        idBarang,
        tanggalPerpindahan: tanggal_perpindahan,
        idLokasiAsal,
        idLokasiTujuan,
        rincianStok: rincian_stok,
        alasan,
        keterangan,
        tandaiTidakLayak: tandai_tidak_layak,
        idUser,
      });

    return res.status(201).json({
      message: "Perpindahan aset berhasil disimpan.",
      data: result,
    });

  } catch (error) {
    console.error("Create perpindahan aset error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Terjadi kesalahan saat menyimpan perpindahan aset.",
    });
  }
};


// Mengambil seluruh riwayat perpindahan aset
const getAllPerpindahanAset = async (req, res) => {
  try {
    const riwayat =
      await perpindahanAsetService.getAllPerpindahanAset();

    return res.status(200).json({
      message: "Riwayat perpindahan aset berhasil diambil.",
      data: riwayat,
    });

  } catch (error) {
    console.error("Get riwayat perpindahan aset error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

// Mengambil detail satu transaksi perpindahan aset
const getDetailPerpindahanAset = async (req, res) => {
  try {
    const idPerpindahan = Number(req.params.idPerpindahan);

    if (
      !Number.isInteger(idPerpindahan) ||
      idPerpindahan <= 0
    ) {
      return res.status(400).json({
        message: "ID perpindahan tidak valid.",
      });
    }

    const detail =
      await perpindahanAsetService.getDetailPerpindahanAset(
        idPerpindahan
      );

    if (!detail) {
      return res.status(404).json({
        message: "Riwayat perpindahan aset tidak ditemukan.",
      });
    }

    return res.status(200).json({
      message: "Detail perpindahan aset berhasil diambil.",
      data: detail,
    });
  } catch (error) {
    console.error("Get detail perpindahan aset error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
};

module.exports = {
  getStokBarangUntukPerpindahan,
  createPerpindahanAset,
  getAllPerpindahanAset,
  getDetailPerpindahanAset,
};