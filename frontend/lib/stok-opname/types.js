/**
 * Kontrak data Stok Opname.
 *
 * Semua bentuk data di bawah ini mengikuti respons backend:
 * - GET  /stok-opname/lokasi
 * - GET  /stok-opname/sesi/:id_opname/barang
 * - GET  /stok-opname/sesi/:id_opname/ringkasan
 *
 * @typedef {"baik" | "rusak_ringan" | "rusak_berat"} KondisiFisik
 * @typedef {"belum_diperiksa" | "sesuai" | "ada_temuan"} StatusPemeriksaan
 * @typedef {"semua" | "belum" | "temuan" | "sesuai"} StatusFilter
 *
 * @typedef {Object} JumlahKondisi
 * @property {number} baik
 * @property {number} rusak_ringan
 * @property {number} rusak_berat
 *
 * @typedef {Object} PenggunaAktif
 * @property {number} [id]
 * @property {string} [nip]
 * @property {string} [nama]
 * @property {string} [role]
 *
 * @typedef {Object} SesiStokOpname
 * @property {number} id_opname
 * @property {number} id_lokasi
 * @property {string} status
 * @property {string | null} tanggal_mulai
 * @property {string | null} tanggal_selesai
 * @property {string} nama_lokasi
 *
 * @typedef {Object} RingkasanBarangSesi
 * @property {number} jumlah_jenis_barang
 * @property {number} jumlah_data_stok
 * @property {number} jumlah_sudah_diperiksa
 * @property {number} jumlah_belum_diperiksa
 *
 * @typedef {Object} KelompokPengadaan
 * @property {number} id_detail
 * @property {number[]} detail_ids
 * @property {number} id_pengadaan
 * @property {number} tahun_pengadaan
 * @property {string} status_penggunaan
 * @property {number} jumlah_sistem
 * @property {JumlahKondisi} jumlah_sistem_per_kondisi
 * @property {JumlahKondisi} jumlah_fisik
 * @property {StatusPemeriksaan} status_pemeriksaan
 * @property {string | null} catatan
 * @property {string | null} diperiksa_pada
 * @property {boolean} sudah_ada_hasil
 * @property {number | null} total_fisik
 * @property {number | null} selisih
 *
 * @typedef {Object} BarangSesi
 * @property {number} id_barang
 * @property {string} kode_barang
 * @property {string} nama_barang
 * @property {string} kategori
 * @property {KelompokPengadaan[]} daftar_pengadaan
 *
 * @typedef {Object} DataBarangSesi
 * @property {SesiStokOpname} sesi
 * @property {RingkasanBarangSesi} ringkasan
 * @property {BarangSesi[]} barang
 *
 * @typedef {Object} LokasiStokOpname
 * @property {number} id
 * @property {string} nama_lokasi
 * @property {string | null} kategori
 * @property {string | null} kategori_lainnya
 * @property {number} jumlah_jenis_barang
 * @property {number} jumlah_data_stok
 * @property {number} total_unit
 * @property {string | null} [penanggung_jawab]
 *
 * @typedef {Object} SesiBaru
 * @property {number} id_opname
 * @property {number} id_lokasi
 * @property {string} nama_lokasi
 * @property {number} id_user
 * @property {string} status
 * @property {number} jumlah_data_stok
 *
 * @typedef {Object} PayloadSimpanPemeriksaan
 * @property {JumlahKondisi} jumlah_fisik
 * @property {string | null} catatan
 *
 * @typedef {Object} HasilSimpanPemeriksaan
 * @property {number} id_detail
 * @property {number[]} detail_ids
 * @property {number} jumlah_sistem
 * @property {JumlahKondisi} jumlah_sistem_per_kondisi
 * @property {JumlahKondisi} jumlah_fisik
 * @property {number} total_fisik
 * @property {number} selisih
 * @property {StatusPemeriksaan} status_pemeriksaan
 *
 * @typedef {Object} KondisiRingkasan
 * @property {number} sebelum
 * @property {number | null} sesudah
 * @property {number | null} selisih
 *
 * @typedef {Object} RingkasanPengadaan
 * @property {number} id_detail
 * @property {number[]} detail_ids
 * @property {number} id_pengadaan
 * @property {number} tahun_pengadaan
 * @property {string} status_penggunaan
 * @property {number} jumlah_sebelum
 * @property {number | null} jumlah_sesudah
 * @property {number | null} selisih_jumlah
 * @property {Record<KondisiFisik, KondisiRingkasan>} kondisi
 * @property {string | null} catatan
 * @property {StatusPemeriksaan} status_pemeriksaan
 * @property {string | null} diperiksa_pada
 *
 * @typedef {Object} RingkasanBarang
 * @property {number} id_barang
 * @property {string} kode_barang
 * @property {string} nama_barang
 * @property {string} kategori
 * @property {RingkasanPengadaan[]} daftar_pengadaan
 *
 * @typedef {Object} StatistikRingkasan
 * @property {number} jumlah_jenis_barang
 * @property {number} jumlah_data_stok
 * @property {number} jumlah_sudah_diperiksa
 * @property {number} jumlah_belum_diperiksa
 * @property {number} jumlah_sesuai
 * @property {number} jumlah_temuan
 * @property {number} total_sistem
 * @property {number} total_fisik
 * @property {boolean} semua_sudah_diperiksa
 *
 * @typedef {Object} DataRingkasanSesi
 * @property {SesiStokOpname} sesi
 * @property {StatistikRingkasan} ringkasan
 * @property {RingkasanBarang[]} barang
 *
 * @typedef {Object} HasilKonfirmasiSesi
 * @property {number} id_opname
 * @property {string} status
 * @property {string} message
 *
 * @typedef {Object} BarangDraft
 * @property {number} id_detail
 * @property {JumlahKondisi} jumlah_fisik
 * @property {KondisiFisik} kondisi
 * @property {string} catatan
 * @property {boolean} touched
 * @property {boolean} saved
 * @property {JumlahKondisi} initial_jumlah_fisik
 * @property {string} initial_catatan
 *
 * @typedef {Object} ItemBarangSesi
 * @property {string} key
 * @property {BarangSesi} barang
 * @property {KelompokPengadaan} kelompok
 *
 * @typedef {Object} BarangPemeriksaan
 * @property {string} key
 * @property {BarangSesi} barang
 * @property {KelompokPengadaan} kelompok
 * @property {BarangDraft} draft
 * @property {StatusPemeriksaan} status
 * @property {number} totalFisik
 * @property {number} selisih
 * @property {boolean} dirty
 *
 * @typedef {Object} StatistikPengecekan
 * @property {number} total
 * @property {number} checked
 * @property {number} belum
 * @property {number} sesuai
 * @property {number} temuan
 * @property {number} persen
 *
 * @typedef {Object} NotifikasiAksi
 * @property {"sukses" | "info" | "error"} tipe
 * @property {string} pesan
 */

export {};
