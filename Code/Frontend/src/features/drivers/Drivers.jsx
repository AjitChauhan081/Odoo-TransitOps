import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { SearchBar } from '../../components/SearchBar';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useNotify } from '../../components/NotificationCenter';
import { useEffect } from 'react';
import { apiFetch } from '../../api/client';
import { formatDate, isExpired } from '../../utils/formatters';
import { DRIVER_STATUSES } from '../../constants/statuses';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

export default function Drivers() {
  const [query, setQuery] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [category, setCategory] = useState('Commercial');
  const [expiry, setExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [addError, setAddError] = useState(null);

  const [driverToDelete, setDriverToDelete] = useState(null);

  const notify = useNotify();
  const { user } = useAuth();
  const isFleetManager = user?.role === ROLES.FLEET_MANAGER;

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

  if (isFleetManager) {
    columns.push({
      key: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (r) => (
        <button 
          onClick={() => setDriverToDelete(r)} 
          className="text-ink-soft hover:text-status-danger transition-colors p-1" 
          title="Delete Driver"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      )
    });
  }

  async function handleAddDriver(e) {
    e.preventDefault();
    if (!name.trim() || !licenseNo.trim()) {
      setAddError('Name and License No. are required.');
      return;
    }
    
    try {
      // Normalize slashes, dots, and spaces to dashes for strict date parsing
      let finalExpiry = expiry ? expiry.replace(/[\/\.\s]/g, '-') : '';
      
      // If it looks like DD-MM-YYYY or MM-DD-YYYY, flip it to YYYY-MM-DD
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(finalExpiry)) {
        const parts = finalExpiry.split('-');
        finalExpiry = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      
      // Strict validation: if it doesn't match YYYY-MM-DD by now, fallback to default
      if (!/^\d{4}-\d{2}-\d{2}$/.test(finalExpiry)) {
        finalExpiry = '';
      }

      if (!finalExpiry) {
        finalExpiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
      }

      const payload = {
        name: name.trim(),
        license_number: licenseNo.trim(),
        license_category: category,
        license_expiry_date: finalExpiry,
        contact_number: contact.trim() || '0000000000',
        safety_score: 100,
        status: 'Available'
      };
      
      const created = await apiFetch('/drivers/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setDrivers((prev) => [created, ...prev]);
      setModalOpen(false);
      
      setName('');
      setLicenseNo('');
      setCategory('Commercial');
      setExpiry('');
      setContact('');
      setAddError(null);
      
      notify('success', `Driver ${name.trim()} added successfully.`);
    } catch (err) {
      setAddError(err.message || 'Failed to add driver');
    }
  }

  async function handleDeleteDriver() {
    if (!driverToDelete) return;
    const id = driverToDelete.id;
    const name = driverToDelete.name;
    try {
      await apiFetch(`/drivers/${id}`, { method: 'DELETE' });
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      notify('success', `Driver ${name} deleted.`);
    } catch (err) {
      notify('error', err.message || 'Failed to delete driver.');
    }
    setDriverToDelete(null);
  }

  return (
    <PageShell title="Drivers & Safety Profiles">
      <Panel
        title="Drivers"
        actions={
          isFleetManager && (
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={14} strokeWidth={1.5} /> Add Driver
            </Button>
          )
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

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setAddError(null); }}
        title="Add Driver"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="add-driver-form">Save Driver</Button>
          </>
        }
      >
        <form id="add-driver-form" onSubmit={handleAddDriver} className="grid grid-cols-2 gap-4">
          <Input label="Full Name" required pattern="^[A-Za-z][A-Za-z\s\-\.\']{1,}$" minLength="3" title="Must be at least 3 characters and start with a letter" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" error={addError} />
          <Input label="License No." required pattern="^[A-Za-z0-9][A-Za-z0-9\-]{4,}[A-Za-z0-9]$" title="Must be at least 6 characters, start and end with alphanumeric" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} placeholder="e.g. DL-12345" />
          <Select label="License Category" value={category} onChange={(e) => setCategory(e.target.value)} options={['Commercial', 'Heavy', 'Light']} />
          <Input label="Expiry Date" type="date" required min={new Date().toISOString().split('T')[0]} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          <Input label="Contact Number" type="tel" required pattern="^\+?[0-9\s]{10,15}$" title="Enter a valid 10-15 digit phone number without hyphens" value={contact} onChange={(e) => {
            const val = e.target.value;
            if (!val.includes('-')) setContact(val);
          }} placeholder="e.g. 9876543210" />
        </form>
      </Modal>

      <ConfirmationDialog
        open={!!driverToDelete}
        onClose={() => setDriverToDelete(null)}
        onConfirm={handleDeleteDriver}
        title="Delete Driver"
        message={`Are you sure you want to delete ${driverToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </PageShell>
  );
}
