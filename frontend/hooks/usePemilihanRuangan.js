"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSesiStokOpname,
  getLokasiStokOpname,
} from "@/lib/stok-opname/api";

export function usePemilihanRuangan() {
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorAksi, setErrorAksi] = useState("");
  const [membuatSesi, setMembuatSesi] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function muat() {
      setLoading(true);
      setError("");

      try {
        const data = await getLokasiStokOpname({}, controller.signal);

        if (!controller.signal.aborted) {
          setLokasi(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (controller.signal.aborted || err?.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Daftar ruangan gagal dimuat."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    muat();

    return () => controller.abort();
  }, [reloadKey]);

  const kategoriOptions = useMemo(() => {
    const daftar = new Set();

    for (const item of lokasi) {
      const nilai = item.kategori?.trim();

      if (nilai) daftar.add(nilai);
    }

    return Array.from(daftar).sort((a, b) => a.localeCompare(b, "id"));
  }, [lokasi]);

  const muatUlang = useCallback(() => {
    setReloadKey((nilai) => nilai + 1);
  }, []);

  const bersihkanErrorAksi = useCallback(() => {
    setErrorAksi("");
  }, []);

  /**
   * Membuat sesi untuk ruangan terpilih.
   * Jika backend menjawab 409, artinya ruangan masih punya sesi aktif:
   * frontend diarahkan ke sesi tersebut alih-alih membuat sesi ganda.
   */
  const mulaiPengecekan = useCallback(async (idLokasi) => {
    setMembuatSesi(true);
    setErrorAksi("");

    try {
      const sesi = await createSesiStokOpname(idLokasi);
      const idOpname = Number(sesi?.id_opname);

      if (!Number.isSafeInteger(idOpname) || idOpname <= 0) {
        throw new Error("Sesi stok opname berhasil dibuat tanpa ID sesi.");
      }

      return { idOpname, melanjutkanSesi: false };
    } catch (err) {
      if (err?.status === 409) {
        const idAktif = Number(err?.data?.id_opname);

        if (Number.isSafeInteger(idAktif) && idAktif > 0) {
          return { idOpname: idAktif, melanjutkanSesi: true };
        }
      }

      setErrorAksi(
        err instanceof Error
          ? err.message
          : "Sesi stok opname gagal dibuat."
      );

      return { idOpname: null, melanjutkanSesi: false };
    } finally {
      setMembuatSesi(false);
    }
  }, []);

  return {
    lokasi,
    kategoriOptions,
    loading,
    error,
    errorAksi,
    membuatSesi,
    muatUlang,
    mulaiPengecekan,
    bersihkanErrorAksi,
  };
}
