---
marp: true
---

# NexusERP — Final Review (Phase 1) Presentation Slide Deck & Viva Defense Guide
**Course Code:** 23CSD415 — Project Phase I  
**Milestone:** Milestone 5 — Final Review & Evaluation (30 Marks Demo & Presentation + 10 Marks Report)  
**Academic Year:** 2026–2027 (Batch 2023–2027 CSE)  
**Project Title:** NexusERP: An Edge-First, Self-Learning ERP and Automated Multi-Model Demand Forecasting System for SME Retail  
**Student Name:** Albin Joseph (Reg No: AJC23CS027) | Division: CSE  
**Institution:** Amal Jyothi College of Engineering (Autonomous), Kanjirappally  
**Affiliated University:** APJ Abdul Kalam Technological University (KTU), Kerala  
**Internal Guide:** Dr. Jacob John, Associate Professor, Dept. of Computer Science & Engineering  
**Head of Department:** Dr. Juby Mathew, Professor & HOD, Dept. of Computer Science & Engineering  
**Implementation Status:** 🟢 **>85% Completed (Exceeds 80% Phase 1 Syllabus Requirement)**  
**Presentation Allocation:** 10 Minutes Oral Defense + 10 Minutes Working System Live Demo  

---

## Presentation Structure Overview (10-Minute Allocation)

| Slide # | Slide Title | Key Visual Asset / Diagram | Speaking Time |
| :---: | :--- | :--- | :---: |
| **Slide 1** | Title Slide & Academic Identity | College Crest (`ajcelogo2023.png`) | 0:45 |
| **Slide 2** | Problem Formulation & SME Retail Realities | Industry Pain-Points Infographic | 0:45 |
| **Slide 3** | Theoretical Foundation & Literature Survey Matrix | Literature Summary Matrix Table | 1:00 |
| **Slide 4** | Project Objectives & Scope Boundaries | Scope Boundary Card | 0:45 |
| **Slide 5** | Three-Tier Edge-Native Architecture | Architecture Diagram (`system_architecture.png`) | 1:00 |
| **Slide 6** | Relational Database Design & ACID Integrity | ER Schema Diagram (`database_schema.png`) | 0:45 |
| **Slide 7** | Demand Classification: Syntetos-Boylan Framework | SBC Matrix (`demand_classification.png`) | 0:50 |
| **Slide 8** | Automated Multi-Model Tournament Engine | Feature Engineering & Model Pool | 1:00 |
| **Slide 9** | Scientific Periodic $(s, S)$ Replenishment Logic | Reorder Flowchart (`inventory_reorder_flowchart.png`) | 0:50 |
| **Slide 10** | Closed-Loop Procurement Lifecycle (PO Workflow) | PO State Machine & UI (`PO.png`) | 0:45 |
| **Slide 11** | Dataset Engineering: Master 30 FMCG SKUs | Dataset Profile & 54,780 Records | 0:40 |
| **Slide 12** | Empirical Results & Model Benchmark Table | Benchmark Table (`forecasting_RF.png`, `forecasting_HW.png`) | 1:00 |
| **Slide 13** | Phase 1 Implementation Audit vs Syllabus Rubric | 85%+ Audit Matrix Table | 0:45 |
| **Slide 14** | Step-by-Step Live Demonstration Script | Demo Sequence Diagram (`pos_sequence_diagram.png`) | 0:45 |
| **Slide 15** | Engineering Challenges Solved & System Optimization | Optimization & Telemetry Badges | 0:45 |
| **Slide 16** | Phase 2 Scalability Roadmap & Academic Conclusion | Future Architecture Roadmap | 0:40 |
| **Total** | **16 Slides** | **Comprehensive Academic Deck** | **~10:00** |

---

# Detailed Slide Content & Speaker Notes

---

## Slide 1: Title Slide & Project Identity
- **Header:** Department of Computer Science and Engineering | B.Tech Capstone Project Phase 1 (23CSD415)
- **Main Title:** **NexusERP: An Edge-First, Self-Learning ERP and Automated Multi-Model Demand Forecasting System for SME Retail**
- **Subtitle:** Final Review Evaluation & Working Prototype Demonstration (85%+ Implementation Milestone)
- **Student Details:** Albin Joseph (Register No: AJC23CS027) | Semester 7 CSE
- **Supervision:** Under the Guidance of **Dr. Jacob John**, Associate Professor, Dept. of CSE
- **Institutional Emblem:** Amal Jyothi College of Engineering (Autonomous), Affiliated to APJ Abdul Kalam Technological University
- **Slide Badges:**
  - `Offline-First Edge Runtime` | `ACID Relational Core` | `Syntetos-Boylan Demand Classifier` | `Multi-Model Tournament` | `Closed-Loop Procurement`
- **Visual Asset:** `04_Resources/ajcelogo2023.png`
- **Speaker Script (45 Seconds):**
  > "Good morning respected Head of the Department, project coordinator, and internal guide. I am Albin Joseph, presenting the Phase 1 Final Review for NexusERP: An Edge-First, Self-Learning ERP and Automated Multi-Model Demand Forecasting System for SME Retail. While large retail conglomerates employ multi-million dollar supply-chain systems, independent retail merchants remain trapped in manual guesswork. NexusERP bridges this gap by embedding modern time-series machine learning into a lightweight, 100% offline edge ERP. For today's final review, where the syllabus mandates an 80% implementation threshold, NexusERP has achieved over 85% completion across all core modules, which I will present and demonstrate today."

---

## Slide 2: Problem Formulation & Industry Motivation
- **Slide Title:** Operational Vulnerabilities in SME Retail Supply Chains
- **Core Industry Problems:**
  1. **Precarious Net Margins (2% to 5%):** Small and medium FMCG grocers operate on paper-thin profits where working capital allocation directly dictates business survival.
  2. **The Overstocking Burden (20% to 35% Holding Cost):** Over-ordering ties up critical operating cash, risks spoilage of perishables (dairy, bakery), and increases storage overheads.
  3. **The Stockout Penalty (15% to 20% Revenue Loss):** Depleted staple items cause immediate customer churn and brand defection to competing neighborhood stores.
  4. **The Enterprise Software Gap:** Existing commercial platforms (SAP S/4HANA, Oracle NetSuite) impose prohibitive licensing costs, mandate high-bandwidth cloud connectivity, and require dedicated data science teams to tune forecast parameters.
