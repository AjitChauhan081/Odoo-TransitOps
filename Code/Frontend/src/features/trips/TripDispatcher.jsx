import { useMemo, useState } from 'react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LifecycleStepper } from '../../components/LifecycleStepper';
import { RuleCallout } from '../../components/RuleCallout';
import { StatusTag } from '../../components/StatusTag';
import { EmptyState } from '../../components/EmptyState';
import { useNotify } from '../../components/NotificationCenter';
import { TRIP_STATUSES } from '../../constants/statuses';
import { isExpired } from '../../utils/formatters';
import { apiFetch } from '../../api/client';
import { useEffect } from 'react';

const STEPS = TRIP_STATUSES; // Draft -> Dispatched -> Completed -> Cancelled

export default function TripDispatcher() {
  const [vehicles, setVehicles] = useState([]);
  const [allDrivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [distance, setDistance] = useState('');
  const notify = useNotify();

  useEffect(() => {
    async function load() {
      try {
        const [v, d, t] = await Promise.all([
          apiFetch('/vehicles/'),
          apiFetch('/drivers/'),
          apiFetch('/trips/')
        ]);
        setVehicles(v);
        setDrivers(d);
        setTrips(t);
      } catch (err) {
        notify('error', 'Failed to load dispatch data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [notify]);

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = allDrivers.filter((d) => d.status === 'Available' && !isExpired(d.license_expiry_date));

  const selectedVehicle = vehicles.find((v) => String(v.id) === String(vehicleId));
  const capacityExceeded =
    selectedVehicle && cargoWeight && Number(cargoWeight) > selectedVehicle.max_load_capacity;

  const activeIndex = source && destination && vehicleId && driverId ? (capacityExceeded ? 0 : 1) : 0;

  async function handleDispatch(e) {
    e.preventDefault();
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !distance) return;
    if (capacityExceeded) return;

    try {
      const payload = {
        source,
        destination,
        vehicle_id: Number(vehicleId),
        driver_id: Number(driverId),
        cargo_weight: Number(cargoWeight),
        planned_distance: Number(distance),
        status: 'Draft'
      };
      
      const createdTrip = await apiFetch('/trips/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const dispatchedTrip = await apiFetch(`/trips/${createdTrip.id}/dispatch`, {
        method: 'PATCH'
      });
      
      setTrips((prev) => [dispatchedTrip, ...prev]);
      notify('success', `Trip ${dispatchedTrip.id} dispatched successfully.`);
      setSource(''); setDestination(''); setVehicleId(''); setDriverId(''); setCargoWeight(''); setDistance('');
    } catch (err) {
      notify('error', err.message || 'Failed to dispatch trip');
    }
  }

  const liveTrips = useMemo(() => trips.filter((t) => t.status === 'Dispatched' || t.status === 'Draft').slice(0, 10), [trips]);

  return (
    <PageShell title="Trip Dispatcher">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Panel title="Create Trip">
          <div className="flex flex-col gap-4">
            <LifecycleStepper steps={STEPS} activeIndex={activeIndex} />

            <form onSubmit={handleDispatch} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Source" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Gandhinagar Depot" />
                <Input label="Destination" required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Ahmedabad Hub" />
              </div>
              <Select
                label="Vehicle (available only)"
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                options={availableVehicles.map((v) => ({ value: v.id, label: `${v.registration_number} — ${v.name_model} (${v.max_load_capacity}kg)` }))}
              />
              <Select
                label="Driver (available only)"
                required
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                options={availableDrivers.map((d) => ({ value: d.id, label: `${d.name} (${d.license_number})` }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cargo Weight (kg)" type="number" required value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} />
                <Input label="Planned Distance (km)" type="number" required value={distance} onChange={(e) => setDistance(e.target.value)} />
              </div>

              {capacityExceeded && (
                <RuleCallout>
                  Vehicle Capacity {selectedVehicle.max_load_capacity}kg / Cargo Weight {cargoWeight}kg → ✕ Capacity exceeded by{' '}
                  {Number(cargoWeight) - selectedVehicle.max_load_capacity}kg — dispatch blocked.
                </RuleCallout>
              )}

              <Button type="submit" variant="primary" disabled={capacityExceeded} className="self-start">
                Dispatch Trip
              </Button>
            </form>
          </div>
        </Panel>

        <Panel title="Live Board">
          <div className="flex flex-col gap-3">
            {liveTrips.length === 0 && <EmptyState message="No active trips." />}
            {liveTrips.map((t) => (
              <div key={t.id} className="border border-line rounded-sm p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[12px] font-medium">{t.id}</span>
                  <StatusTag status={t.status} />
                </div>
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <span className="w-2 h-2 bg-ink rounded-full" />
                  <span>{t.source}</span>
                  <span className="flex-1 h-[1px] bg-line" />
                  <span className="w-2 h-2 border border-ink rounded-full" />
                  <span>{t.destination}</span>
                </div>
                <div className="mt-2 text-[11px] text-ink-soft font-mono">
                  Vehicle ID: {t.vehicle_id} · Driver: {allDrivers.find((d) => d.id === t.driver_id)?.name || t.driver_id}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-ink-soft font-mono border-t border-line pt-3">
              On Complete → odometer → fuel log → expenses → Vehicle &amp; Driver Available.
            </p>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
