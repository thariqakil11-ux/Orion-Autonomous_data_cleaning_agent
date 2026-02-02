# Orion: Autonomous Data Cleaning Agent

Orion is a powerful, automated data cleaning and analysis platform. It leverages intelligent "Agents" to transform raw datasets into clean, actionable data while providing deep business insights and comprehensive exploratory data analysis (EDA) reports.

## 🚀 Key Features

- **Autonomous Data Cleaning**: Automatically handles missing values and corrects outliers using intelligent heuristics.
- **Business Insight Engine**: Detects risks like data skewness and high cardinality, providing actionable business recommendations.
- **Automated EDA**: Generates rich, interactive HTML reports using `ydata-profiling`.
- **Interactive Dashboard**: Modern, glassmorphism-inspired UI for easy file management and result visualization.
- **Data Health Scoring**: Provides an overall health score for your dataset to quantify data quality.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Data Processing**: [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
- **Reports**: [ydata-profiling](https://github.com/ydataai/ydata-profiling)
- **API**: RESTful endpoints for file processing and management.

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```text
Orion/
├── backend/            # FastAPI Server & Data Agents
│   ├── api.py          # API Endpoints
│   ├── autonomous_data_cleaning_agent_backend.py  # Core Logic
│   └── uploads/        # Uploaded datasets
├── frontend/           # Vite + React UI
│   ├── src/            # Components, Pages, Hooks
│   └── public/         # Static Assets
└── outputs/            # Generated Reports & Cleaned Data
```

## ⚙️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
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
   pip install fastapi uvicorn pandas numpy ydata-profiling openpyxl
   ```
4. Start the server:
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
2. **Cleaner Agent**: Executes cleaning strategies (median imputation for numeric, mode for categorical).
3. **Insight Engine**: Calculates skewness, std dev, and cardinality to flag business risks.
4. **Reporter Agent**: Compiles all findings into a human-readable executive overview.

---

Built with ❤️ by the Orion Team.
