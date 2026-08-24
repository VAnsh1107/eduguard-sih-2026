# EduGuard

EduGuard is an AI-powered early-warning student retention platform designed for higher education institutions to proactively identify at-risk students and dispatch targeted academic and wellbeing support.

---

## Overview

Every academic year, an estimated 15% to 20% of undergraduate students drop out silently. Traditional university Enterprise Resource Planning (ERP) systems operate reactively—noticing student disengagement only after midterm exams are failed, semester registrations lapse, or tuition fees go unpaid. By that point, remedial intervention is often too late.

EduGuard provides early warning and retention intelligence designed to catch student attrition indicators within the critical Weeks 2 to 6 window of an academic term. By integrating 12 multi-dimensional indicators across academic performance, digital engagement, library utilization, commuting distance, and self-reported mental wellbeing, EduGuard equips university leadership and academic mentors with actionable retention insights.

The platform combines machine learning predictions with game-theoretic SHAP feature attributions, counterfactual "What-If" simulation, transparent rule-based intervention prioritization, and multi-tenant security architecture.

---

## Core Workflow

```
Student Data Collection 
   └── 12 Multi-Dimensional Indicators (Academic, Behavioral, Logistics, Wellbeing)
        │
        ▼
Risk Prediction Engine 
   └── RandomForest + XGBoost Soft-Voting Ensemble (Predicts Low / Medium / High Risk)
        │
        ▼
Explainability & Attribution 
   └── Dual SHAP TreeExplainers (Identifies Top Factor Attributions & Risk Drivers)
        │
        ▼
Counterfactual "What-If" Analysis 
   └── Real-Time Model Re-Inference (Simulates Metric Adjustments & Class Transitions)
        │
        ▼
Prescriptive Support & Interventions 
   └── Rule-Based Prioritization Engine (Ranks Tutoring, Counseling, Logistics Support)
        │
        ▼
Follow-up & Outcome Tracking 
   └── BEFORE → AFTER Risk Probability Monitoring (Observes Post-Intervention Status)
```

---

## Key Features

* **Soft-Voting Ensemble Classification:** Combines RandomForest and XGBoost classifiers to evaluate student attrition risk based on 12 features.
* **SHAP Explainability:** Uses dual `TreeExplainer` instances to output directional feature attributions, explaining the primary drivers behind each student's risk assignment.
* **Counterfactual "What-If" Studio:** Allows mentors to interactively adjust student metrics (e.g. attendance or GPA) and re-run model inference in real time to observe predicted probability changes.
* **Prioritized Intervention Recommendations:** Ranks support plans (academic tutoring, wellness referrals, financial aid) using transparent rules tied to student risk drivers.
* **Multi-Tenant Scoping & Security:** Implements JWT authentication, role-based access control (RBAC), and database-level institution isolation.
* **7-Week Risk Trajectory Simulation:** Visualizes cohort risk progression curves across recent weeks derived from baseline student data.
* **Institutional PDF Brief Generator:** Produces instant single-student retention summaries formatted for administrative review via ReportLab.
* **Real-Time Event Gateway:** Broadcasts instant risk category transition alerts via WebSocket (`Flask-SocketIO`).

---

## Architecture

The system uses a decoupled client-server architecture with multi-tenant data isolation:

* **Frontend:** React 18, Vite v5, Framer Motion, Radix UI primitives, Lucide React icons, and Recharts visualization.
* **Backend:** Python 3.10 Flask REST API, Flask-JWT-Extended, Flask-SocketIO, and ReportLab PDF rendering.
* **Database & ORM:** SQLAlchemy with SQLite persistence, enforcing multi-tenant isolation via a `TenantScopedMixin`.
* **Machine Learning Pipeline:** Scikit-Learn `Pipeline` wrapping `StandardScaler` and `VotingClassifier` (RandomForest + XGBoost), serialized with `joblib`.
* **Real-Time Layer:** `Flask-SocketIO` broadcasting risk updates to authorized client sessions.

---

## Machine Learning

### Feature Vector (12 Indicators)
1. `attendance_rate` (Float, 0.0–1.0)
2. `gpa` (Float, 0.0–10.0)
3. `assignment_submission_rate` (Float, 0.0–1.0)
4. `lms_login_frequency` (Integer, logins/week)
5. `library_visits` (Integer, visits/month)
6. `socioeconomic_score` (Float, 1.0–10.0)
7. `scholarship_recipient` (Binary, 0 or 1)
8. `family_income_bracket` (Integer, 1–5)
9. `previous_backlogs` (Integer, count)
10. `distance_from_college` (Float, km)
11. `extracurricular_participation` (Binary, 0 or 1)
12. `mental_health_score` (Float, 1.0–10.0)

### Ensemble & Evaluation Methodology
* **Algorithm:** Soft-Voting Ensemble (0.5 RandomForest + 0.5 XGBoost Classifier).
* **Validation Methodology:** Pipeline-isolated 5-Fold Stratified Cross-Validation (preprocessing fit strictly inside each fold).
* **Verified Performance Metrics:**
  * **5-Fold Stratified CV Macro F1:** `82.32% ± 2.68%`
  * **Test Accuracy:** `87.10%`
  * **Test Macro F1:** `79.49%`
  * **Test Weighted F1:** `86.80%`

