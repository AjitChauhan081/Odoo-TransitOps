export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const ROLE_LIST = Object.values(ROLES);

// Which modules each role can see in the sidebar (per §6 + §9 RBAC matrix on Settings)
export const ROLE_NAV_ACCESS = {
  [ROLES.FLEET_MANAGER]: ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'fuel-expenses', 'analytics', 'settings'],
  [ROLES.DISPATCHER]: ['dashboard', 'trips', 'fleet', 'drivers'],
  [ROLES.SAFETY_OFFICER]: ['dashboard', 'drivers', 'analytics'],
  [ROLES.FINANCIAL_ANALYST]: ['dashboard', 'fuel-expenses', 'analytics'],
};

// Full permission matrix rendered on the Settings screen (§5.9)
// '✓' full access, 'view' read-only, '–' no access
export const RBAC_MATRIX = {
  [ROLES.FLEET_MANAGER]: { Fleet: '✓', Drivers: '✓', Trips: 'view', 'Fuel/Exp': 'view', Analytics: 'view' },
  [ROLES.DISPATCHER]: { Fleet: 'view', Drivers: 'view', Trips: '✓', 'Fuel/Exp': '–', Analytics: '–' },
  [ROLES.SAFETY_OFFICER]: { Fleet: '–', Drivers: '✓', Trips: 'view', 'Fuel/Exp': '–', Analytics: 'view' },
  [ROLES.FINANCIAL_ANALYST]: { Fleet: '–', Drivers: '–', Trips: '–', 'Fuel/Exp': '✓', Analytics: '✓' },
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.FLEET_MANAGER]: 'Full control over vehicle registry and maintenance records.',
  [ROLES.DISPATCHER]: 'Creates and tracks trips; sees only available vehicles and drivers.',
  [ROLES.SAFETY_OFFICER]: 'Manages driver safety profiles and compliance analytics.',
  [ROLES.FINANCIAL_ANALYST]: 'Owns fuel, expense and cost/ROI reporting.',
};
