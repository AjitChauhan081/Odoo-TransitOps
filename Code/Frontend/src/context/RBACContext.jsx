import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { ROLE_NAV_ACCESS } from '../constants/roles';

const RBACContext = createContext(null);

export function RBACProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role;
  const allowedModules = role ? ROLE_NAV_ACCESS[role] || [] : [];

  function canAccess(moduleKey) {
    return allowedModules.includes(moduleKey);
  }

  return (
    <RBACContext.Provider value={{ role, allowedModules, canAccess }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RBACContext);
  if (!ctx) throw new Error('useRole must be used within RBACProvider');
  return ctx;
}
