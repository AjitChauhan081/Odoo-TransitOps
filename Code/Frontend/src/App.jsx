import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RBACProvider } from './context/RBACContext';
import { NotificationProvider } from './components/NotificationCenter';

const Login = lazy(() => import('./features/auth/Login'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const VehicleRegistry = lazy(() => import('./features/vehicles/VehicleRegistry'));
const Drivers = lazy(() => import('./features/drivers/Drivers'));
const TripDispatcher = lazy(() => import('./features/trips/TripDispatcher'));
const Maintenance = lazy(() => import('./features/maintenance/Maintenance'));
const FuelExpenses = lazy(() => import('./features/fuel-expenses/FuelExpenses'));
const Analytics = lazy(() => import('./features/analytics/Analytics'));
const Settings = lazy(() => import('./features/settings/Settings'));

function PageFallback() {
  return <div className="min-h-screen flex items-center justify-center font-mono text-[12px] text-ink-soft">Loading...</div>;
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/fleet" element={<RequireAuth><VehicleRegistry /></RequireAuth>} />
        <Route path="/drivers" element={<RequireAuth><Drivers /></RequireAuth>} />
        <Route path="/trips" element={<RequireAuth><TripDispatcher /></RequireAuth>} />
        <Route path="/maintenance" element={<RequireAuth><Maintenance /></RequireAuth>} />
        <Route path="/fuel-expenses" element={<RequireAuth><FuelExpenses /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RBACProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </RBACProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
