# 🛡️ EduGuard — Proactive AI Early-Warning & Student Retention Platform

> **Smart India Hackathon (SIH 2026)**  
> **Domain:** AI in Education / Higher Education Student Retention  
> **Target Problem:** Proactive Identification of Academic Attrition & Prescriptive Intervention Dispatch

---

## 📌 1. Project Objective

Every academic year, approximately **15% to 20% of undergraduate students drop out silently**. Traditional university Enterprise Resource Planning (ERP) systems operate reactively—noticing student disengagement only after midterm exams are failed, semester registrations lapse, or fees go unpaid. By then, remedial intervention is often too late.

**EduGuard** is a full-stack, institutional-grade early warning and retention intelligence platform designed to catch student attrition indicators within the critical **Weeks 2 to 6 window**. By uniting 12 multi-dimensional signals across academic performance, behavioral engagement, library activity, commuting distance, and self-reported mental wellbeing, EduGuard equips educational institutions to:

1. **Detect Early Attrition:** Flag emerging academic and emotional distress weeks before examinations.
2. **Eliminate Black-Box Confusion:** Provide game-theoretic **SHAP (SHapley Additive exPlanations)** factor attribution aggregated from both ensemble models so mentors understand the drivers behind a student's risk level.
3. **Simulate Solutions:** Offer an interactive **Counterfactual "What-If" Studio** enabling mentors to simulate recovery trajectories before assigning remedial plans.
4. **Streamline Interventions:** Facilitate seamless 1-click support assignments (tutoring, counselor referrals, transport subsidies) with instant institutional PDF evaluation briefs.

---

## ✨ 2. Key Features

### 🧠 A. Machine Learning & Explainability Engine
* **Voting Ensemble Classification:** Dual-pipeline combining **RandomForest** (for non-linear behavioral clustering) and **XGBoost** (for gradient boosting on weak engagement signals) evaluated via Pipeline-isolated **Stratified 5-Fold Cross-Validation (82.32% ± 2.68% F1-Macro, 87.10% Test Accuracy, 79.49% Test Macro F1)**.
* **Soft-Voting SHAP Attribution:** Feature attributions aggregated from both ensemble members using matching soft-voting weights, with automated additivity sanity checks.
* **Real ML Counterfactual "What-If" Studio:** Interactive sliders for attendance boosts and GPA improvement that execute true model-derived re-inference, returning model-derived probability deltas and class transitions.

> [!NOTE]
> **Scientific Methodology & Production Disclosure:**  
> EduGuard's current prototype demonstrates the full predictive and intervention architecture using controlled synthetic data (engineered non-linear interaction terms with Sigmoid probability mapping). The production architecture is designed for institutional historical data, featuring versioned retraining, 5-fold cross-validation, and longitudinal outcome validation.

### 🏛️ B. Administrator & Leadership Command Center
* **7-Week Risk Trajectory Simulation:** Model-derived risk progression curves across the student population with interactive date-filtered tooltips.
* **Live Model Retraining Terminal:** In-browser streaming modal showing live training epochs, 5-fold stratified cross-validation metrics, and model version registry auditing.
* **Dynamic Alert Threshold Calculator:** Interactive trigger slider with live cohort calculation (e.g. *313 students triggered at 75% threshold*).
* **Batch Ingestion & Export:** Drag-and-drop CSV batch student onboarding and 1-click database export.

### 👩‍🏫 C. Teacher & Academic Mentor Command Center
* **Multi-Criteria Filter Matrix:** Filter students by Department, Semester (1–8), and Risk Tier with removable active pill chips.
* **Interactive Spotlight Search:** Global `Ctrl + K` live-search modal with debounced query resolution across 5,000+ student records.
* **1-Click Student Radar Profile:** Slide-over sheet with normalized 6-axis performance radar visualizer (GPA, Attendance, Assignments, LMS Logins, Wellbeing, Social).
* **In-App Institutional PDF Brief & Download:** Formatted institutional evaluation brief preview with 1-click ReportLab PDF export.

