import { useState } from 'react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { useNotify } from '../../components/NotificationCenter';
import { formatINR, formatDate } from '../../utils/formatters';
import { MAINTENANCE_STATUSES } from '../../constants/statuses';
import { apiFetch } from '../../api/client';
import { useEffect } from 'react';

export default function Maintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const notify = useNotify();

  useEffect(() => {
    async function load() {
      try {
        const [v, m] = await Promise.all([
          apiFetch('/vehicles/'),
          apiFetch('/maintenance/')
        ]);
        setVehicles(v);
        setLogs(m);
      } catch (err) {
        console.error("Failed to load maintenance data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'description', label: 'Service' },
    { key: 'cost', label: 'Cost', align: 'right', render: (r) => formatINR(r.cost) },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
  ];

  async function handleSave(e) {
    e.preventDefault();
    if (!vehicleId || !serviceType || !cost || !date || !status) return;
    
    try {
      const payload = {
        vehicle_id: Number(vehicleId),
        description: serviceType,
        date: date,
        cost: Number(cost),
        status: status
      };
      const created = await apiFetch('/maintenance/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setLogs((prev) => [created, ...prev]);
      notify('success', `Service record added successfully.`);
      setVehicleId(''); setServiceType(''); setCost(''); setDate(''); setStatus('');
    } catch (err) {
      notify('error', err.message || 'Failed to save maintenance record');
    }
  }

  return (
    <PageShell title="Maintenance">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Panel title="Log Service Record">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Select label="Vehicle" required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} options={vehicles.map((v) => ({ value: v.id, label: `${v.registration_number} — ${v.name_model}` }))} />
            <Select label="Service Type" required value={serviceType} onChange={(e) => setServiceType(e.target.value)} options={['Oil Change', 'Brake Service', 'Tyre Replacement', 'General Inspection', 'Engine Overhaul']} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cost (₹)" type="number" min="0" required value={cost} onChange={(e) => { if(Number(e.target.value)>=0) setCost(e.target.value); }} />
              <Input label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Select label="Status" required value={status} onChange={(e) => setStatus(e.target.value)} options={MAINTENANCE_STATUSES} />
            <Button type="submit" variant="primary" className="self-start">Save</Button>
          </form>

          <div className="mt-6 pt-4 border-t border-line">
            <p className="micro-label mb-3">Vehicle State Transition</p>
            <div className="flex items-center gap-3 font-mono text-[12px]">
              <span className="px-2 py-1 border border-status-available text-status-available rounded-sm">Available</span>
              <span className="flex-1 h-[1px] bg-line-strong relative">
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-ink-soft">⇄</span>
              </span>
              <span className="px-2 py-1 border border-status-warn text-status-warn rounded-sm">In Shop</span>
            </div>
            <p className="text-[11px] text-ink-soft font-mono mt-3">
              In Shop vehicles are removed from the dispatch pool.
            </p>
          </div>
        </Panel>

        <Panel title="Service Log">
          {loading ? (
            <p className="text-[12px] font-mono text-ink-soft p-4">Loading maintenance records...</p>
          ) : (
            <Table columns={columns} rows={logs} emptyMessage="No maintenance records." />
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
