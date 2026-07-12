// Indian numbering (lakh/crore grouping), ledger style — e.g. 6,20,000
export function formatINR(value) {
  const num = Math.round(Number(value) || 0);
  return '₹' + num.toLocaleString('en-IN');
}

export function formatNumber(value) {
  const num = Math.round(Number(value) || 0);
  return num.toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function isExpired(dateStr, referenceDate = new Date('2026-07-12')) {
  const d = new Date(dateStr);
  return d.getTime() < referenceDate.getTime();
}
