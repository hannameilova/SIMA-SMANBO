const {
    createPengembalian,
} = require("../services/pengembalian.service");

// Mencatat pengembalian barang
const createPengembalianController = async (req, res) => {
    try {
        // Mengambil identitas petugas dari token login
        const idUser = req.user?.id;

        if (!idUser) {
            return res.status(401).json({
                message: "Identitas pengguna tidak ditemukan.",
            });
        }

        const result = await createPengembalian(
            req.body,
            idUser
        );

        return res.status(201).json({
            message: "Pengembalian berhasil dicatat.",
            data: result,
        });

    } catch (error) {
        console.error("Error createPengembalian:", error);

        return res.status(400).json({
            message: error.message ||
                "Terjadi kesalahan saat mencatat pengembalian.",
        });
    }
};

module.exports = {
    createPengembalianController,
};