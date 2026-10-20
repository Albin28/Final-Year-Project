# Project Instructions for AI Assistants (NexusERP)

## Key Project Paths
- **Backend Directory**: `01_Project/backend`
- **Frontend Directory**: `01_Project/frontend`
- **Database File**: `01_Project/nexuserp.db`
- **Python Virtualenv**: `.venv` (Root level)

## Execution Rules
- Run backend with `.venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000` from `01_Project/backend`.
- Run frontend with `npm run dev` from `01_Project/frontend`.
- Exclude `.venv/`, `node_modules/`, `02_Datasets/`, `dataset/` when running broad searches.

## Credentials
- `admin` / `admin123`

## Strict Change Proposal Protocol
- **Zero Automatic Changes**: Never modify, delete, rename, or create code/files without prior review.
- **Change Proposal Report**: Generate a 10-point report (File Path, Action Type, Purpose, Reason, Risk Level, Expected Impact, Exact Changes, Why Required, Alternatives, Confidence Score) before performing any modification.
- **Candidate Tables**: Mandatory candidate tables for any proposed file deletions or dependency removals.
- **Pre-Execution Summary**: Display summary block (counts, risks, benefits) and stop to await explicit user approval.
- **Code Generation Rules**: Show BEFORE and AFTER code with highlighted modified lines, rationale, and performance/security estimates.

## Final-Year Engineering Project Guidelines
- **Context**: B.Tech Final Year Engineering Project.
- **Feature Preservation**: Never recommend deleting any feature solely because it is experimental.
- **Demo Value**: Prioritize preserving project functionality and demonstration value over aggressive optimization.
- **Classification Schema**:
  - `Critical Before GitHub`
  - `Recommended Before GitHub`
  - `Optional Enhancement`
  - `Future Improvement`

