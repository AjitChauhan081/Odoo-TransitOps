export function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 font-mono text-[12px] cursor-pointer select-none">
      <input type="checkbox" className="w-4 h-4 accent-ink rounded-none border border-line" {...props} />
      {label}
    </label>
  );
}
