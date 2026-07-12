import { useMemo, useState } from 'react';

export function usePagination(rows, pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, clampedPage, pageSize]);
  return { page: clampedPage, setPage, totalPages, pageRows };
}
