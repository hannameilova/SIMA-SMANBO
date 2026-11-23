const express = require("express");
const router = express.Router();

const perpindahanAsetController = require("../controllers/perpindahanAset.controller");

router.get("/", perpindahanAsetController.getAllPerpindahanAset);

router.get(
  "/stok/:idBarang",
  perpindahanAsetController.getStokBarangUntukPerpindahan
);

router.get(
  "/:idPerpindahan",
  perpindahanAsetController.getDetailPerpindahanAset
);

router.post("/", perpindahanAsetController.createPerpindahanAset);

module.exports = router;