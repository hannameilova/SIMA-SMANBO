const {
    getAllPeminjaman,
    getPeminjamanById,
    createPeminjaman
} = require("../services/peminjaman.service");

// ==========================================
// GET: Mengambil seluruh data peminjaman
// ==========================================

const getAllPeminjamanController = async (req, res) => {
    try {
        const data = await getAllPeminjaman();

        return res.status(200).json({
            message: "Data peminjaman berhasil diambil.",
            data: data
        });

    } catch (error) {
        console.error("Error getAllPeminjaman:", error.message);

        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data peminjaman."
        });
    }
};


// ==========================================
// GET: Mengambil detail peminjaman berdasarkan ID
// ==========================================

const getPeminjamanByIdController = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validasi ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID peminjaman tidak valid."
            });
        }

        const data = await getPeminjamanById(id);

        // Memeriksa apakah data ditemukan
        if (!data) {
            return res.status(404).json({
                message: "Data peminjaman tidak ditemukan."
            });
        }

        return res.status(200).json({
            message: "Detail peminjaman berhasil diambil.",
            data: data
        });

    } catch (error) {
        console.error("Error getPeminjamanById:", error.message);

        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail peminjaman."
        });
    }
};


// ==========================================
// POST: Mencatat peminjaman baru
// ==========================================

const createPeminjamanController = async (req, res) => {
    try {
        // Mengambil ID petugas dari token login
        const idUser = req.user?.id;

        if (!idUser) {
            return res.status(401).json({
                message: "Identitas pengguna tidak ditemukan."
            });
        }

        // Memanggil service untuk menyimpan peminjaman
        const result = await createPeminjaman(
            req.body,
            idUser
        );

        return res.status(201).json({
            message: "Peminjaman berhasil dicatat.",
            data: result
        });

    } catch (error) {
        console.error("Error createPeminjaman:", error);

        // Error validasi dari service
        // Error database memiliki error.code
        const statusCode = error.code ? 500 : 400;

        return res.status(statusCode).json({
            message: statusCode === 400
                ? error.message
                : "Terjadi kesalahan saat mencatat peminjaman."
        });
    }
};


module.exports = {
    getAllPeminjamanController,
    getPeminjamanByIdController,
    createPeminjamanController
};