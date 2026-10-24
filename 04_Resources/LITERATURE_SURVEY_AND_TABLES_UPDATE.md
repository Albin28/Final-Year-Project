# NexusERP — Literature Survey Update, Small Academic Tables & Chapter 2 Revision Guide

This guide provides ready-to-use content, data tables, and structural revisions for Chapter 2 (Literature Survey) of the NexusERP B.Tech Project Report and extended academic documentation.

---

## 1. Two New Standalone Academic Tables (Clean, Black & White)

### Table 1: Demand Pattern Categorization & Forecasting Algorithm Mapping
*Recommended Placement: Chapter 2 (under Demand Classification) or Chapter 4 (Implementation).*

| Demand Category | ADI Threshold | CV² Threshold | Retail Velocity Characteristics | Optimal Algorithm Family |
| :--- | :--- | :--- | :--- | :--- |
| **Regular (Smooth)** | ADI < 1.32 | CV² < 0.49 | High turnover, low quantity variation, steady weekly consumption | Holt-Winters / Facebook Prophet |
| **Intermittent** | ADI >= 1.32 | CV² < 0.49 | Sporadic order arrivals with relatively constant order quantities | Random Forest / Croston Method |
| **Erratic** | ADI < 1.32 | CV² >= 0.49 | Frequent customer purchases characterized by high volume variance | Random Forest / Gradient Boosting |
| **Lumpy (Irregular)** | ADI >= 1.32 | CV² >= 0.49 | Sporadic order intervals combined with highly volatile batch sizes | Simple Exponential Smoothing (SES) |

---

### Table 2: Scientific Inventory Replenishment & Reorder Parameterization Matrix
*Recommended Placement: Chapter 2 (under Replenishment Policies) or Chapter 3 (System Architecture).*

| Parameter / Metric | Mathematical Formulation | Physical Significance in Retail Operations | NexusERP Default Setting |
| :--- | :--- | :--- | :--- |
| **Review Period (R)** | R = t_current - t_previous | Fixed interval between scheduled inventory audits | 1 Day (Daily closing) |
| **Supplier Lead Time (L)** | L = t_delivery - t_order | Elapsed duration between purchase order dispatch and physical receipt | 3 Days (Configurable: 1–14) |
| **Service Level Factor (Z)** | Z = Normal_CDF^(-1)(alpha) | Statistical confidence factor ensuring non-stockout probability | 1.65 (95% Service Level) |
| **Safety Stock (SS)** | SS = Z * sqrt(L * sigma_D^2 + D^2 * sigma_L^2) | Strategic buffer protecting against sales spikes and supplier delays | Dynamically derived per SKU |
| **Reorder Point (ROP)** | ROP = (D_hat * L) + SS | Inventory threshold triggering automated purchase order creation | Real-time PO suggestion alert |
| **Target Inventory (TI)** | TI = (D_hat * (L + R)) + SS | Upper replenishment ceiling to restore stock during periodic review | Order Quantity Q = TI - Stock_on_hand |

---

## 2. Peer-Reviewed Paper Profiles for Literature Survey

### 2.1 Base Paper
- **Actual Title:** Combining demand classification and forecasting models in spare parts inventory management for the energy sector
- **Authors:** Leandro Fernandes da Silva, Eliane da Silva Christo, Kelly Alonso Costa, and Hugo Pimentel Tavares
- **Journal & Year:** *The International Journal of Advanced Manufacturing Technology*, Vol. 144, No. 7, pp. 355–366, 2026.
- **DOI:** 10.1007/s00170-026-17483-1
- **Core Contribution:** Conducted an extensive empirical evaluation across 2,244 items in an energy utility company, combining Syntetos-Boylan demand categorization (ADI/CV²) with ABC monetary classification. Pitted machine learning models (Random Forest, XGBoost) against classical exponential smoothing techniques (Holt, Holt-Winters, SARIMA) across 13,464 model iterations using the objective CRITIC multi-criteria method. Empirically demonstrated that no single model dominates all inventory profiles: Random Forest was superior on irregular and intermittent items, while Holt-Winters dominated regular items.
- **Identified Limitations:** Conducted entirely as an offline data science experiment in a Python/Spyder environment; completely lacked integration with operational ERP transactional ledgers, live Point of Sale checkouts, or automated restocking loops.
- **Relevance to NexusERP:** Directly provides the theoretical and empirical justification for NexusERP's multi-model tournament architecture, proving that matching algorithm families to empirical demand velocity profiles yields superior accuracy over single-model deployments.

