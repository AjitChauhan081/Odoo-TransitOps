import { Inbox } from 'lucide-react';

export function EmptyState({ message = 'No records found.', hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox size={28} strokeWidth={1.25} className="text-ink-soft" />
      <p className="font-mono text-[12px] text-ink-soft">{message}</p>
      {hint && <p className="font-mono text-[11px] text-ink-soft opacity-70">{hint}</p>}
    </div>
  );
}
