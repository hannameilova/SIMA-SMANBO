
const db = require("../config/database");

// Mengambil seluruh data peminjaman
const getAllPeminjaman = async () => {
    const [rows] = await db.query(`
        SELECT
            p.id_peminjaman,
            p.kode_transaksi,
            p.id_barang,
            p.nama_peminjam,
            p.kategori_peminjam,
            p.kategori_peminjam_lainnya,
            p.nomor_surat,
            p.keperluan,
            p.jumlah_pinjam,
            p.tanggal_pinjam,
            p.batas_pengembalian,
            p.status,
            p.created_at,
            b.nama_barang,
            b.kategori AS kategori_barang,
            l.nama_lokasi AS lokasi_pakai,
            u.nama AS nama_petugas,
            (
                SELECT COALESCE(SUM(s.jumlah), 0)
                FROM stok_lokasi s
                JOIN pengadaan_barang pb
                    ON s.id_pengadaan = pb.id_pengadaan
                WHERE pb.id_barang = p.id_barang
                AND s.status_penggunaan = 'aktif'
            ) AS total_stok,
            (
                SELECT COALESCE(SUM(p2.jumlah_pinjam), 0)
                FROM peminjaman p2
                WHERE p2.id_barang = p.id_barang
                AND p2.status = 'dipinjam'
            ) AS total_dipinjam,
            (
                SELECT COALESCE(SUM(s.jumlah), 0)
                FROM stok_lokasi s
                JOIN pengadaan_barang pb
                    ON s.id_pengadaan = pb.id_pengadaan
                WHERE pb.id_barang = p.id_barang
                AND s.status_penggunaan = 'aktif'
            ) -
            (
                SELECT COALESCE(SUM(p2.jumlah_pinjam), 0)
                FROM peminjaman p2
                WHERE p2.id_barang = p.id_barang
                AND p2.status = 'dipinjam'
            ) AS stok_tersedia,
            CASE
                WHEN p.status = 'dipinjam'
                AND p.batas_pengembalian < NOW()
                THEN 1
                ELSE 0
            END AS terlambat
        FROM peminjaman p
        JOIN barang b
            ON p.id_barang = b.id_barang
        JOIN lokasi l
            ON p.id_lokasi_pakai = l.id
        JOIN users u
            ON p.id_user = u.id
        ORDER BY p.created_at DESC
    `);

    return rows;
};


