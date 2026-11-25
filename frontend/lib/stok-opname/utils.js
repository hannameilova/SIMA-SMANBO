
export const URUTAN_KONDISI = ["baik", "rusak_ringan", "rusak_berat"];

export const OPSI_KONDISI = [
  {
    value: "baik",
    label: "Baik",
    deskripsi: "Fungsi dan bentuk barang normal",
  },
  {
    value: "rusak_ringan",
    label: "Rusak Ringan",
    deskripsi: "Masih dapat digunakan dengan sedikit kendala",
  },
  {
    value: "rusak_berat",
    label: "Rusak Berat",
    deskripsi: "Tidak dapat digunakan atau perlu perbaikan besar",
  },
];

export const OPSI_FILTER_STATUS = [
  { value: "semua", label: "Semua Barang" },
  { value: "belum", label: "Belum Dicek" },
  { value: "temuan", label: "Ada Selisih / Berubah" },
  { value: "sesuai", label: "Sesuai" },
];

export function jumlahKosong() {
  return {
    baik: 0,
    rusak_ringan: 0,
    rusak_berat: 0,
  };
}

export function normalisasiJumlah(nilai) {
  return {
    baik: angkaAman(nilai?.baik),
    rusak_ringan: angkaAman(nilai?.rusak_ringan),
    rusak_berat: angkaAman(nilai?.rusak_berat),
  };
}

export function angkaAman(nilai, fallback = 0) {
  const angka = Number(nilai);

  if (!Number.isFinite(angka)) return fallback;

  return Math.max(0, Math.trunc(angka));
}

export function totalJumlahFisik(jumlah) {
  return jumlah.baik + jumlah.rusak_ringan + jumlah.rusak_berat;
}

export function jumlahDariTotal(total, kondisi) {
  const jumlah = jumlahKosong();
  jumlah[kondisi] = angkaAman(total);
  return jumlah;
}

export function kondisiDominan(jumlah, cadangan) {
  let terpilih = "baik";
  let nilaiTerbesar = -1;

  for (const kondisi of URUTAN_KONDISI) {
    if (jumlah[kondisi] > nilaiTerbesar) {
      nilaiTerbesar = jumlah[kondisi];
      terpilih = kondisi;
    }
  }

  if (nilaiTerbesar > 0) return terpilih;

  if (cadangan) {
    let cadanganTerpilih = "baik";
    let cadanganTerbesar = -1;

    for (const kondisi of URUTAN_KONDISI) {
      if (cadangan[kondisi] > cadanganTerbesar) {
        cadanganTerbesar = cadangan[kondisi];
        cadanganTerpilih = kondisi;
      }
    }

    if (cadanganTerbesar > 0) return cadanganTerpilih;
  }

  return "baik";
}

// Membuat draft pemeriksaan barang
export function buatDraftBarang(item) {
  const { kelompok } = item;

  // Periksa apakah barang sudah pernah diperiksa
  const sudahDiperiksa =
    kelompok.status_pemeriksaan !== "belum_diperiksa";

  // Ambil distribusi kondisi dari stok sistem
  const jumlahSistem = normalisasiJumlah(
    kelompok.jumlah_sistem_per_kondisi
  );

  const totalSistem = angkaAman(
    kelompok.jumlah_sistem,
    totalJumlahFisik(jumlahSistem)
  );

  // Barang yang belum diperiksa otomatis dimulai dari kondisi Baik
  const jumlahAwal = sudahDiperiksa
    ? normalisasiJumlah(kelompok.jumlah_fisik)
    : {
        baik: totalSistem,
        rusak_ringan: 0,
        rusak_berat: 0,
      };

  const catatanAwal = kelompok.catatan ?? "";

  return {
    id_detail: kelompok.id_detail,
    jumlah_fisik: { ...jumlahAwal },
    catatan: catatanAwal,

    // Barang yang belum diperiksa langsung perlu disimpan
    touched: !sudahDiperiksa,
    saved: sudahDiperiksa,

    initial_jumlah_fisik: { ...jumlahAwal },
    initial_catatan: catatanAwal,
  };
}

// Memeriksa apakah draft memiliki perubahan
export function apakahDraftKotor(draft) {
  // Barang yang belum pernah diperiksa harus disimpan
  if (draft.touched && !draft.saved) {
    return true;
  }

  // Periksa perubahan catatan
  const catatan = (draft.catatan ?? "").trim();
  const catatanAwal = (draft.initial_catatan ?? "").trim();

  if (catatan !== catatanAwal) {
    return true;
  }

  // Periksa perubahan jumlah setiap kondisi
  return URUTAN_KONDISI.some(
    (kondisi) =>
      Number(draft.jumlah_fisik?.[kondisi] ?? 0) !==
      Number(draft.initial_jumlah_fisik?.[kondisi] ?? 0)
  );
}

