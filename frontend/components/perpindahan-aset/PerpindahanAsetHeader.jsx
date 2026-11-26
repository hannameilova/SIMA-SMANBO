"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Header halaman untuk modul Perpindahan Aset (breadcrumb, judul, deskripsi, dan aksi kanan).
 */
export default function PerpindahanAsetHeader({
  breadcrumbs = [],
  judul,
  deskripsi,
  aksi = null,
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500"
          >
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;

              return (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  {idx > 0 && (
                    <ChevronRight size={13} className="text-slate-400" />
                  )}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-blue-600"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast ? "font-semibold text-blue-600" : "text-slate-500"
                      }
                    >
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        {judul && (
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
            {judul}
          </h1>
        )}

        {deskripsi && (
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            {deskripsi}
          </p>
        )}
      </div>

      {aksi ? <div className="shrink-0">{aksi}</div> : null}
    </div>
  );
}
