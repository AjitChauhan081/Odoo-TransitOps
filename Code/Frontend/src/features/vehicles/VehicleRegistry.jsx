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
import { formatNumber, formatINR } from '../../utils/formatters';
import { apiFetch } from '../../api/client';
import { useEffect } from 'react';

export default function VehicleRegistry() {
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [regError, setRegError] = useState(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/vehicles/');
        setVehicles(data);
      } catch (err) {
        notify('error', 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [notify]);

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (!type || v.vehicle_type === type) &&
          (!status || v.status === status) &&
          (v.registration_number.toLowerCase().includes(query.toLowerCase()) || v.name_model.toLowerCase().includes(query.toLowerCase()))
      ),
    [vehicles, query, type, status]
  );

  const columns = [
    { key: 'registration_number', label: 'Reg. No.' },
    { key: 'name_model', label: 'Name / Model' },
    { key: 'vehicle_type', label: 'Type' },
    { key: 'max_load_capacity', label: 'Capacity', align: 'right', render: (r) => `${formatNumber(r.max_load_capacity)} kg` },
    { key: 'odometer', label: 'Odometer', align: 'right', render: (r) => `${formatNumber(r.odometer)} km` },
    { key: 'acquisition_cost', label: 'Acq. Cost', align: 'right', render: (r) => formatINR(r.acquisition_cost) },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
  ];

  async function handleAddVehicle(e) {
    e.preventDefault();
    if (!regNo.trim()) {
      setRegError('Registration No. is required.');
      return;
    }
    
    try {
      const payload = {
        registration_number: regNo.trim(),
        name_model: 'New Vehicle',
        vehicle_type: 'Van',
        max_load_capacity: 500,
        odometer: 0,
        acquisition_cost: 500000,
        status: 'Available'
      };
      
      const created = await apiFetch('/vehicles/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setVehicles((prev) => [created, ...prev]);
      setModalOpen(false);
      setRegNo('');
      setRegError(null);
      notify('success', `Vehicle ${regNo.trim()} added successfully.`);
    } catch (err) {
      setRegError(err.message || 'Failed to add vehicle');
    }
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
          {loading ? (
            <p className="text-[12px] font-mono text-ink-soft p-4">Loading vehicles...</p>
          ) : (
            <Table columns={columns} rows={filtered} emptyMessage="No vehicles registered." />
          )}
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
