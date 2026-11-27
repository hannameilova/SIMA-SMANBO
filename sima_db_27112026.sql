-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 27, 2026 at 05:52 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.37

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
-- Table structure for table `barang`
--

CREATE TABLE `barang` (
  `id_barang` int UNSIGNED NOT NULL,
  `kode_barang` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_barang` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` enum('habis_pakai','tidak_habis_pakai') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`id_barang`, `kode_barang`, `nama_barang`, `kategori`, `created_at`, `updated_at`) VALUES
(15, 'BRG-003', 'Printer Epson L120', 'habis_pakai', '2026-10-20 04:20:08', '2026-10-20 04:20:08'),
(16, 'BRG-004', 'Papan Tulis', 'tidak_habis_pakai', '2026-10-27 07:44:35', '2026-10-27 07:44:35'),
(17, 'BRG-005', 'Sapu Lidi', 'habis_pakai', '2026-11-25 08:24:18', '2026-11-25 08:24:18'),
(18, 'BRG-006', 'Foto Presiden', 'tidak_habis_pakai', '2026-11-25 08:26:17', '2026-11-25 08:26:17'),
(19, 'BRG-007', 'Sapu Ijuk', 'habis_pakai', '2026-11-26 13:54:49', '2026-11-26 13:54:49'),
(20, 'BRG-008', 'Proyektor', 'habis_pakai', '2026-11-26 18:25:03', '2026-11-26 18:25:03');

-- --------------------------------------------------------

--
-- Table structure for table `lokasi`
--

