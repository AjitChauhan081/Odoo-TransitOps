// Maps a status string to the semantic color token defined in index.css / tailwind config
export const STATUS_COLOR = {
  Available: 'status-available',
  'On Trip': 'status-available',
  Completed: 'status-available',
  Dispatched: 'status-warn',
  'In Shop': 'status-warn',
  Pending: 'status-warn',
  Suspended: 'status-danger',
  Retired: 'status-danger',
  Cancelled: 'status-danger',
  Draft: 'status-neutral',
  'Off Duty': 'status-neutral',
};

export const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];
export const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
export const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
export const MAINTENANCE_STATUSES = ['In Shop', 'Completed', 'Pending'];
