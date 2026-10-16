const express = require("express");
const lokasiController = require("../controllers/lokasi.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, lokasiController.getAllLokasi);

router.post("/", authenticate, lokasiController.createLokasi);

router.put("/:id", authenticate, lokasiController.updateLokasi);

module.exports = router;