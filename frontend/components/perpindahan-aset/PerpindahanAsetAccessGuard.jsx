"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { clearSession } from "@/lib/auth";

export default function PerpindahanAsetAccessGuard({ children }) {
  const router = useRouter();
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

        const role = String(user?.role ?? "").trim().toLowerCase();
        const isWakasekSarpras = role === "wakasek sarpras";

        setAccess(isWakasekSarpras ? "allowed" : "denied");
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err?.status === 401) {
          clearSession();
          setAccess("unauthorized");
          return;
        }

        if (err?.status === 403) {
          setAccess("denied");
          return;
        }

        setAccess("unverified");
      }
    }

    checkAccess();

    return () => controller.abort();
  }, []);

  if (access === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Memeriksa hak akses...</p>
      </div>
    );
  }

  if (access === "unauthorized" || access === "unverified") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p role="alert" className="text-sm font-medium text-slate-700">
            {access === "unauthorized"
              ? "Sesi login Anda telah berakhir atau token tidak valid. Silakan login kembali."
              : "Sesi tidak dapat diverifikasi. Pastikan koneksi ke server tersedia."}
          </p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <LogIn size={15} />
            Ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert size={22} />
          </div>
          <p role="alert" className="text-sm font-semibold text-red-700">
            Anda tidak memiliki akses ke modul Perpindahan Aset.
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Fitur ini hanya dapat diakses oleh pengguna dengan peran Wakasek
            Sarpras.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
