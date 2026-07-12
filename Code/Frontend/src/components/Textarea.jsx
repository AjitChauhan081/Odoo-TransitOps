export function Textarea({ label, required, error, rows = 3, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="micro-label block mb-1">
          {label}{required && <span className="text-status-danger ml-1">*</span>}
        </span>
      )}
      <textarea
        rows={rows}
        className={`w-full px-3 py-2 bg-paper-dim font-mono text-[13px] border rounded-sm outline-none ${error ? 'border-status-danger' : 'border-line focus:border-ink'} ${className}`}
        {...props}
      />
      {error && <span className="block mt-1 text-[11px] text-status-danger">{error}</span>}
    </label>
  );
}
