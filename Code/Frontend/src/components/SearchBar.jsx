import { Search, RotateCcw } from 'lucide-react';

// Shared search/filter contract (§9.23): search + arbitrary filter slots + reset.
export function SearchBar({ value, onChange, placeholder = 'Search...', filters, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className="w-full h-10 pl-9 pr-3 bg-paper-dim font-mono text-[13px] border border-line rounded-sm outline-none focus:border-ink"
        />
      </div>
      {filters}
      {onReset && (
        <button
          onClick={onReset}
          className="h-10 px-3 flex items-center gap-1.5 border border-line rounded-sm font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:border-ink hover:text-ink"
        >
          <RotateCcw size={13} strokeWidth={1.5} /> Reset
        </button>
      )}
    </div>
  );
}