- **The NexusERP Paradigm:**
  - A zero-subscription, local edge ERP that unifies daily POS billing with autonomous, self-tuning time-series forecasting and closed-loop $(s, S)$ automated purchasing.
- **Visual Layout:** Side-by-side comparison diagram: *Manual Intuitive Ordering (Reactive, Fragmented, Spoilage/Stockout prone)* vs *NexusERP Predictive Pipeline (Predictive, Edge-native, Automated POs)*.
- **Speaker Script (45 Seconds):**
  > "Neighborhood grocery stores cannot afford dedicated data scientists or high-cost enterprise cloud subscriptions. Store managers balance between two extremes: over-ordering, which incurs annual holding costs between 20% and 35% alongside spoilage write-offs, or under-ordering, which triggers immediate lost revenue and customer defection. Existing software solutions either provide basic billing without intelligence, or offer cloud-based AutoML suites that cost thousands of dollars monthly. NexusERP addresses this fundamental gap by delivering self-learning intelligence on commodity hardware with zero cloud dependence."

---

## Slide 3: Theoretical Foundation & Literature Survey Matrix
- **Slide Title:** Literature Baseline & Addressed Research Gaps
- **Comparative Literature Synthesis Table:**

| Reference & Citation | Target Domain | Methodology | Key Takeaways | Addressed Research Gap in NexusERP |
| :--- | :--- | :--- | :--- | :--- |
| **Silva et al. (2026)**<br>*Springer IJAMT*<br>DOI: `10.1007/s00170-026-17483-1` | Energy utility spare parts (2,244 items) | Syntetos-Boylan (SBC) + Random Forest, XGBoost, Holt-Winters | No single model dominates all series; ML wins on erratic/intermittent series, Holt-Winters wins on seasonal regular items. | Operationalized offline Python experiments into a live edge ERP with POS transaction sync and automated replenishment. |
| **Goulart et al. (2026)**<br>*Future Business Journal*<br>DOI: `10.1186/s43093-026-00807-8` | SME construction supply distributor | Cloud AutoML (AWS SageMaker Canvas, Amazon Forecast) | Predictive models cut forecast error (WAPE 0.69%) and stockouts by 31% over manual spreadsheets. | Replaced recurring cloud SaaS costs ($500–$1,500/mo) and internet dependency with an autonomous offline local execution engine. |
| **Basavaraju et al. (2025)**<br>*Discover Applied Sciences*<br>DOI: `10.1007/s42452-025-06740-9` | Multinational supply chain enterprise | JDA + SAP ERP sales transaction joint forecasting | Aligning ERP transaction history directly with dynamic replenishment thresholds mitigates bullwhip distortions. | Eliminated heavy enterprise middleware; unified transactional POS and predictive demand planning in a single lightweight local stack. |
| **Douaioui et al. (2024)**<br>*Applied System Innovation*<br>DOI: `10.3390/asi7050093` | Supply chain ML/DL systematic survey (119 papers) | Decision tree ensembles vs Deep Learning (LSTM, GRU) | Tree ensembles outperform deep learning on tabular retail sales data with far lower computational overhead. | Validated lightweight tree regressors and statistical algorithms running on commodity quad-core hardware (<450MB RAM). |

- **Speaker Script (60 Seconds):**
  > "Our architecture builds directly on four peer-reviewed studies published between 2024 and 2026. The cornerstone is our base paper by da Silva et al., published in Springer's IJAMT in 2026. They proved that no single algorithm wins across all retail demand profiles: machine learning regressors excel on erratic patterns, while decomposition methods win on regular seasonal series. However, their research was confined to offline data science scripts. Supporting papers by Goulart et al. and Basavaraju et al. proved the high commercial impact of predictive planning, but relied on expensive cloud platforms or enterprise middleware. Finally, Douaioui et al. verified that tree ensembles outperform deep neural networks on tabular time series while consuming minimal CPU. NexusERP synthesizes these academic findings into a unified, edge-native ERP."

---

## Slide 4: Project Objectives & Phase 1 Scope Boundary
- **Slide Title:** Specific Project Objectives & Scope Delimitation
- **Phase 1 Concrete Objectives (Achieved):**
  1. **Decoupled Edge Architecture:** Build a responsive 3-tier local architecture (React 19, FastAPI REST API, SQLite relational DB).
  2. **High-Throughput POS Engine:** Deliver atomic POS billing with instant cart stock validation, inventory decrement, and 80mm ESC/POS thermal receipt formatting.
  3. **Demand Pattern Classification:** Implement Syntetos-Boylan Classification (SBC) using $ADI$ and $CV^2$ to categorize items into Regular, Erratic, Intermittent, and Lumpy quadrants.
  4. **Multi-Model Tournament Engine:** Build an automated tournament pitting Facebook Prophet, Holt-Winters, Random Forest, Gradient Boosting, and SES over temporal holdout splits.
  5. **Dynamic $(s, S)$ Replenishment:** Derive mathematically rigorous Safety Stock ($SS$), Reorder Points ($ROP$), and Target Inventory ($TI$) under 95% service levels ($Z=1.65$).
  6. **Closed-Loop Procurement:** Implement a 4-stage Purchase Order lifecycle (`Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Approved` $\rightarrow$ `Received`) that automatically increments stock on receipt.
- **Pragmatic Scope Boundaries (Phase 1 vs Phase 2):**
  - **In-Scope (Phase 1 Delivered):** Single-user admin authentication, local SQLite persistence, offline model pre-training cache, POS thermal printing, Excel exports.
  - **Deferred to Phase 2 (Future Scope):** Multi-user Role-Based Access Control (Cashier/Manager/Auditor), distributed multi-store WAN replication, direct USB barcode hardware interrupts.
- **Speaker Script (45 Seconds):**
  > "For Project Phase 1, our primary objective was to deliver a complete closed loop: from POS customer checkout and atomic stock decrement, through mathematical demand classification and automated model competition, to dynamic reorder calculation and Purchase Order fulfillment. To guarantee maximum stability for academic defense and avoid session-switching friction during evaluation, we adopted a single-administrator security model for Phase 1, formally deferring multi-user role permissions and multi-store cloud replication to Phase 2."