---

### 2.2 Supporting Paper 1 (LS-1)
- **Actual Title:** Predictive models for inventory optimization: a machine learning application for demand forecasting at a construction supplies distributor
- **Authors:** Diocélio Dornela Goulart, Rodrigo Baroni de Carvalho, Mariana Almeida Henriques, and Bárbara Kawany Gonçalves Nunes Carvalho
- **Journal & Year:** *Future Business Journal*, Vol. 12, Article 92, 2026.
- **DOI:** 10.1186/s43093-026-00807-8
- **Core Contribution:** Documented an end-to-end implementation blueprint for deploying predictive analytics in an SME (Casa Cardão) without an internal data science team. Utilized cloud-based AutoML platforms (Amazon Forecast and Amazon SageMaker Canvas) over an 80/20 train-test temporal split, achieving an aggregate Weighted Absolute Percentage Error (WAPE) of 0.69% and validating multi-quantile scenario forecasting (P35 pessimistic, P50 neutral, P80 optimistic).
- **Identified Limitations:** Completely dependent on proprietary, expensive cloud infrastructure incurring $500–$1,500 monthly SaaS costs, requiring persistent high-speed internet, and operating as a "black box" without per-SKU diagnostic transparency.
- **Relevance to NexusERP:** Demonstrates the high business value of predictive forecasting for resource-lean SMEs while highlighting the critical need for a zero-cost, local offline edge architecture like NexusERP that eliminates cloud subscription fees and internet dependence.

---

### 2.3 Supporting Paper 2 (LS-2)
- **Actual Title:** Developing a demand planning strategy for joint forecasting and employing analytical tool in an empirical case study
- **Authors:** Kiran Basavaraju and Omid Fatahi Valilai
- **Journal & Year:** *Discover Applied Sciences*, Vol. 7, Article 345, 2025.
- **DOI:** 10.1007/s42452-025-06740-9
- **Core Contribution:** Developed an integrated demand planning framework combining statistical sales pattern forecasting with transactional ERP data in a multinational supply chain, proving that linking transaction history directly to replenishment thresholds mitigates bullwhip distortions and order variance. Introduced MAPE90 tracking across operational time fences.
- **Identified Limitations:** Designed for heavyweight enterprise environments requiring complex middleware integrations across disparate commercial suites (JDA Software, SAP ERP, SharePoint, Power Automate), making it impractical for standalone SME retailers.
- **Relevance to NexusERP:** Confirms that forecasting models must be directly coupled to transactional sales ledgers. NexusERP implements this principle within a unified edge application where daily POS sales atomically refresh inventory records and immediately inform replenishment logic.

---

### 2.4 Supporting Paper 3 (LS-3)
- **Actual Title:** Machine Learning and Deep Learning Models for Demand Forecasting in Supply Chain Management: A Critical Review
- **Authors:** Kaoutar Douaioui, Rachid Oucheikh, Othmane Benmoussa, and Charif Mabrouki
- **Journal & Year:** *Applied System Innovation*, Vol. 7, Issue 5, Article 93, 2024.
- **DOI:** 10.3390/asi7050093
- **Core Contribution:** Systematically analyzed 119 peer-reviewed publications (2015–2024) from the Scopus database, establishing that while deep learning (LSTM, GRU) captures complex temporal patterns in large-scale datasets, ensemble decision trees (Random Forest, Gradient Boosting) achieve superior empirical accuracy and operational robustness on tabular retail time series with vastly lower computational cost.
- **Identified Limitations:** Purely theoretical bibliometric and taxonomical survey; lacked an open-source reference implementation, edge deployment benchmark, or closed-loop procurement interface.
- **Relevance to NexusERP:** Provides peer-reviewed justification for selecting lightweight decision-tree ensembles and statistical algorithms over heavy deep neural networks, enabling sub-second inference and low RAM footprint (<450 MB) on standard commodity hardware.

---

## 3. Replacement Guide for Oversized Table 2.1

### Instructions for AI / Report Author:
1. Locate Table 2.1 in Chapter 2 (`\begin{table}...\end{table}` in LaTeX or large table matrix in Markdown).
2. Remove the large multi-column table completely to prevent visual clutter and awkward page overflows.
3. Replace the table with the following structured narrative paragraphs under Section 2.6:

