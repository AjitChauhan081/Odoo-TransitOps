export function Select({ label, required, error, options = [], placeholder = 'Select...', className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="micro-label block mb-1">
          {label}{required && <span className="text-status-danger ml-1">*</span>}
        </span>
      )}
      <select
        className={`w-full h-10 px-3 bg-paper-dim font-mono text-[13px] border rounded-sm outline-none appearance-none ${error ? 'border-status-danger' : 'border-line focus:border-ink'} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <span className="block mt-1 text-[11px] text-status-danger">{error}</span>}
    </label>
  );
}
