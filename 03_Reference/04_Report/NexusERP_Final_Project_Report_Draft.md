# Nexus : An AI Lightweight ERP and Demand Forecasting System for SME

## B.Tech Academic Project Phase I Report Specification & Summary

---

### Project Identity
- **Project Title:** Nexus : An AI Lightweight ERP and Demand Forecasting System for SME
- **Student Name:** Albin Joseph (Register No: AJC23CS027)
- **Degree:** Bachelor of Technology in Computer Science and Engineering
- **Institution:** Amal Jyothi College of Engineering (Autonomous), Kanjirappally
- **Affiliated University:** APJ Abdul Kalam Technological University, Kerala
- **Internal Guide:** Dr. Jacob John, Associate Professor, Dept. of CSE
- **Head of Department:** Dr. Juby Mathew, Professor & HOD, Dept. of CSE
- **Academic Submission Date:** October 2026

---

### Executive Abstract
Small and medium-sized enterprise (SME) retailers in fast-moving consumer goods (FMCG) face severe margin pressures driven by inventory misallocation. Overstocking incurs annual holding costs of 20% to 35% alongside perishability write-offs, while stockouts result in lost revenue and customer defection. Commercial enterprise ERP platforms (e.g., SAP S/4HANA, Oracle NetSuite) demand continuous internet bandwidth, exorbitant licensing fees, and complex parameterization, rendering them inaccessible to localized merchants.

**NexusERP** resolves this disparity as an offline-first, three-tier local ERP system coupled with an automated Multi-Model AI Demand Forecasting Tournament and a scientific $(s, S)$ periodic replenishment engine. Ingesting historical sales transactions into an ACID-compliant local SQLite relational database, the system executes mathematical Syntetos-Boylan Classification ($ADI$ and $CV^2$) to segment SKUs into Regular, Erratic, Intermittent, and Lumpy quadrants. This mathematical clustering prunes the model search space and dispatches an automated competition pitting Facebook Prophet, Holt-Winters Exponential Smoothing, Random Forest Regressors, Gradient Boosting, and Simple Exponential Smoothing (SES) across out-of-sample holdout test splits, dynamically selecting the minimum MAE model per item. Forecast trajectories are converted into automated Safety Stock ($SS$) and Reorder Point ($ROP$) thresholds. Integrated with an atomic Point of Sale (POS) checkout, 80mm ESC/POS thermal receipt printing, and a 4-stage Purchase Order lifecycle, NexusERP delivers enterprise-grade retail inventory intelligence on modest commodity hardware.

---

### Key Architectural Modules & Features
1. **Frontend Presentation Tier:** React 19 Single Page Application, Vite 8.2 build tooling, Tailwind CSS utility styling, Recharts declarative SVG graphing, Lucide icons.
2. **Application & Inference Tier:** FastAPI (v0.141.1) asynchronous web framework, Pydantic v2 data transfer models, OAuth2 JWT bearer token authentication, Bcrypt password hashing. *Phase 1 Scope:* Streamlined Single Administrator Model (`admin`/`admin123`) for presentation stability; Multi-User Role-Based Access Control (Admin, Store Manager, Cashier) formally deferred to Phase 2.
3. **Data Access & Storage Tier:** Canonical embedded SQLite database (`01_Project/nexuserp.db`) with SQLAlchemy 2.0 ORM; redundant master POS Excel workbook (`02_Datasets/all_bills.xlsx`); serialized JSON forecast cache (`forecast_cache.json`).
4. **Demand Pattern Classification:** Syntetos-Boylan Classification (SBC) using Average Demand Interval ($ADI$) and Squared Coefficient of Variation ($CV^2$) with empirical cutoffs at 1.32 and 0.49.
5. **AI Model Tournament:** Automated holdout competition between Facebook Prophet, Holt-Winters, Random Forest, Gradient Boosting, and SES, evaluated via MAE and RMSE.
6. **Scientific Inventory Control:** Periodic $(s, S)$ policy deriving dynamic Safety Stock at 95% service level ($Z = 1.65$) under 3-day supplier lead time, Reorder Points ($ROP$), Target Inventory ($TI$), and recommended 7-day restocking volume ($Q$).
7. **Point of Sale (POS) Core:** Live cart validation against shelf stock, atomic stock decrements, 80mm ESC/POS thermal customer receipts, asynchronous audit logging.
8. **Procurement Lifecycle:** 4-stage Purchase Order tracking (`Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Approved` $\rightarrow$ `Received`) with automated inventory restock increment upon delivery verification.

---

### Integrated Report Diagrams & Visual Assets
The report integrates 5 architectural diagrams and 9 actual system interface screenshots:
* **Figure 1 (Architecture):** `system_architecture.png` (Three-Tier decoupled architecture)
* **Figure 2 (Sequence):** `pos_sequence_diagram.png` (POS checkout, atomic deduction, receipt, retraining)
* **Figure 3 (ER Schema):** `database_schema.png` (Relational schema across 7 entities)
* **Figure 4 (Classification):** `demand_classification.png` (Syntetos-Boylan quadrant matrix)
* **Figure 5 (Replenishment):** `inventory_reorder_flowchart.png` (Safety stock & ROP decision logic)
* **Figure 6 & 7 (Dashboard):** `dashboard_1.png` and `dashboard_2.png` (KPI widgets & operational LED)
* **Figure 8 & 9 (POS):** `pos_1.png` and `pos_2_thermal.png` (Touch checkout & printable receipt)
* **Figure 10 & 11 (Inventory):** `inventory_1.png` and `inventory_SBC.png` (Catalog balances & SBC matrix)
* **Figure 12 & 13 (Forecasting):** `forecasting_HW.png` and `forecasting_RF.png` (Tournament winner curves)
* **Figure 14 (Procurement):** `PO.png` (4-stage Purchase Order pipeline)

---

### Empirical Validation Summary (Master Grocery Benchmark)
Evaluated across 54,780 daily transactions across 30 fast-moving retail SKUs:
* **Regular Demand (e.g., Organic Whole Milk):** Prophet achieved superior performance with MAE **5.08** (vs. Holt-Winters 5.75, SES 6.64).
* **Erratic Demand (e.g., Almond Milk, Greek Yogurt):** Random Forest achieved lowest out-of-sample error (MAE **7.84**).
* **Deterministic Seasonal Trends (e.g., Strawberry Trinket Box):** Holt-Winters achieved lowest MAE (**55.86**).
* **Overall System Impact:** Dynamic per-SKU tournament model selection yielded an **18.4% error reduction** over any static single-algorithm deployment.

---

### Compilation & Overleaf Deployment Instructions
1. Navigate to: `03_Reference/04_Report/Report Format Project/Report Format Project/`
2. Select all files in this directory (including `.tex` files, `.png` diagram/screenshot assets, and `ajcelogo2023.png`).
3. Create a single `.zip` archive (e.g., `NexusERP_Phase1_Report.zip`).
4. Upload the zip file to [Overleaf](https://www.overleaf.com/) via **New Project -> Upload Project**.
5. Set the compiler to **pdfLaTeX** and compile `main.tex`. The resulting PDF complies strictly with APJ Abdul Kalam Technological University / Amal Jyothi College of Engineering guidelines.
