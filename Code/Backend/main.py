from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

# Import all routers
from routers import auth, vehicles, drivers, trips, maintenance, fuel, expenses, dashboard

# ─── Create all DB tables on startup ─────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App instance ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="TransitOps API",
    description="""
## Smart Transport Operations Platform

Manage your fleet, drivers, trips, maintenance, fuel, and expenses through a unified REST API.

### Roles & Access
| Role              | Access                                    |
|-------------------|-------------------------------------------|
| Fleet Manager     | Full access to all resources              |
| Driver            | Complete trips, log fuel                  |
| Safety Officer    | View drivers, update status & safety score|
| Financial Analyst | View & log expenses                       |

### Trip Lifecycle
`Draft` → `Dispatched` → `Completed` / `Cancelled`
""",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include all routers ──────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(fuel.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "TransitOps API is running",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