### 🎓 D. Student Wellbeing & Goal Hub
* **Personalized Goal Streaks:** Custom target setter for Attendance, GPA, and Assignment completion with progress rings and streak counters.
* **5-Dimensional Weekly Wellbeing Check-in:** 30-second mobile slider test (Stress, Sleep, Motivation, Social Connection, Physical Health) that feeds into model weights as a leading indicator.
* **Assigned Support Tracking:** Direct visibility into allocated mentorship programs without discouraging punitive labels.

### ⚡ E. Real-Time WebSockets & Telemetry
* **Live Event Stream:** Powered by `Flask-SocketIO` to broadcast instant escalation notices whenever a student's risk category transitions.

---

## 🛠️ 3. Technology Stack

| Layer | Technology / Library | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite v5 | High-performance SPA with fast HMR |
| **Styling & UI Tokens** | Apple HIG / Untitled UI Design Tokens | Strict elevation, layered shadows, Apple-inspired light mode |
| **Motion & Physics** | Framer Motion | Spring animations, count-up numbers, slide sheets, gestures |
| **Accessible Primitives**| Radix UI (`@radix-ui/*`) | Accessible Dialogs, Sheets, Tabs, Dropdowns, Switches |
| **Data Visualization** | Recharts v2 | Radar profiles, Line charts, Area trends, Bar charts |
| **Iconography** | Lucide React | Clean, modern feather icon library |
| **Notifications** | React Hot Toast | Apple-styled floating toast alerts |
| **Backend API** | Python Flask + Flask-CORS | Modular REST API and WebSocket gateway |
| **Real-Time Gateway** | Flask-SocketIO + Eventlet/Gevent | Real-time bi-directional risk update streaming |
| **Database & ORM** | SQLite / PostgreSQL + SQLAlchemy | Relational persistence with foreign-key constraints |
| **Machine Learning** | Scikit-Learn + XGBoost | Soft voting ensemble (RandomForest + XGBoost Classifier) |
| **Model Explainability**| SHAP (TreeExplainer) | Feature attribution and Shapley value calculations |
| **Document Generation**| ReportLab | High-fidelity institutional PDF generation |
| **Authentication** | Flask-JWT-Extended | Stateless HMAC-SHA256 JWT auth with role claims |

---

## 🚀 4. Setup & Installation Instructions

