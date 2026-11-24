
const db = require("../config/database");

// Mencatat pengembalian barang
const createPengembalian = async (data, idUser) => {
    const {
        id_peminjaman,
        tanggal_pengembalian,
        jam_pengembalian
    } = data;

    // 1. Validasi input
    const idPeminjaman = Number(id_peminjaman);
    const idPetugas = Number(idUser);

    if (
        !Number.isInteger(idPeminjaman) ||
        idPeminjaman <= 0 ||
        !Number.isInteger(idPetugas) ||
        idPetugas <= 0
    ) {
        throw new Error("Data peminjaman atau petugas tidak valid.");
    }

    // 2. Validasi tanggal dan jam
    const tanggal = String(tanggal_pengembalian || "").trim();
    const jam = String(jam_pengembalian || "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
        throw new Error(
            "Tanggal pengembalian harus menggunakan format YYYY-MM-DD."
        );
    }

    const [tahun, bulan, hari] = tanggal.split("-").map(Number);

    const tanggalValid = new Date(
        Date.UTC(tahun, bulan - 1, hari)
    );

    if (
        tanggalValid.getUTCFullYear() !== tahun ||
        tanggalValid.getUTCMonth() !== bulan - 1 ||
        tanggalValid.getUTCDate() !== hari
    ) {
        throw new Error("Tanggal pengembalian tidak valid.");
    }

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(jam)) {
        throw new Error(
            "Jam pengembalian harus menggunakan format HH:mm."
        );
    }

    const tanggalPengembalian = `${tanggal} ${jam}:00`;

    // 3. Memulai transaksi database
    const connection = await db.getConnection();

    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [peminjamanRows] = await connection.query(`
            SELECT
                id_peminjaman,
                status,
                DATE_FORMAT(
                    tanggal_pinjam,
                    '%Y-%m-%d %H:%i:%s'
                ) AS tanggal_pinjam
            FROM peminjaman
            WHERE id_peminjaman = ?
            FOR UPDATE
        `, [idPeminjaman]);

        if (peminjamanRows.length === 0) {
            throw new Error("Data peminjaman tidak ditemukan.");
        }

        const peminjaman = peminjamanRows[0];

        if (peminjaman.status !== "dipinjam") {
            throw new Error(
                "Peminjaman ini sudah dikembalikan sebelumnya."
            );
        }

        if (tanggalPengembalian <= peminjaman.tanggal_pinjam) {
            throw new Error(
                "Waktu pengembalian harus setelah waktu peminjaman."
            );
        }

        // 4. Menyimpan data pengembalian
        const [result] = await connection.query(`
            INSERT INTO pengembalian (
                id_peminjaman,
                id_user,
                tanggal_pengembalian
            )
            VALUES (?, ?, ?)
        `, [
            idPeminjaman,
            idPetugas,
            tanggalPengembalian
        ]);

        // 5. Memperbarui status peminjaman
        await connection.query(`
            UPDATE peminjaman
            SET status = 'dikembalikan'
            WHERE id_peminjaman = ?
            AND status = 'dipinjam'
        `, [idPeminjaman]);

        await connection.commit();
        transactionStarted = false;

        return {
            id_pengembalian: result.insertId,
            id_peminjaman: idPeminjaman,
            tanggal_pengembalian: tanggalPengembalian,
            message: "Pengembalian berhasil dicatat."
        };

    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }

        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createPengembalian,
};