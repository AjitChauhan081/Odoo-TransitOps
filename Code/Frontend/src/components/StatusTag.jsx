import { STATUS_COLOR } from '../constants/statuses';

export function StatusTag({ status }) {
  const token = STATUS_COLOR[status] || 'status-neutral';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wide text-paper bg-${token}`}
    >
      <span className="w-1.5 h-1.5 bg-paper rounded-full inline-block" />
      {status}
    </span>
  );
}
