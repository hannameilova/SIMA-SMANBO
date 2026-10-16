"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { clearSession, getToken, getUser } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Memuat dashboard...");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    async function validateSession() {
      try {
        const result = await getCurrentUser(token);
        if (result.user) {
          setUser((current) => ({
            ...current,
            ...result.user,
          }));
        }
        setStatusMessage("");
      } catch (error) {
        clearSession();
        router.replace("/login");
        setStatusMessage(error.message);
      }
    }

    validateSession();
  }, [router]);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3fb] text-slate-500">
        {statusMessage}
      </main>
    );
  }

  const roleLabel = user.role === "tu" ? "Tata Usaha" : "Wakasek Sarpras";

  return (
    <main className="min-h-screen bg-[#eef3fb] px-4 py-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#2563eb]">Dashboard SIMA</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Selamat datang, {user.nama || "Pengguna"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Anda masuk sebagai {roleLabel}. Ringkasan inventaris akan tampil di
              halaman ini setelah modul dashboard terhubung ke data sistem.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Keluar
          </button>
        </div>
      </div>
    </main>
  );
}
