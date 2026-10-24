# NexusERP — Current Project Status
**AI-Based Inventory & Sales Forecasting System for Small Business ERP Management**  
*Last Verified & Updated: 22 October 2026*  
*Overall Status: 🟢 FINAL REVIEW READY (>85% IMPLEMENTATION ACHIEVED)*

---

## 1. Authentication & Scope Baseline
- **Current Active Model**: **Single Administrator User** (`admin` / `admin123`).
- **Database Status**: Cleaned. Demo accounts (`manager`, `cashier`) removed from `01_Project/nexuserp.db`.
- **Seeding Status**: Updated `unify_top30_dataset.py` to seed only `admin`.
- **Phase 2 Deferred Scope**: Multi-user Role-Based Access Control (Admin, Store Manager, Cashier) formally deferred to Phase 2 after the final review demo.

---

## 2. Academic Milestones (July 2026 – November 2026)

| Milestone | Window | Academic Focus | Status |
| :--- | :--- | :--- | :--- |
| **Milestone 1 — Topic Finalization** | 6–7 July 2026 | Scope locked with project guide for academic delivery. | ✅ COMPLETED |
| **Milestone 2 — Proposal Presentation** | 8–14 July 2026 | Problem definition, objectives, abstract, and base paper submission. | ✅ COMPLETED |
| **Milestone 3 — Interim Review 1** | 3–14 August 2026 | Literature survey, requirements, feasibility, 20% prototype demo. | ✅ COMPLETED (20 Marks) |
| **Milestone 4 — Interim Review 2** | 14–25 September 2026 | 50%+ implementation, multi-model forecasting tournament, SBC engine. | ✅ COMPLETED (20 Marks) |
| **Milestone 5 — Final Review** | 27–28 October 2026 | 80%+ implementation, soft-bound report submission, 10-min viva + 10-min demo. | 🟢 READY FOR EVALUATION |

---

## 3. Verified System Modules

### A. Core ERP Subsystems
- ✅ **FastAPI Backend**: Asynchronous REST endpoints running on `127.0.0.1:8000`.
- ✅ **React 19 + Vite Frontend**: Responsive SPA with modular components running on `localhost:5173`.
- ✅ **ACID Relational Storage**: Canonical SQLite database (`01_Project/nexuserp.db`).
- ✅ **Inventory Control**: Live stock balances, barcode lookups, low-stock notifications.
- ✅ **POS Checkout**: Cart stock validation, instant inventory decrements, Excel export (`.xlsx`).
- ✅ **80mm ESC/POS Thermal Receipt**: Browser-native thermal receipt modal (`ThermalReceiptModal.jsx`).

### B. Machine Learning & Forecasting Engine
- ✅ **Multi-Model Tournament**: Automatic holdout evaluation comparing Facebook Prophet, Holt-Winters Exponential Smoothing, SES, and Random Forest Regressor.
- ✅ **Syntetos-Boylan Classification (SBC)**: Classifies items by $ADI$ and $CV^2$ into Smooth, Erratic, Intermittent, and Lumpy quadrants.
- ✅ **Explainable AI (XAI)**: Feature importance analysis displaying top sales drivers.
- ✅ **Model Leaderboard**: Real-time evaluation table comparing $R^2$, MAE, RMSE, and MAPE metrics.
- ✅ **ABC-XYZ Matrix & Spikes**: K-Means revenue-predictability clustering and Isolation Forest anomaly spike detection.
- ✅ **Asynchronous Offline Pre-Training**: Pre-computes 30-day forecast horizons into `forecast_cache.json` (<40ms response).

### C. Closed-Loop Procurement
- ✅ **Purchase Order Workflow**: Automatic conversion of $(s, S)$ reorder suggestions into active POs.
- ✅ **State Machine**: `Draft` ➔ `Submitted` ➔ `Approved` ➔ `Received`.
- ✅ **Stock Replenishment**: Direct increment of physical stock upon `Received` state transition.
- ✅ **Safety Stock Simulator**: Interactive tuning of Lead Time ($L=1\dots14$ days) and Service Level ($Z=90\%, 95\%, 99\%$).

### D. Continuous Accuracy Telemetry
- ✅ **Daily Prediction Tracker**: `prediction_tracker.py` and `scheduler.py` logging forecast vs. realized checkout delta.
- ✅ **Operational LED**: Model health indicator (`ModelStatusLED.jsx`) in top navigation bar.

---

## 4. Immediate Final Review Action Items
1. **Report Soft-Binding Submission (Deadline: 26 October 2026)**:
   - Compile final report in Overleaf using the LaTeX package (`main.tex`).
   - Submit soft-bound physical copy and PDF to division coordinators.
2. **Viva & Demonstration Rehearsal**:
   - 10-minute presentation covering problem, mathematics (SBC + $(s, S)$ policy), and tournament results.
   - 10-minute live demonstration flow:
     `Login (admin) ➔ Dashboard & Model Health LED ➔ POS Billing & Thermal Receipt ➔ Live Inventory Decrement ➔ Forecasting Tournament Leaderboard & XAI ➔ AI $(s, S)$ Restock to PO Conversion ➔ PO Receipt Stock Increment`.
