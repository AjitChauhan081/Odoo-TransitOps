import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { KpiCard } from '../../components/KpiCard';
import { Button } from '../../components/Button';
import { Button } from '../../components/Button';
import { formatINR } from '../../utils/formatters';
import { apiFetch } from '../../api/client';
import { useEffect, useState, useMemo } from 'react';

const monthlyRevenue = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 480000 },
  { month: 'Mar', revenue: 510000 },
  { month: 'Apr', revenue: 490000 },
  { month: 'May', revenue: 530000 },
  { month: 'Jun', revenue: 580000 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-paper border border-ink px-2 py-1 font-mono text-[11px]">
      <div className="text-ink-soft">{label}</div>
      <div>{formatINR(payload[0].value)}</div>
    </div>
  );
}

export default function Analytics() {
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [v, f, m] = await Promise.all([
          apiFetch('/vehicles/'),
          apiFetch('/fuel/'),
          apiFetch('/maintenance/')
        ]);
        setVehicles(v);
        setFuelLogs(f);
        setMaintenanceLogs(m);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalFuelLiters = fuelLogs.reduce((s, f) => s + f.liters, 0);
  const totalMaintCost = maintenanceLogs.reduce((s, m) => s + m.cost, 0);
  const fuelEfficiency = fuelLogs.length ? (totalFuelLiters / (fuelLogs.length * 8)).toFixed(1) : 0; 
  const utilization = 78; // demo aggregate
  const opCost = totalFuelCost + totalMaintCost;
  const totalAcquisition = vehicles.reduce((s, v) => s + v.acquisition_cost, 0);
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const roi = totalAcquisition ? (((totalRevenue - opCost) / totalAcquisition) * 100).toFixed(1) : 0;

  const costliest = useMemo(
    () =>
      vehicles
        .map((v) => ({
          registration_number: v.registration_number,
          cost:
            maintenanceLogs.filter((m) => m.vehicle_id === v.id).reduce((s, m) => s + m.cost, 0) +
            fuelLogs.filter((f) => f.vehicle_id === v.id).reduce((s, f) => s + f.cost, 0),
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 6),
    [vehicles, maintenanceLogs, fuelLogs]
  );
  const maxCost = Math.max(...costliest.map((c) => c.cost), 1);

  if (loading) return <PageShell title="Reports & Analytics">Loading...</PageShell>;

  function exportCSV() {
    const rows = [['Month', 'Revenue'], ...monthlyRevenue.map((m) => [m.month, m.revenue])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monthly-revenue.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell title="Reports & Analytics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Fuel Efficiency" value={fuelEfficiency} suffix=" km/l" underline="status-available" />
        <KpiCard label="Fleet Utilization" value={utilization} suffix="%" underline="accent" />
        <KpiCard label="Operational Cost" value={formatINR(opCost)} underline="status-warn" />
        <div className="border border-line rounded-sm p-4 flex flex-col gap-2">
          <span className="micro-label">Vehicle ROI</span>
          <span className="font-serif text-[30px] leading-none">{roi}%</span>
          <span className="text-[10px] text-ink-soft font-mono">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          title="Monthly Revenue"
          actions={
            <Button variant="secondary" onClick={exportCSV}>
              <Download size={13} strokeWidth={1.5} /> Export CSV
            </Button>
          }
        >
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--ink-soft)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--ink-soft)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--paper-dim)' }} />
                <Bar dataKey="revenue" fill="var(--ink)" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top Costliest Vehicles">
          <ul className="flex flex-col gap-3">
            {costliest.map((c) => (
              <li key={c.registration_number} className="flex items-center gap-3">
                <span className="font-mono text-[12px] w-24 flex-shrink-0">{c.registration_number}</span>
                <div className="flex-1 h-4 bg-paper-dim border border-line">
                  <div className="h-full bg-accent" style={{ width: `${(c.cost / maxCost) * 100}%` }} />
                </div>
                <span className="font-mono text-[11px] w-24 text-right flex-shrink-0">{formatINR(c.cost)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
