import { useMemo, useState } from 'react';

export function useSortableData(rows, defaultKey = null) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [direction, setDirection] = useState('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return direction === 'asc' ? av - bv : bv - av;
      return direction === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sortKey, direction]);

  function requestSort(key) {
    if (sortKey === key) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  }

  return { sorted, sortKey, direction, requestSort };
}
