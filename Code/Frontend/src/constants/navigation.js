import { LayoutGrid, Truck, Users, Route, Wrench, Fuel, BarChart3, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutGrid },
  { key: 'fleet', label: 'Fleet', path: '/fleet', icon: Truck },
  { key: 'drivers', label: 'Drivers', path: '/drivers', icon: Users },
  { key: 'trips', label: 'Trips', path: '/trips', icon: Route },
  { key: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { key: 'fuel-expenses', label: 'Fuel & Expenses', path: '/fuel-expenses', icon: Fuel },
  { key: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { key: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];
