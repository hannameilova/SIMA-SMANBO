const GAYA = {
  belum_diperiksa: "border-slate-200 bg-slate-100 text-slate-500",
  sesuai: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ada_temuan: "border-red-200 bg-red-50 text-red-600",
};

export default function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold leading-5 sm:text-[11px] ${GAYA[status]}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
