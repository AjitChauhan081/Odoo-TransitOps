import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 mt-1 border-t border-line">
      <span className="font-mono text-[11px] text-ink-soft">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center border border-line rounded-sm disabled:opacity-30 hover:border-ink"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center border border-line rounded-sm disabled:opacity-30 hover:border-ink"
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
