# AI-Based Demand Forecasting for Inventory Management
## Comprehensive Seminar Reference Document

> **Seminar Topic:** AI-Based Demand Forecasting for Inventory Management  
> **Project Topic:** AI-Based Inventory & Sales Forecasting System for Small Business ERP Management  
> **Key Model Adopted:** Facebook Prophet (time-series forecasting model)  
> **College:** Amal Jyothi College of Engineering — Department of Computer Science and Engineering  

---

## Table of Contents

1. [Seminar Guidelines Summary](#1-seminar-guidelines-summary)
2. [Introduction & Topic Relevance](#2-introduction--topic-relevance)
3. [Base Paper — Detailed Analysis](#3-base-paper--detailed-analysis)
4. [Literature Survey Paper 1 — Detailed Analysis](#4-literature-survey-paper-1--detailed-analysis)
5. [Literature Survey Paper 2 — Detailed Analysis](#5-literature-survey-paper-2--detailed-analysis)
6. [Literature Survey Paper 3 — Detailed Analysis](#6-literature-survey-paper-3--detailed-analysis)
7. [Comparative Literature Review Table](#7-comparative-literature-review-table)
8. [Justification for Choosing the Base Paper](#8-justification-for-choosing-the-base-paper)
9. [Objectives of the Seminar](#9-objectives-of-the-seminar)
10. [Methodology from the Base Paper](#10-methodology-from-the-base-paper)
11. [Key Results & Discussion Points](#11-key-results--discussion-points)
12. [Conclusion & Future Work](#12-conclusion--future-work)
13. [Complete References with DOI Links](#13-complete-references-with-doi-links)
14. [PPT Slide Plan (18–20 Slides)](#14-ppt-slide-plan-1820-slides)
15. [Figures, Tables & Data Reference Guide](#15-figures-tables--data-reference-guide)

---

## 1. Seminar Guidelines Summary

*(Extracted from: Seminar Guidelines 2026, Department of CSE, Amal Jyothi College of Engineering)*

### Key Requirements
- **Topic Selection:** Core CSE area, current & broad-based, linked to final year project area.
- **Source:** Reputed indexed international journals (2022–2026), e.g., Springer, IEEE Xplore, ScienceDirect.
- **Extended Abstract:** 500–600 words covering relevance, works carried out, brief of results.
- **Presentation:** 15 minutes + 10 minutes Q&A. Limited to **18–20 slides**.

### PPT Slide Order (Mandatory)
| Slide No. | Content |
|-----------|---------|
| 1 | Title Slide (Topic, Name, Roll No., Dept., Date) |
| 2 | Contents Slide |
| 3 | Introduction (brief intro, importance, relevance) |
| 4–5 | Existing Works / Literature Survey (min. 3 related works, key findings) |
| 6 | Objectives |
| 7–10 | Methodology / Work Carried Out (steps from base paper, methods & techniques) |
| 11–14 | Results and Discussions (key results, interpretation) |
| 15–16 | Conclusion and Future Work |
| 17 | References (standard citation style) |
| 18 | Acknowledgements |
| 19 | Questions Slide |

### Mark Distribution
| Component | Marks | Details |
|-----------|-------|---------|
| Seminar Guide | 20 | Background Knowledge (10) + Relevance (10) |
| Seminar Coordinator | 20 | Diary (10) + Attendance (10) |
| Presentation (IEC Panel) | 40 | Clarity (10), Interactions (10), Overall Participation (10), Slide Quality (10) |
| Report (IEC Panel) | 20 | Technical content, quality, templates, references |

### General Tips
- Use bullet points, charts/graphs/images, readable font, consistent style.
- Include slide numbers, figure numbers, table numbers.
- Practice to cover all slides within 15 minutes.

---

## 2. Introduction & Topic Relevance

### Why AI-Based Demand Forecasting Matters Today

Demand forecasting is the process of predicting future customer demand using historical data, statistical methods, and increasingly, artificial intelligence. It is a **critical pillar of inventory management** because:

- **Inventory holding costs** represent **20–40% of inventory value** for most companies (da Silva et al., 2026 — Base Paper).
- Forecasting errors lead to **excess inventory** (higher storage costs, risk of obsolescence) or **stockouts** (lost sales, customer dissatisfaction) (Goulart et al., 2026 — LS-1).
- The rapid globalization of the world economy requires companies to **constantly increase competitiveness** of their operations (da Silva et al., 2026).
- Traditional forecasting methods (moving averages, exponential smoothing, ARIMA) have **limitations in handling complex, seasonal, or multivariate data** (Goulart et al., 2026).

### The AI Revolution in Forecasting

- AI provides a **revolutionary alternative** offering more accurate and agile forecasting models compared to conventional methods (Douaioui et al., 2024 — LS-3).
- AI-based forecasting strategies are **dynamic** — models continuously adjust to market fluctuations (Douaioui et al., 2024).
- ML algorithms can identify **complex nonlinear patterns** in historical data without relying on strict statistical assumptions (Goulart et al., 2026).
- Research interest in AI-driven demand forecasting has **surged after 2021** — nearly **73% of all 119 publications** analyzed in a systematic review were produced between 2021–2024 (Douaioui et al., 2024).

### Relevance to Our Project

Our project — **"AI-Based Inventory & Sales Forecasting System for Small Business ERP Management"** — directly addresses these challenges by:
- Applying the **Facebook Prophet model** (a robust, scalable time-series forecasting tool) for demand prediction.
- Targeting **small businesses** that lack dedicated data science teams and resources.
- Integrating forecasting into an **ERP management system** for real-time inventory decisions.
- The base paper's comparison of ML vs. classical forecasting models provides the **theoretical foundation** and **methodology inspiration** for our system.

---

## 3. Base Paper — Detailed Analysis

### Paper Information

| Field | Details |
|-------|---------|
| **Title** | Combining Demand Classification and Forecasting Models in Spare Parts Inventory Management for the Energy Sector |
| **Authors** | Leandro Fernandes da Silva, Eliane da Silva Christo, Kelly Alonso Costa, Hugo Pimentel Tavares |
| **Journal** | The International Journal of Advanced Manufacturing Technology (2026), Vol. 144, pp. 355–366 |
| **Publisher** | Springer |
| **DOI** | [https://doi.org/10.1007/s00170-026-17483-1](https://doi.org/10.1007/s00170-026-17483-1) |
| **Published** | 28 March 2026 |
| **Received / Accepted** | 4 August 2025 / 12 January 2026 |
| **Affiliation** | Federal Fluminense University (UFF), Volta Redonda, RJ, Brazil |
| **License** | Creative Commons Attribution 4.0 |

### Abstract Summary
The paper compares **Machine Learning models (Random Forest, XGBoost)** and **classical exponential smoothing models (Holt, Holt-Winters, SARIMA)** to identify the best demand forecasting model for **2,244 spare part items** in an energy company in southeastern Brazil. A demand classification process categorized items into four types: **Irregular, Intermittent, Erratic, and Regular**. The CRITIC multicriteria method was used to determine model scores. The result: **Random Forest** performed best overall, followed by **Exponential Smoothing**. For regular items, **Holt-Winters** was superior.

### Research Objective
- To analyze and propose the best demand forecasting models according to the behavior of the historical series.
- To compare ML-based (Random Forest, XGBoost) and traditional statistical models (ExpSmoothing, Holt, Holt-Winters, SARIMA) for spare parts demand.
- To classify items by **demand behavior** (ADI/CV classification) and **financial value** (ABC classification).

### Novelty of the Research
- Used the **total population** of 2,244 historical series (not a sample), avoiding selection bias.
- Combined **two classification systems** (demand behavior + ABC value) for comprehensive analysis.
- Applied the **CRITIC multicriteria method** for objective model scoring.
- Performed **13,464 iterations** in Python (Spyder 3.11) across 6 models × 2,244 items.

### Dataset & Data Collection

| Characteristic | Value |
|---------------|-------|
| **Company** | Large energy company, southeastern Brazil |
| **Data Source** | SAP R/3 ERP — Materials Management Module |
| **Total Items** | 2,244 stockable items |
| **Time Period** | 60 months (January 2020 – December 2024) |
| **Training Period** | Jan/2020 to Dec/2023 (48 months) |
| **Test Period** | Jan/2024 to Dec/2024 (12 months) |
| **Forecast Horizon** | 12 steps ahead |

### Demand Classification Methods

#### Classification by Demand Behavior (ADI / CV²)
Items were classified into four categories based on:
- **ADI (Average Demand Interval):** Average period interval without demand.
- **CV² (Square Coefficient of Variation):** Standard deviation of demand / average demand.
- **Cutoff points:** ADI = 1.32, CV² = 0.49

| Category | Description | Characteristics |
|----------|-------------|----------------|
| **Regular** | High turnover, low variation | Predictable demand patterns |
| **Intermittent** | Several periods without demand | Low turnover, low randomness in demand size |
| **Erratic** | High turnover, high variation | Difficult to predict |
| **Irregular** | Low turnover, high variation | Most challenging — 52% of items fell here |

**Key Finding:** More than **52% of the 2,244 items had irregular demand**, which makes forecasting extremely difficult.

#### ABC Classification (Pareto Principle)
| Category | % of Items | % of Consumption Value | No. of Items |
|----------|-----------|----------------------|-------------|
| **A** | 4% | 80% | 82 items |
| **B** | 10% | 15% | 213 items |
| **C** | 87% | 5% | 1,949 items |

**Key Insight:** Only **82 items (4%)** represent **80% of consumption value** — these require the most detailed forecasting analysis.

### Forecasting Models Used

#### Machine Learning Models
1. **Random Forest** — Ensemble learning algorithm combining predictions from multiple decision trees. Uses bootstrapping to train independent trees, reducing variance and preventing overfitting.
2. **XGBoost (Extreme Gradient Boosting)** — Advanced gradient boosting algorithm using decision trees with regularization techniques to prevent overfitting.

#### Classical / Statistical Models
3. **Exponential Smoothing (Simple)** — Weighted averages of previous observations, weights decaying exponentially.
4. **Holt Model** — Extension of simple exponential smoothing for trended data (level + trend components).
5. **Holt-Winters Model** — Extension of Holt's method for data with seasonal and trend variations (level + trend + seasonality).
6. **SARIMA** — Seasonal Autoregressive Integrated Moving Average — handles non-stationary time series, captures trends, seasonality, and linear information.

### Evaluation Methodology

#### Error Measures Used
| Metric | Full Name | Purpose |
|--------|-----------|---------|
| **MAE** | Mean Absolute Error | Average magnitude of absolute differences |
| **MAPE** | Mean Absolute Percentage Error | Average errors in percentage terms |
| **sMAPE** | Symmetric MAPE | Balanced calculation of deviations |
| **RMSE** | Root Mean Squared Error | Emphasizes larger errors (outliers) |

#### Statistical Tests Performed
- **ADF (Augmented Dickey-Fuller):** Tests for stationarity.
- **KPSS (Kwiatkowski-Phillips-Schmidt-Shin):** Tests for stationarity.
- **AIC (Akaike Information Criterion):** Model selection — balances fit with simplicity.
- **BIC (Bayesian Information Criterion):** Similar to AIC, penalizes excessive complexity.

#### Stationarity Test Results (All 2,244 Items)
| Test Type | No. of Items | Percentage |
|-----------|-------------|-----------|
| Both ADF & KPSS passed | 1,386 | 61.8% |
| Neither passed | 442 | 19.7% |
| KPSS only | 210 | 9.4% |
| ADF only | 206 | 9.2% |

#### Model Scoring: CRITIC Method
The **CRITIC (Criteria Importance Through Intercriteria Correlation)** method:
- An analytical approach to determine **objective weights** in multicriteria decision problems.
- Draws weights directly from **intrinsic data variability** — no subjective expert judgments needed.
- The model with the **highest CRITIC score** was selected as the best.

### Key Results

#### Overall Model Performance (Score-Based Ranking)
| Model | No. of Best SKUs | Percentage |
|-------|-----------------|-----------|
| **Random Forest** | **691** | **30.79%** |
| **ExpSmoothing** | 595 | 26.52% |
| **SARIMA** | 294 | 13.10% |
| **Holt-Winters** | 239 | 10.65% |
| **Holt** | 228 | 10.16% |
| **XGBoost** | 197 | 8.78% |
| **Total** | **2,244** | **100%** |

#### Performance by Demand Classification Type

| Demand Type | Best Model | % of Best Predictions |
|-------------|-----------|---------------------|
| **Intermittent** | Random Forest | 41% |
| **Irregular** | Random Forest | 45% |
| **Regular** | Holt-Winters | 25% |
| **Erratic** | No model stood out significantly | ExpSmoothing (23%) ≈ RF (24%) |

#### Detailed Breakdown — Ranking of Models by Demand Classification

**Intermittent Items (639 total):**
| Model | Count | % |
|-------|-------|---|
| Random Forest | 265 | 41% |
| ExpSmoothing | 228 | 36% |
| Holt | 62 | 10% |
| XGBoost | 42 | 7% |
| SARIMA | 26 | 4% |
| Holt-Winters | 16 | 3% |

**Erratic Items (1,162 total):**
| Model | Count | % |
|-------|-------|---|
| Random Forest | 283 | 24% |
| ExpSmoothing | 265 | 23% |
| SARIMA | 219 | 19% |
| Holt-Winters | 151 | 13% |
| XGBoost | 128 | 11% |
| Holt | 116 | 10% |

**Irregular Items (185 total):**
| Model | Count | % |
|-------|-------|---|
| Random Forest | 83 | 45% |
| ExpSmoothing | 49 | 26% |
| Holt | 18 | 10% |
| SARIMA | 14 | 8% |
| XGBoost | 13 | 7% |
| Holt-Winters | 8 | 4% |

**Regular Items (258 total):**
| Model | Count | % |
|-------|-------|---|
| Holt-Winters | 64 | 25% |
| Random Forest | 60 | 23% |
| ExpSmoothing | 53 | 21% |
| SARIMA | 35 | 14% |
| Holt | 32 | 12% |
| XGBoost | 14 | 5% |

#### ABC Classification Results
- For **Class A items** (82 items, 80% of value), **Holt-Winters** presented the best results.
- The paper recommends **detailed, punctual analysis** for Class A items due to their high financial impact.

### Key Conclusions from the Base Paper
1. **Random Forest is superior** for irregular and intermittent demands — aligns with ensemble/deep learning research.
2. **Holt-Winters** is best for regular and seasonal demand items.
3. **XGBoost** performed the **worst** overall (only 8.78% of best predictions).
4. **No single model is ideal** for all types of historical series — model comparison is essential.
5. The **dual classification approach** (demand behavior + ABC value) enhances forecasting quality.
6. Traditional SARIMA and Holt-Winters models have **limited utility** to only regular series and stable seasonalities.
7. **Big Data processing** (13,464 iterations on total population) eliminates selection biases.

### Limitations
- Application of results in inventory management requires **additional calculations** (safety stock, order point).
- The study recommends **constant reevaluation** of models whenever new scenarios or data emerge.

### Future Work Suggestions
- Explore the use of forecasts as support for **inventory sizing and management**.
- Integrate additional variables (external factors, promotions, etc.).
- Continuously reevaluate models with new data.

---

## 4. Literature Survey Paper 1 — Detailed Analysis

### Paper Information

| Field | Details |
|-------|---------|
| **Title** | Predictive Models for Inventory Optimization: A Machine Learning Application for Demand Forecasting at a Construction Supplies Distributor |
| **Authors** | Diocélio Dornela Goulart, Rodrigo Baroni de Carvalho, Mariana Almeida Henriques, Bárbara Kawany Gonçalves Nunes Carvalho |
| **Journal** | Future Business Journal (2026), Vol. 12, Article 92 |
| **Publisher** | Springer (Open Access) |
| **DOI** | [https://doi.org/10.1186/s43093-026-00807-8](https://doi.org/10.1186/s43093-026-00807-8) |
| **Received / Accepted** | 2 January 2026 / 7 March 2026 |
| **Affiliation** | Fundação Dom Cabral & Pontifícia Universidade Católica de Minas Gerais, Brazil |

### Abstract Summary
This practice paper presents a **single-case study** on deploying ML-based predictive models for inventory management at **Casa Cardão**, a medium-sized Brazilian construction supplies distributor. Using **Amazon Forecast** and **Amazon SageMaker Canvas** (cloud-based AutoML), the study achieved a **WAPE (Weighted Absolute Percentage Error) of approximately 0.69%**. The primary contribution is **architectural and socio-technical** — documenting an end-to-end implementation blueprint for deploying cloud-based AutoML in an SME.

### Research Context
- **Company:** Casa Cardão — 100-year-old Brazilian distributor, ~220 staff, 200 sales representatives.
- **Portfolio:** 10,500+ SKUs, with 150 strong demand items from ABC curve.
- **Revenue:** R$310 million (~US$60 million) in 2023.
- **Challenge:** Lean IT structure, no Data Science expertise, need for predictive analytics.

### Key Research Question
*"How can cloud-based AutoML platforms enable SMEs without specialized data science teams to implement effective demand forecasting systems for inventory management?"*

### Methodology & Tools

| Aspect | Details |
|--------|---------|
| **Platform** | Amazon Forecast → migrated to SageMaker Canvas |
| **Algorithms Tested** | DeepAR+, CNN-QR, Prophet, ARIMA, ETS |
| **Best Model** | DeepAR+ (lowest backtest error) |
| **Data Period** | 16 months (July 2023 – November 2024) |
| **Observations** | 11,074 daily records (exemplified SKU) |
| **Train-Test Split** | 80% training / 20% backtesting |
| **Forecast Horizon** | 60 days |
| **Primary Metric** | WAPE |
| **Development Period** | August 2024 – July 2025 |

### Technology Architecture (4 Layers)
1. **Ingestion Layer:** ERP + CRM data + external data (weather, holidays, macroeconomic indices) → Amazon S3 Data Lake.
2. **Preparation Layer:** SageMaker Data Wrangler for ETL (cleaning, aggregation, enrichment).
3. **Modeling Layer:** SageMaker Canvas for AutoML + Amazon Forecast for final training.
4. **Application Layer:** Interactive React dashboard on base44 platform, with P35/P50/P60/P80 scenarios and GPT O3-mini conversational interface.

### Three Forecast Scenarios
| Scenario | Description |
|----------|-------------|
| **Optimistic (P80)** | Low inventory, accounts for seasonality/promotions |
| **Neutral (P50)** | No discernible trend, balanced stock |
| **Pessimistic (P35)** | High inventory, no forecasted demand |

### Key Results
- **WAPE of ~0.69%** during evaluation period (aggregate across evaluated SKUs).
- For exemplified SKU ("Amanco 6m × 100mm drain pipe"): DeepAR+ estimated 2,340 units for Dec 2023 vs. actual 2,255 units (deviation < 1%).
- ML models (especially DeepAR+) **outperformed traditional ARIMA and ETS** for most SKUs with complex/seasonal demand patterns.
- Operational goals: reduce excess inventory by 20%, shortages by 15% within 1 year.

### Evaluation Metrics
| Metric | Description |
|--------|-------------|
| **RMSE** | Penalizes larger deviations |
| **MAPE** | Percentage error relative to actual demand |
| **MASE** | Compares model vs. naive model (MASE < 1 = better than naive) |
| **WAPE** | Weights errors by total demand (primary metric) |

### Cost Structure (AWS)
- Estimated monthly cost: **USD 500 – 1,500/month** (S3, Lambda, SageMaker Canvas, Data Wrangler, CloudWatch).
- Compares favorably to hiring data science personnel (annual salary > USD 60,000 in Brazil).

### Key Contributions
1. **Practical:** End-to-end implementation blueprint for deploying AutoML in SMEs.
2. **Methodological:** How AWS AutoML workflows apply to time-series forecasting without ML expertise.
3. **Contextual:** Empirical evidence from a Brazilian SME in construction supplies.

### Limitations
1. Single-case study — context-dependent results.
2. Only aggregate WAPE reported (no per-SKU class breakdowns).
3. No baseline comparison with naive/seasonal naive methods.
4. Business impact claims based on preliminary qualitative observations.
5. AWS AutoML = "black box" — limited transparency.
6. Cold-start problem for new products not addressed.
7. Benefited from temporary AWS credits.

### Relevance to Our Project
- Demonstrates **feasibility of ML-based forecasting for SMEs** with limited IT resources — directly relevant to our small business ERP target.
- Validates **cloud-based AutoML** as a viable approach.
- Shows importance of **multiple forecast scenarios** (optimistic/neutral/pessimistic).
- **Prophet** was one of the algorithms tested in this study's pipeline.

---

## 5. Literature Survey Paper 2 — Detailed Analysis

### Paper Information

| Field | Details |
|-------|---------|
| **Title** | Developing a Demand Planning Strategy for Joint Forecasting and Employing Analytical Tool in an Empirical Case Study |
| **Authors** | Kiran Basavaraju, Omid Fatahi Valilai |
| **Journal** | Discover Applied Sciences (2025), Vol. 7, Article 345 |
| **Publisher** | Springer (Open Access) |
| **DOI** | [https://doi.org/10.1007/s42452-025-06740-9](https://doi.org/10.1007/s42452-025-06740-9) |
| **Received / Accepted** | 10 August 2024 / 17 March 2025 |
| **Affiliation** | Constructor University Bremen, Germany |

### Abstract Summary
This paper develops a **demand planning framework** with analytical capabilities for sales patterns, historical sales, and seasonality data. The framework was implemented in an **empirical business environment** — a multinational FMCG company in the beauty industry operating in the EMEA region. The primary focus is on a **Joint Forecast Project** with customer collaboration, using tools like JDA, ERP, and MFR systems.

### Research Objectives
- Examine root causes of customer order deviations from forecasts.
- Improve demand planning process to enhance performance.
- Develop and implement a joint forecasting initiative combining statistical models with real-time customer inputs.

### Key Challenges Addressed
1. **Poor Visibility:** Demand planners cannot see the big picture across the market.
2. **Poor Forecasting:** Lack of precise knowledge of production capacity and required inventory.
3. **Poor Consistency:** Inconsistent procedures causing inconsistent data inputs/outputs.

### Methodology & Framework

#### Tools Used in the Studied Company
| Tool | Purpose |
|------|---------|
| **JDA** | Statistical forecast-based system (at least 12 months history needed) |
| **MFR** | Reporting system — extracts data from JDA and ERP |
| **Prometheus©** | Ordering system for luxury brand initiatives |
| **ERP** | Connecting tool between company and customers |

#### S&OP (Sales and Operations Planning) — 5-Step Process
1. **Data Gathering:** Market research, consumer feedback, data analytics, competitor analysis.
2. **Demand Planning:** Cross-functional cooperation, scenario analysis.
3. **Supply Planning:** Operations, materials, and manufacturing planning.
4. **Pre-S&OP:** Department heads assess planning and financial effects.
5. **Executive Meeting:** Final decisions and approval.

#### Forecasting Methods
1. **Benchmarking (No Historical Data):** For new product launches — qualitative methodologies.
2. **Statistical Forecasting:** Open Model Time Series (OMTS) algorithms — identifies level, trend, seasonality, and noise patterns.
3. **Joint Forecast with Customer Collaboration:** Customers provide 3–6 month forecast inputs; demand planners adjust accordingly.

### Implementation Details

#### Standard Template for Customer Forecasts
- Common template introduced for all customers.
- Customers fill in forecast inputs and submit via shared SharePoint folders.
- Auto-fill features based on EAN code entry.
- Template is safeguarded — customers can only edit designated cells.
- **Power Automate** tool automates tracking of submissions.

#### MAPE90 — Key Performance Indicator
- Formula: MAPE90 = Σ(last 3-month actuals - last 3-month forecast) / Σ(last 3-month actuals)
- Used at **SKU level, house level, and subdivision level**.
- Dashboard created for root cause analysis and data visualization.

#### Root Cause Categories for Forecast Deviations
| Root Cause 1 | Root Cause 2 | Root Cause 3 |
|-------------|-------------|-------------|
| Initiatives | Launch phasing/wrong sizing | Delayed or anticipated launch shipments |
| Retailer | Assortment issues, market conditions | Event date/volume changes |
| Forecasting | Stat forecast not accurate, cannibalization | Wrong calculation, wrong seasonal model |
| Supply | Out of Stock (OOS) | Not enough stock to cover retailer orders |

### Implementation Roadmap (5 Months)
1. Month 1: Planning + Research + Iteration 1
2. Month 2: Testing + Internal Discussions + Iteration 2
3. Month 3: Continued iterations
4. Month 4: Internal Training + Final Implementation + Documentation
5. Month 5: Introducing Standard Template to Customers

### Key Findings & Benefits
- **Increased Efficiency:** Automation reduced time/effort for demand planners.
- **Enhanced Accuracy:** Automated tools minimize manual errors.
- **Better Decision-Making:** Real-time data access empowers informed decisions.
- **Employee Satisfaction:** Reduced manual workload, focus on strategic tasks.

### Limitations & Future Directions
- Total impact of advancements is not entirely clear.
- Additional variables and influences affect customer forecast accuracy.
- Recommended: Extend planning window/time fence.
- Future: Advanced data analytics for unstructured data, AI-driven modeling, extended planning horizons.

### Relevance to Our Project
- Demonstrates the **integration of demand forecasting with ERP systems** — core to our project.
- Highlights the importance of **customer collaboration** in demand planning.
- Shows how **MAPE-based performance tracking** can drive continuous improvement.
- Validates the need for **automated analytical tools** accessible to non-technical users.

---

## 6. Literature Survey Paper 3 — Detailed Analysis

### Paper Information

| Field | Details |
|-------|---------|
| **Title** | Machine Learning and Deep Learning Models for Demand Forecasting in Supply Chain Management: A Critical Review |
| **Authors** | Kaoutar Douaioui, Rachid Oucheikh, Othmane Benmoussa, Charif Mabrouki |
| **Journal** | Applied System Innovation (2024), Vol. 7, Issue 5, Article 93 |
| **Publisher** | MDPI (Open Access) |
| **DOI** | [https://doi.org/10.3390/asi7050093](https://doi.org/10.3390/asi7050093) |
| **Received / Accepted** | 6 June 2024 / 23 September 2024 |
| **Published** | 26 September 2024 |
| **Affiliation** | Hassan 1st University, Morocco & Lund University, Sweden & Euromed University, Morocco |

### Abstract Summary
This is a **comprehensive systematic review** analyzing **119 papers** from the **Scopus database (2015–2024)** on ML and DL models for demand forecasting in supply chain management. It provides both **macro-level** (trends, thematic evolution) and **micro-level** (specific model comparisons) analysis.

### Research Questions
1. How does AI-driven automation enhance demand forecasting efficiency in supply chains?
2. Which AI projects apply to demand forecasting in supply chains?
3. What are the future research gaps?

### Methodology
- **Database:** Scopus
- **Search Strategy:** ("demand forecasting" OR "demand prediction") AND ("artificial intelligence" OR "machine learning" OR "deep learning") AND ("supply chain management" OR "supply chain")
- **Period:** 2015–2024
- **Total Papers Analyzed:** 119
- **Tools Used:** VOSviewer (1.6.20), CiteSpace (6.2.6), Bibliometrix R Package (R 4.3.2)

### Publication Trends (Macro-Level Findings)

| Phase | Period | Publications/Year | Significance |
|-------|--------|------------------|-------------|
| **Emerging** | 2014–2017 | 1–3 per year | Limited interest, tentative engagement |
| **Transitional** | 2018–2020 | 7–8 per year | Growing interest, momentum building |
| **Acceleration** | 2021–2024 | 17–30 per year | **73% of all 119 papers** produced in this period |

### Paper Type Distribution
| Type | Count |
|------|-------|
| Conference Paper | 60 |
| Article | 45 |
| Book Chapter | 11 |
| Conference Review | 3 |

### Methodological Approaches
| Approach | Count | % |
|----------|-------|---|
| Modeling | 44 | 37% |
| Case Study | 43 | 35% |
| Survey | 25 | 21% |
| Conceptual | 7 | 7% |

### Top Contributing Countries
| Country | Publications |
|---------|-------------|
| India | 35 |
| China | 12 |
| Morocco | 12 |
| Germany | 10 |
| USA | 9 |
| France | 7 |
| Bangladesh/UK | 4 each |

### Key ML/DL Models Reviewed (Micro-Level)

#### 1. LSTM (Long Short-Term Memory) Networks
- **Type:** Recurrent Neural Network (RNN)
- **Strength:** Captures nonlinear relationships and complex time series.
- **Performance:** **15–20% reduction in forecast errors** compared to ARIMA models in retail demand.
- **Limitation:** Computationally expensive, requires specialized knowledge.

#### 2. Random Forest (RF)
- **Type:** Ensemble learning (multiple decision trees).
- **Strength:** Robust against overfitting, high accuracy.
- **Performance:** **10% improvement in accuracy** vs. traditional regression models (vehicle demand forecasting).
- **Limitation:** Less effective with temporal dependencies.

#### 3. Support Vector Machine (SVM)
- **Type:** Supervised learning for classification/regression.
- **Strength:** Handles high-dimensional data, nonlinear relationships via kernel functions.
- **Performance:** **~12% reduction in forecast error rate** vs. conventional linear models (electricity demand).
- **Limitation:** Less interpretable than simpler models.

#### 4. XGBoost (Extreme Gradient Boosting)
- **Type:** Gradient-boosting framework with parallel tree development.
- **Strength:** Highly efficient and scalable, fast computation.
- **Performance:** **8–10% improvement in accuracy** vs. traditional boosting methods; **30% reduction in training times** (e-commerce sales).
- **Limitation:** Model interpretability challenges.

#### 5. SARIMA–LSTM–BP Combination Model
- **Type:** Hybrid (SARIMA + LSTM + Backpropagation).
- **Strength:** Combines seasonal detection + temporal learning + optimization.
- **Performance:** **18% reduction in error** compared to standalone LSTM models (new energy vehicle demand).
- **Limitation:** Complex to implement and maintain.

### Comparative Effectiveness Summary
| Factor | Best Model(s) |
|--------|--------------|
| **Accuracy** | LSTM (15–20% improvement), XGBoost (8–10%) |
| **Computation Time** | XGBoost (fastest — supports parallel computing) |
| **Ease of Implementation** | SVM, Random Forest (simpler than LSTM) |
| **Robustness** | Random Forest (resists overfitting with many predictors) |
| **Temporal Dependencies** | LSTM (excels when dataset has temporal patterns) |

### Supply Chain Applications of AI (From Reviewed Literature)
| Application | AI Methods |
|------------|-----------|
| Blood supply chain management | ML, time series forecasting |
| Blockchain-enabled demand forecasting | Blockchain + ML |
| Supply chain optimization | Evolutionary algorithms, SVR |
| AI in SMEs | AI, ML, DL |
| Retail demand prediction | Tree-based ensembles, LSTM |
| AI-based time-series forecasting for inventory | Time-series forecasting, anomaly detection |

### Research Gaps Identified
1. Need for **hybrid models** integrating classical methods with AI across various industries.
2. Lack of research on **AI efficiency in geologically underexplored areas**.
3. Need for **standards for compatibility** when incorporating AI into forecasting.
4. **Data quality issues, algorithmic biases, and integration with existing systems** remain challenges.
5. **Explainable AI (XAI)** is increasingly important but underexplored.
6. Cost of implementing ML/DL is a **significant barrier for smaller enterprises**.

### Thematic Evolution (2014–2024)
- AI shifted focus from **risk assessment** to **supply chain management**.
- Deep learning maintained **continuity** in supply chain applications.
- Growing integration of **sustainable practices** with advanced AI technologies.
- Emerging trends: **Explainable AI (XAI)**, **edge computing** for real-time decisions.

### Relevance to Our Project
- Provides the **broader research landscape** validating our choice of AI-based demand forecasting.
- Confirms that **ML/DL models significantly outperform traditional methods** — supporting our Prophet model choice.
- Highlights the **research gap in SME applications** — exactly where our project fits.
- Validates the growing importance of **AI for inventory management** in supply chains.

---

## 7. Comparative Literature Review Table

| Aspect | Base Paper (da Silva et al., 2026) | LS-1 (Goulart et al., 2026) | LS-2 (Basavaraju & Valilai, 2025) | LS-3 (Douaioui et al., 2024) |
|--------|------|------|------|------|
| **DOI** | [10.1007/s00170-026-17483-1](https://doi.org/10.1007/s00170-026-17483-1) | [10.1186/s43093-026-00807-8](https://doi.org/10.1186/s43093-026-00807-8) | [10.1007/s42452-025-06740-9](https://doi.org/10.1007/s42452-025-06740-9) | [10.3390/asi7050093](https://doi.org/10.3390/asi7050093) |
| **Type** | Original Research | Practice/Case Study | Empirical Case Study | Systematic Review |
| **Industry** | Energy Sector (Spare Parts) | Construction Supplies Distribution | FMCG / Beauty Industry | Cross-Industry (119 papers) |
| **Region** | Brazil | Brazil | EMEA (Germany-based) | Global (35 countries) |
| **Company Size** | Large Enterprise | Medium-Sized Enterprise (SME) | Multinational Corporation | N/A (Review) |
| **Dataset Size** | 2,244 items, 60 months | 10,500+ SKUs, 16 months | Not specified (FMCG portfolio) | 119 papers analyzed |
| **ML Models** | Random Forest, XGBoost | DeepAR+, CNN-QR, Prophet, ARIMA, ETS | Statistical (Lewandowski), JDA-based | LSTM, RF, SVM, XGBoost, SARIMA-LSTM-BP |
| **Best Model** | Random Forest (30.79%) | DeepAR+ (WAPE 0.69%) | Joint Forecast + Statistical | LSTM (15-20% error reduction) |
| **Classification** | ADI/CV + ABC | ABC (by value & volume) | Product hierarchies | N/A |
| **Key Metric** | CRITIC Score (MAE, MAPE, sMAPE, RMSE) | WAPE, RMSE, MAPE, MASE | MAPE90 | Various (review) |
| **Platform** | Python (Spyder 3.11) | AWS (SageMaker Canvas, Forecast) | JDA, ERP, SharePoint, Power Automate | N/A |
| **Main Contribution** | Model comparison for spare parts by demand type | AutoML implementation blueprint for SMEs | Joint forecasting framework with customer collaboration | Comprehensive review of ML/DL in supply chain demand forecasting |
| **Limitations** | No safety stock/order point calculations | Single case, no naive baseline comparison | Impact not fully quantified | No primary experiments |
| **Relevance to Our Project** | ★★★★★ (Primary — methodology & model comparison) | ★★★★ (SME focus, cloud-based ML) | ★★★ (ERP integration, demand planning process) | ★★★★ (Theoretical foundation, model landscape) |

---

## 8. Justification for Choosing the Base Paper

### Why This Paper Was Selected as the Base Paper

The paper **"Combining Demand Classification and Forecasting Models in Spare Parts Inventory Management for the Energy Sector"** by da Silva et al. (2026) was chosen as the base paper for the following compelling reasons:

### 1. Direct Methodological Relevance
- The paper provides a **comprehensive comparison of 6 forecasting models** (2 ML + 4 classical), which directly informs our project's model selection strategy.
- Our project adopts the **Facebook Prophet model** — a time-series forecasting tool similar in philosophy to the exponential smoothing and SARIMA models evaluated in this paper. The base paper's findings on the **strengths and limitations of statistical vs. ML approaches** provide critical insight for our implementation.

### 2. Rigorous, Large-Scale Empirical Evaluation
- Unlike most studies that use small sample datasets, this paper uses the **total population of 2,244 items** with **13,464 iterations**, providing statistically robust results free from selection bias.
- The **60-month historical dataset** (2020–2024) is contemporary and covers real-world disruptions (e.g., COVID-19 impact), making the findings highly relevant.

### 3. Demand Classification Framework
- The paper's **dual classification system** (demand behavior via ADI/CV + ABC value classification) is directly applicable to our small business ERP system, where products will have varying demand patterns and financial importance.
- The finding that **52% of items had irregular demand** validates the need for AI-based approaches over simple statistical methods.

### 4. Practical Inventory Management Focus
- The paper is grounded in **real-world inventory management** for an operating energy company, not just theoretical modeling.
- Its focus on **spare parts management** parallels the challenges faced by small businesses in managing diverse product inventories.

### 5. Key Model Insights for Our Prophet Implementation
- The paper found that **no single model is ideal for all demand patterns** — this supports our approach of using Prophet (which automatically handles trends, seasonality, and holidays) as a flexible, general-purpose model.
- Prophet, developed by Facebook, shares characteristics with the Holt-Winters and SARIMA models evaluated in the base paper but adds **robustness to missing data, outliers, and trend changes** — addressing limitations identified in the base paper.
- The base paper's finding that **Holt-Winters works best for regular/seasonal demand** aligns with Prophet's strengths, as Prophet is essentially a modernized, more flexible version of additive decomposition models.

### 6. Published in a High-Impact, Indexed Journal
- Published in **The International Journal of Advanced Manufacturing Technology** (Springer) — Impact Factor > 3.0, indexed in Web of Science and Scopus.
- Published in **2026** — meets the college's requirement for recent papers (2022–2026).

### 7. Gap Addressed by Our Project
- The base paper identifies that **"the application of survey results in inventory management requires additional calculations related to specific parameters of inventory planning"** — this is exactly what our ERP system aims to provide.
- The paper recommends **"exploring the use of forecasts as support for inventory sizing and management"** — our project directly addresses this future work recommendation.

### Comparison with Other Papers (Why Not Them as Base Paper?)

| Paper | Why Not Selected as Base Paper |
|-------|-------------------------------|
| **LS-1 (Goulart et al.)** | Uses proprietary AWS AutoML (black box) — not reproducible for our project. Single-case study with limited generalizability. No transparent model comparison. |
| **LS-2 (Basavaraju & Valilai)** | Focuses on demand planning process and customer collaboration — organizational, not algorithmic. No specific ML model evaluation. |
| **LS-3 (Douaioui et al.)** | A review paper — provides landscape but no primary experimental results. Cannot serve as a replicable methodology source. |

---

## 9. Objectives of the Seminar

1. To present a comprehensive overview of **AI-based demand forecasting techniques** and their role in modern inventory management.
2. To discuss the **comparative analysis of Machine Learning (Random Forest, XGBoost) and classical statistical models (ExpSmoothing, Holt, Holt-Winters, SARIMA)** for demand forecasting, as demonstrated in the base paper.
3. To explain the **demand classification methodology** (ADI/CV behavioral classification + ABC value classification) used to categorize inventory items.
4. To analyze the **key results** showing Random Forest's superiority for irregular/intermittent demand and Holt-Winters' effectiveness for regular demand.
5. To establish the **relevance and connection** between the base paper's methodology and our project's adoption of the **Prophet model** for small business ERP-based demand forecasting.
6. To identify **research gaps and future directions** in AI-driven inventory management, particularly for SMEs.

---

## 10. Methodology from the Base Paper

### Research Development Flowchart (8 Stages)

```
Stage 1: Literature Review
    ↓
Stage 2: Data Extraction (SAP R/3 ERP, 60 months, 2,244 items)
    ↓
Stage 3: Data Processing & Classification
    ├── Demand Behavior Classification (ADI/CV → Irregular/Intermittent/Erratic/Regular)
    └── ABC Value Classification (Pareto → A: 4%/80% | B: 10%/15% | C: 87%/5%)
    ↓
Stage 4: Stationarity Testing (ADF + KPSS tests on all 2,244 series)
    ↓
Stage 5: Model Selection Criteria (AIC + BIC)
    ↓
Stage 6: Demand Forecasting (6 models × 2,244 items = 13,464 iterations)
    ├── ML: Random Forest, XGBoost
    └── Classical: ExpSmoothing, Holt, Holt-Winters, SARIMA
    ↓
Stage 7: Error Calculation (MAE, MAPE, sMAPE, RMSE for each model × item)
    ↓
Stage 8: Performance Analysis via CRITIC Method → Best Model Selection
```

### Implementation Details
- **Programming Environment:** Spyder (Python 3.11)
- **Total Iterations:** 13,464 (6 models × 2,244 items)
- **Training Data:** January 2020 – December 2023 (48 months)
- **Test Data:** January 2024 – December 2024 (12 months)
- **Forecast Horizon:** 12 steps (months) ahead
- **Model Selection:** CRITIC multicriteria method — objective weighting based on data variability and intercriteria correlation

---

## 11. Key Results & Discussion Points

### Discussion Point 1: Random Forest's Dominance
- Random Forest was the **best overall model** (30.79% of items), particularly excelling in **irregular (45%)** and **intermittent (41%)** demand types.
- This aligns with ensemble learning's known strength in handling **noisy, non-linear data with high variance**.
- The review paper (LS-3) confirms: RF models are **robust against overfitting** and show **10% accuracy improvement** over traditional regression.

### Discussion Point 2: XGBoost's Unexpected Poor Performance
- Despite being a powerful ensemble method, XGBoost had the **worst performance (8.78%)**.
- Possible explanation: XGBoost may require more **feature engineering and hyperparameter tuning** than was provided in this study.
- The review paper notes XGBoost excels in **e-commerce settings** with different data characteristics.

### Discussion Point 3: Holt-Winters for Regular Demand
- Holt-Winters performed best for **regular demand items (25%)**, leveraging its ability to model level, trend, and seasonality.
- This model's strength is relevant for our project where **seasonal products** in small business inventory may follow regular patterns.

### Discussion Point 4: No Universal Model Exists
- **No single model was ideal for all demand types** — a critical finding that supports the use of:
  - **Model ensembles** or **automated model selection** (like Prophet's automatic trend/seasonality detection).
  - **Periodic model reevaluation** as new data emerges.

### Discussion Point 5: The 52% Irregular Demand Challenge
- More than half of all items had **irregular demand** — this is a common real-world challenge.
- Implies that traditional forecasting methods alone are insufficient.
- Supports the adoption of **flexible AI models** like Prophet that handle irregularities, missing data, and changepoints.

### Discussion Point 6: ABC Classification Impact
- Only **82 items (4%)** represent **80% of consumption value** (Pareto principle).
- For these high-value **Class A items**, Holt-Winters performed best.
- This finding is directly applicable to small business ERP systems — **prioritize forecasting accuracy for top-value products**.

---

## 12. Conclusion & Future Work

### Conclusions
1. **AI-based demand forecasting** significantly enhances inventory management by providing more accurate and adaptive predictions compared to traditional methods.
2. The base paper demonstrates that **Random Forest** is the most effective model for irregular and intermittent demand patterns, while **Holt-Winters** excels for regular demand.
3. The **dual classification approach** (demand behavior + financial value) enables more targeted and efficient forecasting strategies.
4. **No single model is universally optimal** — continuous model comparison and reevaluation is essential.
5. The literature confirms a **paradigm shift** toward AI-driven supply chain management, with 73% of publications appearing in 2021–2024.
6. **SMEs stand to benefit significantly** from accessible AI tools (cloud-based AutoML, Prophet, etc.) that don't require dedicated data science teams.

### Future Work & Connection to Our Project
1. **Our project** will implement the **Prophet model** — a modern, flexible forecasting tool that handles trends, seasonality, holidays, and missing data automatically — addressing the base paper's finding that no single classical model works for all demand types.
2. Integration of demand forecasting into a **small business ERP system** — directly addressing the base paper's recommendation for "exploring forecasts as support for inventory sizing and management."
3. Development of a **user-friendly dashboard** for non-technical business owners — inspired by LS-1's approach with interactive scenario-based forecasting.
4. Exploration of **hybrid models** combining Prophet with ensemble methods for improved accuracy across diverse demand patterns.

---

## 13. Complete References with DOI Links

### Base Paper
1. da Silva, L.F., Christo, E.S., Costa, K.A., & Tavares, H.P. (2026). "Combining Demand Classification and Forecasting Models in Spare Parts Inventory Management for the Energy Sector." *The International Journal of Advanced Manufacturing Technology*, 144, 355–366.  
   **DOI:** [https://doi.org/10.1007/s00170-026-17483-1](https://doi.org/10.1007/s00170-026-17483-1)

### Literature Survey Papers
2. Goulart, D.D., Carvalho, R.B., Henriques, M.A., & Carvalho, B.K.G.N. (2026). "Predictive Models for Inventory Optimization: A Machine Learning Application for Demand Forecasting at a Construction Supplies Distributor." *Future Business Journal*, 12, 92.  
   **DOI:** [https://doi.org/10.1186/s43093-026-00807-8](https://doi.org/10.1186/s43093-026-00807-8)

3. Basavaraju, K., & Fatahi Valilai, O. (2025). "Developing a Demand Planning Strategy for Joint Forecasting and Employing Analytical Tool in an Empirical Case Study." *Discover Applied Sciences*, 7, 345.  
   **DOI:** [https://doi.org/10.1007/s42452-025-06740-9](https://doi.org/10.1007/s42452-025-06740-9)

4. Douaioui, K., Oucheikh, R., Benmoussa, O., & Mabrouki, C. (2024). "Machine Learning and Deep Learning Models for Demand Forecasting in Supply Chain Management: A Critical Review." *Applied System Innovation*, 7(5), 93.  
   **DOI:** [https://doi.org/10.3390/asi7050093](https://doi.org/10.3390/asi7050093)

### Additional Key References (from Papers)
5. Makridakis, S., Spiliotis, E., & Assimakopoulos, V. (2018). "Statistical and Machine Learning Forecasting Methods: Concerns and Ways Forward." *PLoS ONE*, 13(3), e0194889.  
   **DOI:** [https://doi.org/10.1371/journal.pone.0194889](https://doi.org/10.1371/journal.pone.0194889)

6. Seyedan, M., & Mafakheri, F. (2020). "Predictive Big Data Analytics for Supply Chain Demand Forecasting: Methods, Applications, and Research Opportunities." *Journal of Big Data*, 7, 53.  
   **DOI:** [https://doi.org/10.1186/s40537-020-00329-2](https://doi.org/10.1186/s40537-020-00329-2)

7. Munim, Z.H., Fiskin, C.S., Nepal, B., & Chowdhury, M.M.H. (2023). "Forecasting Container Throughput of Major Asian Ports Using the Prophet and Hybrid Time Series Models." *The Asian Journal of Shipping and Logistics*, 39(2), 67–77.  
   **DOI:** [https://doi.org/10.1016/j.ajsl.2023.02.004](https://doi.org/10.1016/j.ajsl.2023.02.004)

8. Falatouri, T., Darbanian, F., Brandtner, P., & Udokwu, C. (2022). "Predictive Analytics for Demand Forecasting — A Comparison of SARIMA and LSTM in Retail SCM." *Procedia Computer Science*, 200, 993–1003.  
   **DOI:** [https://doi.org/10.1016/j.procs.2022.01.298](https://doi.org/10.1016/j.procs.2022.01.298)

9. Ivanov, D. (2022). "Viable Supply Chain Model: Integrating Agility, Resilience and Sustainability Perspectives." *Annals of Operations Research*, 319, 1411–1431.  
   **DOI:** [https://doi.org/10.1007/s10479-020-03640-6](https://doi.org/10.1007/s10479-020-03640-6)

10. Ji, S., Wang, X., Zhao, W., & Guo, D. (2019). "An Application of a Three-Stage XGboost-Based Model to Sales Forecasting of a Cross-Border e-Commerce Enterprise." *Mathematical Problems in Engineering*, 2019, 8503252.  
    **DOI:** [https://doi.org/10.1155/2019/8503252](https://doi.org/10.1155/2019/8503252)

---

## 14. PPT Slide Plan (18–20 Slides)

| Slide # | Title | Content Source | Key Visuals |
|---------|-------|---------------|-------------|
| 1 | **Title Slide** | — | College logo, topic, name, roll no., dept., date |
| 2 | **Contents** | — | List of sections |
| 3 | **Introduction** | Section 2 of this doc | Why demand forecasting matters, 20-40% inventory cost stat |
| 4 | **Literature Survey (1/2)** | Sections 4, 5 | LS-1 (AutoML for SMEs) + LS-2 (Joint Forecasting + ERP) |
| 5 | **Literature Survey (2/2)** | Section 6 | LS-3 (119 paper review — ML/DL models, publication trends chart) |
| 6 | **Literature Comparison Table** | Section 7 | Comparative table of all 4 papers |
| 7 | **Objectives** | Section 9 | 6 clear objectives |
| 8 | **Base Paper Overview** | Section 3 | Paper details, 2,244 items, energy company, 6 models |
| 9 | **Demand Classification** | Section 3 | ADI/CV classification diagram + ABC Pareto chart |
| 10 | **Methodology — Flowchart** | Section 10 | 8-stage development flowchart |
| 11 | **Models Used** | Section 3 | ML (RF, XGBoost) vs. Classical (ExpSmoothing, Holt, HW, SARIMA) |
| 12 | **Evaluation — Metrics & CRITIC** | Section 3 | Error metrics table + CRITIC method explanation |
| 13 | **Results — Overall Ranking** | Section 3 | Model performance table (RF: 30.79% → XGBoost: 8.78%) |
| 14 | **Results — By Demand Type** | Section 3 | Chart: RF best for irregular/intermittent, HW for regular |
| 15 | **Results — ABC Classification** | Section 3 | Class A (82 items, 80% value) → HW best |
| 16 | **Key Findings & Discussion** | Section 11 | 6 discussion points |
| 17 | **Conclusion & Future Work** | Section 12 | Conclusions + connection to our Prophet-based project |
| 18 | **References** | Section 13 | All DOI-linked citations |
| 19 | **Acknowledgements** | — | Guide, panel, peers |
| 20 | **Questions** | — | "Thank You — Questions?" |

---

## 15. Figures, Tables & Data Reference Guide

> **Note for PPT Creator (Claude/AI):** The following figures and tables from the papers can be referenced or recreated for the presentation. DOI links are provided so the original paper's figures can be accessed.

### From Base Paper (DOI: [10.1007/s00170-026-17483-1](https://doi.org/10.1007/s00170-026-17483-1))
| Figure/Table | Description | Use In PPT |
|-------------|-------------|-----------|
| Fig. 1 | Work Development Flowchart (8 stages) | Methodology slide |
| Fig. 2 | Demand Classification of Items (ADI/CV scatter plot) | Classification slide |
| Fig. 3 | Aggregation of Materials by ABC Categories (pie/bar chart) | ABC Classification slide |
| Fig. 4 | Code Historical Series Behavior (SKU 386227 time series) | Data visualization slide |
| Fig. 5 | Seasonal Code Behavior (decomposition) | Methodology slide |
| Fig. 6 | Comparison of AIC and BIC Values (scatter plot) | Evaluation slide |
| Fig. 7 | No. of Times Models Performed Best by Error Measure (bar chart) | Results slide |
| Fig. 8 | Forecasting Models with Highest Score by Demand Type (stacked bar) | Results by demand type slide |
| Fig. 9 | Models with Lower Score by ABC Classification | ABC results slide |
| Table 2 | Stationarity Test Results (ADF/KPSS) | Methodology slide |
| Table 3 | Prediction Models with Highest Score (6 models ranked) | Key results slide |
| Table 4 | Ranking of Models by Demand Classification (detailed breakdown) | Results slide |

### From LS-1 (DOI: [10.1186/s43093-026-00807-8](https://doi.org/10.1186/s43093-026-00807-8))
| Figure/Table | Description | Use In PPT |
|-------------|-------------|-----------|
| Fig. 1 | Inventory Forecast Graphs (dashboard screenshots) | Literature survey slide |
| Fig. 2 | Technology Architecture (4-layer pipeline) | Literature survey slide |
| Table 1 | Dataset Characteristics and Evaluation Protocol | Literature survey slide |

### From LS-2 (DOI: [10.1007/s42452-025-06740-9](https://doi.org/10.1007/s42452-025-06740-9))
| Figure/Table | Description | Use In PPT |
|-------------|-------------|-----------|
| Fig. 1 | S&OP Process Diagram | Literature survey slide |
| Fig. 8 | Root Cause Flow Diagram | Literature survey slide |
| Table 1 | Effects of Improvements for Joint Forecast Project | Discussion slide |

### From LS-3 (DOI: [10.3390/asi7050093](https://doi.org/10.3390/asi7050093))
| Figure/Table | Description | Use In PPT |
|-------------|-------------|-----------|
| Fig. 4 | Publication Counts Over Years (2014–2024 bar chart) | Introduction/Relevance slide |
| Fig. 6 | Methodological Approaches Pie Chart (37% modeling, 35% case study) | Literature survey slide |
| Table 3 | Overview of AI/ML Techniques (10 key papers compared) | Literature survey slide |
| Table 5 | Supply Chain Applications and AI Methods (10 applications) | Discussion slide |

---

> **END OF SEMINAR REFERENCE DOCUMENT**
>
> **Instructions for Claude (PPT Creator):**
> - Use this document as the comprehensive source for creating an 18–20 slide seminar PPT.
> - All data, statistics, and findings are **factually extracted** from the original papers — do not add fictional data.
> - Use the **DOI links** to access original paper figures, charts, and data for visual elements.
> - Follow the **PPT Slide Plan** in Section 14 for slide structure.
> - Maintain **bullet points** (not paragraphs) in slides.
> - Include **slide numbers, figure numbers, table numbers** as required by guidelines.
> - The seminar topic is "AI-Based Demand Forecasting for Inventory Management" but the focus is on the **base paper's methodology and results**.
> - Connect the base paper's findings to the student's project: **"AI-Based Inventory & Sales Forecasting System for Small Business ERP Management"** using the **Prophet model**.
