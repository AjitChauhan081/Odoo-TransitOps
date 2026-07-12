# TransitOps Backend

Smart Transport Operations Platform — FastAPI + PostgreSQL backend.

## Tech Stack
| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Database  | PostgreSQL (`TransitOps` on port 5433) |
| ORM       | SQLAlchemy |
| Auth      | JWT (python-jose + passlib) |
| Package Manager | uv |

---

## Quick Start (New Machine)

### 1. Prerequisites
- Python 3.12+
- PostgreSQL **running** on `localhost:5433`
  - Username: `postgres`
  - Password: `1234`
- `uv` package manager installed

### 2. Install uv (If not installed)
If you do not have `uv` installed, install it globally using:
- **Windows (PowerShell):** `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
- **macOS/Linux:** `curl -LsSf https://astral.sh/uv/install.sh | sh`

### 3. Install Dependencies
```bash
cd D:\Hackathon\Code\Backend
uv sync
```

### 4. Configure Environment Variables
You must set up your environment variables before running the application:
```bash
cp .env.example .env
```
*Note: Make sure the `DATABASE_URL` inside `.env` matches your local PostgreSQL credentials.*

### 5. Run the Startup Script
This single command will:
- Create the `TransitOps` database (if it doesn't exist)
- Create all 7 tables inside it
- Start the FastAPI server

```bash
uv run python start.py
```

That's it! The API will be live at:

| URL | Description |
|-----|-------------|
| http://localhost:8000 | API root |
| http://localhost:8000/docs | Swagger UI (interactive) |
| http://localhost:8000/redoc | ReDoc documentation |

Press **CTRL+C** to stop the server.

## Demo Credentials
If you run `start.py` on an empty database, it will automatically populate 4 demo users with the password `password123`:
- `fleet@transitops.com` (Fleet Manager)
- `driver@transitops.com` (Driver)
- `safety@transitops.com` (Safety Officer)
- `finance@transitops.com` (Financial Analyst)

---

## What the Startup Script Does

```
[Step 1] Creating database: TransitOps
  → Connects to PostgreSQL on localhost:5433
  → Creates 'TransitOps' database if not exists

[Step 2] Creating tables in TransitOps
  → users, vehicles, drivers, trips,
    maintenance_logs, fuel_logs, expenses

[Step 3] Starting FastAPI server
  → Uvicorn on http://0.0.0.0:8000 with auto-reload
```

---

## API Endpoints

### 🔐 Auth (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login & get JWT token |
| GET  | `/auth/me` | Get current user profile |

### 🚛 Vehicles (`/vehicles`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/vehicles/` | List all vehicles (filter by status) |
| POST   | `/vehicles/` | Register a new vehicle |
| GET    | `/vehicles/{id}` | Get vehicle by ID |
| PUT    | `/vehicles/{id}` | Update vehicle details |
| PATCH  | `/vehicles/{id}/status` | Update vehicle status only |
| DELETE | `/vehicles/{id}` | Delete/retire vehicle |
| GET    | `/vehicles/{id}/trips` | Trip history for vehicle |
| GET    | `/vehicles/{id}/maintenance` | Maintenance logs for vehicle |

### 👨‍✈️ Drivers (`/drivers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/drivers/` | List all drivers (filter by status) |
| POST   | `/drivers/` | Register a new driver |
| GET    | `/drivers/{id}` | Get driver by ID |
| PUT    | `/drivers/{id}` | Update driver details |
| PATCH  | `/drivers/{id}/status` | Update driver status |
| PATCH  | `/drivers/{id}/safety-score` | Update safety score |
| DELETE | `/drivers/{id}` | Remove driver |
| GET    | `/drivers/{id}/trips` | Trip history for driver |
| GET    | `/drivers/expiring-licenses` | Drivers with expiring licenses |

### 🗺️ Trips (`/trips`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/trips/` | List all trips (filter by status) |
| POST   | `/trips/` | Create a new trip (Draft) |
| GET    | `/trips/{id}` | Get trip by ID |
| PUT    | `/trips/{id}` | Update a Draft trip |
| PATCH  | `/trips/{id}/dispatch` | Dispatch trip (Draft → Dispatched) |
| PATCH  | `/trips/{id}/complete` | Complete trip (Dispatched → Completed) |
| PATCH  | `/trips/{id}/cancel` | Cancel a trip |

### 🔧 Maintenance (`/maintenance`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/maintenance/` | List all logs (filter by vehicle/status) |
| POST   | `/maintenance/` | Create maintenance log (→ In Shop) |
| GET    | `/maintenance/{id}` | Get log by ID |
| PUT    | `/maintenance/{id}` | Update log |
| PATCH  | `/maintenance/{id}/close` | Close log (→ vehicle Available) |

### ⛽ Fuel Logs (`/fuel`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/fuel/` | List fuel logs (filter by vehicle/trip) |
| POST   | `/fuel/` | Log fuel fill-up |
| GET    | `/fuel/{id}` | Get fuel log by ID |
| DELETE | `/fuel/{id}` | Delete fuel log |

### 💰 Expenses (`/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/expenses/` | List expenses (filter by vehicle/trip/type) |
| POST   | `/expenses/` | Log an expense |
| GET    | `/expenses/{id}` | Get expense by ID |
| DELETE | `/expenses/{id}` | Delete expense |

### 📊 Dashboard (`/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/dashboard/summary` | KPI summary (vehicles, drivers, trips, finances) |
| GET    | `/dashboard/fleet-utilization` | Fleet utilization metrics |
| GET    | `/dashboard/cost-per-trip` | Cost breakdown per completed trip |

### 📄 Reports & Documents (Bonus Features)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/reports/export-pdf` | Generate & download PDF report of KPIs |
| POST   | `/vehicles/{id}/documents` | Upload a vehicle document (e.g. Insurance) |
| GET    | `/vehicles/{id}/documents` | List all documents for a vehicle |
| GET    | `/vehicles/{id}/documents/{doc_id}/download`| Download a vehicle document |
| POST   | `/drivers/trigger-reminders` | Mock Email service for expiring licenses |

### 🔍 Advanced Querying
The `/vehicles`, `/drivers`, and `/trips` endpoints support advanced parameters:
- `?search=term` (Full text search across key fields)
- `?sort_by=field` (Sort by a specific column, e.g. `odometer`)
- `?order=asc|desc` (Order direction)

---

## RBAC — Role-Based Access Control
| Role | Permissions |
|------|-------------|
| **Fleet Manager** | Full access: vehicles, drivers, trips, maintenance, fuel, expenses |
| **Driver** | Complete trips, log fuel |
| **Safety Officer** | View drivers, update status & safety score |
| **Financial Analyst** | View & create expenses |

---

## Database Schema

```
users          → id, email, hashed_password, role
vehicles       → id, registration_number, name_model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status
drivers        → id, name, license_number, license_category, license_expiry_date, contact_number, safety_score, status
trips          → id, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, final_odometer, fuel_consumed
maintenance_logs → id, vehicle_id, description, date, cost, status
fuel_logs      → id, vehicle_id, trip_id, liters, cost, date
expenses       → id, expense_type, amount, date, vehicle_id, trip_id
vehicle_documents → id, vehicle_id, document_type, file_path, uploaded_at
```

## Business Rules Enforced
- ✅ Vehicle must be `Available` to be dispatched
- ✅ Driver must be `Available` to be dispatched
- ✅ Cargo weight cannot exceed vehicle `max_load_capacity`
- ✅ Only `Draft` trips can be edited or dispatched
- ✅ Only `Dispatched` trips can be completed
- ✅ Completing a trip auto-updates vehicle odometer and frees vehicle+driver
- ✅ Maintenance logs auto-set vehicle to `In Shop` / `Available` on create/close
- ✅ Cannot delete a vehicle/driver that is `On Trip`
