# NexusERP Frontend

This is the frontend for the NexusERP project, an AI-based inventory and sales forecasting system for small business ERP management.

## Current implementation status

The frontend is currently connected to a working FastAPI backend and demonstrates the active inventory management prototype for Interim Review 1.

### Included in the live prototype

- Dashboard with KPI cards and forecast demo charts
- Inventory page with product CRUD operations
- Create, edit, delete, and low-stock indicator logic
- Sidebar-based ERP-style layout
- Login and registration UI flow with token-aware auth context

## Tech stack

- React + Vite
- React Router
- Axios for API calls
- Recharts for dashboard charts
- Framer Motion for UI animation
- Lucide icons

## Project structure

- src/pages: Dashboard, Inventory, Login, Register, Accounts
- src/context: AuthContext for token/session handling
- src/api/axios.js: shared API configuration
- src/components/Sidebar.jsx: ERP navigation

## Run locally

### 1. Install dependencies

npm install

### 2. Start the frontend

npm run dev

The app should run on:

- http://localhost:5173

## Backend expectation

This frontend expects the FastAPI backend to be running on the local development API, typically:

- http://127.0.0.1:8000

The main inventory endpoints are:

- GET /api/products
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}
- GET /api/products/low-stock

## Notes

This is a working prototype and not yet a full production ERP. The current focus is on the core inventory module, dashboard metrics, and a stable local demo flow for academic review purposes.
