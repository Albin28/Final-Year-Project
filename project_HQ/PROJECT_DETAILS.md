# NexusERP — Master Project Specification & Architecture Details
**AI-Powered Demand Forecasting & Automated Inventory Optimization ERP for Retail**  
*Academic Context: B.Tech Computer Science & Engineering — Final Year Capstone Project*  
*Current Phase: Phase 1 (Single-User Production Demo)*

---

## 1. Executive Summary & Problem Domain
Traditional retail MSMEs and small businesses face severe inventory inefficiencies: overstocking leads to tied-up capital and perishable spoilage, while stockouts result in lost revenue and dissatisfied customers. Existing commercial ERPs (SAP, NetSuite) are prohibitively complex, cost-prohibitive, and lack integrated, explainable demand forecasting tailored to intermittent or seasonal sales patterns.

**NexusERP** bridges this gap by unifying a lightweight, modern web-based ERP (POS Billing, Inventory Control, and Purchase Order Procurement) with an automated AI forecasting engine. It classifies demand regimes, runs an automated multi-model tournament (Prophet, Holt-Winters, SES, Random Forest, Gradient Boosting), detects sales anomalies, and executes a closed-loop $(s, S)$ reordering mechanism that converts AI recommendations directly into trackable Purchase Orders.

---

## 2. Technical Stack & Environment

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Backend Framework** | **FastAPI** (Python 3.10+ / 3.12), Uvicorn ASGI server |
| **Database & ORM** | **SQLite 3** (`01_Project/nexuserp.db`), **SQLAlchemy ORM** |
| **Frontend Framework** | **React 19**, **Vite 6**, Lucide Icons, Axios, React Router v6 |
| **Styling & UI** | Vanilla Modular CSS, Responsive Layouts, Glassmorphic / Dark-mode touches |
| **AI / ML Engine** | `scikit-learn`, `prophet`, `statsmodels`, `scipy`, `numpy`, `pandas`, `openpyxl` |
| **Testing & Automation** | Custom automated module suite (`test_all_modules.py`), Windows Batch Launchers |

---

## 3. User Authentication & Access Control

### Phase 1 (Current Active State)
- **Model**: Single Administrator Model (`admin`).
- **Default Credentials**: 
  - **Username**: `admin`
  - **Password**: `admin123`
  - **Email**: `admin@nexuserp.local`
- **Session**: JWT bearer token stored in client memory/context with automatic redirection.
- **Scope Justification**: Simplified for high-reliability academic demonstration and rapid evaluation, eliminating session-switching friction during viva presentations.

### Phase 2 (Future Deferred Roadmap)
- **Multi-User Role-Based Access Control (RBAC)**:
  - `Admin`: Full system control, AI parameter tuning, user management, financial audits.
  - `Store Manager`: Inventory adjustments, PO approvals, vendor management, forecasting overrides.
  - `Cashier / Staff`: POS checkout, receipt generation, daily shift reconciliation.

---

## 4. System Architecture & Core Modules

```
                    ┌──────────────────────────────────────────────┐
                    │        React 19 + Vite Frontend SPA          │
                    │  (POS, Inventory, Forecasting, POs, Telemetry│
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP / REST / JWT
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               FastAPI Backend                │
                    │         (main.py on 127.0.0.1:8000)          │
                    └──────┬───────────────┬───────────────┬───────┘
                           │               │               │
        ┌──────────────────┴──┐   ┌────────┴─────────┐   ┌─┴───────────────────┐
        │   Core ERP Routers  │   │  AI & Analytics  │   │ Background Services │
        │  /auth, /inventory, │   │  /forecasting,   │   │ prediction_tracker  │
        │  /billing, /pos,    │   │  /analytics,     │   │ scheduler.py        │
        │  /purchase_orders   │   │  Syntetos-Boylan │   │ offline pretrainer  │
        └──────────┬──────────┘   └────────┬─────────┘   └─────────┬───────────┘
                   │                       │                       │
                   ▼                       ▼                       ▼
            SQLite Database       ML Forecast Models         Cache Store
            (`nexuserp.db`)      (Prophet, HW, Tree)    (`forecast_cache.json`)
```

### Module Breakdown

#### A. POS Billing & Instant Stock Reconciliation (`/billing`, `/pos`)
- Real-time checkout with barcode/SKU scanning, live inventory decrement, and validation against current stock.
- Export invoices to Excel (`.xlsx`) and native browser ESC/POS 80mm thermal receipt rendering modal (`ThermalReceiptModal.jsx`).

#### B. Inventory Management & Telemetry (`/products`, `/inventory`)
- CRUD operations for SKUs with dynamic safety stock thresholds, reorder points, unit pricing, and category breakdowns.
- Visual Model Status LED (`ModelStatusLED.jsx`) indicating AI engine readiness and cache freshness.

#### C. Multi-Model Forecasting Tournament (`/forecasting`)
- **Automated Model Tournament**: Evaluates Facebook Prophet, Holt-Winters Exponential Smoothing, Simple Exponential Smoothing (SES), and Random Forest/GBM regressor on rolling sales windows.
- Selects winning model per SKU based on lowest RMSE / MAPE and highest $R^2$.
- **Explainable AI (XAI)**: Feature importance charts exposing key sales drivers (day-of-week, seasonal cycles, rolling 7-day volume).
- **Asynchronous Offline Pre-Training**: Pre-computes 30-day forward horizons into `forecast_cache.json` ensuring sub-50ms dashboard response times.

