"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSesiStokOpname,
  getLokasiStokOpname,
} from "@/lib/stok-opname/api";
import { normalisasiLokasiOpname } from "@/lib/stok-opname/utils";

export function useLokasiOpname() {
  const [rawLokasi, setRawLokasi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedGedung, setSelectedGedung] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Mengambil daftar ruangan dari backend
  useEffect(() => {
    const controller = new AbortController();

    async function muatLokasi() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getLokasiStokOpname({}, controller.signal);

        if (!controller.signal.aborted) {
          setRawLokasi(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (controller.signal.aborted || err?.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Daftar ruangan gagal dimuat."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    muatLokasi();

    return () => controller.abort();
  }, [reloadKey]);

  // Normalisasi data lokasi sekaligus mempertahankan ID sesi opname
  const lokasi = useMemo(
    () =>
      rawLokasi.map((item) => {
        const hasilNormalisasi = normalisasiLokasiOpname(item);

        return {
          ...hasilNormalisasi,
          idOpname:
            item.idOpname ??
            item.id_opname ??
            hasilNormalisasi.idOpname ??
            hasilNormalisasi.id_opname ??
            null,
        };
      }),
    [rawLokasi]
  );

  // Daftar pilihan gedung
  const gedungOptions = useMemo(() => {
    const setGedung = new Set();

    for (const item of lokasi) {
      if (item.gedung) {
        setGedung.add(item.gedung);
      }
    }

    return Array.from(setGedung).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [lokasi]);

  // Daftar pilihan kategori
  const kategoriOptions = useMemo(() => {
    const setKategori = new Set();

    for (const item of lokasi) {
      if (
        item.kategoriLabel &&
        item.kategoriLabel !== "Tanpa Kategori"
      ) {
        setKategori.add(item.kategoriLabel);
      }
    }

    return Array.from(setKategori).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [lokasi]);

  // Filter ruangan berdasarkan gedung, kategori, dan pencarian
  const baseFilteredLokasi = useMemo(() => {
    const kataKunci = search.trim().toLowerCase();

    return lokasi.filter((item) => {
      if (selectedGedung && item.gedung !== selectedGedung) {
        return false;
      }

      if (
        selectedKategori &&
        item.kategoriLabel !== selectedKategori
      ) {
        return false;
      }

      if (!kataKunci) return true;

      const teks = [
        item.namaLokasi,
        item.judulTampil,
        item.gedung,
        item.kategoriLabel,
        item.penanggungJawab,
      ]
        .join(" ")
        .toLowerCase();

      return teks.includes(kataKunci);
    });
  }, [lokasi, search, selectedGedung, selectedKategori]);

  // Menghitung jumlah ruangan berdasarkan status
  const counts = useMemo(() => {
    const hasil = {
      semua: baseFilteredLokasi.length,
      belum_diperiksa: 0,
      sedang_berlangsung: 0,
      selesai_opname: 0,
    };

    for (const item of baseFilteredLokasi) {
      if (item.status === "belum_diperiksa") {
        hasil.belum_diperiksa += 1;
      } else if (item.status === "sedang_berlangsung") {
        hasil.sedang_berlangsung += 1;
      } else if (item.status === "selesai_opname") {
        hasil.selesai_opname += 1;
      }
    }

    return hasil;
  }, [baseFilteredLokasi]);

  const filteredLokasi = useMemo(() => {
    if (activeTab === "semua") {
      return baseFilteredLokasi;
    }

    return baseFilteredLokasi.filter(
      (item) => item.status === activeTab
    );
  }, [activeTab, baseFilteredLokasi]);

  // Mengambil ruangan yang sedang dipilih
  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;

    return (
      lokasi.find((item) => item.id === selectedRoomId) ?? null
    );
  }, [lokasi, selectedRoomId]);

  // Memilih ruangan
  const selectRoom = useCallback((room) => {
    if (!room) return;

    const bisaDipilih = [
      "belum_diperiksa",
      "sedang_berlangsung",
      "selesai_opname",
    ].includes(room.status);

    if (!bisaDipilih) return;

    setActionError("");
    setSelectedRoomId(room.id);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSelectedGedung("");
    setSelectedKategori("");
    setActiveTab("semua");
  }, []);

  const refresh = useCallback(() => {
    setReloadKey((nilai) => nilai + 1);
  }, []);

  const clearActionError = useCallback(() => {
    setActionError("");
  }, []);

  // Membuat sesi opname baru atau menangani sesi yang masih berlangsung
  const startOpnameSession = useCallback(
    async (idLokasiOverride) => {
      const targetId = idLokasiOverride ?? selectedRoom?.id;

      if (!targetId) {
        setActionError("Pilih ruangan terlebih dahulu.");

        return {
          idOpname: null,
          melanjutkanSesi: false,
        };
      }

      setIsCreatingSession(true);
      setActionError("");

      // Memperbarui status ruangan setelah sesi dibuat
      const perbaruiStatusRuangan = (idOpname) => {
        setRawLokasi((prev) =>
          prev.map((item) =>
            Number(item.id ?? item.id_lokasi) === Number(targetId)
              ? {
                  ...item,
                  status_opname: "berlangsung",
                  id_opname: idOpname,
                }
              : item
          )
        );
      };

      try {
        const sesi = await createSesiStokOpname(targetId);
        const idOpname = Number(sesi?.id_opname);

        if (!Number.isSafeInteger(idOpname) || idOpname <= 0) {
          throw new Error(
            "Sesi stok opname berhasil dibuat tanpa ID sesi."
          );
        }

        perbaruiStatusRuangan(idOpname);
        setSelectedRoomId(null);

        return {
          idOpname,
          melanjutkanSesi: false,
        };
      } catch (err) {
        // Jika masih ada sesi aktif, gunakan sesi tersebut
        if (err?.status === 409) {
          const idAktif = Number(err?.data?.id_opname);

          if (Number.isSafeInteger(idAktif) && idAktif > 0) {
            perbaruiStatusRuangan(idAktif);

            return {
              idOpname: idAktif,
              melanjutkanSesi: true,
            };
          }
        }

        setActionError(
          err instanceof Error
            ? err.message
            : "Sesi stok opname gagal dibuat."
        );

        return {
          idOpname: null,
          melanjutkanSesi: false,
        };
      } finally {
        setIsCreatingSession(false);
      }
    },
    [selectedRoom]
  );

  const hasActiveFilters = Boolean(
    search.trim() ||
      selectedGedung ||
      selectedKategori ||
      activeTab !== "semua"
  );

  return {
    lokasi,
    filteredLokasi,
    gedungOptions,
    kategoriOptions,
    counts,
    isLoading,
    isEmpty: !isLoading && !error && lokasi.length === 0,
    hasActiveFilters,
    error,
    actionError,
    isCreatingSession,
    search,
    selectedGedung,
    selectedKategori,
    activeTab,
    selectedRoom,
    setSearch,
    setSelectedGedung,
    setSelectedKategori,
    setActiveTab,
    selectRoom,
    resetFilters,
    refresh,
    clearActionError,
    setActionError,
    startOpnameSession,
  };
}