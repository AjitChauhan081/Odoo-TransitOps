import { useMemo, useState } from 'react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { KpiCard } from '../../components/KpiCard';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { StatusTag } from '../../components/StatusTag';
import { vehicles, drivers, trips } from '../../data/mockData';

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (!vehicleType || v.type === vehicleType) &&
          (!status || v.status === status) &&
          (!region || v.depot === region)
      ),
    [vehicleType, status, region]
  );

  const activeVehicles = filteredVehicles.filter((v) => v.status !== 'Retired').length;
  const available = filteredVehicles.filter((v) => v.status === 'Available').length;
  const inMaintenance = filteredVehicles.filter((v) => v.status === 'In Shop').length;
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length;
  const utilization = Math.round((trips.filter((t) => t.status !== 'Cancelled').length / trips.length) * 100);

  const statusBreakdown = ['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => ({
    status: s,
    count: vehicles.filter((v) => v.status === s).length,
  }));
  const totalV = vehicles.length;

  const recentTrips = trips.slice(0, 8);

  const tripColumns = [
    { key: 'id', label: 'Trip' },
    { key: 'vehicleId', label: 'Vehicle' },
    { key: 'driverId', label: 'Driver', render: (r) => drivers.find((d) => d.id === r.driverId)?.name || r.driverId },
    { key: 'status', label: 'Status', sortable: false, render: (r) => <StatusTag status={r.status} /> },
    { key: 'eta', label: 'ETA', align: 'right' },
  ];

  const barColors = { Available: 'status-available', 'On Trip': 'status-warn', 'In Shop': 'status-warn', Retired: 'status-danger' };

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
        <KpiCard label="Active Vehicles" value={activeVehicles} underline="status-available" />
        <KpiCard label="Available Vehicles" value={available} underline="status-available" />
        <KpiCard label="Vehicles In Maintenance" value={inMaintenance} underline="status-warn" />
        <KpiCard label="Active Trips" value={activeTrips} underline="status-warn" />
        <KpiCard label="Pending Trips" value={pendingTrips} underline="status-neutral" />
        <KpiCard label="Drivers On Duty" value={driversOnDuty} underline="status-available" />
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