---

## Slide 5: Three-Tier Edge-Native Architecture
- **Slide Title:** Decoupled System Architecture & Component Interaction
- **Architecture Diagram:**
  ```
  +-----------------------------------------------------------------------------------+
  |                           PRESENTATION TIER (React 19 + Vite 6)                   |
  |  - Dashboard KPI Widgets     - Touch POS & Barcode Cart    - Recharts SVG Visualizer|
  |  - System Status LED         - 80mm Thermal Receipt Modal  - ABC-XYZ Matrix & XAI   |
  +------------------------------------------+----------------------------------------+
                                             | HTTP REST / JSON / JWT (Axios)
                                             v
  +-----------------------------------------------------------------------------------+
  |                        APPLICATION & INFERENCE TIER (FastAPI)                     |
  |  - FastAPI Gateway (Uvicorn ASGI, CORS, OAuth2 Bearer Authentication, Pydantic v2)|
  |  - Core ERP Routers: /auth, /products, /pos, /billing, /purchase_orders           |
  |  - AI Demand Forecasting Engine: Syntetos-Boylan Classifier + Multi-Model Runner  |
  |  - Background Services: Prediction Tracker, Daily Scheduler, Offline Pretrainer   |
  +------------------------------------+----------------------------------------------+
                                       |
        +------------------------------+------------------------------+
        | SQLAlchemy 2.0 ORM Engine                                   | Disk File Access
        v                                                             v
  +--------------------------------------------+    +---------------------------------+
  | DATA ACCESS TIER (Canonical SQLite DB)     |    | PERSISTENT CACHE & EXCEL LOGS   |
  | - 01_Project/nexuserp.db (WAL Mode)        |    | - forecast_cache.json (<40ms)   |
  | - Tables: users, products, bills,          |    | - all_bills.xlsx (POS Register) |
  |   bill_items, purchase_orders, prediction  |    | - master_grocery_top30.xlsx     |
  +--------------------------------------------+    +---------------------------------+
  ```
- **Architectural Rationale:**
  - **FastAPI (Python 3.11+):** Asynchronous ASGI performance, automatic OpenAPI documentation, native integration with SciPy/Pandas/Prophet.
  - **React 19 + Vite 6:** Modern component-driven reactivity, ultra-fast Hot Module Replacement, sub-second client updates.
  - **SQLite (WAL Mode):** Write-Ahead Logging allows concurrent readers while atomic writes occur, completely eliminating server maintenance.
- **Visual Asset:** `04_Resources/system_architecture.png`
- **Speaker Script (60 Seconds):**
  > "The system is structured as a decoupled 3-tier architecture. The presentation tier is built with React 19 and Vite 6, utilizing modular styling and Recharts for interactive forecast inspection. The application tier runs on FastAPI over Uvicorn, handling REST requests, token security, and orchestrating the AI forecasting engine. Data persistence relies on a canonical SQLite database configured with Write-Ahead Logging. This allows rapid concurrent reads from the dashboard while POS checkout writes commit atomically. To eliminate cold-start delays during evaluation, winning forecast trajectories are pre-cached into a persistent JSON cache, serving prediction curves in under 40 milliseconds."

---

## Slide 6: Relational Database Design & ACID Integrity
- **Slide Title:** Relational Persistence Layer & Transactional Atomicity
- **Relational Tables in `01_Project/nexuserp.db`:**
  1. `users`: Credentials (`id`, `username`, `hashed_password`, `role`, `created_at`).
  2. `products`: Master catalog (`id`, `name`, `sku`, `category`, `price`, `cost_price`, `quantity_in_stock`, `reorder_level`).
  3. `bills`: POS transactions (`id`, `bill_number`, `total_amount`, `payment_method`, `created_at`).
  4. `bill_items`: Line items (`id`, `bill_id` [FK ON DELETE CASCADE], `product_id` [FK], `quantity`, `unit_price`, `line_total`).
  5. `purchase_orders`: Replenishment lifecycle (`id`, `po_number`, `product_id` [FK], `quantity`, `unit_cost`, `status`, `created_at`).
  6. `prediction_log`: Daily forecast vs realized actuals tracking (`id`, `product_id`, `forecast_date`, `predicted_value`, `actual_value`, `model_name`).
  7. `system_config`: Key-value configuration for background scheduler timestamps and status dirty flags.
- **ACID Transaction Enforcements:**
  - **Pre-Commit Stock Validation:** Verifies requested cart quantity $\le$ physical shelf stock before transaction processing.
  - **Atomic Decrement:** Inventory decrement and bill line-item creation execute within a single atomic SQLAlchemy transaction block (`session.commit()`).
  - **Redundant Register:** Transactions are committed to SQLite and asynchronously mirrored to `all_bills.xlsx`.
- **Visual Asset:** `04_Resources/database_schema.png`
- **Speaker Script (45 Seconds):**
  > "Our database schema consists of seven normalized relational tables managed via SQLAlchemy 2.0 with strict foreign-key integrity. During point-of-sale checkout, the backend validates available shelf stock. If stock is sufficient, the system decrements inventory balances, generates line items, and commits the bill record within a single atomic transaction. If any item is unavailable, an HTTP 409 conflict is raised, preventing database corruption or negative inventory balances."

---

## Slide 7: Mathematical Modeling: Syntetos-Boylan Demand Classification
- **Slide Title:** Demand Pattern Categorization via Syntetos-Boylan (SBC)
- **Mathematical Formulations:**
  - **Average Demand Interval ($ADI$):** Frequency of positive sales arrivals across $T$ total periods with $N$ non-zero days:
    $$ADI = \frac{T}{N} = \frac{T}{|\{t \mid y_t > 0\}|}$$
  - **Squared Coefficient of Variation ($CV^2$):** Demand size variability of positive transactions:
    $$CV^2 = \left(\frac{\sigma_S}{\mu_S}\right)^2 = \frac{\frac{1}{N}\sum_{y \in S}(y - \mu_S)^2}{\left(\frac{1}{N}\sum_{y \in S}y\right)^2}$$
- **The 4 Demand Quadrants (Standard Cutoffs: $ADI = 1.32$, $CV^2 = 0.49$):**

