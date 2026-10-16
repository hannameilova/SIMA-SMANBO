"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/api";
import { isAuthenticated, isRemembered, saveSession } from "@/lib/auth";

const FEATURES = [
  {
    title: "Stok Opname Digital",
    description: "Catat data opname fisik per ruangan & stok langsung tervalidasi.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
        <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Riwayat Aktivitas",
    description: "Telusuri perubahan data dan aktivitas inventaris yang tercatat.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Perpindahan dan Sirkulasi Aset",
    description: "Catat perpindahan, peminjaman, dan pengembalian barang dalam satu sistem.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 7h10l3 4v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
        <path d="M7 7V5a1 1 0 0 1 1-1h5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRememberDevice(isRemembered());

    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const trimmedNip = nip.trim();

    if (!trimmedNip || !password) {
      setErrorMessage("NIP dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginRequest(trimmedNip, password);
      saveSession(
        {
          token: result.token,
          user: result.user,
        },
        rememberDevice
      );
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(error.message || "Login tidak berhasil.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleForgotPassword() {
    setInfoMessage(
      "Reset kata sandi belum tersedia di sistem. Hubungi admin Sarpras untuk bantuan akun."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8eef8] px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-[0_24px_60px_rgba(37,99,235,0.12)] md:grid-cols-2">
        <aside className="relative hidden bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#312e81] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_45%)]" />
          <div className="relative z-10">
            <h1 className="max-w-sm text-4xl font-extrabold leading-tight tracking-tight">
              Kelola Inventaris Sekolah Lebih Mudah dan Terpusat.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">
              Platform terpadu untuk mengelola data inventaris, stok opname,
              perpindahan aset, serta peminjaman dan pengembalian barang sekolah.
            </p>
          </div>

          <ul className="relative z-10 mt-10 space-y-3">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  {feature.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-blue-100">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6 flex flex-col items-center text-center">
              <Image
                src="/logoSMANBO.png"
                alt="Lambang SMA Negeri 1 Bojonggede"
                width={86}
                height={86}
                priority
              />
              <h2 className="mt-4 text-lg font-bold text-[#1d4ed8]">
                Sistem Manajemen Inventaris (SIMA)
              </h2>
              <p className="text-sm font-semibold text-slate-700">
                SMA Negeri 1 Bojonggede
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Masuk ke Akun Anda</h3>
              <p className="mt-1 text-sm text-slate-500">
                Silakan masuk menggunakan username terdaftar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label
                  htmlFor="nip"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  Username Pegawai / NIP
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="3.2" />
                      <path d="M5.5 19c1.2-3.2 3.6-4.8 6.5-4.8S17.8 15.8 19 19" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="nip"
                    name="nip"
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    value={nip}
                    onChange={(event) => setNip(event.target.value)}
                    placeholder="Masukkan Nomor Induk Pegawai"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-[#2563eb] hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-11 text-sm text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3l18 18" strokeLinecap="round" />
                        <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6M9.9 5.1A10.8 10.8 0 0 1 12 5c5.2 0 9.5 3.4 11 8-.4 1.3-1.1 2.5-2 3.5M6.1 6.1C4.1 7.5 2.6 9.6 2 13c1.5 4.6 5.8 8 11 8 1.4 0 2.8-.2 4-.7" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#2563eb]"
                />
                Ingat perangkat ini
              </label>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              {infoMessage ? (
                <p className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  {infoMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-[#2563eb] py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Memproses..." : "Masuk ke SIM Sarpras →"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
