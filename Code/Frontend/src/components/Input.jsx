export function Input({ label, required, optional, error, success, warning, hint, className = '', ...props }) {
  const stateBorder = error
    ? 'border-status-danger'
    : success
    ? 'border-status-available'
    : warning
    ? 'border-status-warn'
    : 'border-line focus:border-ink';
  return (
    <label className="block">
      {label && (
        <span className="micro-label block mb-1">
          {label}
          {required && <span className="text-status-danger ml-1">*</span>}
          {optional && <span className="text-ink-soft ml-1 normal-case">(optional)</span>}
        </span>
      )}
      <input
        className={`w-full h-10 px-3 bg-paper-dim font-mono text-[13px] border rounded-sm outline-none ${stateBorder} ${className}`}
        {...props}
      />
      {hint && !error && <span className="block mt-1 text-[11px] text-ink-soft">{hint}</span>}
      {error && <span className="block mt-1 text-[11px] text-status-danger">{error}</span>}
    </label>
  );
}