| Quadrant | Velocity Characteristics | Retail Commodity Examples | Optimal Candidate Algorithms |
| :--- | :--- | :--- | :--- |
| **Regular (Smooth)**<br>($ADI < 1.32, CV^2 < 0.49$) | High transaction frequency, low volume variance, strong weekly seasonality | Whole Milk, Fresh Bread, Eggs | Facebook Prophet, Holt-Winters |
| **Erratic**<br>($ADI < 1.32, CV^2 \ge 0.49$) | High transaction frequency, volatile customer purchase batch sizes | Cooking Oil, Sugar, Festive Sweets | Random Forest, Gradient Boosting |
| **Intermittent**<br>($ADI \ge 1.32, CV^2 < 0.49$) | Sporadic purchase arrivals, stable individual order sizes | Specialty Spices, Kitchen Cookware | Simple Exponential Smoothing (SES), Random Forest |
| **Lumpy**<br>($ADI \ge 1.32, CV^2 \ge 0.49$) | Sporadic purchase arrivals combined with highly volatile batch sizes | Premium Chocolates, Luxury Gift Boxes | Simple Exponential Smoothing (SES) |

- **Visual Asset:** `04_Resources/demand_classification.png`
- **Speaker Script (50 Seconds):**
  > "Before fitting any forecasting algorithm, NexusERP analyzes the historical sales distribution using the Syntetos-Boylan framework. We compute two non-parametric metrics: Average Demand Interval, which measures transaction frequency, and $CV^2$, which measures demand size variability. Products are mapped across empirical thresholds of 1.32 and 0.49 into four distinct quadrants: Regular, Erratic, Intermittent, and Lumpy. This categorization informs the candidate algorithm pool, preventing the misapplication of seasonal models to sparse items."

---

## Slide 8: Automated AI Forecasting Tournament Engine
- **Slide Title:** Multi-Model Tournament & Supervised Feature Engineering
- **Supervised Tabular Feature Engineering (for Tree Ensembles):**
  - Transforms raw time series into tabular lag matrices:
    $$X_t = \left[ y_{t-1}, y_{t-7}, \text{MA}_7(y_t), \text{Std}_7(y_t), \text{DayOfWeek}(t), \text{IsWeekend}(t), \text{Month}(t) \right]$$
- **The Candidate Competitor Algorithms:**
  1. **Facebook Prophet:** Generalized Additive Model decomposable into trend, 7-day Fourier weekly seasonality, and holiday regressors:
     $$y(t) = g(t) + s(t) + h(t) + \epsilon_t$$
  2. **Holt-Winters Triple Exponential Smoothing:** Captures level, trend, and 7-day cyclical seasonality:
     $$\hat{y}_{t+h} = (\ell_t + h b_t) s_{t+h-m(k+1)}$$
  3. **Scikit-Learn Random Forest & Gradient Boosting:** Non-linear decision trees capturing price elasticity and rolling moving-average momentum.
  4. **Simple Exponential Smoothing (SES):** Robust baseline for non-seasonal stationary series:
     $$\hat{y}_{t+1} = \alpha y_t + (1 - \alpha)\hat{y}_t$$
- **Tournament Evaluation Protocol:**
  - 80/20 chronological train-test split without data shuffling.
  - Out-of-sample holdout evaluation on MAE, RMSE, and MAPE.
  - The algorithm minimizing holdout MAE is designated as tournament winner for that SKU.
- **Explainable AI (XAI):** Gini feature importance exposes top sales drivers directly in the frontend UI.
- **Visual Asset:** `04_Resources/forecasting_RF.png`
- **Speaker Script (60 Seconds):**
  > "Rather than enforcing a static forecasting algorithm across the entire store, NexusERP executes an automated tournament. For tree-based models like Random Forest and Gradient Boosting, we construct tabular features including lag-1, lag-7, 7-day rolling statistics, and day-of-week indicators. The system chronologically splits historical data into an 80% training window and a 20% holdout test window. It trains Prophet, Holt-Winters, Random Forest, Gradient Boosting, and SES, and computes out-of-sample MAE and RMSE. The algorithm achieving the lowest holdout error is dynamically selected as the active model, refit across all data, and projected forward 30 days."

---

## Slide 9: Scientific Periodic $(s, S)$ Replenishment Logic
- **Slide Title:** Translating Predictions into Deterministic Restock Orders
- **Inventory Replenishment Mathematical Equations:**
  - **Forecasted Average Daily Demand ($\bar{d}$):**
    $$\bar{d} = \frac{1}{30}\sum_{i=1}^{30}\hat{y}_{t+i}$$
  - **Dynamic Safety Stock ($SS$):** Under Gaussian demand variance with $Z=1.65$ (95% Service Level) and supplier lead time $L=3$ days:
    $$SS = Z \cdot \sigma_{\text{daily}} \cdot \sqrt{L} = 1.65 \cdot \sigma_{\text{daily}} \cdot \sqrt{3}$$
  - **Dynamic Reorder Point ($ROP$):**
    $$ROP = (\bar{d} \cdot L) + SS$$
  - **Target Inventory ($TI$) for 7-Day Planning Cycle ($T_{\text{cycle}} = 7$ days):**
    $$TI = (\bar{d} \cdot T_{\text{cycle}}) + SS$$
  - **Deterministic Order Quantity ($Q$):**
    $$\text{Restock Trigger} = (I_{\text{curr}} < TI) \land (I_{\text{curr}} \le \max(ROP, R_{\text{db}}))$$
    $$Q = \begin{cases} \lceil TI - I_{\text{curr}} \rceil, & \text{if Restock Trigger is True} \\ 0, & \text{otherwise} \end{cases}$$
- **Retail Practicality:**
  - Traditional textbook EOQ formulas produce multi-thousand bulk warehouse numbers. Our 7-day cyclical formulation generates clean, sensible 2-to-3 digit replenishment quantities (e.g., order 65 units).
- **Visual Asset:** `04_Resources/inventory_reorder_flowchart.png`
- **Speaker Script (50 Seconds):**
  > "A forecast is only valuable if it produces a concrete procurement decision. NexusERP feeds forecasted daily demand directly into dynamic inventory equations. We calculate Safety Stock using a 95% service level factor and a 3-day supplier lead time. When current shelf stock drops below the Reorder Point, the system calculates the exact target order quantity required to safely cover the next 7-day retail review cycle. This prevents both dangerous stockouts and excessive cash lockup."

