"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function MasterInventarisAccessGuard({ children }) {
  const [access, setAccess] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function checkAccess() {
      try {
        const response = await apiRequest("/auth/me", {
          signal: controller.signal,
        });

        const user =
          response?.data?.user ??
          response?.user ??
          response?.data ??
          response;

        const role = String(user?.role ?? "")
          .trim()
          .toLowerCase();

        const isSarpras = [
          "sarpras",
          "wakasek sarpras",
        ].includes(role);

        setAccess(isSarpras ? "allowed" : "denied");
      } catch {
        if (!controller.signal.aborted) {
          setAccess("unverified");
        }
      }
    }

    checkAccess();

    return () => controller.abort();
  }, []);

  if (access === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Memeriksa hak akses...
        </p>
      </div>
    );
  }

  if (access === "unverified") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p role="alert" className="text-center text-sm text-slate-600">
          Sesi tidak dapat diverifikasi. Silakan login kembali.
        </p>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p
          role="alert"
          className="text-center text-sm font-medium text-red-600"
        >
          Anda tidak memiliki akses ke modul Master Inventaris.
        </p>
      </div>
    );
  }

  return children;
}