export function adaPerubahanKondisi(item, draft) {
  const sistem = normalisasiJumlah(
    item.kelompok.jumlah_sistem_per_kondisi
  );

  return URUTAN_KONDISI.some(
    (kondisi) => draft.jumlah_fisik[kondisi] !== sistem[kondisi]
  );
}

export function hitungStatusBarang(item, draft) {
  const sudahDisentuh = draft.touched || draft.saved;

  if (!sudahDisentuh) return "belum_diperiksa";

  const total = totalJumlahFisik(draft.jumlah_fisik);
  const selisih = total - item.kelompok.jumlah_sistem;

  if (selisih !== 0) return "ada_temuan";
  if (adaPerubahanKondisi(item, draft)) return "ada_temuan";

  return "sesuai";
}

export function buatBarangPemeriksaan(items, drafts) {
  return items
    .map((item) => {
      const draft = drafts[item.kelompok.id_detail];

      if (!draft) return null;

      const totalFisik = totalJumlahFisik(draft.jumlah_fisik);

      return {
        ...item,
        draft,
        status: hitungStatusBarang(item, draft),
        totalFisik,
        selisih: totalFisik - item.kelompok.jumlah_sistem,
        dirty: apakahDraftKotor(draft),
      };
    })
    .filter((item) => item !== null);
}

export function ratakanBarangSesi(barang) {
  const hasil = [];

  for (const item of barang) {
    for (const kelompok of item.daftar_pengadaan) {
      hasil.push({
        key: `${item.id_barang}-${kelompok.id_detail}`,
        barang: item,
        kelompok,
      });
    }
  }

  return hasil;
}

export function kelompokkanKategori(barang) {
  const kategori = new Set();

  for (const item of barang) {
    const nilai = item.barang.kategori?.trim();

    if (nilai) kategori.add(nilai);
  }

  return Array.from(kategori).sort((a, b) =>
    a.localeCompare(b, "id")
  );
}

export function cocokFilterStatus(status, filter) {
  if (filter === "semua") return true;
  if (filter === "belum") return status === "belum_diperiksa";
  if (filter === "temuan") return status === "ada_temuan";
  return status === "sesuai";
}

export function statusKeFilter(status) {
  if (status === "belum_diperiksa") return "belum";
  if (status === "ada_temuan") return "temuan";
  return "sesuai";
}

export function labelStatus(item) {
  if (item.status === "belum_diperiksa") return "Belum Diperiksa";
  if (item.status === "sesuai") return "Sesuai";

  if (item.selisih < 0) {
    return `Selisih ${formatAngka(item.selisih)} Unit`;
  }

  if (item.selisih > 0) {
    return `Selisih +${formatAngka(item.selisih)} Unit`;
  }

  return "Kondisi Berubah";
}

export function labelPeringatanSelisih(selisih) {
  if (selisih === 0) return null;

  if (selisih < 0) {
    return `Selisih kurang ${formatAngka(Math.abs(selisih))} Unit`;
  }

  return `Selisih lebih +${formatAngka(selisih)} Unit`;
}

export function formatAngka(nilai) {
  return new Intl.NumberFormat("id-ID").format(nilai);
}

export function formatTanggal(
  nilai,
  opsi = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
) {
  if (!nilai) return "—";

  const tanggal = new Date(nilai);

  if (Number.isNaN(tanggal.getTime())) return "—";

  return new Intl.DateTimeFormat("id-ID", opsi).format(tanggal);
}

export function formatTanggalWaktu(nilai) {
  return formatTanggal(nilai, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function labelKategoriRuangan(kategori, kategoriLainnya) {
  if (kategori === "Lainnya" && kategoriLainnya?.trim()) {
    return kategoriLainnya.trim();
  }

  return kategori?.trim() || "Tanpa Kategori";
}

export function labelStatusPenggunaan(nilai) {
  const normal = nilai?.trim();

  if (!normal) return "Tidak diketahui";

  const peta = {
    digunakan: "Digunakan",
    dipinjam: "Dipinjam",
    disimpan: "Disimpan",
    tidak_digunakan: "Tidak Digunakan",
    rusak: "Rusak",
  };

  if (peta[normal.toLowerCase()]) return peta[normal.toLowerCase()];

  return normal
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (huruf) => huruf.toUpperCase());
}

export function ringkasKelompok(item) {
  const bagian = [`Tahun ${item.tahun_pengadaan}`];

  if (item.status_penggunaan) {
    bagian.push(labelStatusPenggunaan(item.status_penggunaan));
  }

  return bagian.join(" • ");
}

export const OPSI_TAB_LOKASI = [
  { value: "semua", label: "Semua Ruangan" },
  { value: "belum_diperiksa", label: "Belum Diperiksa" },
  { value: "sedang_berlangsung", label: "Sedang Berlangsung" },
  { value: "selesai_opname", label: "Selesai Opname" },
];

export function normalisasiStatusOpname(item) {
  const raw = String(
    item?.status_opname ?? item?.status ?? item?.status_sesi ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    raw === "sedang_berlangsung" ||
    raw === "berlangsung" ||
    raw === "sedang berlangsung" ||
    raw === "draft" ||
    raw === "aktif"
  ) {
    return "sedang_berlangsung";
  }

  if (
    raw === "selesai_opname" ||
    raw === "selesai opname" ||
    raw === "selesai" ||
    raw === "completed" ||
    raw === "done"
  ) {
    return "selesai_opname";
  }

  if (
    raw === "belum_diperiksa" ||
    raw === "belum diperiksa" ||
    raw === "belum"
  ) {
    return "belum_diperiksa";
  }

  if (Number(item?.id_opname_aktif) > 0) {
    return "sedang_berlangsung";
  }

  return "belum_diperiksa";
}

function ekstrakGedungDariNama(namaLokasi) {
  if (!namaLokasi) return "";

  const match = String(namaLokasi).match(
    /\((Gedung\s+[^)]+?)(?:\s+Lt\.?\s*\d+)?\)/i
  );

  return match ? match[1].trim() : "";
}