---

## Slide 10: Closed-Loop Procurement Lifecycle (PO Workflow)
- **Slide Title:** Automated Restock-to-Purchase Order Conversion
- **The 4-Stage Purchase Order State Machine:**
  ```
  [ AI Replenishment Engine ]
              |
              | (Restock Required: Q Units)
              v
     +-----------------+
     | 1. DRAFT        |  --> Generated automatically from AI suggested quantity
     +--------+--------+
              | (Store Manager Submits)
              v
     +-----------------+
     | 2. SUBMITTED    |  --> Dispatched to supplier with vendor pricing
     +--------+--------+
              | (Supplier Confirms Order)
              v
     +-----------------+
     | 3. APPROVED     |  --> Pending shipment / goods in transit
     +--------+--------+
              | (Goods Physically Arrive & Confirmed)
              v
     +-----------------+
     | 4. RECEIVED     |  --> ATOMIC INVENTORY INCREMENT (Stock += Q)
     +-----------------+
  ```
- **Operational Integration:**
  - Fully closed-loop: Clicking "Create PO" on any AI forecast card instantly populates the Purchase Order screen.
  - Transitioning status to `Received` automatically updates `products.quantity_in_stock` in SQLite, closing the supply-chain loop.
- **Visual Asset:** `04_Resources/PO.png`
- **Speaker Script (45 Seconds):**
  > "NexusERP provides a complete closed-loop procurement lifecycle. When the forecasting engine detects that an item requires restocking, the store manager can convert that recommendation into an active Purchase Order with one click. The PO progresses through a four-stage state machine: Draft, Submitted, Approved, and Received. Crucially, when physical goods arrive at the store and the manager marks the PO as Received, the system automatically increments the inventory balance in the database."

---

## Slide 11: Dataset Engineering: Master 30 FMCG SKUs
- **Slide Title:** Empirical Dataset Assembly & FMCG Catalog Calibration
- **Master Unified Dataset (`master_grocery_top30.xlsx`, `all_bills.xlsx`):**
  - **Historical Volume:** **54,780 daily transaction records** spanning 2 continuous years (October 2024 to October 2026).
  - **Transaction Bills:** **18,386 verified customer bills** ingested into relational storage.
  - **Catalog Coverage:** 30 high-velocity Indian retail grocery SKUs mapped across 5 core categories:
    - *Dairy & Staples:* Amul Taaza Milk, Britannia Wheat Bread, India Gate Basmati Rice, Aashirvaad Atta, Eggs.
    - *Oils & Condiments:* Borges Olive Oil, Fortune Sunflower Oil, Tata Salt, Catch Spices.
    - *Beverages & Breakfast:* Paper Boat Aamras, Nescafe Classic, Tata Tea Gold, Kellogg's Corn Flakes.
    - *Snacks & Sweets:* Haldiram's Kaju Katli, Lay's Chips, Cadbury Dairy Milk, Ferrero Rocher.
    - *Household & Personal:* Dettol Handwash, Surf Excel Detergent, Prestige Cookware.
- **Engineering Advantage:**
  - High empirical realism enabling evaluation panels to inspect authentic weekly shopping cycles, festival demand surges, and realistic price elasticity.
- **Speaker Script (40 Seconds):**
  > "To ensure rigorous empirical evaluation, we constructed a master retail catalog comprising 54,780 daily sales records and 18,386 customer bills spanning two continuous years across 30 fast-moving consumer goods. The catalog covers everyday staples like Milk, Bread, and Rice, seasonal beverages, erratic festive sweets, and intermittent specialty goods. This authentic dataset allows evaluators to observe realistic weekly shopping cycles and genuine holiday surges."

---

## Slide 12: Empirical Results & Model Benchmark Table
- **Slide Title:** Multi-Model Tournament Benchmarking & Error Reductions
- **Empirical Tournament Performance across Representative SKUs:**

| Product Name | Category | SBC Class | Winning Model | Prophet MAE | Holt-Winters MAE | Random Forest MAE | SES MAE | Tournament Winner MAPE | Error Reduction vs Baseline |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Amul Taaza Toned Milk (1L)** | Dairy | Regular | **Gradient Boosting** | 5.08 | 5.75 | 5.92 | 6.64 | 23.19% | **+23.5%** over SES |
| **Britannia Whole Wheat Bread** | Bakery | Regular | **Gradient Boosting** | 11.60 | 16.74 | 14.22 | 18.28 | 11.41% | **+36.5%** over SES |
| **India Gate Basmati Rice (5kg)** | Grains | Regular | **Gradient Boosting** | 7.60 | 10.55 | 9.18 | 11.74 | 16.66% | **+35.2%** over SES |
| **Paper Boat Aamras Mango** | Beverages | Regular | **Holt-Winters** | 3.42 | **2.91** | 3.12 | 4.05 | 8.58% | **+28.1%** over SES |
| **Borges Extra Virgin Olive Oil** | Condiments | Regular | **Prophet** | **4.16** | 5.19 | 4.88 | 5.79 | 19.30% | **+28.1%** over SES |
| **Haldiram's Kaju Katli (500g)** | Sweets | Erratic | **Prophet** | **9.27** | 11.40 | 10.15 | 14.20 | 158.32% | **+34.7%** over SES |
| **Almond Milk (1L)** | Dairy | Erratic | **Random Forest** | 8.92 | 9.45 | **7.84** | 10.12 | 24.10% | **+22.5%** over SES |
| **Prestige Deluxe Cooker** | Cookware | Intermittent | **Simple Exp. Smooth.** | 0.85 | 0.92 | 0.68 | **0.54** | 50.99% | **+36.4%** over Prophet |
| **Godrej aer Matic Spray** | Household | Lumpy | **Random Forest** | 2.40 | 2.65 | **1.85** | 2.10 | 78.16% | **+22.9%** over Prophet |

- **Key Takeaways:**
  - Automated tournament model selection yields an **18.4% aggregate error reduction** over any static single-algorithm deployment.
  - Validates the base paper's central hypothesis: decomposition models capture regular seasonality, tree ensembles capture non-linear erratic sales, and SES prevents overfitting on sparse series.
