You are an expert technical presenter. Generate UPDATED content for a 10-slide PowerPoint for my B.Tech project progress update (post Interim Review 1, preparing for Interim Review 2).

Project Title: AI-Based Inventory & Sales Forecasting System for Small Business ERP Management (NexusERP)

Mandatory output format rules:

1. Output must be exactly 10 slides.
2. Use this structure only: Slide 1, Slide 2, ... Slide 10.
3. Use concise bullet points (max 5 bullets per slide, short lines).
4. No conversational text before or after slides.
5. Include one Literature Survey slide as a compact comparative table.

Critical update instruction:
You MUST update old/outdated details and reflect the CURRENT implementation state. Do not use old Firebase/PostgreSQL assumptions. Treat this prompt as the source of truth for latest status.

Current implementation truth (must be reflected in slides):

1. Frontend: React + Vite.
2. Backend: FastAPI.
3. Database: SQLite (canonical local DB path standardized to avoid multiple DB inconsistency).
4. Implemented modules:

- Inventory CRUD with low-stock tracking.
- POS (Point of Sale) basic billing module.
- Billing auto-deducts inventory stock.
- Recent bills listing.
- Bill-wise Excel export (.xlsx) by Bill ID.

5. Status: Working prototype delivered for Review 1; now moving toward Review 2 (target 50% implementation).
6. Planned next work:

- Advanced invoice/print formatting.
- Reporting and analytics on billing data.
- AI forecasting integration using recorded sales/billing history.

Required slide coverage (all must be included across 10 slides):

1. Title and project identity.
2. Problem statement and motivation.
3. Objectives and scope (included vs excluded).
4. Literature survey table (Author, Year, Model/Method, Key takeaway).
5. Feasibility study (technical, operational, economic, schedule).
6. Requirements summary (functional + non-functional).
7. Updated system architecture (Frontend, Backend, SQLite Data Layer, AI Layer planned).
8. Implemented features demo summary (inventory + POS + stock deduction + Excel export).
9. Current progress, milestone mapping, and risks.
10. Next phase roadmap (Review 2 to Final Review) and conclusion.

Literature references to include in the table slide:

1. Leandro Fernandes da Silva et al. (2026) - demand classification + forecasting combinations.
2. Diocelio Dornela Goulart et al. (2026) - predictive models/AutoML for inventory optimization.
3. Kiran Basavaraju et al. (2025) - demand planning strategy with ERP integration.
4. Kaoutar Douaioui et al. (2024) - ML/DL review for demand forecasting and SME gap.
