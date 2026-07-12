import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { SearchBar } from '../../components/SearchBar';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { useNotify } from '../../components/NotificationCenter';
import { vehicles as initialVehicles } from '../../data/mockData';
import { formatNumber, formatINR } from '../../utils/formatters';

export default function VehicleRegistry() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [regError, setRegError] = useState(null);
  const notify = useNotify();

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (!type || v.type === type) &&
          (!status || v.status === status) &&
          (v.id.toLowerCase().includes(query.toLowerCase()) || v.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [vehicles, query, type, status]
  );

  const columns = [
    { key: 'id', label: 'Reg. No.' },
    { key: 'name', label: 'Name / Model' },
    { key: 'type', label: 'Type' },
    { key: 'capacityKg', label: 'Capacity', align: 'right', render: (r) => `${formatNumber(r.capacityKg)} kg` },
    { key: 'odometer', label: 'Odometer', align: 'right', render: (r) => `${formatNumber(r.odometer)} km` },
    { key: 'acquisitionCost', label: 'Acq. Cost', align: 'right', render: (r) => formatINR(r.acquisitionCost) },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
  ];

  function handleAddVehicle(e) {
    e.preventDefault();
    const duplicate = vehicles.some((v) => v.id.toLowerCase() === regNo.trim().toLowerCase());
    if (!regNo.trim()) {
      setRegError('Registration No. is required.');
      return;
    }
    if (duplicate) {
      setRegError('This Registration No. already exists — it must be unique.');
      return;
    }
    setVehicles((prev) => [
      { id: regNo.trim(), name: 'New Vehicle', type: 'Van', capacityKg: 500, odometer: 0, acquisitionCost: 500000, status: 'Available', depot: 'Gandhinagar Depot' },
      ...prev,
    ]);
    setModalOpen(false);
    setRegNo('');
    setRegError(null);
    notify('success', `Vehicle ${regNo.trim()} added successfully.`);
  }

  return (
    <PageShell title="Vehicle Registry">
      <Panel
        title="Fleet"
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} strokeWidth={1.5} /> Add Vehicle
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by reg. no. or name..."
            filters={
              <>
                <Select value={type} onChange={(e) => setType(e.target.value)} options={['Van', 'Truck', 'Mini Truck', 'Trailer']} placeholder="Type: All" className="w-40" />
                <Select value={status} onChange={(e) => setStatus(e.target.value)} options={['Available', 'On Trip', 'In Shop', 'Retired']} placeholder="Status: All" className="w-40" />
              </>
            }
            onReset={() => { setQuery(''); setType(''); setStatus(''); }}
          />
          <Table columns={columns} rows={filtered} emptyMessage="No vehicles registered." />
          <p className="text-[11px] text-ink-soft font-mono border-t border-line pt-3">
            Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher.
          </p>
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setRegError(null); }}
        title="Add Vehicle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddVehicle}>Save Vehicle</Button>
          </>
        }
      >
        <form onSubmit={handleAddVehicle} className="flex flex-col gap-4">
          <Input label="Registration No." required value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. VAN-23" error={regError} />
        </form>
      </Modal>
    </PageShell>
  );
}
