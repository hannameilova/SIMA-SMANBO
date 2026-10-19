-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 19 Okt 2026 pada 05.45
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sima_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `barang`
--

CREATE TABLE `barang` (
  `id_barang` int(10) UNSIGNED NOT NULL,
  `kode_barang` varchar(50) NOT NULL,
  `nama_barang` varchar(150) NOT NULL,
  `kategori` enum('habis_pakai','tidak_habis_pakai') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `barang`
--

INSERT INTO `barang` (`id_barang`, `kode_barang`, `nama_barang`, `kategori`, `created_at`, `updated_at`) VALUES
(1, 'BRG-001', 'Kursi Siswa Premium', 'tidak_habis_pakai', '2026-10-17 06:00:53', '2026-10-17 15:41:15'),
(2, 'BRG-002', 'Meja Siswa', 'tidak_habis_pakai', '2026-10-17 06:00:53', '2026-10-17 06:00:53'),
(3, 'BRG-003', 'Pulpen', 'habis_pakai', '2026-10-17 06:00:53', '2026-10-17 06:00:53'),
(4, 'BRG-004', 'Proyektor', 'tidak_habis_pakai', '2026-10-17 06:00:53', '2026-10-17 06:00:53'),
(5, 'BRG-005', 'Kursi Testing', 'tidak_habis_pakai', '2026-10-17 06:13:10', '2026-10-17 06:13:10'),
(6, 'BRG-006', 'Meja Testing', 'tidak_habis_pakai', '2026-10-17 15:20:38', '2026-10-17 15:20:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `lokasi`
--

CREATE TABLE `lokasi` (
  `id` int(10) UNSIGNED NOT NULL,
  `nama_lokasi` varchar(150) NOT NULL,
  `kategori` varchar(255) DEFAULT NULL,
  `kategori_lainnya` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `lokasi`
--

INSERT INTO `lokasi` (`id`, `nama_lokasi`, `kategori`, `kategori_lainnya`, `created_at`, `updated_at`) VALUES
(1, 'Vertical Garden', 'Lainnya', 'Taman', '2026-10-16 12:53:21', '2026-10-18 13:48:47'),
(2, 'Gudang Utama', 'Ruang Penunjang', NULL, '2026-10-16 14:05:45', '2026-10-16 14:07:44'),
(3, 'XII Sains 2', 'Ruang Kelas', NULL, '2026-10-18 13:43:43', '2026-10-18 13:43:57'),
(4, 'Laboratorium IPA', 'Ruang Penunjang', NULL, '2026-10-18 14:07:29', '2026-10-18 14:08:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengadaan_barang`
--

CREATE TABLE `pengadaan_barang` (
  `id_pengadaan` int(10) UNSIGNED NOT NULL,
  `id_barang` int(10) UNSIGNED NOT NULL,
  `tahun_pengadaan` year(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pengadaan_barang`
--

INSERT INTO `pengadaan_barang` (`id_pengadaan`, `id_barang`, `tahun_pengadaan`, `created_at`, `updated_at`) VALUES
(1, 1, '2025', '2026-10-17 06:01:09', '2026-10-17 06:01:09'),
(2, 1, '2026', '2026-10-17 06:01:09', '2026-10-17 06:01:09'),
(3, 2, '2025', '2026-10-17 06:01:09', '2026-10-17 06:01:09'),
(4, 3, '2026', '2026-10-17 06:01:09', '2026-10-17 06:01:09'),
(5, 4, '2024', '2026-10-17 06:01:09', '2026-10-17 06:01:09'),
(6, 5, '2026', '2026-10-17 06:13:10', '2026-10-17 06:13:10'),
(7, 6, '2026', '2026-10-17 15:20:38', '2026-10-17 15:20:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stok_lokasi`
--

CREATE TABLE `stok_lokasi` (
  `id_stok` int(10) UNSIGNED NOT NULL,
  `id_pengadaan` int(10) UNSIGNED NOT NULL,
  `id_lokasi` int(10) UNSIGNED NOT NULL,
  `jumlah` int(10) UNSIGNED NOT NULL,
  `kondisi` enum('baik','rusak_ringan','rusak_berat') NOT NULL DEFAULT 'baik',
  `status_penggunaan` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `stok_lokasi`
--

INSERT INTO `stok_lokasi` (`id_stok`, `id_pengadaan`, `id_lokasi`, `jumlah`, `kondisi`, `status_penggunaan`, `created_at`, `updated_at`) VALUES
(1, 6, 1, 10, 'baik', 'aktif', '2026-10-17 06:13:10', '2026-10-17 15:17:39'),
(2, 7, 1, 15, 'baik', 'aktif', '2026-10-17 15:20:38', '2026-10-17 15:20:38'),
(3, 1, 1, 10, 'baik', 'aktif', '2026-10-17 15:33:57', '2026-10-17 15:33:57'),
(4, 2, 2, 5, 'baik', 'aktif', '2026-10-17 15:33:57', '2026-10-17 16:27:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `nip` varchar(30) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Wakasek Sarpras','Tata Usaha') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `nip`, `nama`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '198001012010011001', 'Daud Suwarno, S.Pd., M.Sn.', '$2b$10$BNRCW8BOWe8//sRlCpu0tOXhz/QXFWLPx17faOd2mbnoYb8vGlsnq', 'Wakasek Sarpras', 1, '2026-10-16 09:39:21', '2026-10-18 14:16:06'),
(3, '198001012010011002', 'Pengguna TU', '$2b$10$LpxES8efTZNGcaAd1aOoi.7BldNKuHMKDaXuM4bM8E25sbAdySci6', 'Tata Usaha', 1, '2026-10-16 10:18:50', '2026-10-18 14:16:06');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`id_barang`),
  ADD UNIQUE KEY `kode_barang` (`kode_barang`);

--
-- Indeks untuk tabel `lokasi`
--
ALTER TABLE `lokasi`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `pengadaan_barang`
--
ALTER TABLE `pengadaan_barang`
  ADD PRIMARY KEY (`id_pengadaan`),
  ADD UNIQUE KEY `uq_barang_tahun` (`id_barang`,`tahun_pengadaan`);

--
-- Indeks untuk tabel `stok_lokasi`
--
ALTER TABLE `stok_lokasi`
  ADD PRIMARY KEY (`id_stok`),
  ADD UNIQUE KEY `uq_stok_kelompok` (`id_pengadaan`,`id_lokasi`,`kondisi`,`status_penggunaan`),
  ADD KEY `fk_stok_lokasi` (`id_lokasi`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `barang`
--
ALTER TABLE `barang`
  MODIFY `id_barang` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `lokasi`
--
ALTER TABLE `lokasi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `pengadaan_barang`
--
ALTER TABLE `pengadaan_barang`
  MODIFY `id_pengadaan` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `stok_lokasi`
--
ALTER TABLE `stok_lokasi`
  MODIFY `id_stok` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `pengadaan_barang`
--
ALTER TABLE `pengadaan_barang`
  ADD CONSTRAINT `fk_pengadaan_barang` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `stok_lokasi`
--
ALTER TABLE `stok_lokasi`
  ADD CONSTRAINT `fk_stok_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stok_pengadaan` FOREIGN KEY (`id_pengadaan`) REFERENCES `pengadaan_barang` (`id_pengadaan`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
