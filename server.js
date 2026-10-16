require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const lokasiRoutes = require("./routes/lokasi.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/lokasi", lokasiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend SIMA berhasil berjalan!",
  });
});

app.get("/test-db", async (req, res) => {
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