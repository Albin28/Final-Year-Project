# Student Diary / Daily Activity Log

## B.Tech Final Year Project (Phase 1)

**Project Title:** AI-Based Inventory & Sales Forecasting System for Small Business ERP Management

---

### Week 1: Topic Selection & Finalization

**Date:** 06 July 2026
**Activity:** Met with the project guide to discuss potential project ideas. Proposed an AI-based forecasting system integrated with a small business ERP.
**Outcome/Remarks:** Guide suggested selecting a recent journal paper to support the forecasting methodology.

**Date:** 07 July 2026
**Activity:** Conducted literature search on Scopus/IEEE and selected the base paper: _"Combining Demand Classification and Forecasting Models in Spare Parts Inventory Management for the Energy Sector"_ (Springer, 2026).
**Outcome/Remarks:** The topic was approved and formally finalized.

---

### Week 2: Project Proposal Preparation

**Date:** 10 July 2026
**Activity:** Drafted the problem statement, objectives, and abstract for the project proposal.
**Outcome/Remarks:** Foundation for project planning and presentation structure was established.

**Date:** 12 July 2026
**Activity:** Prepared the project proposal presentation slides.
**Outcome/Remarks:** Slides completed and the proposal packet was prepared as per the required guidelines.

**Date:** 14 July 2026
**Activity:** Delivered the project proposal presentation to the guide.
**Outcome/Remarks:** Presentation was successful and the planning phase began.

---

### Week 3 & 4: Planning & Documentation

**Date:** 20 July 2026
**Activity:** Started drafting the Master Project Specification and finalized the architectural direction for the ERP + AI solution.
**Outcome/Remarks:** Core technology stack and project flow were outlined.

**Date:** 29 July 2026
**Activity:** Completed the Master Project Specification (v1.0).
**Outcome/Remarks:** Scope, deliverables, and timeline were locked for the project phases.

---

### Week 5: Interim Review 1 Preparation

**Date:** 03 August 2026
**Activity:** Began detailed literature survey and requirement analysis work for Interim Review 1.
**Outcome/Remarks:** Research references were organized and compiled for review.

**Date:** 06 August 2026
**Activity:** Worked on system design artifacts including architecture, requirement breakdown, and feasibility analysis.
**Outcome/Remarks:** Foundational design and documentation were prepared.

**Date:** 08 August 2026
**Activity:** Finalized the documentation set for Review 1: literature survey, requirement analysis, feasibility study, and system design.
**Outcome/Remarks:** Documentation track was completed, and implementation began.

**Date:** 08 August 2026 (Afternoon)
**Activity:** Started the initial prototype implementation using FastAPI + SQLite for rapid backend development and React + Vite for the frontend interface.
**Outcome/Remarks:** The first working inventory module and login/register screens were implemented.

---

### Week 6: Prototype Stabilization and Review Delivery

**Date:** 12 August 2026
**Activity:** Completed the review presentation and finalized the project demo flow for Interim Review 1.
**Outcome/Remarks:** All required review materials were prepared and the demo was ready.

**Date:** 14 August 2026
**Activity:** Validated the prototype locally with the inventory CRUD flow and dashboard integration.
**Outcome/Remarks:** The app was confirmed to run end-to-end using the local API and frontend interface.

**Date:** 16 August 2026
**Activity:** Confirmed the current implementation direction: local SQLite backend for the working prototype, React dashboard + inventory module, and auth UI structure retained for future integration.
**Outcome/Remarks:** The project is now aligned with the codebase actually in the repository. Firebase/Auth migration is deferred; the immediate deliverable remains the stable inventory prototype for the academic review.

---

### Week 7: AI Demand Forecasting & Model Tournament

**Date:** 18 August 2026
**Activity:** Implemented database seeding script generating 18 months of historical transaction patterns. Developed the demand pattern classification module (using ADI and $CV^2$). Implemented Prophet, Holt-Winters, and Exponential Smoothing tournament forecasting engine with backtesting. Exposed forecasting API endpoints and built an interactive frontend dashboard page with model metrics and restocking recommendations.
**Outcome/Remarks:** Core module for Interim Review 2 completed. The app dynamically classifies demand patterns and recommends restocking volumes based on safety stock calculations.

---

### Current Status Summary

**Current Focus:** AI demand forecasting, pattern classification, model tournament visualization, and restocking recommendations.
**Current Stack:** React.js, FastAPI, SQLite, Facebook Prophet, Statsmodels (Holt-Winters, SES), openpyxl, Recharts.
**Current Achievement:** Fully functional multi-model forecasting tournament page, historical data seeding, and automated reorder volume calculations.
**Next Step:** Expand reporting, multi-format export, and finalize presentation materials for Interim Review 2.
