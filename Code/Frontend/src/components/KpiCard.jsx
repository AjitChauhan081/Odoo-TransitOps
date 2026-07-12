export function KpiCard({ label, value, underline, suffix = '' }) {
  return (
    <div className="border border-line bg-paper rounded-sm p-4 flex flex-col gap-2 min-w-0">
      <span className="micro-label">{label}</span>
      <span className="font-serif text-[30px] leading-none truncate">{value}{suffix}</span>
      {underline && <span className={`h-[3px] w-10 bg-${underline} inline-block`} />}
    </div>
  );
}
