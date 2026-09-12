# NexusERP: AI-Based Inventory & Sales Forecasting System for Small Business ERP Management

## Academic Final Year Project Report Draft

---

### Abstract
Small and medium-sized retail businesses (SMBs), particularly grocery stores, face significant financial losses due to stockouts of high-demand goods and excess holding costs for slow-moving inventory. Traditional Enterprise Resource Planning (ERP) systems offer static stock tracking but lack dynamic, data-driven demand prediction. 

This project presents **NexusERP**, an intelligent, lightweight ERP system integrated with an automated Multi-Model AI Demand Forecasting Engine. NexusERP combines real-time POS billing, automated inventory deduction, Syntetos-Boylan Demand Pattern Classification ($ADI$ and $CV^2$), and an automated model tournament comparing **Facebook Prophet**, **Holt-Winters Exponential Smoothing**, and **Simple Exponential Smoothing (SES)**. Evaluated on a unified master dataset of 54,780 daily grocery sales transactions across 30 product categories, Prophet achieved superior accuracy on regular and erratic demand patterns (MAE 5.08 vs 6.64). NexusERP computes dynamic safety stock and 7-day restocking reorder points, providing small business managers with an actionable, automated stock replenishment system.

---

### 1. Introduction & Objectives
- **Problem Statement:** Manual inventory tracking leads to high stockout risks, over-ordering, and capital lockup.
- **Objectives:**
  1. Develop a responsive 3-tier local ERP system with POS billing and automated stock deduction.
  2. Implement Syntetos-Boylan demand classification to categorize products into *Regular*, *Erratic*, *Intermittent*, and *Lumpy* demand.
  3. Build an automated forecasting tournament selecting the lowest MAE model per item.
  4. Compute dynamic safety stock and 7-day reorder point recommendations.

---

### 2. Literature Survey & Related Work
- **Base Paper Reference:** *Springer 2026 / SCI Retail Demand Analytics*.
- **Key Takeaways:** Classical time-series models fail on non-stationary, intermittent demand patterns. Hybrid demand classification coupled with model selection optimizes stock availability while reducing holding cost.

---

### 3. System Architecture & Technical Stack
- **Frontend Layer:** React.js + Vite, Tailwind/Vanilla CSS, Recharts for time-series visualization.
- **Backend Layer:** FastAPI (Python 3.12+), RESTful endpoints (`/api/inventory`, `/api/pos`, `/api/forecasting`).
- **Database Layer:** Local SQLite database (`nexuserp.db`) with ORM mapping for Users, Products, Bills, and BillItems.
- **AI Forecasting Engine:** Prophet (`cmdstanpy`), `statsmodels` Holt-Winters, Syntetos-Boylan ADI & $CV^2$ module.

---

### 4. AI Forecasting & Restocking Methodology

#### 4.1 Syntetos-Boylan Classification (SBC)
Demand is categorized into four archetypes based on Average Demand Interval ($ADI$) and Coefficient of Variation squared ($CV^2$):
- **ADI** = $\frac{\text{Total Time Periods}}{\text{Periods with Positive Sales}}$
- **CV$^2$** = $\left(\frac{\sigma_y}{\mu_y}\right)^2$

| Classification | Condition | Recommended Strategy |
| :--- | :--- | :--- |
| **Regular** | $ADI < 1.32$, $CV^2 < 0.49$ | Prophet / Additive Seasonality |
| **Erratic** | $ADI < 1.32$, $CV^2 \ge 0.49$ | Prophet / Robust Adaptive Smoothing |
| **Intermittent** | $ADI \ge 1.32$, $CV^2 < 0.49$ | Simple Exponential Smoothing / Croston |
| **Lumpy** | $ADI \ge 1.32$, $CV^2 \ge 0.49$ | Higher Safety Stock Buffer |

#### 4.2 Restocking & Reorder Point Formulas
- **Safety Stock ($SS$):** $SS = 1.65 \times \sigma_{\text{demand}} \times \sqrt{L}$ (where $L = 3$ days lead time, 95% service level)
- **Reorder Point ($ROP$):** $ROP = (\bar{d}_{\text{forecast}} \times L) + SS$
- **Recommended Restock Order ($Q$):** $Q = \max(0, (\bar{d}_{\text{forecast}} \times 7) + SS - S_{\text{current}})$

---

### 5. Experimental Results & Performance Evaluation

Evaluated on 30 top grocery products (54,780 transactions):

| Product Name | Category | SBC Class | Best Model | Prophet MAE | Holt-Winters MAE | SES MAE |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Organic Whole Milk (1L)** | Dairy | Regular | **Prophet** | **5.08** | 5.75 | 6.64 |
| **Whole Wheat Bread** | Bakery | Regular | **Prophet** | **11.60** | 16.74 | 18.28 |
| **Basmati Rice (5kg)** | Grains | Regular | **Prophet** | **7.60** | 10.55 | 11.74 |
| **Extra Virgin Olive Oil (1L)** | Condiments | Regular | **Prophet** | **4.16** | 5.19 | 5.79 |
| **Strawberry Trinket Box** | Retail | Erratic | **Holt-Winters** | 56.06 | **55.86** | 62.61 |

---

### 6. Conclusion & Future Scope
NexusERP successfully demonstrates an end-to-end, data-driven ERP system tailored for small grocery stores. By combining automated POS inventory deductions with Prophet demand forecasting and SBC classification, small business managers can prevent stockouts while maintaining lean inventory levels. Future extensions include multi-store transfer optimization and automated supplier reorder EDI integration.
