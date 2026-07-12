import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { useNotify } from '../../components/NotificationCenter';
import { vehicles, fuelLogs as initialFuel, expenses as initialExpenses, maintenanceLogs } from '../../data/mockData';
import { formatINR, formatDate, formatNumber } from '../../utils/formatters';

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState(initialFuel);
  const [expenses] = useState(initialExpenses);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fVehicle, setFVehicle] = useState('');
  const [fDate, setFDate] = useState('');
  const [fLiters, setFLiters] = useState('');
  const [fCost, setFCost] = useState('');
  const notify = useNotify();

  const fuelColumns = [
    { key: 'vehicleId', label: 'Vehicle' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'liters', label: 'Liters', align: 'right', render: (r) => `${formatNumber(r.liters)} L` },
    { key: 'cost', label: 'Cost', align: 'right', render: (r) => formatINR(r.cost) },
  ];

  const expenseColumns = [
    { key: 'tripId', label: 'Trip' },
    { key: 'vehicleId', label: 'Vehicle' },
    { key: 'toll', label: 'Toll', align: 'right', render: (r) => formatINR(r.toll) },
    { key: 'other', label: 'Other', align: 'right', render: (r) => formatINR(r.other) },
    { key: 'maintenanceLinked', label: 'Maint. (Linked)', align: 'right', render: (r) => formatINR(r.maintenanceLinked) },
    { key: 'total', label: 'Total', align: 'right', render: (r) => formatINR(r.total) },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
  ];

  const totalFuel = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalMaint = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalCost = totalFuel + totalMaint;

  function handleSaveFuel(e) {
    e.preventDefault();
    if (!fVehicle || !fDate || !fLiters || !fCost) return;
    const id = `FL-${String(fuelLogs.length + 1).padStart(2, '0')}`;
    setFuelLogs((prev) => [{ id, vehicleId: fVehicle, date: fDate, liters: Number(fLiters), cost: Number(fCost) }, ...prev]);
    notify('success', `Fuel log ${id} added successfully.`);
    setFuelModalOpen(false);
    setFVehicle(''); setFDate(''); setFLiters(''); setFCost('');
  }

  return (
    <PageShell title="Fuel & Expense Management">
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setFuelModalOpen(true)}>
          <Plus size={14} strokeWidth={1.5} /> Log Fuel
        </Button>
        <Button variant="primary">
          <Plus size={14} strokeWidth={1.5} /> Add Expense
        </Button>
      </div>

      <Panel title="Fuel Logs">
        <Table columns={fuelColumns} rows={fuelLogs} emptyMessage="No fuel logs." />
      </Panel>

      <Panel title="Other Expenses (Toll/Misc)">
        <Table columns={expenseColumns} rows={expenses} emptyMessage="No expense records." />
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="micro-label">Total Operational Cost (Auto) = Fuel + Maintenance</span>
          <span className="font-serif text-[28px]">{formatINR(totalCost)}</span>
        </div>
      </Panel>

      <Modal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        title="Log Fuel"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFuelModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveFuel}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleSaveFuel} className="flex flex-col gap-4">
          <Select label="Vehicle" required value={fVehicle} onChange={(e) => setFVehicle(e.target.value)} options={vehicles.map((v) => ({ value: v.id, label: v.id }))} />
          <Input label="Date" type="date" required value={fDate} onChange={(e) => setFDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Liters" type="number" required value={fLiters} onChange={(e) => setFLiters(e.target.value)} />
            <Input label="Cost" type="number" required value={fCost} onChange={(e) => setFCost(e.target.value)} />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
