const express = require("express");

const stokOpnameController = require("../controllers/stokOpname.controller");

const router = express.Router();

router.get("/lokasi", stokOpnameController.getLokasi);

router.post("/sesi", stokOpnameController.createSesi);

router.get("/sesi/:id_opname/barang", stokOpnameController.getBarangSesi);

router.put("/detail/:id_detail", stokOpnameController.savePemeriksaan);

router.get("/sesi/:id_opname/ringkasan", stokOpnameController.getRingkasanSesi);

router.post("/sesi/:id_opname/konfirmasi", stokOpnameController.confirmSesi);

module.exports = router;