# TransitOps — Frontend

Raw Aesthetics fleet-operations UI. React 19 + Tailwind CSS + React Router + Framer Motion + recharts + lucide-react.

## Run it

```
npm install
npm run dev
```

Then open the printed localhost URL. Sign in on `/login` with any email/password (4+ chars) and pick a role — the sidebar and RBAC matrix (Settings) change based on the role you choose.

## Build

```
npm run build
```

## What's implemented

- Full design-token system in `src/index.css` + `tailwind.config.js` (ink/paper/accent/status colors as CSS variables, serif+mono type pairing, blueprint grid background).
- Shared component library in `src/components`: Button, Input, Textarea, Select, Checkbox, Table (sort/search/paginate/sticky header & first column), Pagination, SearchBar, StatusTag, RuleCallout, Panel, KpiCard, LifecycleStepper, EmptyState, Skeletons, Modal, ConfirmationDialog, NotificationCenter.
- Responsive shell in `src/layouts` (Sidebar collapses/drawers, Topbar, PageShell with the visible grid).
- All 9 routed pages in `src/features`: Login, Dashboard, Vehicle Registry, Drivers, Trip Dispatcher, Maintenance, Fuel & Expenses, Analytics, Settings/RBAC.
- Mock data in `src/data/mockData.js` meeting the minimum volumes (22 vehicles, 20 drivers, 32 trips, 16 fuel logs, 11 maintenance logs, 12 expenses), Gujarat depots + Indian driver names.
- RBAC simulation via Context (`AuthContext`, `RBACContext`) — nav items and the Settings permission matrix respond to the signed-in role.
- Business-rule callouts (capacity exceeded, duplicate reg. no., expired license) as permanent inline components, separate from the toast-style Notification Center.

## Notes / scope

This build focuses on the core information architecture, interactions, and the full visual system rather than every optional sub-bullet in the spec (e.g. column resizing, PNG chart export, and per-field character counters are not wired up). It's a solid base to extend from — the component contracts (Table, Modal, NotificationCenter) are built to take that extra behavior without restructuring.
