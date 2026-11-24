const express = require("express");

const router = express.Router();

const {
    getAllPeminjamanController,
    getPeminjamanByIdController,
    createPeminjamanController
} = require("../controllers/peminjaman.controller");

// GET: Mengambil seluruh data peminjaman
router.get("/", getAllPeminjamanController);

// GET: Mengambil detail peminjaman berdasarkan ID
router.get("/:id", getPeminjamanByIdController);

// POST: Mencatat peminjaman baru
router.post("/", createPeminjamanController);

module.exports = router;