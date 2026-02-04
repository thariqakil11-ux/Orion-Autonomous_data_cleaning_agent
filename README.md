# Orion: Autonomous Data Cleaning Agent

Orion is a powerful, automated data cleaning and analysis platform. It leverages intelligent "Agents" to transform raw datasets into clean, actionable data while providing deep business insights and comprehensive exploratory data analysis (EDA) reports.

## 🚀 Key Features

- **Autonomous Data Cleaning**: Automatically handles missing values and corrects outliers using intelligent heuristics.
- **Business Insight Engine**: Detects risks like data skewness and high cardinality, providing actionable business recommendations.
- **Automated EDA**: Generates rich, interactive HTML reports using `ydata-profiling`.
- **Interactive Dashboard**: Modern, glassmorphism-inspired UI for easy file management and result visualization.
- **Data Health Scoring**: Provides an overall health score for your dataset to quantify data quality.
- **User Authentication**: Secure registration and login flow with email verification codes.
- **Analysis History**: Persistent storage of processed datasets and generated reports.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Authentication**: [Passlib](https://passlib.readthedocs.io/) (PBKDF2-SHA256)
- **Data Processing**: [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
- **Reports**: [ydata-profiling](https://github.com/ydataai/ydata-profiling)
- **Email**: SMTP integration for verification codes.

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```text
Orion/
├── backend/                # FastAPI Server & Data Agents
│   ├── api.py              # Main API Endpoints
│   ├── autonomous_data_cleaning_agent_backend.py  # Core Cleaning Logic
│   ├── business_insight_engine.py      # Statistical Analysis Engine
│   ├── executive_summary_generator.py  # AI-driven Summary Logic
│   ├── models.py           # SQLAlchemy Database Models
│   ├── database.py         # DB Connection & Session Management
│   ├── config.py           # Configuration & Env Management
│   └── uploads/            # Uploaded datasets
├── frontend/               # Vite + React UI
│   ├── src/                # Components, Pages, Hooks
│   └── public/             # Static Assets
└── outputs/                # Generated Reports & Cleaned Data
```

## ⚙️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL Server
- npm or yarn

### 1. Setup Backend
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Create and activate a virtual environment:
   ```sh
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install fastapi uvicorn pandas numpy ydata-profiling openpyxl sqlalchemy psycopg2-binary passlib python-dotenv
   ```
4. Create a `.env` file in the `backend` directory:
   ```env
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=orion_db
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   MAIL_FROM=noreply@orion-ai.com
   ```
5. Initialize the database:
   ```sh
   python init_db.py
   ```
6. Start the server:
   ```sh
   uvicorn api:app --reload
   ```

### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## 🤖 The Agent Pipeline

Orion's core logic is divided into specialized agents:

1. **Planner Agent**: Analyzes the dataset schema and identifies column types.
2. **Cleaner Agent**: Executes cleaning strategies like median imputation and outlier clipping.
3. **Insight Engine**: Calculates statistical metrics to flag business risks and opportunities.
4. **Reporter Agent**: Generates a professional Executive Summary and deep-dive EDA report.

---

Built with ❤️ by the Orion Team.