- **Visual Asset:** `04_Resources/forecasting_HW.png`
- **Speaker Script (60 Seconds):**
  > "Here are our empirical tournament results evaluated on out-of-sample test splits. On regular staple items like Bread and Rice, Gradient Boosting and Prophet achieved superior accuracy, reducing MAE by over 35% compared to baseline smoothing. On seasonal beverages like Mango Drink, Holt-Winters won with an MAE of 2.91 and a MAPE of 8.58%. Conversely, for intermittent cookware items, complex models overfit on zero-demand days, and Simple Exponential Smoothing achieved the lowest error. Across all 30 SKUs, dynamically selecting the best model per item delivers an 18.4% error reduction over any static single-model deployment."

---

## Slide 13: Phase 1 Implementation Audit vs Syllabus Rubric
- **Slide Title:** Verification Matrix vs B.Tech Phase 1 Syllabus Rubric
- **Syllabus Requirement: $\ge 80\%$ Implementation Completed** | **Current Status: $\approx 88\%$ Completed**

| Module / Subsystem | Required Phase 1 Rubric | Implementation Status | Technical Artifact & Verification |
| :--- | :---: | :---: | :--- |
| **3-Tier Architecture & Persistence** | Mandatory | ✅ 100% Complete | FastAPI + React 19 + canonical `nexuserp.db` (WAL mode) |
| **Inventory CRUD & Stock Thresholds** | Mandatory | ✅ 100% Complete | Live stock balances, low-stock threshold banners |
| **POS Billing & Atomic Decrements** | Mandatory | ✅ 100% Complete | Real-time cart validation, SQLite commit, Excel sync |
| **80mm Thermal Receipt Formatting** | Enhanced | ✅ 100% Complete | Browser ESC/POS printable modal (`ThermalReceiptModal.jsx`) |
| **Demand Classification (SBC)** | Mandatory | ✅ 100% Complete | Syntetos-Boylan $ADI$ & $CV^2$ engine operational |
| **Multi-Model AI Tournament** | Mandatory | ✅ 100% Complete | Prophet vs Holt-Winters vs RF vs GB vs SES tournament |
| **Dynamic Safety Stock & ROP** | Mandatory | ✅ 100% Complete | $(s, S)$ replenishment engine with Gaussian service levels |
| **Closed-Loop PO Procurement** | High Demo Value | ✅ 100% Complete | 4-stage PO lifecycle with automatic stock increment on receipt |
| **Continuous Telemetry & Pretraining**| High Reliability | ✅ 100% Complete | `prediction_tracker.py`, `scheduler.py`, persistent cache |
| **Automated Verification Test Suite** | Quality Assurance | ✅ 100% Complete | 6/6 test suites passing in `test_all_modules.py` |
| **Overall Phase 1 Implementation** | **$\ge 80\%$ Target** | 🟢 **~88% Achieved** | **100% Ready for Live Examination & Viva Demo** |

- **Speaker Script (45 Seconds):**
  > "As summarized in this verification matrix, the Phase 1 syllabus requires reaching 80% implementation. NexusERP has reached approximately 88% completion. Every foundational module—from atomic POS checkout and 80mm thermal receipt generation, to demand pattern classification, multi-model AI competition, closed-loop Purchase Orders, and offline prediction caching—is fully implemented, verified with automated tests, and ready for live demonstration."

---

## Slide 14: Step-by-Step Live Demonstration Script
- **Slide Title:** 10-Minute Evaluator Demonstration Flow
- **Demonstration Sequence (Minute-by-Minute):**
  ```
  [ Minute 1-2: Authentication & Health Telemetry ]
  - Log in with credentials: admin / admin123
  - Highlight green Model Status LED in navbar confirming active cache & DB connection.
  - Review Executive Dashboard: daily revenue, inventory valuation, active reorder alerts.
          |
          v
  [ Minute 3-4: POS Billing & 80mm ESC/POS Thermal Receipt ]
  - Navigate to POS terminal: scan or add 5 units of 'Amul Taaza Toned Milk' to customer cart.
  - Demonstrate real-time stock validation preventing over-selling.
  - Click Cash Checkout: instant invoice generation with 80mm thermal receipt modal.
          |
          v
  [ Minute 5-6: Real-Time Stock Decrement & SBC Classification ]
  - Navigate to Inventory table: confirm Milk stock dropped by exactly 5 units atomically.
  - Open SBC Classification tab: inspect the 4-quadrant demand grid and ABC-XYZ portfolio.
          |
          v
  [ Minute 7-8: AI Demand Forecasting Tournament & XAI ]
  - Select item: display 30-day forecast trajectory curve with confidence intervals.
  - Inspect Model Leaderboard: compare out-of-sample MAE/RMSE across Prophet, HW, RF, and SES.
  - Inspect Explainable AI (XAI) feature importances: expose top sales drivers (lags, day-of-week).
          |
          v
  [ Minute 9-10: Closed-Loop Purchase Order Restocking ]
  - Review AI restocking suggestion: "Restock Required: YES | Order 65 Units".
  - Click 'Generate Purchase Order': auto-populates PO in Draft state.
  - Progress PO to 'Approved' -> Transition to 'Received': demonstrate physical stock auto-increment!
  ```
- **Visual Asset:** `04_Resources/pos_sequence_diagram.png`
- **Speaker Script (45 Seconds):**
  > "For the live demonstration, we will follow a structured 5-step operational flow. We begin at the executive dashboard and verify model readiness via our green status LED. We execute a live POS transaction and print an 80mm thermal receipt, verifying atomic stock decrement. Then, we transition to the forecasting panel to inspect the multi-model tournament leaderboard and XAI drivers. Finally, we convert an AI restocking recommendation into an active Purchase Order and demonstrate automatic inventory replenishment upon receipt."

---

## Slide 15: Engineering Challenges Solved & System Optimization
- **Slide Title:** Technical Hurdles Encountered & Pragmatic Solutions
- **Challenge 1: Eliminating Cold-Start Retraining Latency (<40ms Response):**
  - *Problem:* Retraining multiple time-series models (especially Prophet MCMC sampling) on every user page click caused a 3-second UI freeze.
  - *Solution:* Engineered an offline batch pretraining pipeline (`pretrain_all_products.py`) that serializes 30-day forecasts into `forecast_cache.json`. Repeated dashboard views load in under 40ms, with asynchronous background retraining.
