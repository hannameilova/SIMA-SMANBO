
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser } from "@/lib/auth";
import {
  getBarangSesi,
  getLokasiStokOpname,
  getRingkasanSesi,
  savePemeriksaan,
} from "@/lib/stok-opname/api";
import {
  buatBarangPemeriksaan,
  buatDraftBarang,
  ratakanBarangSesi,
  totalJumlahFisik,
} from "@/lib/stok-opname/utils";

const KONDISI_VALID = [
  "baik",
  "rusak_ringan",
  "rusak_berat",
];

export function useStockOpname(idOpname) {
  const idValid = Number.isSafeInteger(idOpname) && idOpname > 0;

  const [sesi, setSesi] = useState(null);
  const [ringkasan, setRingkasan] = useState(null);
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [lokasi, setLokasi] = useState(null);
  const [pengguna, setPengguna] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [errorAksi, setErrorAksi] = useState("");
  const [notifikasi, setNotifikasi] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Dibaca setelah mount agar hasil render server dan klien tetap sama.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPengguna(getUser());
  }, []);

  useEffect(() => {
    if (!idValid) return;

    const controller = new AbortController();

    async function muat() {
      setLoading(true);
      setError("");
      setErrorAksi("");
      setNotifikasi(null);

      const [hasilBarang, hasilLokasi] = await Promise.allSettled([
        getBarangSesi(idOpname, controller.signal),
        getLokasiStokOpname({}, controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (hasilBarang.status === "rejected") {
        const err = hasilBarang.reason;

        if (err?.name === "AbortError") return;

        setError(
          err?.message ||
            "Data sesi stok opname gagal diambil. Silakan coba lagi."
        );

        setLoading(false);
        return;
      }

      const data = hasilBarang.value;
      const daftarItem = ratakanBarangSesi(data.barang);
      const draftAwal = {};

      for (const item of daftarItem) {
        draftAwal[item.kelompok.id_detail] = buatDraftBarang(item);
      }

      setSesi(data.sesi);
      setRingkasan(data.ringkasan);
      setItems(daftarItem);
      setDrafts(draftAwal);

      if (hasilLokasi.status === "fulfilled") {
        const ruangan =
          hasilLokasi.value.find(
            (item) => Number(item.id) === Number(data.sesi.id_lokasi)
          ) ?? null;

        setLokasi(ruangan);
      } else {
        setLokasi(null);
      }

      setLoading(false);
    }

    muat();

    return () => controller.abort();
  }, [idOpname, idValid, reloadKey]);

  const barang = useMemo(
    () => buatBarangPemeriksaan(items, drafts),
    [items, drafts]
  );

  const statistik = useMemo(() => {
    let belum = 0;
    let sesuai = 0;
    let temuan = 0;

    for (const item of barang) {
      if (item.status === "belum_diperiksa") belum += 1;
      else if (item.status === "sesuai") sesuai += 1;
      else temuan += 1;
    }

    const total = barang.length;
    const checked = total - belum;

    return {
      total,
      checked,
      belum,
      sesuai,
      temuan,
      persen: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
  }, [barang]);

  const jumlahKotor = useMemo(
    () => barang.filter((item) => item.dirty).length,
    [barang]
  );

  // Menambah jumlah berdasarkan kondisi
  const tambahKondisi = useCallback((idDetail, kondisi) => {
    if (!KONDISI_VALID.includes(kondisi)) return;

    setDrafts((sebelumnya) => {
      const draft = sebelumnya[idDetail];

      if (!draft) return sebelumnya;

      const jumlah = { ...draft.jumlah_fisik };

      if (kondisi === "baik") {
        // Menambah total unit fisik
        jumlah.baik += 1;
      } else {
        // Memindahkan satu unit dari Baik
        if (jumlah.baik <= 0) return sebelumnya;

        jumlah.baik -= 1;
        jumlah[kondisi] += 1;
      }

      return {
        ...sebelumnya,
        [idDetail]: {
          ...draft,
          jumlah_fisik: jumlah,
          touched: true,
        },
      };
    });
  }, []);

  // Mengurangi jumlah berdasarkan kondisi
  const kurangiKondisi = useCallback((idDetail, kondisi) => {
    if (!KONDISI_VALID.includes(kondisi)) return;

    setDrafts((sebelumnya) => {
      const draft = sebelumnya[idDetail];

      if (!draft) return sebelumnya;

      const jumlah = { ...draft.jumlah_fisik };

      if (jumlah[kondisi] <= 0) return sebelumnya;

      jumlah[kondisi] -= 1;

      if (kondisi !== "baik") {
        // Mengembalikan satu unit ke kondisi Baik
        jumlah.baik += 1;
      }

      return {
        ...sebelumnya,
        [idDetail]: {
          ...draft,
          jumlah_fisik: jumlah,
          touched: true,
        },
      };
    });
  }, []);

  // Mengubah catatan pemeriksaan
  const ubahCatatan = useCallback((idDetail, catatan) => {
    setDrafts((sebelumnya) => {
      const draft = sebelumnya[idDetail];

      if (!draft) return sebelumnya;

      return {
        ...sebelumnya,
        [idDetail]: {
          ...draft,
          catatan,
          touched: true,
        },
      };
    });
  }, []);

  // Menyimpan draf satu per satu
  const simpanDraf = useCallback(async () => {
    const itemKotor = barang.filter((item) => item.dirty);

    if (itemKotor.length === 0) {
      setNotifikasi({
        tipe: "info",
        pesan: "Tidak ada perubahan baru yang perlu disimpan.",
      });

      return true;
    }

    setSaving(true);
    setErrorAksi("");
    setNotifikasi(null);

    const idBerhasil = new Set();
    let pesanGagal = "";

    try {
      for (const item of itemKotor) {
        const idDetail = item.kelompok.id_detail;
        const draft = drafts[idDetail];

        try {
          await savePemeriksaan(idDetail, {
            jumlah_fisik: {
              baik: draft.jumlah_fisik.baik,
              rusak_ringan: draft.jumlah_fisik.rusak_ringan,
              rusak_berat: draft.jumlah_fisik.rusak_berat,
            },
            catatan: draft.catatan.trim()
              ? draft.catatan.trim()
              : null,
          });

          idBerhasil.add(idDetail);
        } catch (err) {
          if (!pesanGagal) {
            pesanGagal =
              err?.message ||
              "Sebagian hasil pemeriksaan gagal disimpan.";
          }
        }
      }

      // Tandai barang yang berhasil disimpan
      if (idBerhasil.size > 0) {
        setDrafts((sebelumnya) => {
          const berikutnya = { ...sebelumnya };

          for (const id of idBerhasil) {
            const draft = berikutnya[id];

            if (!draft) continue;

            berikutnya[id] = {
              ...draft,
              touched: false,
              saved: true,
              initial_jumlah_fisik: {
                ...draft.jumlah_fisik,
              },
              initial_catatan: draft.catatan,
            };
          }

          return berikutnya;
        });
      }

      // Tampilkan hasil penyimpanan
      if (pesanGagal) {
        setErrorAksi(pesanGagal);

        setNotifikasi({
          tipe: "error",
          pesan:
            idBerhasil.size > 0
              ? `${idBerhasil.size} barang tersimpan, ${itemKotor.length - idBerhasil.size} barang gagal disimpan.`
              : "Draf pemeriksaan gagal disimpan.",
        });
      } else {
        setNotifikasi({
          tipe: "sukses",
          pesan: `Draf pemeriksaan berhasil disimpan untuk ${idBerhasil.size} barang.`,
        });
      }

      return idBerhasil.size === itemKotor.length;
    } finally {
      setSaving(false);
    }
  }, [barang, drafts]);

  // Mengambil ringkasan pemeriksaan
  const tinjauHasil = useCallback(async () => {
    const berhasilSimpan = await simpanDraf();

    if (!berhasilSimpan) return null;

    setReviewing(true);
    setErrorAksi("");

    try {
      const data = await getRingkasanSesi(idOpname);

      setNotifikasi({
        tipe: "sukses",
        pesan: "Ringkasan pemeriksaan berhasil dimuat.",
      });

      return data;
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : "Ringkasan pemeriksaan gagal dimuat.";

      setErrorAksi(pesan);

      setNotifikasi({
        tipe: "error",
        pesan: "Tahap ringkasan belum dapat dibuka.",
      });

      return null;
    } finally {
      setReviewing(false);
    }
  }, [idOpname, simpanDraf]);

  const muatUlang = useCallback(() => {
    setReloadKey((nilai) => nilai + 1);
  }, []);

  const bersihkanNotifikasi = useCallback(() => {
    setNotifikasi(null);
  }, []);

  const bersihkanErrorAksi = useCallback(() => {
    setErrorAksi("");
  }, []);

  return {
    sesi,
    ringkasan,
    lokasi,
    pengguna,
    items,
    drafts,
    barang,
    statistik,
    jumlahKotor,

    semuaDiperiksa:
      statistik.total > 0 && statistik.checked === statistik.total,

    loading: idValid && loading,
    error: idValid ? error : "ID sesi stok opname tidak valid.",

    saving,
    reviewing,
    errorAksi,
    notifikasi,

    tambahKondisi,
    kurangiKondisi,
    ubahCatatan,

    simpanDraf,
    tinjauHasil,
    muatUlang,

    bersihkanNotifikasi,
    bersihkanErrorAksi,
  };
}