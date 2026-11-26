"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
import AksiNotification from "@/components/stok-opname/AksiNotification";
import SearchableBarangSelect from "@/components/perpindahan-aset/SearchableBarangSelect";
import SearchableLokasiSelect from "@/components/perpindahan-aset/SearchableLokasiSelect";
import PilihKelompokStok from "@/components/perpindahan-aset/PilihKelompokStok";
import PratinjauDampakStok from "@/components/perpindahan-aset/PratinjauDampakStok";
import {
  createPerpindahanAset,
  getDaftarBarang,
  getDaftarLokasi,
  getStokPerpindahan,
  getLokasiAsalDenganStok,
} from "@/lib/perpindahan-aset/api";
import {
  OPSI_ALASAN_PERPINDAHAN,
  formatApiErrorMessage,
  getTodayJakartaYMD,
  hitungPratinjauDampakStok,
  isCheckboxTidakLayakBerlaku,
} from "@/lib/perpindahan-aset/utils";

export default function FormPerpindahanView() {
  const router = useRouter();

  // Data master dari API
  const [barangOptions, setBarangOptions] = useState([]);
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [lokasiAsalOptions, setLokasiAsalOptions] = useState([]);
  const [loadingLokasiAsal, setLoadingLokasiAsal] = useState(false);
  const [errorLokasiAsal, setErrorLokasiAsal] = useState("");
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [masterError, setMasterError] = useState("");
  const [reloadMasterKey, setReloadMasterKey] = useState(0);

  // Informasi petugas login
  const [petugas, setPetugas] = useState(null);

  // State form
  const [idBarang, setIdBarang] = useState("");
  const [tanggalPerpindahan, setTanggalPerpindahan] = useState(() =>
    getTodayJakartaYMD()
  );
  const [idLokasiAsal, setIdLokasiAsal] = useState("");
  const [idLokasiTujuan, setIdLokasiTujuan] = useState("");
  const [jumlahPerStok, setJumlahPerStok] = useState({});
  const [alasan, setAlasan] = useState("");
  const [tandaiTidakLayak, setTandaiTidakLayak] = useState(false);
  const [keterangan, setKeterangan] = useState("");

  // State stok asal & tujuan dari API
  const [stokAsalList, setStokAsalList] = useState([]);
  const [loadingStokAsal, setLoadingStokAsal] = useState(false);
  const [errorStokAsal, setErrorStokAsal] = useState("");
  const [retryStokAsalKey, setRetryStokAsalKey] = useState(0);

  const [stokTujuanList, setStokTujuanList] = useState([]);
  const [loadingStokTujuan, setLoadingStokTujuan] = useState(false);
  const [errorStokTujuan, setErrorStokTujuan] = useState("");

  // State validasi, submit & reset modal
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Ambil identitas petugas dari API/session
  useEffect(() => {
    const controller = new AbortController();

    apiRequest("/auth/me", { signal: controller.signal })
      .then((res) => {
        const user = res?.data?.user ?? res?.user ?? res?.data ?? res;

        if (!controller.signal.aborted) {
          setPetugas(user?.nama ? user : getUser());
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPetugas(getUser());
        }
      });

    return () => controller.abort();
  }, []);

  // Muat daftar barang & lokasi dari backend
  useEffect(() => {
    const controller = new AbortController();

    async function loadMasterData() {
      setLoadingMaster(true);
      setMasterError("");
      setLokasiAsalOptions([]);
      setErrorLokasiAsal("");

      try {
        const [barangData, lokasiData] = await Promise.all([
          getDaftarBarang(controller.signal),
          getDaftarLokasi(controller.signal),
        ]);

        if (!controller.signal.aborted) {
          setBarangOptions(barangData);
          setLokasiOptions(lokasiData);
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setMasterError(
            formatApiErrorMessage(
              err,
              "Gagal memuat daftar barang dan lokasi dari server."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingMaster(false);
        }
      }
    }

    loadMasterData();

    return () => controller.abort();
  }, [reloadMasterKey]);

  // Ambil lokasi yang memiliki stok dari barang terpilih
  useEffect(() => {
    if (!idBarang) {
      setLokasiAsalOptions([]);
      setLoadingLokasiAsal(false);
      setErrorLokasiAsal("");
      return;
    }

    if (loadingMaster || masterError) {
      return;
    }

    const controller = new AbortController();

    async function loadLokasiAsal() {
      setLoadingLokasiAsal(true);
      setErrorLokasiAsal("");
      setLokasiAsalOptions([]);

      try {
        const data = await getLokasiAsalDenganStok(
          idBarang,
          lokasiOptions,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setLokasiAsalOptions(data);
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setLokasiAsalOptions([]);
          setErrorLokasiAsal(
            formatApiErrorMessage(
              err,
              "Gagal memuat lokasi yang memiliki stok barang."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLokasiAsal(false);
        }
      }
    }

    loadLokasiAsal();

    return () => controller.abort();
  }, [idBarang, lokasiOptions, loadingMaster, masterError]);

  const selectedBarang = useMemo(
    () =>
      barangOptions.find(
        (item) => String(item.id_barang) === String(idBarang)
      ) || null,
    [barangOptions, idBarang]
  );

  const selectedLokasiAsal = useMemo(
    () =>
      lokasiOptions.find(
        (item) => String(item.id) === String(idLokasiAsal)
      ) || null,
    [lokasiOptions, idLokasiAsal]
  );

  const selectedLokasiTujuan = useMemo(
    () =>
      lokasiOptions.find(
        (item) => String(item.id) === String(idLokasiTujuan)
      ) || null,
    [lokasiOptions, idLokasiTujuan]
  );

  const lokasiSama = Boolean(
    idLokasiAsal &&
      idLokasiTujuan &&
      String(idLokasiAsal) === String(idLokasiTujuan)
  );

  // Aturan bisnis checkbox tidak layak pakai
  const checkboxBerlaku = useMemo(
    () =>
      isCheckboxTidakLayakBerlaku(
        selectedLokasiTujuan?.nama_lokasi,
        alasan
      ),
    [selectedLokasiTujuan, alasan]
  );

  // Ambil kelompok stok lokasi asal
  useEffect(() => {
    if (!idBarang || !idLokasiAsal) {
      setStokAsalList([]);
      setLoadingStokAsal(false);
      setErrorStokAsal("");
      return;
    }

    const controller = new AbortController();

    async function loadStokAsal() {
      setLoadingStokAsal(true);
      setErrorStokAsal("");

      try {
        const data = await getStokPerpindahan(
          idBarang,
          idLokasiAsal,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setStokAsalList(data);
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setStokAsalList([]);
          setErrorStokAsal(
            formatApiErrorMessage(err, "Gagal mengambil stok lokasi asal.")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStokAsal(false);
        }
      }
    }

    loadStokAsal();

    return () => controller.abort();
  }, [idBarang, idLokasiAsal, retryStokAsalKey]);

  // Ambil kelompok stok lokasi tujuan
  useEffect(() => {
    if (!idBarang || !idLokasiTujuan || lokasiSama) {
      setStokTujuanList([]);
      setLoadingStokTujuan(false);
      setErrorStokTujuan("");
      return;
    }

    const controller = new AbortController();

    async function loadStokTujuan() {
      setLoadingStokTujuan(true);
      setErrorStokTujuan("");

      try {
        const data = await getStokPerpindahan(
          idBarang,
          idLokasiTujuan,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setStokTujuanList(data);
        }
      } catch (err) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setStokTujuanList([]);
          setErrorStokTujuan(
            formatApiErrorMessage(err, "Gagal mengambil stok lokasi tujuan.")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStokTujuan(false);
        }
      }
    }

    loadStokTujuan();

    return () => controller.abort();
  }, [idBarang, idLokasiTujuan, lokasiSama]);

  const effectiveStokAsalList = useMemo(
    () => (idBarang && idLokasiAsal ? stokAsalList : []),
    [idBarang, idLokasiAsal, stokAsalList]
  );

  const effectiveStokTujuanList = useMemo(
    () =>
      idBarang && idLokasiTujuan && !lokasiSama ? stokTujuanList : [],
    [idBarang, idLokasiTujuan, lokasiSama, stokTujuanList]
  );

  // Hitung pratinjau dampak stok
  const pratinjauDampak = useMemo(() => {
    if (!idBarang || !idLokasiAsal || !idLokasiTujuan || lokasiSama) {
      return null;
    }

    return hitungPratinjauDampakStok({
      stokAsalList: effectiveStokAsalList,
      stokTujuanList: effectiveStokTujuanList,
      jumlahPerStok,
      idLokasiTujuan,
      tandaiTidakLayak: checkboxBerlaku ? tandaiTidakLayak : false,
    });
  }, [
    idBarang,
    idLokasiAsal,
    idLokasiTujuan,
    lokasiSama,
    effectiveStokAsalList,
    effectiveStokTujuanList,
    jumlahPerStok,
    checkboxBerlaku,
    tandaiTidakLayak,
  ]);

  const totalDipilih = useMemo(
    () =>
      effectiveStokAsalList.reduce(
        (sum, stok) => sum + Number(jumlahPerStok[stok.id_stok] || 0),
        0
      ),
    [effectiveStokAsalList, jumlahPerStok]
  );

  const handleJumlahChange = useCallback((idStok, qty) => {
    setJumlahPerStok((prev) => ({
      ...prev,
      [idStok]: qty,
    }));

    setFieldErrors((prev) => {
      if (!prev.rincianStok) return prev;

      const next = { ...prev };
      delete next.rincianStok;

      return next;
    });
  }, []);

  const clearFieldError = useCallback((key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];

      return next;
    });
  }, []);

  // Validasi formulir
  function validateForm() {
    const errors = {};

    if (!idBarang) {
      errors.idBarang = "Silakan pilih barang yang akan dipindahkan.";
    }

    if (
      !tanggalPerpindahan ||
      !/^\d{4}-\d{2}-\d{2}$/.test(tanggalPerpindahan)
    ) {
      errors.tanggalPerpindahan = "Tanggal perpindahan wajib diisi.";
    }

    if (!idLokasiAsal) {
      errors.idLokasiAsal = "Lokasi asal wajib dipilih.";
    }

    if (!idLokasiTujuan) {
      errors.idLokasiTujuan = "Lokasi tujuan wajib dipilih.";
    } else if (lokasiSama) {
      errors.idLokasiTujuan =
        "Lokasi tujuan tidak boleh sama dengan lokasi asal.";
    }

    if (!alasan) {
      errors.alasan = "Silakan pilih alasan perpindahan.";
    }

    // Validasi kelompok stok (manual, tanpa FIFO)
    const rincianTerpilih = [];

    for (const stok of effectiveStokAsalList) {
      const qty = Number(jumlahPerStok[stok.id_stok] || 0);

      if (qty < 0 || !Number.isInteger(qty)) {
        errors.rincianStok =
          "Jumlah unit harus berupa bilangan bulat positif.";
        break;
      }

      if (qty > Number(stok.jumlah)) {
        errors.rincianStok = `Jumlah untuk stok tahun ${stok.tahun_pengadaan} melebihi stok tersedia (${stok.jumlah} unit).`;
        break;
      }

      if (qty > 0) {
        rincianTerpilih.push({
          id_stok: Number(stok.id_stok),
          jumlah: qty,
        });
      }
    }

    if (!errors.rincianStok && rincianTerpilih.length === 0) {
      errors.rincianStok =
        "Pilih minimal satu kelompok stok dengan jumlah perpindahan lebih dari 0.";
    }

    // Validasi keterangan
    const keteranganTrim = keterangan.trim();

    if (keteranganTrim.length > 500) {
      errors.keterangan = "Keterangan maksimal 500 karakter.";
    } else if (alasan === "lainnya" && keteranganTrim.length < 5) {
      errors.keterangan =
        "Keterangan wajib diisi minimal 5 karakter untuk alasan Lainnya.";
    }

    setFieldErrors(errors);

    return {
      isValid: Object.keys(errors).length === 0,
      rincianTerpilih,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitError("");

    const { isValid, rincianTerpilih } = validateForm();

    if (!isValid) {
      return;
    }

    const effectiveTandaiTidakLayak = checkboxBerlaku
      ? Boolean(tandaiTidakLayak)
      : false;

    const payload = {
      id_barang: Number(idBarang),
      tanggal_perpindahan: tanggalPerpindahan,
      id_lokasi_asal: Number(idLokasiAsal),
      id_lokasi_tujuan: Number(idLokasiTujuan),
      rincian_stok: rincianTerpilih,
      alasan,
      keterangan: keterangan.trim() || null,
      tandai_tidak_layak: effectiveTandaiTidakLayak,
    };

    setSubmitting(true);

    try {
      const response = await createPerpindahanAset(payload);
      const nomorMutasi = response?.data?.nomor_mutasi || "";

      const targetUrl = nomorMutasi
        ? `/perpindahan-aset?created=${encodeURIComponent(nomorMutasi)}`
        : "/perpindahan-aset";

      router.push(targetUrl);
    } catch (err) {
      setSubmitError(
        formatApiErrorMessage(
          err,
          "Gagal menyimpan transaksi perpindahan aset."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isFormDirty = Boolean(
    idBarang ||
      idLokasiAsal ||
      idLokasiTujuan ||
      alasan ||
      keterangan.trim() ||
      totalDipilih > 0 ||
      tandaiTidakLayak ||
      tanggalPerpindahan !== getTodayJakartaYMD()
  );

  const performReset = useCallback(() => {
    setIdBarang("");
    setTanggalPerpindahan(getTodayJakartaYMD());
    setIdLokasiAsal("");
    setIdLokasiTujuan("");
    setLokasiAsalOptions([]);
    setLoadingLokasiAsal(false);
    setErrorLokasiAsal("");
    setStokAsalList([]);
    setStokTujuanList([]);
    setJumlahPerStok({});
    setAlasan("");
    setTandaiTidakLayak(false);
    setKeterangan("");
    setFieldErrors({});
    setSubmitError("");
    setErrorStokAsal("");
    setErrorStokTujuan("");
    setConfirmResetOpen(false);
  }, []);

  function handleRequestReset() {
    if (submitting) return;

    if (isFormDirty) {
      setConfirmResetOpen(true);
    } else {
      performReset();
    }
  }

  const namaPetugas = petugas?.nama || "Memuat identitas petugas...";

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1160px] px-4 py-6 md:px-8 md:py-7">
        {/* Tombol Kembali ke Riwayat Perpindahan */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.push("/perpindahan-aset")}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Kembali ke Riwayat Perpindahan Aset
          </button>
        </div>

        {/* Error memuat data master */}
        {masterError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-xs font-bold text-red-800 sm:text-sm">
                    Gagal Memuat Data Barang & Lokasi
                  </p>

                  <p className="mt-0.5 text-xs text-red-600">
                    {masterError}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReloadMasterKey((k) => k + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <RefreshCw size={14} />
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Card Utama Formulir */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {/* Judul Formulir */}
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Catat Perpindahan Baru
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Isi parameter mutasi fisik barang secara presisi.
            </p>
          </div>

          {/* Notifikasi Error Submit */}
          {submitError && (
            <div className="mt-5">
              <AksiNotification
                errorAksi={submitError}
                notifikasi={{
                  pesan: "Transaksi perpindahan gagal disimpan.",
                }}
                onClose={() => setSubmitError("")}
              />
            </div>
          )}

          <div className="mt-6 space-y-6">
            {/* Baris 1: Pilih Barang & Tanggal Perpindahan */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="pilih-barang-trigger"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Pilih Barang <span className="text-red-500">*</span>
                </label>

                <SearchableBarangSelect
                  barangOptions={barangOptions}
                  value={idBarang}
                  loading={loadingMaster}
                  disabled={submitting || Boolean(masterError)}
                  error={fieldErrors.idBarang}
                  onChange={(val) => {
                    setIdBarang(val);

                    // Reset lokasi asal dan rincian stok saat barang berubah
                    setIdLokasiAsal("");
                    setLokasiAsalOptions([]);
                    setLoadingLokasiAsal(Boolean(val));
                    setErrorLokasiAsal("");

                    setJumlahPerStok({});
                    setStokAsalList([]);
                    setStokTujuanList([]);
                    setErrorStokAsal("");
                    setErrorStokTujuan("");

                    clearFieldError("idBarang");
                    clearFieldError("idLokasiAsal");
                    clearFieldError("idLokasiTujuan");
                    clearFieldError("rincianStok");
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="tanggal-perpindahan"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Tanggal Perpindahan{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="tanggal-perpindahan"
                  type="date"
                  value={tanggalPerpindahan}
                  disabled={submitting}
                  onChange={(e) => {
                    setTanggalPerpindahan(e.target.value);
                    clearFieldError("tanggalPerpindahan");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-colors focus:border-blue-500 disabled:bg-slate-50 sm:text-sm"
                />

                {fieldErrors.tanggalPerpindahan && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {fieldErrors.tanggalPerpindahan}
                  </p>
                )}
              </div>
            </div>

            {/* Baris 2: Lokasi Asal & Lokasi Tujuan */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Lokasi Asal */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Lokasi Asal (Sumber Unit){" "}
                  <span className="text-red-500">*</span>
                </label>

                <SearchableLokasiSelect
                  id="lokasi-asal"
                  lokasiOptions={lokasiAsalOptions}
                  value={idLokasiAsal}
                  placeholder={
                    loadingMaster
                      ? "Memuat lokasi..."
                      : !idBarang
                        ? "Pilih barang terlebih dahulu..."
                        : loadingLokasiAsal
                          ? "Mencari lokasi yang memiliki stok..."
                          : "Pilih lokasi asal..."
                  }
                  disabled={
                    loadingMaster ||
                    loadingLokasiAsal ||
                    !idBarang ||
                    submitting ||
                    Boolean(masterError)
                  }
                  error={Boolean(fieldErrors.idLokasiAsal)}
                  emptyMessage={
                    errorLokasiAsal
                      ? "Daftar lokasi gagal dimuat."
                      : "Tidak ada lokasi yang memiliki stok barang ini."
                  }
                  onChange={(value) => {
                    setIdLokasiAsal(value);
                    setJumlahPerStok({});
                    setStokAsalList([]);
                    setErrorStokAsal("");

                    clearFieldError("idLokasiAsal");
                    clearFieldError("idLokasiTujuan");
                    clearFieldError("rincianStok");
                  }}
                />

                {errorLokasiAsal && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {errorLokasiAsal}
                  </p>
                )}

                {fieldErrors.idLokasiAsal && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {fieldErrors.idLokasiAsal}
                  </p>
                )}
              </div>

              {/* Lokasi Tujuan */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Lokasi Tujuan (Penerima Unit){" "}
                  <span className="text-red-500">*</span>
                </label>

                <SearchableLokasiSelect
                  id="lokasi-tujuan"
                  lokasiOptions={lokasiOptions}
                  value={idLokasiTujuan}
                  placeholder={
                    loadingMaster
                      ? "Memuat lokasi..."
                      : "Pilih lokasi tujuan..."
                  }
                  disabled={
                    loadingMaster || submitting || Boolean(masterError)
                  }
                  error={Boolean(lokasiSama || fieldErrors.idLokasiTujuan)}
                  onChange={(nextId) => {
                    const nextLokasi = lokasiOptions.find(
                      (item) => String(item.id) === String(nextId)
                    );

                    setIdLokasiTujuan(nextId);
                    setStokTujuanList([]);
                    setErrorStokTujuan("");

                    if (
                      !isCheckboxTidakLayakBerlaku(
                        nextLokasi?.nama_lokasi,
                        alasan
                      )
                    ) {
                      setTandaiTidakLayak(false);
                    }

                    clearFieldError("idLokasiTujuan");
                  }}
                />

                {(lokasiSama || fieldErrors.idLokasiTujuan) && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {lokasiSama
                      ? "Lokasi tujuan tidak boleh sama dengan lokasi asal."
                      : fieldErrors.idLokasiTujuan}
                  </p>
                )}
              </div>
            </div>

            {/* Pemilihan Kelompok Stok & Jumlah Dipindahkan */}
            <div className="space-y-2">
              <PilihKelompokStok
                idBarang={idBarang}
                idLokasiAsal={idLokasiAsal}
                namaLokasiAsal={selectedLokasiAsal?.nama_lokasi}
                stokList={effectiveStokAsalList}
                jumlahPerStok={jumlahPerStok}
                loading={loadingStokAsal}
                error={errorStokAsal}
                disabled={submitting}
                onJumlahChange={handleJumlahChange}
                onRetry={() => setRetryStokAsalKey((k) => k + 1)}
              />

              {fieldErrors.rincianStok && (
                <p className="text-xs font-medium text-red-600">
                  {fieldErrors.rincianStok}
                </p>
              )}
            </div>

            {/* Pratinjau Dampak Stok */}
            <PratinjauDampakStok
              namaBarang={selectedBarang?.nama_barang || ""}
              namaLokasiAsal={selectedLokasiAsal?.nama_lokasi || ""}
              namaLokasiTujuan={selectedLokasiTujuan?.nama_lokasi || ""}
              pratinjau={pratinjauDampak}
              loadingTujuan={loadingStokTujuan}
              errorTujuan={errorStokTujuan}
            />

            {/* Alasan Perpindahan */}
            <div>
              <span className="mb-2 block text-xs font-bold text-slate-700">
                Alasan Perpindahan{" "}
                <span className="text-red-500">*</span>
              </span>

              <div className="flex flex-wrap gap-2">
                {OPSI_ALASAN_PERPINDAHAN.map((opsi) => {
                  const isActive = alasan === opsi.value;

                  return (
                    <button
                      key={opsi.value}
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setAlasan(opsi.value);

                        if (
                          !isCheckboxTidakLayakBerlaku(
                            selectedLokasiTujuan?.nama_lokasi,
                            opsi.value
                          )
                        ) {
                          setTandaiTidakLayak(false);
                        }

                        clearFieldError("alasan");
                        clearFieldError("keterangan");
                      }}
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                      } disabled:opacity-60`}
                    >
                      {opsi.label}
                    </button>
                  );
                })}
              </div>

              {fieldErrors.alasan && (
                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                  {fieldErrors.alasan}
                </p>
              )}
            </div>

            {/* Checkbox Kondisional */}
            {checkboxBerlaku && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={tandaiTidakLayak}
                      disabled={submitting}
                      onChange={(e) =>
                        setTandaiTidakLayak(e.target.checked)
                      }
                      className="peer sr-only"
                    />

                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white transition-colors peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300">
                      {tandaiTidakLayak && (
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="text-white"
                        />
                      )}
                    </span>
                  </span>

                  <span className="text-xs leading-5">
                    <span className="font-bold text-slate-800">
                      Tandai unit yang dipindahkan sebagai tidak layak pakai
                    </span>

                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      Jika dicentang, unit yang dipindahkan ke Gudang akan
                      berstatus nonaktif di lokasi tujuan tanpa mengubah status
                      sisa stok di lokasi asal.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {/* Keterangan */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="keterangan-perpindahan"
                  className="text-xs font-bold text-slate-700"
                >
                  Keterangan :{" "}
                  {alasan === "lainnya" ? (
                    <span className="font-semibold text-red-600">
                      (Wajib diisi, minimal 5 karakter)
                    </span>
                  ) : (
                    <span className="font-normal text-slate-400">
                      (Opsional)
                    </span>
                  )}
                </label>

                <span className="text-[11px] text-slate-400">
                  {keterangan.trim().length}/500
                </span>
              </div>

              <textarea
                id="keterangan-perpindahan"
                rows={3}
                maxLength={500}
                disabled={submitting}
                value={keterangan}
                onChange={(e) => {
                  setKeterangan(e.target.value);
                  clearFieldError("keterangan");
                }}
                placeholder={
                  alasan === "lainnya"
                    ? "Tuliskan alasan atau catatan detail perpindahan (minimal 5 karakter)..."
                    : "Tambahkan catatan kondisi atau keterangan perpindahan bila diperlukan..."
                }
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 disabled:bg-slate-50 sm:text-sm ${
                  fieldErrors.keterangan
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
              />

              {fieldErrors.keterangan && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors.keterangan}
                </p>
              )}
            </div>

            {/* Informasi Petugas */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {namaPetugas.charAt(0).toUpperCase()}
              </div>

              <p className="text-xs text-slate-600">
                Petugas:{" "}
                <span className="font-bold text-slate-900">
                  {namaPetugas}
                </span>
              </p>
            </div>

            {/* Peringatan Audit */}
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <p className="leading-5">
                Perpindahan yang sudah disimpan tidak dapat diubah atau
                dihapus. Pastikan fisik barang telah dicek dan informasi telah
                sesuai.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2.5 pt-1">
              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingMaster ||
                  loadingLokasiAsal ||
                  Boolean(masterError)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                {submitting && (
                  <Loader2 size={16} className="animate-spin" />
                )}

                {submitting ? "Menyimpan Perpindahan..." : "Simpan"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleRequestReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                <RotateCcw size={14} />
                Reset Form
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Dialog Konfirmasi Reset Form */}
      {confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2
              id="reset-dialog-title"
              className="text-base font-bold text-slate-900"
            >
              Reset Formulir Perpindahan?
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Seluruh pilihan barang, lokasi, kelompok stok, alasan, dan
              keterangan yang sudah diisi akan dikosongkan.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={performReset}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Ya, Reset Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}