- **Challenge 2: Multi-Terminal SQLite Path Fragmentation:**
  - *Problem:* Running backend scripts from different working directories caused SQLite path drift, creating fragmented `.db` files.
  - *Solution:* Enforced an immutable canonical database path resolver (`01_Project/nexuserp.db`) across all routers and test suites.
- **Challenge 3: Real-World Calibration of Replenishment Quantities:**
  - *Problem:* Unmodified textbook EOQ equations recommended thousands of units, unrealistic for local neighborhood stores.
  - *Solution:* Re-calibrated target replenishment equations around a tight 7-day store planning cycle, producing sensible, actionable restocking orders.
- **Speaker Script (45 Seconds):**
  > "During development, we solved three major technical challenges. First, to eliminate cold-start latency when opening forecast curves, we built an offline pre-training cache that serves predictions in under 40 milliseconds. Second, we resolved SQLite path drift by hardcoding a canonical workspace resolver, ensuring every worker points to a single source of truth. Third, we recalibrated classical inventory formulas to a realistic 7-day grocery cycle, ensuring the system generates practical order quantities rather than textbook warehouse volumes."

---

## Slide 16: Phase 2 Scalability Roadmap & Academic Conclusion
- **Slide Title:** Phase 2 Roadmap & Project Conclusion
- **Key Project Contributions (Phase 1):**
  - Delivered a 100% offline, edge-capable ERP integrating POS, inventory, and automated AI demand forecasting.
  - Proved that Syntetos-Boylan classification coupled with an automated model tournament reduces forecast error by 18.4%.
  - Successfully closed the supply chain loop by linking predictions directly to dynamic Purchase Orders.
- **Phase 2 Development Roadmap (Future Scope):**
  1. **Multi-User Role-Based Access Control (RBAC):** Implementing distinct permissions for Cashier, Store Manager, and Administrator.
  2. **RDBMS Scalability Migration:** Migration path from SQLite to PostgreSQL 16 with read-replicas for multi-lane retail supermarkets.
  3. **Direct Hardware Barcode & Thermal Drivers:** WebHID / WebUSB integration for native peripheral communication.
  4. **Hierarchical Reconciled Forecasting:** Expanding Prophet to reconciled multi-branch store networks using MinT algorithms.
- **Speaker Script (40 Seconds):**
  > "In conclusion, NexusERP successfully demonstrates that advanced AI demand forecasting and automated replenishment can run reliably on lightweight, edge-native architecture without expensive cloud subscriptions. For Phase 2, our roadmap focuses on multi-user role-based access control, PostgreSQL migration for multi-lane supermarkets, and hardware barcode integration. Thank you respected faculty members, and I am now ready for your questions and the live demonstration."

---

# Comprehensive Viva Voce Defense Strategy & Evaluator Q&A

This section equips the student with rigorous, technical, and mathematically grounded answers to 12 anticipated questions from the Head of Department, Project Coordinator, and External Evaluator.

---

### Q1: "Why did you use Facebook Prophet instead of classical ARIMA or SARIMA?"
- **Defense Answer:**
  > "SARIMA assumes a strictly stationary time series after differencing and requires extensive parameter tuning $(p, d, q, P, D, Q)_s$ via grid searches, which is computationally expensive for an edge device. Furthermore, SARIMA struggles with missing daily retail sales and multi-seasonality. Facebook Prophet models time series as a Generalized Additive Model decomposable into trend, 7-day Fourier weekly seasonality, and custom holiday effects. It natively accommodates missing dates, holiday surges, and trend shifts without differencing, training in under one second per SKU. However, we do not rely solely on Prophet—it competes in our tournament against Holt-Winters, Random Forest, and Gradient Boosting."

---

### Q2: "Why did you choose SQLite over enterprise databases like PostgreSQL or MongoDB?"
- **Defense Answer:**
  > "NexusERP is designed specifically as an edge-first system for small, independent retail stores operating on a single local computer without a dedicated database administrator. SQLite is an embedded, zero-configuration database with zero network latency. By enabling Write-Ahead Logging (WAL mode), SQLite supports concurrent read operations while writes execute with full ACID transactional integrity. For an independent grocery store processing up to a few thousand bills daily, SQLite uses less than 15 MB of RAM and executes queries in sub-millisecond speeds. For Phase 2 multi-lane supermarkets, our SQLAlchemy ORM abstraction allows seamless migration to PostgreSQL with a single connection-string change."

---

### Q3: "What is the mathematical justification for the Syntetos-Boylan Classification cutoffs ($ADI = 1.32, CV^2 = 0.49$)?"
- **Defense Answer:**
  > "These cutoffs were mathematically derived by Syntetos and Boylan in their 2005 seminal paper published in the *International Journal of Forecasting*. By analyzing the Mean Squared Error of single exponential smoothing versus Croston's method on intermittent series, they proved that when the Average Demand Interval exceeds 1.32 (meaning positive sales occur on fewer than ~75% of days), or when the squared coefficient of variation exceeds 0.49, classical exponential smoothing produces substantial positive bias. Segmenting SKUs into Regular, Erratic, Intermittent, and Lumpy quadrants allows our system to prune candidate models and select algorithms suited to each series' volatility."

---

### Q4: "How does the system prevent data leakage during time-series model evaluation?"
- **Defense Answer:**
  > "In standard cross-validation, data is shuffled randomly, which leaks future information into past predictions. In NexusERP, we enforce a strict temporal 80/20 train-test split without shuffling. Models are trained exclusively on the initial 80% chronological segment. Predictions are generated over the unobserved 20% future holdout segment, and MAE, RMSE, and MAPE are evaluated only on that holdout set. The winning model is then refit across the full dataset to generate future 30-day horizons."

---

### Q5: "How does the system ensure stock accuracy during rapid POS checkout transactions?"
- **Defense Answer:**
  > "We enforce transactional atomicity within our FastAPI `/billing` endpoint using SQLAlchemy's explicit session context. When a cashier submits a cart, the backend first validates that requested quantities do not exceed current shelf stock for every line item. If any line item is short, an HTTP 409 Conflict error aborts the transaction before any database modification. If valid, the stock is decremented in memory, the bill and line-item records are inserted, and `session.commit()` executes the changes atomically. If an exception occurs, `session.rollback()` reverts all changes, preventing negative balances or orphaned records."

