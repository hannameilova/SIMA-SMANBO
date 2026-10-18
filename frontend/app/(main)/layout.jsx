"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, getUser, clearSession } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  ArrowLeftRight,
  Handshake,
  History,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAVIGASI = [
  {
    judul: "MENU UTAMA",
    menu: [
      {
        nama: "Dashboard",
        url: "/dashboard",
        ikon: LayoutDashboard,
      },
      {
        nama: "Master Inventaris",
        url: "/master-inventaris",
        ikon: Package,
      },
    ],
  },
  {
    judul: "OPERASIONAL & LOGISTIK",
    menu: [
      {
        nama: "Stok Opname",
        url: "/stok-opname",
        ikon: ClipboardCheck,
      },
      {
        nama: "Perpindahan Aset",
        url: "/perpindahan-aset",
        ikon: ArrowLeftRight,
      },
      {
        nama: "Peminjaman",
        url: "/peminjaman",
        ikon: Handshake,
      },
    ],
  },
  {
    judul: "LAPORAN & KEAMANAN",
    menu: [
      {
        nama: "Riwayat Aktivitas",
        url: "/riwayat-aktivitas",
        ikon: History,
      },
      {
        nama: "Kelola Pengguna",
        url: "/kelola-pengguna",
        ikon: Users,
      },
    ],
  },
];

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated()) {
      router.replace("/login");
      setReady(true);
      return;
    }

    setUser(getUser());
    setReady(true);
  }, [router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  if (!mounted || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memeriksa sesi login...
      </div>
    );
  }

  if (!isAuthenticated()) return null;

  const namaUser = user?.nama || "Pengguna SIMA";
  const roleUser = user?.role || "Tim Inventaris";

  function renderNavigasi() {
    return NAVIGASI.map((grup) => (
      <div key={grup.judul}>
        <p className="mb-3 px-3 text-[9px] font-bold tracking-widest text-slate-400">
          {grup.judul}
        </p>

        <div className="space-y-1">
          {grup.menu.map((menu) => {
            const aktif =
              pathname === menu.url || pathname.startsWith(`${menu.url}/`);

            const Ikon = menu.ikon;

            return (
              <Link
                key={menu.url}
                href={menu.url}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-xs font-medium transition-colors ${
                  aktif
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Ikon size={18} strokeWidth={1.8} />
                <span>{menu.nama}</span>

                {aktif && <span className="ml-auto text-blue-100">●</span>}
              </Link>
            );
          })}
        </div>
      </div>
    ));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">

        {/* LOGO DI SIDEBAR */}
        <Link
          href="/dashboard"
          className="flex h-[88px] shrink-0 items-center gap-3 border-b border-slate-100 px-5"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo SIMA SMAN 1 Bojonggede"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-blue-700">
              SIMA SMAN 1 BJGD
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Sistem Manajemen Aset
            </p>
          </div>
        </Link>

          <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
            {renderNavigasi()}
          </nav>

          <div className="shrink-0 border-t border-slate-100 p-4 text-[10px] text-slate-400">
            SIMA SMAN 1 Bojonggede · Inventaris
          </div>
        </aside>

        {/* AREA KANAN */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* HEADER */}
          <header className="sticky top-0 z-30 flex min-h-[88px] shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((value) => !value)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* PROFIL*/}
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
                aria-label="Buka profil pengguna"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {namaUser.charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-semibold">{namaUser}</p>

                  <p className="mt-1 text-[10px] font-medium text-[#004AC6]">
                    {roleUser}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Keluar"
                aria-label="Keluar dari akun"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* MENU MOBILE */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 top-[88px] z-40 bg-black/20 lg:hidden">
              <div className="flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white">
                <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
                  {renderNavigasi()}
                </nav>

                <div className="border-t border-slate-100 p-4 text-[10px] text-slate-400">
                  SIMA SMAN 1 Bojonggede · Inventaris
                </div>
              </div>

              <button
                type="button"
                className="absolute inset-0 -z-10 cursor-default"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu navigasi"
              />
            </div>
          )}

          {/* KONTEN HALAMAN */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
