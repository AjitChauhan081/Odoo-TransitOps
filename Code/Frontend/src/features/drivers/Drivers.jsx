import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { SearchBar } from '../../components/SearchBar';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { drivers } from '../../data/mockData';
import { formatDate, isExpired } from '../../utils/formatters';
import { DRIVER_STATUSES } from '../../constants/statuses';

export default function Drivers() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => drivers.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.licenseNo.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const columns = [
    { key: 'name', label: 'Driver' },
    { key: 'licenseNo', label: 'License No.' },
    { key: 'category', label: 'Category' },
    {
      key: 'licenseExpiry',
      label: 'Expiry',
      render: (r) => <span className={isExpired(r.licenseExpiry) ? 'text-status-danger' : ''}>{formatDate(r.licenseExpiry)}</span>,
    },
    { key: 'contact', label: 'Contact' },
    { key: 'safetyScore', label: 'Safety Score', align: 'right', render: (r) => `${r.safetyScore}%` },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
  ];

  return (
    <PageShell title="Drivers & Safety Profiles">
      <Panel
        title="Drivers"
        actions={
          <Button variant="primary">
            <Plus size={14} strokeWidth={1.5} /> Add Driver
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Search by name or license no..." onReset={() => setQuery('')} />
          <Table columns={columns} rows={filtered} emptyMessage="No drivers found." />

          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-3">
            <span className="micro-label">Legend:</span>
            {DRIVER_STATUSES.map((s) => (
              <StatusTag key={s} status={s} />
            ))}
          </div>

          <p className="text-[11px] text-ink-soft font-mono border-t border-line pt-3">
            Expired license or Suspended status → blocked from trip assignment.
          </p>
        </div>
      </Panel>
    </PageShell>
  );
}
