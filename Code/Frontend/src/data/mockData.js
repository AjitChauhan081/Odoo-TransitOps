// Mock dataset — frontend only, held in memory (no backend). Volumes meet §9.22 minimums.

const DEPOTS = ['Gandhinagar Depot', 'Ahmedabad Hub', 'Vatva Industrial Area', 'Sanand Warehouse', 'Mansa', 'Kalol Depot'];

const VEHICLE_TYPES = ['Van', 'Truck', 'Mini Truck', 'Trailer'];

function pick(arr, i) { return arr[i % arr.length]; }

export const vehicles = Array.from({ length: 22 }).map((_, i) => {
  const type = pick(VEHICLE_TYPES, i);
  const prefix = type === 'Van' ? 'VAN' : type === 'Truck' ? 'TRUCK' : type === 'Mini Truck' ? 'MINI' : 'TRLR';
  const statusCycle = ['Available', 'On Trip', 'In Shop', 'Available', 'Available', 'Retired'];
  return {
    id: `${prefix}-${String(i + 1).padStart(2, '0')}`,
    name: `${type} ${2018 + (i % 7)} Model`,
    type,
    capacityKg: [500, 1200, 800, 3000][i % 4],
    odometer: 12000 + i * 3421,
    acquisitionCost: 450000 + i * 62000,
    status: pick(statusCycle, i),
    depot: pick(DEPOTS, i),
  };
});

const DRIVER_NAMES = [
  'Manthan Vinzod ', 'Naruto Uzumaki', 'Obito Uchiha', 'Kakashi Uchiha', 'Itachi Uchiha', 'Rin Tohsaka',
  'Madara Uchiha', 'Hashirama Senju', 'Minato Namikaze', 'Gara Kazekage', 'Jogidash Khuman', 'Ebhal Valo',
  'Jonny Depp', 'Deepa Pandya', 'Naresh Bhatt', 'Kavita Shah', 'Mahesh Gohil', 'Rita Panchal',
  'Sanjay Barot', 'Pooja Vyas',
];

export const drivers = DRIVER_NAMES.map((name, i) => {
  const statusCycle = ['Available', 'On Trip', 'Off Duty', 'Available', 'Suspended'];
  const expiryYear = 2025 + (i % 4); // some already expired relative to 2026
  return {
    id: `DRV-${String(i + 1).padStart(2, '0')}`,
    name,
    licenseNo: `GJ-${1000 + i * 7}-${(2015 + (i % 8))}`,
    category: pick(['LMV', 'HMV', 'HMV', 'LMV-TR'], i),
    licenseExpiry: `${expiryYear}-${String(((i * 3) % 12) + 1).padStart(2, '0')}-15`,
    contact: `+91 9${String(800000000 + i * 1111).slice(0, 9)}`,
    safetyScore: 62 + ((i * 13) % 38),
    status: pick(statusCycle, i),
  };
});

const ROUTES = [
  ['Gandhinagar Depot', 'Ahmedabad Hub'],
  ['Ahmedabad Hub', 'Vatva Industrial Area'],
  ['Vatva Industrial Area', 'Sanand Warehouse'],
  ['Sanand Warehouse', 'Mansa'],
  ['Mansa', 'Kalol Depot'],
  ['Kalol Depot', 'Gandhinagar Depot'],
];

export const trips = Array.from({ length: 32 }).map((_, i) => {
  const [source, destination] = pick(ROUTES, i);
  const statusCycle = ['Completed', 'Dispatched', 'Draft', 'Completed', 'Cancelled', 'Completed', 'Dispatched'];
  return {
    id: `TR${String(i + 1).padStart(3, '0')}`,
    source,
    destination,
    vehicleId: pick(vehicles, i).id,
    driverId: pick(drivers, i).id,
    status: pick(statusCycle, i),
    cargoWeightKg: [300, 600, 900, 1500][i % 4],
    plannedDistanceKm: 40 + (i % 10) * 12,
    eta: `${(i % 12) + 1}:${i % 2 === 0 ? '00' : '30'} ${i % 2 === 0 ? 'AM' : 'PM'}`,
  };
});

export const fuelLogs = Array.from({ length: 16 }).map((_, i) => ({
  id: `FL-${String(i + 1).padStart(2, '0')}`,
  vehicleId: pick(vehicles, i * 2).id,
  date: `2026-0${(i % 6) + 1}-${String((i * 3) % 27 + 1).padStart(2, '0')}`,
  liters: 30 + (i % 8) * 6,
  cost: 3200 + (i % 8) * 540,
}));

export const maintenanceLogs = Array.from({ length: 11 }).map((_, i) => ({
  id: `MT-${String(i + 1).padStart(2, '0')}`,
  vehicleId: pick(vehicles, i * 3).id,
  serviceType: pick(['Oil Change', 'Brake Service', 'Tyre Replacement', 'General Inspection', 'Engine Overhaul'], i),
  cost: 2500 + (i % 6) * 3100,
  date: `2026-0${(i % 6) + 1}-${String((i * 5) % 27 + 1).padStart(2, '0')}`,
  status: pick(['In Shop', 'Completed', 'Pending'], i),
}));

export const expenses = Array.from({ length: 12 }).map((_, i) => {
  const toll = 120 + (i % 5) * 40;
  const other = 60 + (i % 4) * 30;
  const maint = i % 3 === 0 ? maintenanceLogs[i % maintenanceLogs.length].cost : 0;
  return {
    id: `EXP-${String(i + 1).padStart(2, '0')}`,
    tripId: pick(trips, i * 2).id,
    vehicleId: pick(vehicles, i * 2).id,
    toll,
    other,
    maintenanceLinked: maint,
    total: toll + other + maint,
    status: pick(['Pending', 'Completed', 'Completed'], i),
  };
});

export const monthlyRevenue = [
  { month: 'Jan', revenue: 1240000 }, { month: 'Feb', revenue: 1310000 }, { month: 'Mar', revenue: 1180000 },
  { month: 'Apr', revenue: 1420000 }, { month: 'May', revenue: 1505000 }, { month: 'Jun', revenue: 1390000 },
];
