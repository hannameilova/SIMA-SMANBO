const express = require("express");
const asetController = require("../controllers/aset.controller");

const router = express.Router();

// Menampilkan daftar aset
router.get("/", asetController.getAllAset);

// Menampilkan detail aset
router.get("/:id", asetController.getAsetById);

// Menambahkan aset
router.post("/", asetController.createAset);

// Mengedit nama dan kategori aset
router.patch("/:id", asetController.updateAset);

module.exports = router;