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
import { formatINR, formatDate, formatNumber } from '../../utils/formatters';
import { apiFetch } from '../../api/client';
import { useEffect } from 'react';

export default function FuelExpenses() {
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fVehicle, setFVehicle] = useState('');
  const [fDate, setFDate] = useState('');
  const [fLiters, setFLiters] = useState('');
  const [fCost, setFCost] = useState('');
  
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [eVehicle, setEVehicle] = useState('');
  const [eType, setEType] = useState('Misc');
  const [eAmount, setEAmount] = useState('');
  const [eDate, setEDate] = useState('');
  
  const notify = useNotify();

  useEffect(() => {
    async function load() {
      try {
        const [v, f, e, m] = await Promise.all([
          apiFetch('/vehicles/'),
          apiFetch('/fuel/'),
          apiFetch('/expenses/'),
          apiFetch('/maintenance/')
        ]);
        setVehicles(v);
        setFuelLogs(f);
        setExpenses(e);
        setMaintenanceLogs(m);
      } catch (err) {
        console.error("Failed to load expenses data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fuelColumns = [
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'liters', label: 'Liters', align: 'right', render: (r) => `${formatNumber(r.liters)} L` },
    { key: 'cost', label: 'Cost', align: 'right', render: (r) => formatINR(r.cost) },
  ];

  const expenseColumns = [
    { key: 'id', label: 'ID' },
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'expense_type', label: 'Type' },
    { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
  ];

  const totalFuel = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalMaint = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalOther = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCost = totalFuel + totalMaint + totalOther;

  async function handleSaveFuel(e) {
    e.preventDefault();
    if (!fVehicle || !fDate || !fLiters || !fCost) return;
    
    try {
      const payload = {
        vehicle_id: Number(fVehicle),
        date: new Date(fDate).toISOString(),
        liters: Number(fLiters),
        cost: Number(fCost)
      };
      
      const created = await apiFetch('/fuel/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setFuelLogs((prev) => [created, ...prev]);
      notify('success', `Fuel log added successfully.`);
      setFuelModalOpen(false);
      setFVehicle(''); setFDate(''); setFLiters(''); setFCost('');
    } catch (err) {
      notify('error', err.message || 'Failed to save fuel log');
    }
  }

  async function handleSaveExpense(e) {
    e.preventDefault();
    if (!eVehicle || !eType || !eAmount || !eDate) return;
    
    try {
      const payload = {
        vehicle_id: Number(eVehicle),
        expense_type: eType,
        amount: Number(eAmount),
        date: new Date(eDate).toISOString()
      };
      
      const created = await apiFetch('/expenses/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setExpenses((prev) => [created, ...prev]);
      notify('success', `Expense added successfully.`);
      setExpenseModalOpen(false);
      setEVehicle(''); setEType('Misc'); setEAmount(''); setEDate('');
    } catch (err) {
      notify('error', err.message || 'Failed to save expense');
    }
  }

  return (
    <PageShell title="Fuel & Expense Management">
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setFuelModalOpen(true)}>
          <Plus size={14} strokeWidth={1.5} /> Log Fuel
        </Button>
        <Button variant="primary" onClick={() => setExpenseModalOpen(true)}>
          <Plus size={14} strokeWidth={1.5} /> Add Expense
        </Button>
      </div>

      <Panel title="Fuel Logs">
        {loading ? (
          <p className="text-[12px] font-mono text-ink-soft p-4">Loading fuel logs...</p>
        ) : (
          <Table columns={fuelColumns} rows={fuelLogs} emptyMessage="No fuel logs." />
        )}
      </Panel>

      <Panel title="Other Expenses (Toll/Misc)">
        {loading ? (
          <p className="text-[12px] font-mono text-ink-soft p-4">Loading expenses...</p>
        ) : (
          <Table columns={expenseColumns} rows={expenses} emptyMessage="No expense records." />
        )}
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="micro-label">Total Operational Cost (Auto) = Fuel + Maintenance + Expenses</span>
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
          <Select label="Vehicle" required value={fVehicle} onChange={(e) => setFVehicle(e.target.value)} options={vehicles.map((v) => ({ value: v.id, label: v.registration_number }))} />
          <Input label="Date" type="date" required value={fDate} onChange={(e) => setFDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Liters" type="number" min="0.1" step="0.1" required value={fLiters} onChange={(e) => setFLiters(e.target.value)} />
            <Input label="Cost (₹)" type="number" min="0" required value={fCost} onChange={(e) => setFCost(e.target.value)} />
          </div>
        </form>
      </Modal>

      <Modal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Add Expense"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExpenseModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveExpense}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleSaveExpense} className="flex flex-col gap-4">
          <Select label="Vehicle" required value={eVehicle} onChange={(e) => setEVehicle(e.target.value)} options={vehicles.map((v) => ({ value: v.id, label: v.registration_number }))} />
          <Select label="Expense Type" required value={eType} onChange={(e) => setEType(e.target.value)} options={['Toll', 'Fine', 'Misc', 'Tax']} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" min="0" required value={eAmount} onChange={(e) => setEAmount(e.target.value)} />
            <Input label="Date" type="date" required value={eDate} onChange={(e) => setEDate(e.target.value)} />
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