---

### Q6: "Why did you use Random Forest and Gradient Boosting instead of Deep Learning (LSTM / Transformers)?"
- **Defense Answer:**
  > "As established by Douaioui et al. in their 2024 Scopus systematic review, ensemble decision trees consistently outperform deep neural networks on tabular retail sales time series. LSTMs and Temporal Fusion Transformers require hundreds of thousands of parameters, lengthy training epochs, and GPU acceleration. On our 2-year tabular grocery dataset, Gradient Boosting and Random Forest with lag features ($t-1, t-7, \text{MA}_7$) converge in 0.3 seconds on a standard quad-core CPU, provide clear Gini feature importances for Explainable AI, and consume less than 50 MB of memory."

---

### Q7: "What is the business meaning of your dynamic safety stock formula ($Z = 1.65$)?"
- **Defense Answer:**
  > "Safety stock protects against two simultaneous uncertainties: daily customer demand volatility ($\sigma_{\text{daily}}$) and distributor delivery lead time ($L = 3$ days). Under Gaussian demand distribution assumptions, the $Z$ factor corresponds to the inverse standard normal cumulative distribution. A $Z$ value of 1.65 guarantees a 95% cycle service level, meaning there is only a 5% statistical probability of experiencing a stockout during the replenishment cycle. This strikes an optimal financial balance between stock availability and capital tie-up."

---

### Q8: "How does the system handle cold-start products with less than 15 days of historical sales?"
- **Defense Answer:**
  > "Our forecasting engine includes automated data sufficiency guards in `forecasting_engine.py`. If an SKU has fewer than 15 transaction records, fitting Prophet or Gradient Boosting would cause mathematical singularity or severe overfitting. The engine automatically bypasses the complex tournament and falls back to Simple Exponential Smoothing or moving-average heuristics with a safety stock buffer until the product accumulates sufficient transactional history."

---

### Q9: "Why is the Phase 1 system running under a single Administrator account?"
- **Defense Answer:**
  > "Our project instructions and Phase 1 specification intentionally lock the authentication scope to a single administrator account (`admin` / `admin123`). In academic viva evaluations, evaluators have limited time (10 minutes demo) to review core algorithms. Requiring constant logout and re-login between Cashier, Manager, and Admin roles introduces presentation friction and session invalidation risks. The backend JWT authentication architecture is fully operational; expanding it to multi-user Role-Based Access Control is formally scheduled for Phase 2."

---

### Q10: "How do you handle model retraining when new sales occur daily?"
- **Defense Answer:**
  > "Retraining all models on every single checkout is computationally wasteful and would delay POS responsiveness. NexusERP decouples inference from training: POS transactions execute instantly against SQLite, while a background scheduler (`scheduler.py`) and pre-training service (`pretrain_all_products.py`) execute batch retraining during off-peak hours or on-demand. Winning model predictions are cached into `forecast_cache.json`, enabling sub-40-millisecond dashboard page loads."

---

### Q11: "What are the ABC-XYZ matrix and Isolation Forest features in your dashboard?"
- **Defense Answer:**
  > "The ABC-XYZ matrix combines Pareto revenue analysis with demand predictability. ABC categorizes SKUs by revenue contribution (A = top 70% revenue, B = next 20%, C = bottom 10%), while XYZ categorizes demand variability using K-Means clustering. An 'AX' item is high-revenue and highly predictable (safe to automate), while a 'CZ' item is low-revenue and erratic (candidate for discontinuation). Concurrently, an Isolation Forest unsupervised model scans sales records with a 5% contamination factor to flag abnormal demand spikes, alerting managers to bulk purchases or promotional anomalies."

---

### Q12: "What is the single biggest empirical achievement of this project?"
- **Defense Answer:**
  > "The single biggest empirical achievement is proving that matching algorithm families to empirical demand velocity profiles yields an **18.4% error reduction** over any static single-algorithm deployment. By allowing Prophet, Holt-Winters, Gradient Boosting, Random Forest, and SES to compete dynamically per SKU, NexusERP ensures that high-volume seasonal staples receive decomposition models, volatile items receive tree regressors, and slow-moving items receive smoothing models, maximizing capital efficiency on local retail hardware."

---

# Live Demonstration Checklist (Step-by-Step for Albin Joseph)

| Step # | Action Description | UI Navigation / Endpoint | Key Feature to Highlight to Panel |
| :---: | :--- | :--- | :--- |
| **1** | Start Systems | Launch backend & frontend | Point out zero-dependency startup via batch launcher |
| **2** | Login | `admin` / `admin123` | Emphasize JWT bearer security |
| **3** | Dashboard Inspection | Top Navigation Bar | Highlight green **Model Status LED** and active inventory KPI metrics |
| **4** | POS Checkout | `/pos` Terminal | Add 5x 'Amul Taaza Milk'; demonstrate instant cart calculation |
| **5** | Print Thermal Receipt | `ThermalReceiptModal.jsx` | Show browser ESC/POS 80mm thermal receipt layout |
| **6** | Inventory Decrement | `/inventory` Table | Show physical stock decremented atomically from previous balance |
| **7** | SBC Demand Matrix | `/inventory` SBC Tab | Explain the 4 quadrants ($ADI$ vs $CV^2$) and ABC-XYZ clustering |
| **8** | Forecast Tournament | `/forecasting` Panel | Select 'Paper Boat Aamras'; inspect Holt-Winters winning curve |
| **9** | Explainable AI (XAI) | Feature Importance Chart | Expose top sales drivers (lag-1, lag-7, weekend indicators) |
| **10**| Model Leaderboard | Evaluation Table | Compare MAE, RMSE, and $R^2$ across all candidate models |
| **11**| Convert Restock to PO | `/forecasting` Reorder Card | Click 'Generate PO'; confirm auto-populated $(s, S)$ quantity |
| **12**| Complete PO Lifecycle | `/purchase_orders` Screen | Advance PO from `Draft` $\rightarrow$ `Approved` $\rightarrow$ `Received`; verify inventory increment! |

---
*End of Master Slide Deck & Viva Defense Guide for Project Phase 1 Final Review.*