> ### 2.6 Comparative Narrative Synthesis of Related Literature
> A critical examination of existing research reveals divergent paradigms between commercial enterprise systems and academic demand planning literature. Enterprise ERP solutions such as SAP S/4HANA and Oracle Cloud deliver robust transactional synchronization across enterprise modules, yet their exorbitant licensing fees, complex configuration overhead, and compulsory cloud connectivity render them inaccessible to suburban and rural retail merchants. Furthermore, commercial ERP suites rarely provide automated, multi-model time-series tournaments tailored to the volatile catalog dynamics of small enterprises.
>
> In academic literature, recent empirical studies have advanced predictive forecasting but remain isolated from everyday retail operations. The investigation by da Silva et al. (2026) demonstrated that dynamic algorithm selection based on Syntetos-Boylan demand categorization dramatically improves accuracy across diverse inventory profiles; however, their framework was executed offline within a Python/Spyder scripting environment lacking database persistence, barcode-driven POS checkout, or automated reordering triggers. Similarly, while Goulart et al. (2026) validated that AutoML enables SMEs to achieve high forecast precision, their architecture remains tethered to proprietary cloud services (AWS SageMaker Canvas), introducing recurring operational costs and absolute internet dependency.
>
> On the enterprise supply chain front, Basavaraju and Valilai (2025) underscored the operational necessity of integrating transactional ledgers with demand planning software. Nonetheless, their framework depends on heavyweight middleware orchestrating enterprise-grade platforms (JDA and SAP), creating an integration burden far beyond the financial and technical capabilities of independent merchants. Concurrently, the systematic review by Douaioui et al. (2024) affirmed that tree ensemble algorithms deliver optimal accuracy-to-compute ratios on tabular sales series, yet highlighted the persistent absence of accessible software implementations embedding these algorithms into everyday retail management workflows.
>
> NexusERP directly resolves these disparities by introducing a decoupled, edge-native architecture that bridges transactional point of sale execution with automated forecasting and scientific replenishment. Operating completely offline on commodity hardware with zero external cloud dependencies, NexusERP unifies an ACID-compliant SQLite datastore, atomic POS checkout, automated Syntetos-Boylan multi-model competition, and a closed-loop $(s, S)$ procurement pipeline within a single lightweight application.

---

## 4. Concluding Subsection for Chapter 2

### Instructions for AI / Report Author:
Add the following subsection as the final subsection of Chapter 2 (Section 2.7) to establish the academic justification before transitioning to Chapter 3 (System Architecture & Design):

> ### 2.7 Research Gaps and NexusERP Value Proposition
> Through a comprehensive review of classical inventory theory, contemporary machine learning literature, and commercial enterprise ERP implementations, five fundamental research and architectural gaps have been identified:
>
> 1. **Disconnect Between Predictive Modeling and Operational Execution:** Academic forecasting models are predominantly evaluated in isolated offline environments (e.g., Python notebooks or statistical toolboxes) without bidirectional connectivity to live transactional ledgers, stock decrements, or point-of-sale terminals.
> 2. **Prohibitive Recurring Cost and Cloud Dependency:** Modern SME-targeted forecasting solutions increasingly rely on cloud-hosted SaaS architectures and proprietary AutoML platforms. This imposes recurring subscription costs and presumes continuous broadband internet, leaving merchants vulnerable to network disruptions.
> 3. **Architectural Complexity and Heavyweight Middleware:** Existing enterprise demand planning integrations rely on sprawling enterprise application integration (EAI) layers connecting disparate commercial suites, demanding dedicated IT staff that small retail enterprises cannot support.
> 4. **Algorithmic Over-Engineering vs. Operational Edge Feasibility:** Literature frequently emphasizes complex deep learning architectures that demand specialized GPU infrastructure while offering minimal accuracy improvements over tree ensembles and classical statistical models on tabular retail time series.
> 5. **Absence of Closed-Loop Procurement Automation:** Existing retail software typically isolates sales forecasting from purchase order generation, forcing store owners to manually calculate reorder thresholds and transcribe numbers across disconnected spreadsheets.
>
> **NexusERP bridges these gaps** by delivering an offline-first, three-tier edge platform that executes locally on commodity quad-core hardware. By integrating mathematical demand classification ($ADI, CV^2$), dynamic model tournaments (Prophet, Holt-Winters, Random Forest, Gradient Boosting, SES), atomic POS checkout, and closed-loop $(s, S)$ purchase order workflows, NexusERP provides an accessible, enterprise-grade inventory intelligence system designed specifically for resource-constrained SME retailers.
