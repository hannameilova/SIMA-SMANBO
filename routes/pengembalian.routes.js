const express = require("express");
const router = express.Router();

const {
    createPengembalianController,
} = require("../controllers/pengembalian.controller");

// Mencatat pengembalian barang
router.post("/", createPengembalianController);

module.exports = router;