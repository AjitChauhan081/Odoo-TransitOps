import { AlertTriangle } from 'lucide-react';

// Permanent, inline business-rule constraint annotation (§7). Distinct from NotificationCenter (§9.21).
export function RuleCallout({ children, className = '' }) {
  return (
    <div className={`flex items-start gap-2 border border-status-danger bg-paper px-3 py-2.5 rounded-sm ${className}`}>
      <AlertTriangle size={16} strokeWidth={1.5} className="text-status-danger flex-shrink-0 mt-0.5" />
      <p className="font-mono text-[12px] text-status-danger leading-snug">{children}</p>
    </div>
  );
}
