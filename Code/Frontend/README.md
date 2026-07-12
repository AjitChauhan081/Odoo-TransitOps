# TransitOps — Frontend

Raw Aesthetics fleet-operations UI. React 19 + Tailwind CSS + React Router + Framer Motion + recharts + lucide-react.

## Run it

## Run it

```bash
cd D:\Hackathon\Code\Frontend
npm install
npm run dev
```

Then open the printed localhost URL.

### Demo Credentials
This frontend is strictly integrated with the FastAPI Backend. You MUST use one of the predefined demo accounts to log in (Password is `password123` for all):
- `fleet@transitops.com` (Fleet Manager)
- `driver@transitops.com` (Driver)
- `safety@transitops.com` (Safety Officer)
- `finance@transitops.com` (Financial Analyst)

**Note:** The dropdown on the login page will enforce that you select the correct role associated with your email!

## Build

```
npm run build
```

## What's implemented

- **Live Backend Integration:** Fully integrated with the FastAPI backend using a unified `apiFetch` client that handles JWT authorization.
- **Dynamic RBAC:** The Sidebar navigation, UI buttons, and Settings permission matrix respond dynamically to the logged-in user's role.
- Full design-token system in `src/index.css` + `tailwind.config.js` (ink/paper/accent/status colors as CSS variables, serif+mono type pairing, blueprint grid background).
- Shared component library in `src/components`: Button, Input, Select, Checkbox, Table, Modal, and NotificationCenter.
- All 9 routed pages in `src/features`: Login, Dashboard, Vehicle Registry, Drivers, Trip Dispatcher, Maintenance, Fuel & Expenses, Analytics, Settings/RBAC.
- Business-rule callouts (capacity exceeded, duplicate reg. no., expired license) as permanent inline components.

## Notes / scope

This build focuses on the core information architecture, interactions, and the full visual system rather than every optional sub-bullet in the spec (e.g. column resizing, PNG chart export, and per-field character counters are not wired up). It's a solid base to extend from — the component contracts (Table, Modal, NotificationCenter) are built to take that extra behavior without restructuring.