#### D. Syntetos-Boylan Demand Pattern Classification
- Computes Average Demand Interval (ADI) and squared Coefficient of Variation ($CV^2$) to classify products into 4 quadrants:
  1. **Smooth** (Regular intervals, low variance)
  2. **Erratic** (Regular intervals, high variance)
  3. **Intermittent** (Sporadic intervals, low variance)
  4. **Lumpy** (Sporadic intervals, high variance)

#### E. Strategic Matrix & Spikes
- **ABC-XYZ Matrix**: Clusters inventory by Pareto revenue contribution (ABC) and demand predictability (XYZ) via K-Means.
- **Isolation Forest**: Flags anomalous checkout volumes and sudden spike anomalies.

#### F. Closed-Loop Purchase Order Workflow (`/purchase_orders`)
- Converts AI $(s, S)$ reorder suggestions into formal Purchase Orders with status transitions:
  `Draft` ➔ `Submitted` ➔ `Approved` ➔ `Received`.
- Upon `Received` state confirmation, physical inventory counts in `nexuserp.db` automatically increment.

#### G. Continuous Accuracy Telemetry (`prediction_tracker.py`)
- Background evaluation comparing past forecasted values against actual realized checkout volumes.
- Exposes rolling accuracy progression, directional bias, and running error metrics.

---

## 5. Standardized Dataset Specifications
- **Catalog**: Standardized Indian Retail FMCG Grocery Catalog covering **30 high-volume SKUs** across Staples, Beverages, Personal Care, Dairy, and Packaged Foods.
- **Historical Volume**: 54,780 daily transaction records spanning multi-year sales windows (`master_grocery_top30.xlsx`, `all_bills.xlsx`).
- **Pre-seeding Script**: `unify_top30_dataset.py` creates tables, seeds Top 30 products, seeds `admin`, and imports consolidated bills.

---

## 6. Execution & Verification Guide

### Backend Service
```bash
# From workspace root
.venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
# (Runs in 01_Project/backend)
```

### Frontend Service
```bash
# From 01_Project/frontend
npm run dev
# (Accessible at http://localhost:5173)
```

### Full Regression Test Suite
```bash
.venv/Scripts/python.exe 01_Project/backend/test_all_modules.py
```

### Pretrain Offline AI Cache
```bash
.venv/Scripts/python.exe 01_Project/backend/pretrain_all_products.py
```

---

## 7. Report Figures & Visual Asset Mapping (LaTeX / Overleaf)
When writing or editing the LaTeX report, reference the following exact image filenames bundled in the report directory:

| Figure # | Filename | Description & System Flow |
| :--- | :--- | :--- |
| **Figure 1** | `system_architecture.png` | Three-Tier decoupled architecture (FastAPI, React 19, SQLite, AI engine). |
| **Figure 2** | `pos_sequence_diagram.png` | POS checkout sequence: live validation, atomic stock deduction, 80mm ESC/POS receipt. |
| **Figure 3** | `database_schema.png` | Relational Entity-Relationship (ER) schema across 7 core entities. |
| **Figure 4** | `demand_classification.png` | Syntetos-Boylan quadrant classification matrix ($ADI$ vs. $CV^2$). |
| **Figure 5** | `inventory_reorder_flowchart.png`| $(s, S)$ periodic replenishment and Safety Stock ($SS$) decision flowchart. |
| **Figure 6** | `dashboard_1.png` | Executive KPI overview cards, daily revenue, and stockout alert telemetry. |
| **Figure 7** | `dashboard_2.png` | Operational Model Status LED indicator and fast-moving items telemetry. |
| **Figure 8** | `pos_1.png` | Touch POS checkout terminal interface with live SKU lookup. |
| **Figure 9** | `pos_2_thermal.png` | 80mm ESC/POS printable customer thermal receipt invoice preview. |
| **Figure 10** | `inventory_1.png` | Inventory catalog listing with live stock balances and low-stock badges. |
| **Figure 11** | `inventory_SBC.png` | Syntetos-Boylan classified inventory matrix with quadrant distribution. |
| **Figure 12** | `forecasting_HW.png` | Holt-Winters exponential smoothing trajectory on seasonal sales data. |
| **Figure 13** | `forecasting_RF.png` | Random Forest regressor out-of-sample forecast curve on erratic items. |
| **Figure 14** | `PO.png` | Closed-loop 4-stage Purchase Order procurement dashboard. |

---

## 8. Empirical Validation Benchmark Results
Evaluated across 54,780 real-world grocery transactions spanning 30 FMCG SKUs:
- **Regular / Smooth Demand (e.g., Organic Whole Milk)**: Facebook Prophet won tournament with lowest MAE (**5.08**) vs. Holt-Winters (5.75) and SES (6.64).
- **Erratic Demand (e.g., Almond Milk, Greek Yogurt)**: Random Forest Regressor captured nonlinear variance with lowest MAE (**7.84**).
- **Seasonal Trend Demand (e.g., Strawberry Trinket Box)**: Holt-Winters captured multiplicative seasonality with lowest MAE (**55.86**).
- **Tournament Advantage**: Dynamic per-SKU multi-model tournament selection achieved an **18.4% average error reduction** across all SKUs compared to deploying any single static forecasting algorithm.

---

## 9. Instructions for Downstream AI Assistants
1. **Scope Protocol**: Phase 1 is strictly single-user (`admin` / `admin123`). Do not reintroduce multi-user roles unless instructed for Phase 2.
2. **Never break existing API contracts**: All routes under `/api` in `routers/` must preserve query parameters and Pydantic schemas.
3. **Follow the Strict Change Proposal Protocol**: Generate candidate tables for deletions and obtain user approval prior to mutating files.