export function formatTerakhirOpname(nilai) {
  if (!nilai) {
    return { teks: "Belum pernah", hariIni: false };
  }

  const teksMentah = String(nilai).trim();

  if (!teksMentah) {
    return { teks: "Belum pernah", hariIni: false };
  }

  const tanggal = new Date(teksMentah);

  if (Number.isNaN(tanggal.getTime())) {
    return {
      teks: teksMentah,
      hariIni: /^hari ini/i.test(teksMentah),
    };
  }

  const sekarang = new Date();

  const samaHari =
    tanggal.getFullYear() === sekarang.getFullYear() &&
    tanggal.getMonth() === sekarang.getMonth() &&
    tanggal.getDate() === sekarang.getDate();

  if (samaHari) {
    const jam = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(tanggal)
      .replace(".", ":");

    return {
      teks: `Hari Ini (${jam})`,
      hariIni: true,
    };
  }

  return {
    teks: formatTanggal(tanggal, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    hariIni: false,
  };
}

export function normalisasiLokasiOpname(item) {
  const id = Number(item?.id ?? item?.id_lokasi);

  const namaLokasi = String(
    item?.nama_lokasi ?? item?.nama_ruangan ?? ""
  ).trim();

  const gedungEksplisit = String(
    item?.gedung ?? item?.nama_gedung ?? item?.lokasi_gedung ?? ""
  ).trim();

  const gedung = gedungEksplisit || ekstrakGedungDariNama(namaLokasi);
  const lantai = String(item?.lantai ?? "").trim();

  const kategoriLabel = labelKategoriRuangan(
    item?.kategori,
    item?.kategori_lainnya
  );

  const penanggungJawab = String(
    item?.penanggung_jawab ??
      item?.pj ??
      item?.nama_penanggung_jawab ??
      ""
  ).trim();

  const totalTarget = angkaAman(
    item?.total_target_aset ??
      item?.jumlah_data_stok ??
      item?.total_unit ??
      item?.jumlah_jenis_barang ??
      0
  );

  const idOpnameRaw = Number(
    item?.id_opname ??
      item?.id_opname_aktif ??
      item?.id_opname_terakhir ??
      item?.sesi_id
  );

  const idOpname =
    Number.isSafeInteger(idOpnameRaw) && idOpnameRaw > 0
      ? idOpnameRaw
      : null;

  const status = normalisasiStatusOpname(item);

  const terakhir = formatTerakhirOpname(
    item?.terakhir_opname ??
      item?.tanggal_terakhir_opname ??
      item?.tanggal_selesai ??
      item?.last_opname_at
  );

  const adaLokasiDalamNama =
    gedung &&
    namaLokasi.toLowerCase().includes(gedung.toLowerCase());

  const infoLokasi = [
    gedung,
    lantai ? `Lt. ${lantai}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const judulTampil =
    !adaLokasiDalamNama && infoLokasi
      ? `${namaLokasi} (${infoLokasi})`
      : namaLokasi;

  return {
    id,
    namaLokasi,
    judulTampil,
    gedung,
    kategori: item?.kategori ?? null,
    kategoriLabel,
    penanggungJawab: penanggungJawab || "Belum diatur",
    totalTarget,
    jumlahJenisBarang: angkaAman(item?.jumlah_jenis_barang ?? 0),
    totalUnit: angkaAman(item?.total_unit ?? 0),
    status,
    idOpname,
    terakhirOpname: terakhir.teks,
    terakhirHariIni: terakhir.hariIni,
  };
}