CREATE TABLE `lokasi` (
  `id` int UNSIGNED NOT NULL,
  `nama_lokasi` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori_lainnya` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lokasi`
--

INSERT INTO `lokasi` (`id`, `nama_lokasi`, `kategori`, `kategori_lainnya`, `created_at`, `updated_at`) VALUES
(7, 'Laboratorium IPA', 'Ruang Penunjang', NULL, '2026-10-20 03:59:03', '2026-10-20 03:59:03'),
(8, 'XII Sains-2', 'Ruang Kelas', NULL, '2026-10-20 04:17:09', '2026-10-20 04:17:09'),
(9, 'XII Soshum-9', 'Ruang Kelas', NULL, '2026-10-20 04:23:25', '2026-10-20 04:23:25'),
(10, 'XII Sains 2', 'Ruang Kelas', NULL, '2026-10-27 07:08:00', '2026-10-27 07:08:00'),
(11, 'XII Ips 1', 'Ruang Kelas', NULL, '2026-10-27 07:44:01', '2026-10-27 07:44:01'),
(13, 'Gudang', 'Ruang Penunjang', NULL, '2026-11-23 09:49:17', '2026-11-23 09:49:17'),
(14, 'Ruang Guru', 'Ruang Administrasi', NULL, '2026-11-25 08:22:16', '2026-11-25 08:22:16'),
(15, 'Vertical Garden', 'Lainnya', 'Taman', '2026-11-25 08:23:22', '2026-11-25 08:23:22'),
(16, 'X Ipa 1', 'Ruang Kelas', NULL, '2026-11-25 08:25:46', '2026-11-25 08:25:46'),
(17, 'Ruang Tu', 'Ruang Administrasi', NULL, '2026-11-25 14:03:11', '2026-11-25 14:03:11');

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
--

CREATE TABLE `peminjaman` (
  `id_peminjaman` int UNSIGNED NOT NULL,
  `kode_transaksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_barang` int UNSIGNED NOT NULL,
  `id_user` int UNSIGNED NOT NULL,
  `id_lokasi_pakai` int UNSIGNED NOT NULL,
  `nama_peminjam` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori_peminjam` enum('Guru','OSIS/MPK','Lainnya') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori_peminjam_lainnya` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_surat` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keperluan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_pinjam` int UNSIGNED NOT NULL,
  `tanggal_pinjam` datetime NOT NULL,
  `batas_pengembalian` datetime NOT NULL,
  `status` enum('dipinjam','dikembalikan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dipinjam',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `peminjaman`
--

INSERT INTO `peminjaman` (`id_peminjaman`, `kode_transaksi`, `id_barang`, `id_user`, `id_lokasi_pakai`, `nama_peminjam`, `kategori_peminjam`, `kategori_peminjam_lainnya`, `nomor_surat`, `keperluan`, `jumlah_pinjam`, `tanggal_pinjam`, `batas_pengembalian`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PJM-2026-1795505339655', 16, 1, 7, 'Budi Santoso', 'Guru', NULL, NULL, 'Peminjaman untuk kegiatan pembelajaran', 1, '2026-11-24 00:00:00', '2026-11-25 00:00:00', 'dikembalikan', '2026-11-24 07:28:59', '2026-11-24 07:36:25'),
(2, 'PJM-2026-1795517890542', 16, 3, 7, 'Budi Santoso', 'Guru', NULL, NULL, 'Peminjaman untuk kegiatan pembelajaran', 1, '2026-11-25 10:00:00', '2026-11-25 11:30:00', 'dikembalikan', '2026-11-24 10:58:10', '2026-11-24 10:59:15'),
(3, 'PJM-2026-1795518092996', 16, 3, 7, 'Budi Santoso', 'Guru', NULL, NULL, 'Pengujian validasi waktu pengembalian', 1, '2026-11-26 10:00:00', '2026-11-26 11:30:00', 'dikembalikan', '2026-11-24 11:01:32', '2026-11-24 11:02:01'),
(4, 'PJM-2026-1795518241364', 16, 3, 7, 'Budi Santoso', 'Guru', NULL, NULL, 'Pengujian validasi waktu pengembalian', 1, '2026-11-27 10:00:00', '2026-11-27 11:30:00', 'dikembalikan', '2026-11-24 11:04:01', '2026-11-24 11:04:32'),
(5, 'PJM-2026-1795518337395', 16, 3, 7, 'Budi Santoso', 'Guru', NULL, NULL, 'Pengujian validasi waktu pengembalian', 1, '2026-11-27 10:00:00', '2026-11-27 11:30:00', 'dikembalikan', '2026-11-24 11:05:37', '2026-11-24 11:07:31'),
(6, 'PJM-2026-1795518646042', 16, 3, 7, 'Budi Santoso', 'Guru', NULL, NULL, 'Pengujian perhitungan stok aktif', 1, '2026-11-28 10:00:00', '2026-11-28 11:30:00', 'dikembalikan', '2026-11-24 11:10:46', '2026-11-24 11:16:56'),
(7, 'PJM-2026-1795518811279', 16, 3, 7, 'Pihak Eksternal', 'Lainnya', 'Komite Sekolah', '001/EXT/2026', 'Pengujian kategori peminjam lainnya', 1, '2026-11-30 10:00:00', '2026-11-30 11:30:00', 'dipinjam', '2026-11-24 11:13:31', '2026-11-24 11:13:31'),
(8, 'PJM-2026-1795519042655', 16, 3, 7, 'Pengurus OSIS', 'OSIS/MPK', NULL, '002/OSIS/2026', 'Peminjaman untuk kegiatan OSIS', 1, '2026-12-01 10:00:00', '2026-12-01 11:30:00', 'dikembalikan', '2026-11-24 11:17:22', '2026-11-26 17:46:45'),
(9, 'PJM-2026-1795717610389', 20, 1, 16, 'Budi', 'Guru', NULL, NULL, 'Pelajaran Biologi', 1, '2026-11-27 10:00:00', '2026-11-27 23:59:59', 'dikembalikan', '2026-11-26 18:26:50', '2026-11-26 18:30:30');

-- --------------------------------------------------------

--
-- Table structure for table `pengadaan_barang`
--

CREATE TABLE `pengadaan_barang` (
  `id_pengadaan` int UNSIGNED NOT NULL,
  `id_barang` int UNSIGNED NOT NULL,
  `tahun_pengadaan` year NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pengadaan_barang`
--

INSERT INTO `pengadaan_barang` (`id_pengadaan`, `id_barang`, `tahun_pengadaan`, `created_at`, `updated_at`) VALUES
(18, 15, '2000', '2026-10-20 04:20:08', '2026-10-20 04:20:08'),
(19, 15, '2026', '2026-10-20 04:25:19', '2026-10-20 04:25:19'),
(20, 16, '2026', '2026-10-27 07:44:35', '2026-10-27 07:44:35'),
(21, 17, '2026', '2026-11-25 08:24:18', '2026-11-25 08:24:18'),
(22, 18, '2022', '2026-11-25 08:26:17', '2026-11-25 08:26:17'),
(23, 19, '2026', '2026-11-26 13:54:49', '2026-11-26 13:54:49'),
(24, 20, '2026', '2026-11-26 18:25:03', '2026-11-26 18:25:03');

-- --------------------------------------------------------

--
-- Table structure for table `pengembalian`
--

CREATE TABLE `pengembalian` (
  `id_pengembalian` int UNSIGNED NOT NULL,
  `id_peminjaman` int UNSIGNED NOT NULL,
  `id_user` int UNSIGNED NOT NULL,
  `tanggal_pengembalian` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pengembalian`
--

INSERT INTO `pengembalian` (`id_pengembalian`, `id_peminjaman`, `id_user`, `tanggal_pengembalian`, `created_at`) VALUES
(1, 1, 1, '2026-11-24 00:00:00', '2026-11-24 07:36:25'),
(2, 2, 3, '2026-11-25 11:00:00', '2026-11-24 10:59:15'),
(3, 3, 3, '2026-11-26 10:00:00', '2026-11-24 11:02:01'),
(4, 4, 3, '2026-11-27 10:00:00', '2026-11-24 11:04:32'),
(5, 5, 3, '2026-11-27 10:01:00', '2026-11-24 11:07:31'),
(6, 6, 3, '2026-11-30 12:00:00', '2026-11-24 11:16:56'),
(7, 8, 1, '2026-12-02 13:46:00', '2026-11-26 17:46:45'),
(8, 9, 1, '2026-11-27 12:00:00', '2026-11-26 18:30:30');

-- --------------------------------------------------------

--
-- Table structure for table `penghapusan_data`
--

CREATE TABLE `penghapusan_data` (
  `id_penghapusan` bigint UNSIGNED NOT NULL,
  `jenis_data` enum('aset','lokasi') COLLATE utf8mb4_general_ci NOT NULL,
  `id_data_asal` bigint UNSIGNED NOT NULL,
  `kode_data` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nama_data` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `alasan` enum('data_duplikat','kesalahan_input','lainnya') COLLATE utf8mb4_general_ci NOT NULL,
  `keterangan` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nip_penghapus` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_penghapus` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `waktu_penghapusan` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penghapusan_data`
--

INSERT INTO `penghapusan_data` (`id_penghapusan`, `jenis_data`, `id_data_asal`, `kode_data`, `nama_data`, `alasan`, `keterangan`, `nip_penghapus`, `nama_penghapus`, `waktu_penghapusan`) VALUES
(1, 'aset', 14, 'BRG-002', 'Proyektor Epson Eb-X600', 'kesalahan_input', 'Data aset salah dimasukkan.', '121', 'Daud Suwarno, S.Pd., M.Sn.', '2026-11-08 17:13:50'),
(2, 'lokasi', 12, NULL, 'X Soshum 1', 'kesalahan_input', 'Lokasi salah dimasukkan.', '121', 'Daud Suwarno, S.Pd., M.Sn.', '2026-11-08 17:48:02'),
(3, 'aset', 13, 'BRG-001', 'Proyektor', 'kesalahan_input', NULL, '121', 'Daud Suwarno, S.Pd., M.Sn.', '2026-11-08 20:00:14');

-- --------------------------------------------------------

--
-- Table structure for table `perpindahan_aset`
--

CREATE TABLE `perpindahan_aset` (
  `id_perpindahan` bigint UNSIGNED NOT NULL,
  `nomor_mutasi` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_barang` int UNSIGNED NOT NULL,
  `tanggal_perpindahan` datetime NOT NULL,
  `id_lokasi_asal` int UNSIGNED NOT NULL,
  `id_lokasi_tujuan` int UNSIGNED NOT NULL,
  `jumlah_dipindahkan` int UNSIGNED NOT NULL,
  `jumlah_asal_sebelum` int UNSIGNED NOT NULL,
  `jumlah_asal_sesudah` int UNSIGNED NOT NULL,
  `jumlah_tujuan_sebelum` int UNSIGNED NOT NULL,
  `jumlah_tujuan_sesudah` int UNSIGNED NOT NULL,
  `alasan` enum('kebutuhan_kelas','penataan_ulang_ruangan','perbaikan','dipindah_ke_gudang','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL,
  `keterangan` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tandai_tidak_layak` tinyint(1) NOT NULL DEFAULT '0',
  `id_user` int UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `perpindahan_aset`
--

INSERT INTO `perpindahan_aset` (`id_perpindahan`, `nomor_mutasi`, `id_barang`, `tanggal_perpindahan`, `id_lokasi_asal`, `id_lokasi_tujuan`, `jumlah_dipindahkan`, `jumlah_asal_sebelum`, `jumlah_asal_sesudah`, `jumlah_tujuan_sebelum`, `jumlah_tujuan_sesudah`, `alasan`, `keterangan`, `tandai_tidak_layak`, `id_user`, `created_at`) VALUES
(1, 'MUT-20261123-F1B51B28', 15, '2026-11-23 00:00:00', 9, 7, 1, 3, 2, 0, 1, 'kebutuhan_kelas', 'Pengujian perpindahan aset', 0, 1, '2026-11-23 09:38:13'),
(2, 'MUT-20261123-6FCFA503', 15, '2026-11-23 00:00:00', 9, 7, 1, 2, 1, 1, 2, 'kebutuhan_kelas', 'Pengujian penambahan ke stok tujuan yang sudah ada', 0, 1, '2026-11-23 09:40:46'),
(3, 'MUT-20261123-877845A0', 15, '2026-11-23 00:00:00', 7, 13, 1, 2, 1, 0, 1, 'dipindah_ke_gudang', 'Pengujian perpindahan aset ke gudang', 1, 1, '2026-11-23 09:55:16'),
(4, 'MUT-20261123-C0FA5049', 15, '2026-11-23 00:00:00', 7, 13, 1, 1, 0, 1, 2, 'dipindah_ke_gudang', 'Pengujian perpindahan tanpa menandai unit tidak layak', 0, 1, '2026-11-23 09:57:20'),
(5, 'MUT-20261125-C1DE79D2', 16, '2026-11-25 00:00:00', 11, 13, 1, 1, 0, 0, 1, 'kebutuhan_kelas', NULL, 0, 1, '2026-11-25 16:13:20'),
(6, 'MUT-20261126-437A9D74', 18, '2026-11-26 00:00:00', 16, 11, 1, 1, 0, 0, 1, 'kebutuhan_kelas', NULL, 0, 1, '2026-11-26 15:54:13');

-- --------------------------------------------------------

--
-- Table structure for table `perpindahan_aset_detail`
--

CREATE TABLE `perpindahan_aset_detail` (
  `id_detail` bigint UNSIGNED NOT NULL,
  `id_perpindahan` bigint UNSIGNED NOT NULL,
  `id_stok_asal` int UNSIGNED NOT NULL,
  `id_stok_tujuan` int UNSIGNED NOT NULL,
  `jumlah_dipindahkan` int UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `perpindahan_aset_detail`
--

INSERT INTO `perpindahan_aset_detail` (`id_detail`, `id_perpindahan`, `id_stok_asal`, `id_stok_tujuan`, `jumlah_dipindahkan`, `created_at`) VALUES
(1, 1, 17, 23, 1, '2026-11-23 09:38:13'),
(2, 2, 17, 23, 1, '2026-11-23 09:40:46'),
(3, 3, 23, 25, 1, '2026-11-23 09:55:16'),
(4, 4, 23, 26, 1, '2026-11-23 09:57:20'),
(5, 5, 18, 36, 1, '2026-11-25 16:13:21'),
(6, 6, 30, 38, 1, '2026-11-26 15:54:13');

-- --------------------------------------------------------

--
-- Table structure for table `stok_lokasi`
--

CREATE TABLE `stok_lokasi` (
  `id_stok` int UNSIGNED NOT NULL,
  `id_pengadaan` int UNSIGNED NOT NULL,
  `id_lokasi` int UNSIGNED NOT NULL,
  `jumlah` int UNSIGNED NOT NULL,
  `kondisi` enum('baik','rusak_ringan','rusak_berat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'baik',
  `status_penggunaan` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stok_lokasi`
--

INSERT INTO `stok_lokasi` (`id_stok`, `id_pengadaan`, `id_lokasi`, `jumlah`, `kondisi`, `status_penggunaan`, `created_at`, `updated_at`) VALUES
(16, 18, 8, 0, 'baik', 'aktif', '2026-10-20 04:20:08', '2026-11-21 12:17:38'),
(17, 19, 9, 0, 'baik', 'aktif', '2026-10-20 04:25:19', '2026-11-23 09:40:46'),
(18, 20, 11, 0, 'baik', 'aktif', '2026-10-27 07:44:35', '2026-11-25 16:13:21'),
(19, 20, 10, 0, 'baik', 'aktif', '2026-10-27 07:45:30', '2026-11-24 17:55:28'),
(20, 18, 8, 0, 'rusak_ringan', 'aktif', '2026-11-08 17:48:31', '2026-11-21 12:17:38'),
(21, 18, 8, 0, 'rusak_berat', 'aktif', '2026-11-21 12:12:51', '2026-11-21 12:17:38'),
(22, 19, 9, 1, 'rusak_ringan', 'aktif', '2026-11-21 12:37:10', '2026-11-21 13:32:50'),
(23, 19, 7, 0, 'baik', 'aktif', '2026-11-23 09:38:13', '2026-11-23 09:57:20'),
(25, 19, 13, 0, 'baik', 'nonaktif', '2026-11-23 09:55:16', '2026-11-25 14:01:00'),
(26, 19, 13, 0, 'baik', 'aktif', '2026-11-23 09:57:20', '2026-11-25 09:58:13'),
(27, 20, 10, 1, 'rusak_berat', 'aktif', '2026-11-24 17:55:28', '2026-11-26 14:38:09'),
(28, 19, 14, 10, 'baik', 'aktif', '2026-11-25 08:22:50', '2026-11-25 14:02:32'),
(29, 21, 15, 2, 'baik', 'aktif', '2026-11-25 08:24:18', '2026-11-25 12:24:23'),
(30, 22, 16, 0, 'baik', 'aktif', '2026-11-25 08:26:17', '2026-11-26 15:54:13'),
(31, 19, 13, 0, 'rusak_berat', 'aktif', '2026-11-25 09:58:13', '2026-11-25 14:01:00'),
(32, 21, 15, 1, 'rusak_ringan', 'aktif', '2026-11-25 12:24:23', '2026-11-25 12:24:23'),
(34, 19, 17, 3, 'baik', 'aktif', '2026-11-25 14:03:42', '2026-11-25 14:03:42'),
(35, 20, 10, 0, 'rusak_ringan', 'aktif', '2026-11-25 14:04:26', '2026-11-26 14:38:09'),
(36, 20, 13, 1, 'baik', 'aktif', '2026-11-25 16:13:21', '2026-11-25 16:13:21'),
(37, 23, 15, 5, 'baik', 'aktif', '2026-11-26 13:54:49', '2026-11-26 13:54:49'),
(38, 22, 11, 1, 'baik', 'aktif', '2026-11-26 15:54:13', '2026-11-26 15:54:13'),
(39, 24, 17, 5, 'baik', 'aktif', '2026-11-26 18:25:03', '2026-11-26 18:25:03');

-- --------------------------------------------------------

--
-- Table structure for table `stok_opname`
--

CREATE TABLE `stok_opname` (
  `id_opname` int UNSIGNED NOT NULL,
  `id_lokasi` int UNSIGNED NOT NULL,
  `id_user` int UNSIGNED NOT NULL,
  `tanggal_mulai` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tanggal_selesai` datetime DEFAULT NULL,
  `status` enum('draft','berlangsung','selesai') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'berlangsung',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stok_opname`
--

INSERT INTO `stok_opname` (`id_opname`, `id_lokasi`, `id_user`, `tanggal_mulai`, `tanggal_selesai`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 1, '2026-11-08 23:38:25', '2026-11-09 00:48:31', 'selesai', '2026-11-08 16:38:25', '2026-11-08 17:48:31'),
(2, 8, 1, '2026-11-09 01:03:17', '2026-11-21 19:12:51', 'selesai', '2026-11-08 18:03:17', '2026-11-21 12:12:51'),
(3, 8, 1, '2026-11-21 19:15:03', '2026-11-21 19:17:38', 'selesai', '2026-11-21 12:15:03', '2026-11-21 12:17:38'),
(4, 9, 1, '2026-11-21 19:23:29', '2026-11-21 19:37:10', 'selesai', '2026-11-21 12:23:29', '2026-11-21 12:37:10'),
(5, 9, 1, '2026-11-21 19:43:36', '2026-11-21 19:57:14', 'selesai', '2026-11-21 12:43:36', '2026-11-21 12:57:14'),
(6, 9, 1, '2026-11-21 20:16:41', '2026-11-21 20:32:50', 'selesai', '2026-11-21 13:16:41', '2026-11-21 13:32:50'),
(7, 10, 1, '2026-11-25 00:51:41', '2026-11-25 00:53:06', 'selesai', '2026-11-24 17:51:41', '2026-11-24 17:53:06'),
(8, 10, 1, '2026-11-25 00:54:42', '2026-11-25 00:55:28', 'selesai', '2026-11-24 17:54:42', '2026-11-24 17:55:28'),
(9, 13, 1, '2026-11-25 15:45:15', '2026-11-25 16:58:13', 'selesai', '2026-11-25 08:45:15', '2026-11-25 09:58:13'),
(10, 14, 1, '2026-11-25 16:56:20', '2026-11-25 17:15:09', 'selesai', '2026-11-25 09:56:20', '2026-11-25 10:15:09'),
(11, 15, 1, '2026-11-25 17:14:26', '2026-11-25 17:35:56', 'selesai', '2026-11-25 10:14:26', '2026-11-25 10:35:56'),
(12, 15, 1, '2026-11-25 19:20:02', '2026-11-25 19:24:23', 'selesai', '2026-11-25 12:20:02', '2026-11-25 12:24:23'),
(13, 11, 1, '2026-11-25 19:27:54', '2026-11-25 20:08:43', 'selesai', '2026-11-25 12:27:54', '2026-11-25 13:08:43'),
(14, 16, 1, '2026-11-25 19:36:55', '2026-11-25 20:08:51', 'selesai', '2026-11-25 12:36:55', '2026-11-25 13:08:51'),
(15, 13, 1, '2026-11-25 20:21:46', '2026-11-25 21:01:00', 'selesai', '2026-11-25 13:21:46', '2026-11-25 14:01:00'),
(16, 14, 1, '2026-11-25 21:01:46', '2026-11-25 21:01:57', 'selesai', '2026-11-25 14:01:46', '2026-11-25 14:01:57'),
(17, 10, 1, '2026-11-25 21:04:00', '2026-11-25 21:04:26', 'selesai', '2026-11-25 14:04:00', '2026-11-25 14:04:26'),
(18, 14, 1, '2026-11-25 21:26:44', NULL, 'berlangsung', '2026-11-25 14:26:44', '2026-11-25 14:26:44'),
(19, 10, 1, '2026-11-26 21:37:33', '2026-11-26 21:38:09', 'selesai', '2026-11-26 14:37:33', '2026-11-26 14:38:09');

-- --------------------------------------------------------

--
-- Table structure for table `stok_opname_detail`
--

CREATE TABLE `stok_opname_detail` (
  `id_detail` int UNSIGNED NOT NULL,
  `id_opname` int UNSIGNED NOT NULL,
  `id_stok` int UNSIGNED NOT NULL,
  `jumlah_sistem` int UNSIGNED NOT NULL,
  `kondisi_sistem` enum('baik','rusak_ringan','rusak_berat') COLLATE utf8mb4_general_ci NOT NULL,
  `status_pemeriksaan` enum('belum_diperiksa','sesuai','ada_temuan') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'belum_diperiksa',
  `catatan` text COLLATE utf8mb4_general_ci,
  `diperiksa_pada` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stok_opname_detail`
--

INSERT INTO `stok_opname_detail` (`id_detail`, `id_opname`, `id_stok`, `jumlah_sistem`, `kondisi_sistem`, `status_pemeriksaan`, `catatan`, `diperiksa_pada`, `created_at`, `updated_at`) VALUES
(1, 1, 16, 1, 'baik', 'ada_temuan', 'Ditemukan 4 unit tidak berada di lokasi.', '2026-11-08 23:59:01', '2026-11-08 16:38:25', '2026-11-08 16:59:01'),
(2, 2, 16, 15, 'baik', 'ada_temuan', 'Ditemukan satu unit rusak berat dan terdapat perubahan jumlah pada kondisi barang.', '2026-11-21 19:09:30', '2026-11-08 18:03:17', '2026-11-21 12:09:30'),
(3, 2, 20, 1, 'rusak_ringan', 'ada_temuan', 'Ditemukan satu unit rusak berat dan terdapat perubahan jumlah pada kondisi barang.', '2026-11-21 19:09:30', '2026-11-08 18:03:17', '2026-11-21 12:09:30'),
(4, 3, 16, 14, 'baik', 'ada_temuan', 'Seluruh barang tidak ditemukan saat pemeriksaan fisik.', '2026-11-21 19:16:18', '2026-11-21 12:15:03', '2026-11-21 12:16:18'),
(5, 3, 20, 2, 'rusak_ringan', 'ada_temuan', 'Seluruh barang tidak ditemukan saat pemeriksaan fisik.', '2026-11-21 19:16:18', '2026-11-21 12:15:03', '2026-11-21 12:16:18'),
(6, 3, 21, 1, 'rusak_berat', 'ada_temuan', 'Seluruh barang tidak ditemukan saat pemeriksaan fisik.', '2026-11-21 19:16:18', '2026-11-21 12:15:03', '2026-11-21 12:16:18'),
(7, 4, 17, 3, 'baik', 'ada_temuan', 'Pengujian simulasi rollback.', '2026-11-21 19:24:49', '2026-11-21 12:23:29', '2026-11-21 12:24:49'),
(8, 5, 17, 2, 'baik', 'ada_temuan', 'Pengujian simulasi rollback.', '2026-11-21 19:56:50', '2026-11-21 12:43:36', '2026-11-21 12:56:50'),
(9, 5, 22, 1, 'rusak_ringan', 'ada_temuan', 'Pengujian simulasi rollback.', '2026-11-21 19:56:50', '2026-11-21 12:43:36', '2026-11-21 12:56:50'),
(10, 6, 17, 1, 'baik', 'ada_temuan', 'Pengujian rollback transaksi.', '2026-11-21 20:18:08', '2026-11-21 13:16:41', '2026-11-21 13:18:08'),
(11, 6, 22, 2, 'rusak_ringan', 'ada_temuan', 'Pengujian rollback transaksi.', '2026-11-21 20:18:08', '2026-11-21 13:16:41', '2026-11-21 13:18:08'),
(12, 7, 19, 1, 'baik', 'ada_temuan', NULL, '2026-11-25 00:52:51', '2026-11-24 17:51:41', '2026-11-24 17:52:51'),
(13, 8, 19, 4, 'baik', 'ada_temuan', NULL, '2026-11-25 00:55:26', '2026-11-24 17:54:42', '2026-11-24 17:55:26'),
(14, 9, 25, 1, 'baik', 'sesuai', NULL, '2026-11-25 16:55:36', '2026-11-25 08:45:15', '2026-11-25 09:55:36'),
(15, 9, 26, 1, 'baik', 'ada_temuan', 'Sudah rusak', '2026-11-25 16:57:20', '2026-11-25 08:45:15', '2026-11-25 09:57:20'),
(16, 10, 28, 2, 'baik', 'sesuai', NULL, '2026-11-25 17:12:39', '2026-11-25 09:56:20', '2026-11-25 10:12:39'),
(17, 11, 29, 3, 'baik', 'sesuai', NULL, '2026-11-25 17:14:32', '2026-11-25 10:14:26', '2026-11-25 10:14:32'),
(18, 12, 29, 3, 'baik', 'ada_temuan', NULL, '2026-11-25 19:23:39', '2026-11-25 12:20:03', '2026-11-25 12:23:39'),
(19, 13, 18, 1, 'baik', 'sesuai', NULL, '2026-11-25 20:08:41', '2026-11-25 12:27:54', '2026-11-25 13:08:41'),
(20, 14, 30, 1, 'baik', 'sesuai', NULL, '2026-11-25 20:08:49', '2026-11-25 12:36:55', '2026-11-25 13:08:49'),
(21, 15, 25, 1, 'baik', 'ada_temuan', NULL, '2026-11-25 21:00:24', '2026-11-25 13:21:46', '2026-11-25 14:00:24'),
(22, 15, 31, 1, 'rusak_berat', 'ada_temuan', NULL, '2026-11-25 21:00:24', '2026-11-25 13:21:46', '2026-11-25 14:00:24'),
(23, 16, 28, 2, 'baik', 'ada_temuan', NULL, '2026-11-25 21:01:54', '2026-11-25 14:01:46', '2026-11-25 14:01:54'),
(24, 17, 27, 1, 'rusak_berat', 'ada_temuan', NULL, '2026-11-25 21:04:16', '2026-11-25 14:04:00', '2026-11-25 14:04:16'),
(25, 18, 28, 10, 'baik', 'sesuai', NULL, '2026-11-26 23:08:08', '2026-11-25 14:26:44', '2026-11-26 16:08:08'),
(26, 19, 35, 1, 'rusak_ringan', 'ada_temuan', NULL, '2026-11-26 21:38:03', '2026-11-26 14:37:33', '2026-11-26 14:38:03');

-- --------------------------------------------------------

--
-- Table structure for table `stok_opname_detail_kondisi`
--

CREATE TABLE `stok_opname_detail_kondisi` (
  `id_detail_kondisi` int UNSIGNED NOT NULL,
  `id_detail` int UNSIGNED NOT NULL,
  `kondisi` enum('baik','rusak_ringan','rusak_berat') COLLATE utf8mb4_general_ci NOT NULL,
  `jumlah_fisik` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stok_opname_detail_kondisi`
--

INSERT INTO `stok_opname_detail_kondisi` (`id_detail_kondisi`, `id_detail`, `kondisi`, `jumlah_fisik`) VALUES
(1, 1, 'baik', 15),
(2, 1, 'rusak_ringan', 1),
(3, 1, 'rusak_berat', 0),
(4, 2, 'baik', 14),
(5, 2, 'rusak_ringan', 2),
(6, 2, 'rusak_berat', 1),
(7, 4, 'baik', 0),
(8, 4, 'rusak_ringan', 0),
(9, 4, 'rusak_berat', 0),
(10, 7, 'baik', 2),
(11, 7, 'rusak_ringan', 1),
(12, 7, 'rusak_berat', 0),
(13, 8, 'baik', 1),
(14, 8, 'rusak_ringan', 2),
(15, 8, 'rusak_berat', 0),
(16, 10, 'baik', 2),
(17, 10, 'rusak_ringan', 1),
(18, 10, 'rusak_berat', 0),
(22, 12, 'baik', 4),
(23, 12, 'rusak_ringan', 0),
(24, 12, 'rusak_berat', 0),
(25, 13, 'baik', 0),
(26, 13, 'rusak_ringan', 0),
(27, 13, 'rusak_berat', 1),
(64, 14, 'baik', 1),
(65, 14, 'rusak_ringan', 0),
(66, 14, 'rusak_berat', 0),
(67, 15, 'baik', 0),
(68, 15, 'rusak_ringan', 0),
(69, 15, 'rusak_berat', 1),
(73, 16, 'baik', 2),
(74, 16, 'rusak_ringan', 0),
(75, 16, 'rusak_berat', 0),
(76, 17, 'baik', 3),
(77, 17, 'rusak_ringan', 0),
(78, 17, 'rusak_berat', 0),
(79, 18, 'baik', 2),
(80, 18, 'rusak_ringan', 1),
(81, 18, 'rusak_berat', 0),
(82, 19, 'baik', 1),
(83, 19, 'rusak_ringan', 0),
(84, 19, 'rusak_berat', 0),
(85, 20, 'baik', 1),
(86, 20, 'rusak_ringan', 0),
(87, 20, 'rusak_berat', 0),
(88, 22, 'baik', 0),
(89, 22, 'rusak_ringan', 0),
(90, 22, 'rusak_berat', 0),
(91, 21, 'baik', 0),
(92, 21, 'rusak_ringan', 0),
(93, 21, 'rusak_berat', 0),
(94, 23, 'baik', 0),
(95, 23, 'rusak_ringan', 0),
(96, 23, 'rusak_berat', 0),
(97, 24, 'baik', 0),
(98, 24, 'rusak_ringan', 1),
(99, 24, 'rusak_berat', 0),
(100, 26, 'baik', 0),
(101, 26, 'rusak_ringan', 0),
(102, 26, 'rusak_berat', 1),
(103, 25, 'baik', 10),
(104, 25, 'rusak_ringan', 0),
(105, 25, 'rusak_berat', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL,
  `nip` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Wakasek Sarpras','Tata Usaha') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nip`, `nama`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '121', 'Daud Suwarno, S.Pd., M.Sn.', '$2b$10$BNRCW8BOWe8//sRlCpu0tOXhz/QXFWLPx17faOd2mbnoYb8vGlsnq', 'Wakasek Sarpras', 1, '2026-10-16 09:39:21', '2026-11-08 08:42:51'),
(3, '122', 'Pengguna TU', '$2b$10$LpxES8efTZNGcaAd1aOoi.7BldNKuHMKDaXuM4bM8E25sbAdySci6', 'Tata Usaha', 1, '2026-10-16 10:18:50', '2026-11-08 08:43:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`id_barang`),
  ADD UNIQUE KEY `kode_barang` (`kode_barang`);

--
-- Indexes for table `lokasi`
--
ALTER TABLE `lokasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`id_peminjaman`),
  ADD UNIQUE KEY `uq_peminjaman_kode` (`kode_transaksi`),
  ADD KEY `fk_peminjaman_user` (`id_user`),
  ADD KEY `fk_peminjaman_lokasi` (`id_lokasi_pakai`),
  ADD KEY `fk_peminjaman_barang` (`id_barang`);

--
-- Indexes for table `pengadaan_barang`
--
ALTER TABLE `pengadaan_barang`
  ADD PRIMARY KEY (`id_pengadaan`),
  ADD UNIQUE KEY `uq_barang_tahun` (`id_barang`,`tahun_pengadaan`);

--
-- Indexes for table `pengembalian`
--
ALTER TABLE `pengembalian`
  ADD PRIMARY KEY (`id_pengembalian`),
  ADD UNIQUE KEY `uq_pengembalian_peminjaman` (`id_peminjaman`),
  ADD KEY `fk_pengembalian_user` (`id_user`);

--
-- Indexes for table `penghapusan_data`
--
ALTER TABLE `penghapusan_data`
  ADD PRIMARY KEY (`id_penghapusan`),
  ADD KEY `idx_penghapusan_jenis` (`jenis_data`),
  ADD KEY `idx_penghapusan_waktu` (`waktu_penghapusan`),
  ADD KEY `idx_penghapusan_pengguna` (`nip_penghapus`);

--
-- Indexes for table `perpindahan_aset`
--
ALTER TABLE `perpindahan_aset`
  ADD PRIMARY KEY (`id_perpindahan`),
  ADD UNIQUE KEY `uq_nomor_mutasi` (`nomor_mutasi`),
  ADD KEY `idx_perpindahan_tanggal` (`tanggal_perpindahan`),
  ADD KEY `idx_perpindahan_barang` (`id_barang`),
  ADD KEY `fk_perpindahan_lokasi_asal` (`id_lokasi_asal`),
  ADD KEY `fk_perpindahan_lokasi_tujuan` (`id_lokasi_tujuan`),
  ADD KEY `fk_perpindahan_user` (`id_user`);

--
-- Indexes for table `perpindahan_aset_detail`
--
ALTER TABLE `perpindahan_aset_detail`
  ADD PRIMARY KEY (`id_detail`),
  ADD UNIQUE KEY `uq_perpindahan_stok_asal` (`id_perpindahan`,`id_stok_asal`),
  ADD KEY `idx_detail_stok_asal` (`id_stok_asal`),
  ADD KEY `idx_detail_stok_tujuan` (`id_stok_tujuan`);

--
-- Indexes for table `stok_lokasi`
--
ALTER TABLE `stok_lokasi`
  ADD PRIMARY KEY (`id_stok`),
  ADD UNIQUE KEY `uq_stok_kelompok` (`id_pengadaan`,`id_lokasi`,`kondisi`,`status_penggunaan`),
  ADD KEY `fk_stok_lokasi` (`id_lokasi`);

--
-- Indexes for table `stok_opname`
--
ALTER TABLE `stok_opname`
  ADD PRIMARY KEY (`id_opname`),
  ADD KEY `idx_stok_opname_lokasi` (`id_lokasi`),
  ADD KEY `idx_stok_opname_user` (`id_user`);

--
-- Indexes for table `stok_opname_detail`
--
ALTER TABLE `stok_opname_detail`
  ADD PRIMARY KEY (`id_detail`),
  ADD UNIQUE KEY `uq_opname_stok` (`id_opname`,`id_stok`),
  ADD KEY `fk_detail_stok` (`id_stok`);

--
-- Indexes for table `stok_opname_detail_kondisi`
--
ALTER TABLE `stok_opname_detail_kondisi`
  ADD PRIMARY KEY (`id_detail_kondisi`),
  ADD UNIQUE KEY `uq_detail_kondisi` (`id_detail`,`kondisi`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barang`
--
ALTER TABLE `barang`
  MODIFY `id_barang` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `lokasi`
--
ALTER TABLE `lokasi`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `id_peminjaman` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `pengadaan_barang`
--
ALTER TABLE `pengadaan_barang`
  MODIFY `id_pengadaan` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `pengembalian`
--
ALTER TABLE `pengembalian`
  MODIFY `id_pengembalian` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `penghapusan_data`
--
ALTER TABLE `penghapusan_data`
  MODIFY `id_penghapusan` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `perpindahan_aset`
--
ALTER TABLE `perpindahan_aset`
  MODIFY `id_perpindahan` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `perpindahan_aset_detail`
--
ALTER TABLE `perpindahan_aset_detail`
  MODIFY `id_detail` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `stok_lokasi`
--
ALTER TABLE `stok_lokasi`
  MODIFY `id_stok` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `stok_opname`
--
ALTER TABLE `stok_opname`
  MODIFY `id_opname` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `stok_opname_detail`
--
ALTER TABLE `stok_opname_detail`
  MODIFY `id_detail` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `stok_opname_detail_kondisi`
--
ALTER TABLE `stok_opname_detail_kondisi`
  MODIFY `id_detail_kondisi` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `fk_peminjaman_barang` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_peminjaman_lokasi` FOREIGN KEY (`id_lokasi_pakai`) REFERENCES `lokasi` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_peminjaman_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pengadaan_barang`
--
ALTER TABLE `pengadaan_barang`
  ADD CONSTRAINT `fk_pengadaan_barang` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`) ON UPDATE CASCADE;

--
-- Constraints for table `pengembalian`
--
ALTER TABLE `pengembalian`
  ADD CONSTRAINT `fk_pengembalian_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pengembalian_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `perpindahan_aset`
--
ALTER TABLE `perpindahan_aset`
  ADD CONSTRAINT `fk_perpindahan_barang` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`),
  ADD CONSTRAINT `fk_perpindahan_lokasi_asal` FOREIGN KEY (`id_lokasi_asal`) REFERENCES `lokasi` (`id`),
  ADD CONSTRAINT `fk_perpindahan_lokasi_tujuan` FOREIGN KEY (`id_lokasi_tujuan`) REFERENCES `lokasi` (`id`),
  ADD CONSTRAINT `fk_perpindahan_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `perpindahan_aset_detail`
--
ALTER TABLE `perpindahan_aset_detail`
  ADD CONSTRAINT `fk_detail_perpindahan` FOREIGN KEY (`id_perpindahan`) REFERENCES `perpindahan_aset` (`id_perpindahan`),
  ADD CONSTRAINT `fk_detail_stok_asal` FOREIGN KEY (`id_stok_asal`) REFERENCES `stok_lokasi` (`id_stok`),
  ADD CONSTRAINT `fk_detail_stok_tujuan` FOREIGN KEY (`id_stok_tujuan`) REFERENCES `stok_lokasi` (`id_stok`);

--
-- Constraints for table `stok_lokasi`
--
ALTER TABLE `stok_lokasi`
  ADD CONSTRAINT `fk_stok_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stok_pengadaan` FOREIGN KEY (`id_pengadaan`) REFERENCES `pengadaan_barang` (`id_pengadaan`) ON UPDATE CASCADE;

--
-- Constraints for table `stok_opname`
--
ALTER TABLE `stok_opname`
  ADD CONSTRAINT `fk_stok_opname_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stok_opname_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stok_opname_detail`
--
ALTER TABLE `stok_opname_detail`
  ADD CONSTRAINT `fk_detail_opname` FOREIGN KEY (`id_opname`) REFERENCES `stok_opname` (`id_opname`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detail_stok` FOREIGN KEY (`id_stok`) REFERENCES `stok_lokasi` (`id_stok`) ON UPDATE CASCADE;

--
-- Constraints for table `stok_opname_detail_kondisi`
--
ALTER TABLE `stok_opname_detail_kondisi`
  ADD CONSTRAINT `fk_detail_kondisi` FOREIGN KEY (`id_detail`) REFERENCES `stok_opname_detail` (`id_detail`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
