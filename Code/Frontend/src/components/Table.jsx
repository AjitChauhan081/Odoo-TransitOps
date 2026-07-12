import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useSortableData } from '../hooks/useSortableData';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './SkeletonLoader';

/**
 * columns: [{ key, label, align: 'left'|'right', render?: (row) => node, sortable?: boolean }]
 */
export function Table({ columns, rows, loading, emptyMessage = 'No records found.', pageSize = 8, stickyFirstColumn = true }) {
  const { sorted, sortKey, direction, requestSort } = useSortableData(rows);
  const { page, setPage, totalPages, pageRows } = usePagination(sorted, pageSize);

  if (loading) return <TableSkeleton cols={columns.length} />;
  if (!rows || rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px] font-mono min-w-[640px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-paper-dim border-b border-line">
              {columns.map((col, ci) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 micro-label !font-mono whitespace-nowrap select-none ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${stickyFirstColumn && ci === 0 ? 'sticky left-0 bg-paper-dim z-20' : ''} ${
                    col.sortable !== false ? 'cursor-pointer hover:text-ink' : ''
                  }`}
                  onClick={() => col.sortable !== false && requestSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false &&
                      (sortKey === col.key ? (
                        direction === 'asc' ? <ArrowUp size={11} strokeWidth={1.5} /> : <ArrowDown size={11} strokeWidth={1.5} />
                      ) : (
                        <ArrowUpDown size={11} strokeWidth={1.5} className="opacity-30" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, ri) => (
              <tr key={row.id ?? ri} className="border-b border-line hover:border-l-2 hover:border-l-line-strong">
                {columns.map((col, ci) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 whitespace-nowrap ${col.align === 'right' ? 'text-right' : 'text-left'} ${
                      stickyFirstColumn && ci === 0 ? 'sticky left-0 bg-paper z-10 font-medium' : ''
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