### Prerequisites
* **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **Python:** v3.10 or higher ([Download Python](https://www.python.org/))
* **Package Managers:** `npm` (bundled with Node) & `pip` (bundled with Python)

---

### Step 1: Clone Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd "sih final"
```

---

### Step 2: Backend Setup & Launch

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Train the ML Ensemble Model & Seed Dataset (First time only):
   ```bash
   python model/train.py
   ```

5. Start the Flask & WebSocket Server:
   ```bash
   python app.py
   ```
   * *Backend will start live at:* `http://localhost:5000`

---

### Step 3: Frontend Setup & Launch

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * *Frontend will start live at:* `http://localhost:5173`

---

## 🔑 Demo Access Credentials

The database comes pre-seeded with 5,000 synthetic student profiles and three pre-configured role accounts:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Administrator / Dean** | `admin@edu.local` | `changeme` | `http://localhost:5173/admin` |
| **Teacher / Academic Mentor** | `teacher@edu.local` | `changeme` | `http://localhost:5173/teacher` |
| **Student** | `student@edu.local` | `changeme` | `http://localhost:5173/student` |
| **ML Inference Studio** | *(Teacher/Admin)* | — | `http://localhost:5173/predict` |

---

## 📊 5. Current Implementation Status

| Milestone / Component | Implementation Status | Verification Details |
|---|---|---|
| **Authentication & Role Guards** | ✅ **100% Complete** | JWT auth with Admin, Teacher, Student routing |
| **ML Inference Engine** | ✅ **100% Complete** | 12 features → RF+XGBoost Voting Ensemble (87.1% Test Acc, 5-Fold CV Macro F1: 82.32%) |
| **SHAP Explainability** | ✅ **100% Complete** | TreeExplainer attribution values on all predictions |
| **Counterfactual What-If Studio** | ✅ **100% Complete** | Dynamic recovery simulation sliders |
| **Admin Analytics & Telemetry** | ✅ **100% Complete** | 7-Week Risk Trajectory Simulation & live retrain terminal |
| **Teacher Directory & Filters** | ✅ **100% Complete** | Live search, Sem 1-8 filter, Dept filter, Radar sheet |
| **Student Wellbeing & Goals** | ✅ **100% Complete** | 5-D weekly wellbeing test & custom target streak rings |
| **ReportLab PDF Engine** | ✅ **100% Complete** | Instant in-app evaluation brief preview & PDF export |
| **Real-Time WebSocket Gateway** | ✅ **100% Complete** | Bi-directional risk update notifications |
| **Automated End-to-End Audit** | ✅ **15 / 15 Tests Passed** | Automated suite passed with zero errors |
| **Production Build** | ✅ **Clean Compilation** | Vite production build passing in 6.17s |

---

## 👥 6. Adding Hackathon Collaborator Access

To provide collaborator access to the evaluation team:

1. Open your repository on GitHub: `https://github.com/<YOUR_USERNAME>/<REPO_NAME>`
2. Click on the **Settings** tab (gear icon) in the repository menu bar.
3. In the left sidebar, click on **Collaborators** (under the *Access* section).
4. Click the green **Add people** button.
5. In the search box, enter the Hackathon ID: **`Hackathon-LDRP`**
   * Link: [https://github.com/Hackathon-LDRP](https://github.com/Hackathon-LDRP)
6. Select the account and click **Add Hackathon-LDRP to this repository**.

---

## 📁 7. Project Directory Structure

```
sih-final/
├── backend/
│   ├── app.py                      # Flask REST API + WebSocket Server
│   ├── requirements.txt            # Python dependencies
│   ├── socketio_instance.py        # Shared WebSocket instance
│   ├── model/
│   │   ├── train.py                # Dataset generator & Voting Ensemble training
│   │   ├── predict.py              # Real-time ML inference & SHAP engine
│   │   └── registry.py             # Model versioning & checkpoint manager
│   ├── models/                     # Serialized .joblib model artifacts & metadata
│   └── instance/
│       └── eduguard.db             # Persistent SQLite database (5,000 students)
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # App routing & context provider
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # JWT authentication state management
│   │   ├── hooks/
│   │   │   └── useSocket.js        # WebSocket subscription hook
│   │   ├── styles/
│   │   │   ├── tokens.css          # Design tokens & color palette
│   │   │   └── base.css            # Base styles & typography
│   │   ├── components/
│   │   │   ├── AppShell.jsx        # Navigation shell, Spotlight Search, Alert Center
│   │   │   ├── StudentProfileSheet.jsx # Radar profile & PDF preview modal
│   │   │   └── ui/                 # Reusable UI primitives (Buttons, Badges, KPI cards)
│   │   └── pages/
│   │       ├── Landing.jsx         # Apple Light Mode landing page with live telemetry
│   │       ├── Login.jsx           # Elevated login card with 1-click demo logins
│   │       ├── AdminDashboard.jsx  # 7-Week telemetry, Retrain terminal, Alert config
│   │       ├── TeacherDashboard.jsx# Student directory with multi-filter matrix
│   │       ├── StudentDashboard.jsx# Performance profile, Goals, 5-D wellbeing check-in
│   │       └── PredictionForm.jsx  # ML Predictor & Counterfactual What-If Studio
│   ├── package.json
│   └── vite.config.js
├── presentation_assets/            # Keynote slide presentation assets
├── eduguard_pitch_presentation.html# Interactive 5-slide presentation HTML
└── README.md                       # Comprehensive project documentation
```

---

<div align="center">
  <b>Built for Smart India Hackathon (SIH 2026)</b><br>
  <i>Empowering educators with proactive retention intelligence.</i>
</div>
