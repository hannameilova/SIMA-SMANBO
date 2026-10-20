require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/database");

const authRoutes = require("./routes/auth.routes");
const lokasiRoutes = require("./routes/lokasi.routes");
const asetRoutes = require("./routes/aset.routes");

const { authenticate } = require("./middlewares/auth.middleware");
const { authorize } = require("./middlewares/role.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Autentikasi
app.use("/auth", authRoutes);

// Data lokasi hanya untuk Sarpras
app.use(
  "/lokasi",
  authenticate,
  authorize("Wakasek Sarpras"),
  lokasiRoutes
);

// Master aset hanya untuk Sarpras,
// kecuali summary yang boleh dibaca TU untuk Dashboard.
const authorizeAset = (req, res, next) => {
  if (req.user.role === "Wakasek Sarpras") {
    return next();
  }

  const isSummaryDashboard =
    req.user.role === "Tata Usaha" &&
    req.method === "GET" &&
    req.originalUrl.split("?")[0] === "/aset/summary";

  if (isSummaryDashboard) {
    return next();
  }

  return res.status(403).json({
    message: "Anda tidak memiliki akses ke modul Master Inventaris.",
  });
};

app.use(
  "/aset",
  authenticate,
  authorizeAset,
  asetRoutes
);

app.get("/", (req, res) => {
  res.json({
    message: "Backend SIMA berhasil berjalan!",
  });
});

app.get(
  "/test-db",
  authenticate,
  authorize("Wakasek Sarpras"),
  async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS hasil");

    res.json({
      message: "Database berhasil terhubung!",
      data: rows,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      message: "Database gagal terhubung.",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});