### Explainability & What-If Inference
* **SHAP:** Uses independent `TreeExplainer` instances for XGBoost (raw log-odds margin space) and RandomForest (probability space), verifying native additivity per model before combining attributions for display.
* **What-If Studio:** Executes true model re-inference on backend endpoint `/api/predict/what-if` upon slider adjustment.

---

## Intervention System

Support recommendations are assigned through a **transparent rule-based prioritization engine** informed by student metrics and SHAP feature attributions:

* Rules match specific risk drivers (e.g., low attendance triggers an *Attendance Recovery Plan*).
* SHAP feature impact magnitudes dynamically adjust priority scores (`HIGH`, `MEDIUM`, `LOW`).
* **Note:** Interventions are selected by auditable deterministic business logic, **not** a second ML model.
* **Outcome Tracking:** Resolved interventions track observed risk probability changes before and after completion without asserting causality.

---

## Security & Multi-Tenancy

* **Authentication:** Stateless HMAC-SHA256 JWT tokens via `Flask-JWT-Extended`.
* **Role-Based Access Control (RBAC):**
  * `super_admin`: Global cross-institution visibility.
  * `admin` / `teacher`: Scoped strictly to their own institution (`institution_id`).
  * `student`: Restricted strictly to their own record (`linked_student_id`).
* **Multi-Tenant Scoping:** ORM-level event listeners automatically filter database queries by `institution_id`.
* **IDOR Protection:** All direct record access endpoints verify caller institution membership before returning data.

---

## Current Limitations

1. **Synthetic Training Baseline:** The current prototype demonstrates pipeline logic using a controlled synthetic dataset engineered with non-linear interaction terms. Production deployment requires fitting on an institution's historical student records.
2. **Trajectory Simulation:** The 7-week cohort trend endpoint (`/api/analytics/trend`) generates a model-derived simulation from current database baseline counts, rather than historical longitudinal telemetry.
3. **SHAP Output Space Heterogeneity:** Feature attributions aggregate matching soft-voting weights across XGBoost (margin space) and RandomForest (probability space) for directional guidance, rather than representing an exact linear probability decomposition.

---

## Project Structure

```
eduguard-sih-2026/
├── backend/
│   ├── app.py                      # Flask REST API, SocketIO gateway, route handlers
│   ├── database.py                 # SQLAlchemy engine, session maker, TenantScopedMixin
│   ├── seed.py                     # Synthetic dataset generator & DB seeder
│   ├── health_check.py             # System verification script
│   ├── requirements.txt            # Python dependencies
│   ├── model/
│   │   ├── train.py                # Pipeline-isolated 5-fold CV & model trainer
│   │   ├── predict.py              # ML inference service & SHAP explainer engine
│   │   ├── synthetic_data.py       # Controlled synthetic dataset generator
│   │   └── registry.py             # Model version registry & checkpoint manager
│   ├── models/                     # SQLAlchemy ORM models & serialized .pkl artifacts
│   ├── services/                   # Email & PDF generation services
│   ├── tasks/                      # Background batch prediction tasks
│   └── tests/                      # Automated test suite (pytest)
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main application router & context providers
│   │   ├── components/             # Reusable UI components & modals
│   │   ├── context/                # Authentication & session context
│   │   ├── pages/                  # Landing, Admin, Teacher, Student, Prediction pages
│   │   └── styles/                 # Design tokens & global CSS
│   ├── package.json
│   └── vite.config.js
├── deploy/                         # Docker & Nginx configuration files
├── docker-compose.yml              # Container orchestration specification
├── eduguard_pitch_presentation.html# Hackathon presentation deck
└── README.md                       # Repository documentation
```

---

## Setup & Installation

### Prerequisites
* **Node.js:** v18.0 or higher
* **Python:** v3.10 or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/VAnsh1107/eduguard-sih-2026.git
cd eduguard-sih-2026
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*Backend runs on `http://localhost:5000`.*

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## Demo Access Credentials

The local database is pre-seeded with test accounts:

| Role | Email | Password | Portal URL |
|---|---|---|---|
| **Admin / Dean** | `admin@edu.local` | `changeme` | `http://localhost:5173/admin` |
| **Teacher / Mentor** | `teacher@edu.local` | `changeme` | `http://localhost:5173/teacher` |
| **Student** | `student@edu.local` | `changeme` | `http://localhost:5173/student` |

---

## Verification & Testing

### Backend Test Suite
Run the 27-test automated test suite:
```bash
cd backend
pytest
```
*Result: 27 / 27 tests passing.*

### Frontend Production Build
Compile the production bundle:
```bash
cd frontend
npm run build
```
*Result: Vite production build completes with 0 errors in ~6.8s.*

---

## License

This project is licensed under the [MIT License](LICENSE).
