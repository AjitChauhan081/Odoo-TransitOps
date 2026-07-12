import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { SearchBar } from '../../components/SearchBar';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { useEffect } from 'react';
import { apiFetch } from '../../api/client';
import { formatDate, isExpired } from '../../utils/formatters';
import { DRIVER_STATUSES } from '../../constants/statuses';

export default function Drivers() {
  const [query, setQuery] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/drivers/');
        setDrivers(data);
      } catch (err) {
        console.error("Failed to load drivers", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(
    () => drivers.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.license_number.toLowerCase().includes(query.toLowerCase())),
    [drivers, query]
  );

  const columns = [
    { key: 'name', label: 'Driver' },
    { key: 'license_number', label: 'License No.' },
    { key: 'license_category', label: 'Category' },
    {
      key: 'license_expiry_date',
      label: 'Expiry',
      render: (r) => <span className={isExpired(r.license_expiry_date) ? 'text-status-danger' : ''}>{formatDate(r.license_expiry_date)}</span>,
    },
    { key: 'contact_number', label: 'Contact' },
    { key: 'safety_score', label: 'Safety Score', align: 'right', render: (r) => `${r.safety_score}%` },
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
          {loading ? (
            <p className="text-[12px] font-mono text-ink-soft p-4">Loading drivers...</p>
          ) : (
            <Table columns={columns} rows={filtered} emptyMessage="No drivers found." />
          )}

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
