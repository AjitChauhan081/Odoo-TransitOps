# TransitOps Source Code

This directory contains the core application source code for the TransitOps platform, separated into two primary modules:

## 1. Backend (`/Backend`)
The backend is a robust REST API built with FastAPI and PostgreSQL, managing the core business logic, RBAC (Role-Based Access Control), and data persistence for the entire platform.

**Key Technologies:**
- **FastAPI** for high-performance API routing and validation.
- **SQLAlchemy** & **PostgreSQL** for database management.
- **uv** for lightning-fast Python dependency management.
- **Pytest** for the 102+ passing test suite.

👉 [View Backend Documentation](./Backend/README.md)

---

## 2. Frontend (`/Frontend`)
*(Currently in planning/initialization phase)*

The frontend will be the modern user interface tailored for Fleet Managers, Drivers, Safety Officers, and Financial Analysts to interact with the platform.

**Key Technologies (Planned):**
- **React** (via Vite) for a snappy Single Page Application (SPA) experience.
- **Vanilla CSS** for strict, tailored modern styling without external UI frameworks.

---

## Quick Start
To get started with the project, please refer to the primary setup instructions in the root directory:
👉 [Root README](../README.md)
