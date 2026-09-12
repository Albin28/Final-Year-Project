# NexusERP – Final Evaluator Presentation Deck Outline (10-Min Review)

---

## Slide 1: Title Slide
- **Title:** NexusERP: AI-Based Inventory & Sales Forecasting System for Small Business ERP Management
- **Subtitle:** Final Year Project Defense & Demonstration
- **Presenter:** Final Year Project Student
- **Guide:** Project Guide & Evaluation Panel

---

## Slide 2: Problem Definition & Motivation
- **Small Business Pain Points:**
  - Small grocery retailers rely on manual stock counts and gut-feeling reordering.
  - Results in 15-20% losses due to stockouts of popular items and high holding costs for slow items.
- **Project Solution:**
  - An integrated local ERP combining real-time POS billing, automated inventory deduction, and AI time-series demand forecasting.

---

## Slide 3: Project Objectives & Scope
- **Key Objectives:**
  1. Build a 3-tier lightweight ERP (React + FastAPI + SQLite).
  2. Implement Point of Sale (POS) billing with live stock sync.
  3. Categorize demand patterns using Syntetos-Boylan Classification (ADI & $CV^2$).
  4. Run an automated model tournament (Prophet vs Holt-Winters vs SES).
  5. Provide dynamic Safety Stock & Reorder Point recommendations.

---

## Slide 4: System Architecture
```
[ React.js + Vite UI ]  <--->  [ FastAPI REST Server ]  <--->  [ SQLite Database ]
  - Dashboard & POS              - Inventory/POS Router          - nexuserp.db
  - Forecasting Panel            - Prophet AI Tournament         - 30 Master Products
```

---

## Slide 5: AI Demand Forecasting Engine
- **Syntetos-Boylan Demand Classification (SBC):**
  - **ADI (Average Demand Interval):** Frequency of positive sales.
  - **$CV^2$ (Coefficient of Variation squared):** Variance of order size.
- **Model Tournament:**
  - Fits **Facebook Prophet**, **Holt-Winters**, and **Simple Exponential Smoothing**.
  - Automatically selects the model achieving the lowest MAE per product.

---

## Slide 6: Master Top 30 Dataset & Experimental Setup
- **Master Dataset:** `master_grocery_top30.xlsx`
- **Total Historical Records:** 54,780 daily transaction entries.
- **Product Catalog:** 30 Top Grocery Items (*Milk, Bread, Rice, Eggs, Olive Oil, Coffee, Flour, Chicken, Snacks, Beverages*).

---

## Slide 7: Model Performance Results (MAE Comparison)
- **Prophet vs Classical Models:**
  - **Organic Whole Milk:** Prophet MAE **5.08** vs HW 5.75 vs SES 6.64 (**Prophet Won**)
  - **Whole Wheat Bread:** Prophet MAE **11.60** vs HW 16.74 vs SES 18.28 (**Prophet Won**)
  - **Extra Virgin Olive Oil:** Prophet MAE **4.16** vs HW 5.19 vs SES 5.79 (**Prophet Won**)

---

## Slide 8: Inventory Restocking Mathematics
- **Safety Stock ($SS$):** $SS = 1.65 \times \sigma_{\text{demand}} \times \sqrt{3}$
- **Reorder Point ($ROP$):** $ROP = (\bar{d} \times 3) + SS$
- **Restock Volume ($Q$):** $Q = (7 \times \bar{d}) + SS - S_{\text{current}}$
- Yields clean, realistic 2-to-3 digit restocking order quantities for store owners.

---

## Slide 9: Working Prototype Highlights
- **100% Offline Capable:** Runs locally without cloud external service reliance.
- **POS Billing:** Bill creation with automatic stock deduction and invoice PDF/Print formatting.
- **Interactive Forecast Panel:** Real-time metrics visualization using Recharts.

---

## Slide 10: Live System Demonstration Flow
1. **Login:** Admin / Manager authentication (`admin` / `admin123`).
2. **Inventory Overview:** View stock status across 30 Master Grocery Items.
3. **POS Billing:** Add items to cart -> Checkout -> Auto Stock Deduction.
4. **Forecasting Panel:** Run Prophet Tournament -> View ROP Alert & Recommended Restock Order.

---

## Slide 11: Summary & Conclusion
- Successfully built an AI-integrated ERP tailored for small retail businesses.
- Prophet model combined with demand classification reduces forecasting errors by up to 25%.
- System is fully functional, tested, and review-ready.

---

## Slide 12: Questions & Answers
- **Thank You!**
- Open for Questions & Feedback from the Evaluation Panel.
