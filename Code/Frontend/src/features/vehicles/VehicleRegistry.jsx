import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { SearchBar } from '../../components/SearchBar';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { Input } from '../../components/Input';
import { useNotify } from '../../components/NotificationCenter';
import { formatNumber, formatINR } from '../../utils/formatters';
import { apiFetch } from '../../api/client';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

export default function VehicleRegistry() {
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [nameModel, setNameModel] = useState('');
  const [vehicleType, setVehicleType] = useState('Van');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');

  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const [regError, setRegError] = useState(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();
  const { user } = useAuth();
  const isFleetManager = user?.role === ROLES.FLEET_MANAGER;

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

  if (isFleetManager) {
    columns.push({
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (r) => (
        <button 
          onClick={() => setVehicleToDelete(r)} 
          className="text-ink-soft hover:text-status-danger transition-colors p-1" 
          title="Delete Vehicle"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      )
    });
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    if (!regNo.trim()) {
      setRegError('Registration No. is required.');
      return;
    }
    
    try {
      const payload = {
        registration_number: regNo.trim(),
        name_model: nameModel.trim() || 'New Vehicle',
        vehicle_type: vehicleType,
        max_load_capacity: maxCapacity ? parseInt(maxCapacity, 10) : 500,
        odometer: odometer ? parseInt(odometer, 10) : 0,
        acquisition_cost: acquisitionCost ? parseInt(acquisitionCost, 10) : 500000,
        status: 'Available'
      };
      
      const created = await apiFetch('/vehicles/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setVehicles((prev) => [created, ...prev]);
      setModalOpen(false);
      
      // Reset form
      setRegNo('');
      setNameModel('');
      setVehicleType('Van');
      setMaxCapacity('');
      setOdometer('');
      setAcquisitionCost('');
      setRegError(null);
      
      notify('success', `Vehicle ${regNo.trim()} added successfully.`);
    } catch (err) {
      setRegError(err.message || 'Failed to add vehicle');
    }
  }

  async function handleDeleteVehicle() {
    if (!vehicleToDelete) return;
    try {
      await apiFetch(`/vehicles/${vehicleToDelete.id}`, { method: 'DELETE' });
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
      notify('success', `Vehicle ${vehicleToDelete.registration_number} deleted.`);
    } catch (err) {
      notify('error', err.message || 'Failed to delete vehicle.');
    }
    setVehicleToDelete(null);
  }

  return (
    <PageShell title="Vehicle Registry">
      <Panel
        title="Fleet"
        actions={
          isFleetManager && (
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} strokeWidth={1.5} /> Add Vehicle
            </Button>
          )
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
        <form id="add-vehicle-form" onSubmit={handleAddVehicle} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Registration No." required value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. VAN-23" error={regError} />
          </div>
          <Input label="Name / Model" value={nameModel} onChange={(e) => setNameModel(e.target.value)} placeholder="e.g. Ford Transit" />
          <Select label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} options={['Van', 'Truck', 'Mini Truck', 'Trailer']} />
          <Input label="Max Capacity (kg)" type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} placeholder="e.g. 500" />
          <Input label="Initial Odometer (km)" type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="e.g. 1500" />
          <Input label="Acquisition Cost (₹)" type="number" value={acquisitionCost} onChange={(e) => setAcquisitionCost(e.target.value)} placeholder="e.g. 500000" />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleDeleteVehicle}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${vehicleToDelete?.registration_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </PageShell>
  );
}
