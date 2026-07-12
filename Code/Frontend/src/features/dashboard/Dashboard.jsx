import { useEffect, useState } from 'react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { KpiCard } from '../../components/KpiCard';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { apiFetch } from '../../api/client';

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');

  const [summary, setSummary] = useState(null);
  const [utilization, setUtilization] = useState(0);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sumRes, utilRes, tripsRes] = await Promise.all([
          apiFetch('/dashboard/summary'),
          apiFetch('/dashboard/fleet-utilization'),
          apiFetch('/trips/')
        ]);
        setSummary(sumRes);
        setUtilization(utilRes.fleet_utilization_percent);
        setRecentTrips(tripsRes.slice(0, 8)); // Grab last 8 trips
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const tripColumns = [
    { key: 'id', label: 'Trip ID' },
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'driver_id', label: 'Driver ID' },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
    { key: 'planned_distance', label: 'Distance', align: 'right', render: (r) => `${r.planned_distance} km` },
  ];

  const barColors = { Available: 'status-available', 'On Trip': 'status-warn', 'In Shop': 'status-warn', Retired: 'status-danger' };

  if (loading || !summary) return <PageShell title="Dashboard">Loading...</PageShell>;

  const totalV = summary.vehicles.total;
  const statusBreakdown = [
    { status: 'Available', count: summary.vehicles.available },
    { status: 'On Trip', count: summary.vehicles.on_trip },
    { status: 'In Shop', count: summary.vehicles.in_shop },
    { status: 'Retired', count: summary.vehicles.retired },
  ];

  return (
    <PageShell title="Dashboard">
      <Panel title="Filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} options={['Van', 'Truck', 'Mini Truck', 'Trailer']} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={['Available', 'On Trip', 'In Shop', 'Retired']} />
          <Select label="Region" value={region} onChange={(e) => setRegion(e.target.value)} options={['Gandhinagar Depot', 'Ahmedabad Hub', 'Vatva Industrial Area', 'Sanand Warehouse', 'Mansa', 'Kalol Depot']} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Vehicles" value={summary.vehicles.active} underline="status-available" />
        <KpiCard label="Available Vehicles" value={summary.vehicles.available} underline="status-available" />
        <KpiCard label="Vehicles In Maintenance" value={summary.vehicles.in_shop} underline="status-warn" />
        <KpiCard label="Active Trips" value={summary.trips.dispatched} underline="status-warn" />
        <KpiCard label="Pending Trips" value={summary.trips.draft} underline="status-neutral" />
        <KpiCard label="Drivers Available" value={summary.drivers.available} underline="status-available" />
        <KpiCard label="Fleet Utilization" value={utilization} suffix="%" underline="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Recent Trips">
          <Table columns={tripColumns} rows={recentTrips} pageSize={8} emptyMessage="No active trips." />
        </Panel>
        <Panel title="Vehicle Status">
          <div className="flex flex-col gap-4">
            <div className="w-full h-6 flex rounded-sm overflow-hidden border border-line">
              {statusBreakdown.map((b) => (
                <div
                  key={b.status}
                  className={`bg-${barColors[b.status]}`}
                  style={{ width: `${(b.count / totalV) * 100}%` }}
                  title={`${b.status}: ${b.count}`}
                />
              ))}
            </div>
            <ul className="flex flex-col gap-2">
              {statusBreakdown.map((b) => (
                <li key={b.status} className="flex items-center justify-between font-mono text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 bg-${barColors[b.status]} inline-block`} />
                    {b.status}
                  </span>
                  <span>{b.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
