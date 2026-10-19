const express = require("express");
const asetController = require("../controllers/aset.controller");

const router = express.Router();

// Menampilkan daftar aset
router.get("/", asetController.getAllAset);

// Menampilkan daftar lokasi untuk filter
router.get("/filter/lokasi", asetController.getAllLokasi);

// Menampilkan daftar kategori untuk filter
router.get("/filter/kategori", asetController.getAllKategori);

// Menampilkan summary aset
router.get("/summary", asetController.getSummaryAset);

// Menampilkan detail aset
router.get("/:id", asetController.getAsetById);

// Menambahkan aset
router.post("/", asetController.createAset);

// Mengedit nama dan kategori aset
router.patch("/:id", asetController.updateAset);

module.exports = router;