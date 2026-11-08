const express = require("express");
const lokasiController = require("../controllers/lokasi.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/", authenticate, lokasiController.getAllLokasi);

router.post("/", authenticate, lokasiController.createLokasi);

router.put("/:id", authenticate, lokasiController.updateLokasi);

router.delete(
  "/:id",
  authenticate,
  authorize("Wakasek Sarpras"),
  lokasiController.deleteLokasi
);

module.exports = router;