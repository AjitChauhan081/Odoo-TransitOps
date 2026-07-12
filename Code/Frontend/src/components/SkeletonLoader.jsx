function Bar({ w = 'w-full', h = 'h-3' }) {
  return <div className={`${w} ${h} bg-line animate-pulse rounded-sm`} />;
}

export function KpiSkeleton() {
  return (
    <div className="border border-line rounded-sm p-4 flex flex-col gap-3">
      <Bar w="w-16" h="h-2" />
      <Bar w="w-20" h="h-6" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 border-b border-line">
          {Array.from({ length: cols }).map((__, c) => (
            <Bar key={c} w={c === 0 ? 'w-20' : 'w-full'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-56 flex items-end gap-3 px-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-1 bg-line animate-pulse" style={{ height: `${30 + (i % 5) * 12}%` }} />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Bar w="w-24" h="h-2" />
          <Bar w="w-full" h="h-10" />
        </div>
      ))}
    </div>
  );
}
