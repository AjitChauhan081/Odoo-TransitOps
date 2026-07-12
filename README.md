# Odoo-TransitOps

**TransitOps** is an end-to-end Smart Transport Operations Platform that digitizes vehicle, driver, dispatch, maintenance, and expense management while enforcing strict business rules and providing operational insights.

Built for the Hackathon.

## 🏗️ Project Architecture

The project is split into a robust Backend and a modern Frontend.

### 1. Backend (`Code/Backend/`)
A high-performance REST API built with:
- **FastAPI** (Python 3.12+)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM)
- **uv** (Package Manager)
- **JWT** (Role-Based Authentication)
- **Pytest** (102 passing tests)

Features:
- Complete Role-Based Access Control (RBAC) for Fleet Managers, Drivers, Safety Officers, and Financial Analysts.
- Full trip lifecycle management with automated state transitions.
- Robust business rules (e.g., cargo limit validation, preventing dispatch of vehicles "In Shop", automatic driver/vehicle un-assignment on trip completion).
- Automatic database table creation and seed script via `start.py`.

### 2. Frontend (`Code/Frontend/`)
*(Status: Planning phase — Implementation pending approval)*
- Planned as a **React Single Page Application (SPA)** using **Vite**.
- **Vanilla CSS** for strict adherence to modern design principles without Tailwind overhead.
- Interactive Dashboard, tables with search/filter/sort, and RBAC-scoped UI.

---

## 🚀 Getting Started

### Prerequisites
1. **PostgreSQL** (PgAdmin 4 / Postgres 18) running locally on port `5433`.
2. **Python** 3.12+
3. **uv** (Fast Python package installer)

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd Code/Backend
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Ensure the `DATABASE_URL` in `.env` matches your local Postgres credentials, targeting a database named `TransitOps`)*

3. Run the one-click startup script:
   ```bash
   uv run start.py
   ```
   *This script automatically creates the tables in Postgres and launches the FastAPI server at `http://localhost:8000`.*

### Running the Backend Tests
The backend includes a comprehensive test suite of 102 tests that run against an isolated, in-memory SQLite database (it will never touch your real Postgres database).
```bash
cd Code/Backend
uv run pytest tests/ -v
```

---

## 📖 API Documentation
Once the backend is running, the interactive API documentation is available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🛡️ Role-Based Access Control (RBAC)
The platform strictly enforces the following roles across all endpoints:

| Role | Capabilities |
|------|-------------|
| **Fleet Manager** | Full access to vehicles, trips, maintenance, and fleet utilization. |
| **Driver** | Can view assigned trips, update odometer/fuel upon trip completion. |
| **Safety Officer** | Monitors licenses, manages driver safety scores, can suspend drivers. |
| **Financial Analyst** | Views fuel costs, logs expenses, and monitors fleet ROI/revenue. |