// Mengambil detail peminjaman berdasarkan ID
const getPeminjamanById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            p.id_peminjaman,
            p.kode_transaksi,
            p.id_barang,
            p.id_user,
            p.id_lokasi_pakai,
            p.nama_peminjam,
            p.kategori_peminjam,
            p.kategori_peminjam_lainnya,
            p.nomor_surat,
            p.keperluan,
            p.jumlah_pinjam,
            p.tanggal_pinjam,
            p.batas_pengembalian,
            p.status,
            p.created_at,
            p.updated_at,
            b.nama_barang,
            b.kategori AS kategori_barang,
            l.nama_lokasi AS lokasi_pakai,
            u.nama AS nama_petugas,
            pg.id_pengembalian,
            pg.tanggal_pengembalian
        FROM peminjaman p
        JOIN barang b
            ON p.id_barang = b.id_barang
        JOIN lokasi l
            ON p.id_lokasi_pakai = l.id
        JOIN users u
            ON p.id_user = u.id
        LEFT JOIN pengembalian pg
            ON p.id_peminjaman = pg.id_peminjaman
        WHERE p.id_peminjaman = ?
    `, [id]);

    return rows[0] || null;
};


// Membuat data peminjaman
const createPeminjaman = async (data, idUser) => {
    const {
        id_barang,
        id_lokasi_pakai,
        nama_peminjam,
        kategori_peminjam,
        kategori_peminjam_lainnya,
        nomor_surat,
        keperluan,
        jumlah_pinjam,
        tanggal_pinjam,
        jam_pinjam,
        batas_pengembalian,
        jam_batas_pengembalian
    } = data;

    // 1. Validasi input
    const idBarang = Number(id_barang);
    const idLokasiPakai = Number(id_lokasi_pakai);
    const jumlah = Number(jumlah_pinjam);
    const idPetugas = Number(idUser);

    if (
        !Number.isInteger(idBarang) || idBarang <= 0 ||
        !Number.isInteger(idLokasiPakai) || idLokasiPakai <= 0 ||
        !Number.isInteger(idPetugas) || idPetugas <= 0
    ) {
        throw new Error("Data barang, lokasi, atau petugas tidak valid.");
    }

    if (
        !nama_peminjam?.trim() ||
        !kategori_peminjam ||
        !keperluan?.trim()
    ) {
        throw new Error("Nama peminjam, kategori, dan keperluan wajib diisi.");
    }

    if (!Number.isInteger(jumlah) || jumlah <= 0) {
        throw new Error("Jumlah barang harus berupa angka bulat lebih dari 0.");
    }

    // 2. Validasi kategori peminjam
    const kategoriValid = ["Guru", "OSIS/MPK", "Lainnya"];

    if (!kategoriValid.includes(kategori_peminjam)) {
        throw new Error("Kategori peminjam tidak valid.");
    }

    if (
        kategori_peminjam === "Lainnya" &&
        !kategori_peminjam_lainnya?.trim()
    ) {
        throw new Error("Kategori peminjam lainnya wajib diisi.");
    }

    if (
        kategori_peminjam !== "Guru" &&
        !nomor_surat?.trim()
    ) {
        throw new Error("Nomor surat pengajuan wajib diisi.");
    }

    // 3. Validasi tanggal dan jam
    const formatTanggal = (value, namaField) => {
        const tanggal = String(value || "").trim();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
            throw new Error(
                `${namaField} harus menggunakan format YYYY-MM-DD.`
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
            throw new Error(`${namaField} tidak valid.`);
        }

        return tanggal;
    };

    const formatJam = (value, namaField) => {
        const jam = String(value || "").trim();

        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(jam)) {
            throw new Error(
                `${namaField} harus menggunakan format HH:mm.`
            );
        }

        return `${jam}:00`;
    };

    const tanggalPinjam =
        `${formatTanggal(tanggal_pinjam, "Tanggal pinjam")} ` +
        `${formatJam(jam_pinjam, "Jam pinjam")}`;

    const batasPengembalian =
        `${formatTanggal(batas_pengembalian, "Tanggal pengembalian")} ` +
        `${formatJam(jam_batas_pengembalian, "Jam pengembalian")}`;

    if (batasPengembalian <= tanggalPinjam) {
        throw new Error(
            "Waktu pengembalian harus setelah waktu peminjaman."
        );
    }

    // 4. Memulai transaksi database
    const connection = await db.getConnection();

    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [stokRows] = await connection.query(`
            SELECT
                s.id_stok,
                s.jumlah
            FROM stok_lokasi s
            JOIN pengadaan_barang pb
                ON s.id_pengadaan = pb.id_pengadaan
            WHERE pb.id_barang = ?
            AND s.status_penggunaan = 'aktif'
            FOR UPDATE
        `, [idBarang]);

        const totalStok = stokRows.reduce(
            (total, stok) => total + Number(stok.jumlah),
            0
        );

        const [pinjamanRows] = await connection.query(`
            SELECT
                COALESCE(SUM(jumlah_pinjam), 0) AS total_dipinjam
            FROM peminjaman
            WHERE id_barang = ?
            AND status = 'dipinjam'
        `, [idBarang]);

        const totalDipinjam = Number(
            pinjamanRows[0].total_dipinjam
        );

        const stokTersedia = totalStok - totalDipinjam;

        if (jumlah > stokTersedia) {
            throw new Error(
                `Stok tidak mencukupi. Stok tersedia hanya ${stokTersedia} unit.`
            );
        }

        // 5. Membuat kode transaksi
        const tahun = tanggal_pinjam.substring(0, 4);
        const kodeTransaksi = `PJM-${tahun}-${Date.now()}`;

        // 6. Menyimpan data peminjaman
        const [result] = await connection.query(`
            INSERT INTO peminjaman (
                kode_transaksi,
                id_barang,
                id_user,
                id_lokasi_pakai,
                nama_peminjam,
                kategori_peminjam,
                kategori_peminjam_lainnya,
                nomor_surat,
                keperluan,
                jumlah_pinjam,
                tanggal_pinjam,
                batas_pengembalian
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            kodeTransaksi,
            idBarang,
            idPetugas,
            idLokasiPakai,
            nama_peminjam.trim(),
            kategori_peminjam,
            kategori_peminjam === "Lainnya"
                ? kategori_peminjam_lainnya.trim()
                : null,
            kategori_peminjam === "Guru"
                ? null
                : nomor_surat.trim(),
            keperluan.trim(),
            jumlah,
            tanggalPinjam,
            batasPengembalian
        ]);

        await connection.commit();
        transactionStarted = false;

        return {
            id_peminjaman: result.insertId,
            kode_transaksi: kodeTransaksi,
            message: "Peminjaman berhasil dicatat."
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
    getAllPeminjaman,
    getPeminjamanById,
    createPeminjaman,
};