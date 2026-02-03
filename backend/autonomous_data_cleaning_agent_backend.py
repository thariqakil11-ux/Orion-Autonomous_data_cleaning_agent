import os
import argparse
import pandas as pd
import numpy as np
from ydata_profiling import ProfileReport
from datetime import datetime
import json
from business_insight_engine import generate_business_insights
from executive_summary_generator import generate_executive_summary_from_insights

# =========================
# Utility
# =========================

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

# =========================
# PLANNER AGENT
# =========================

def planner_agent(df):
    return {
        "rows": df.shape[0],
        "cols": df.shape[1],
        "numeric": df.select_dtypes(include=[np.number]).columns.tolist(),
        "categorical": df.select_dtypes(include=["object", "category"]).columns.tolist(),
        "datetime": df.select_dtypes(include=["datetime64"]).columns.tolist(),
    }

# =========================
# CLEANER AGENT
# =========================

def clean_missing_and_track(df, plan):
    stats = {}
    df = df.copy()

    for col in df.columns:
        missing_before = df[col].isnull().sum()

        if col in plan["numeric"]:
            df[col] = df[col].fillna(df[col].median())
        elif col in plan["categorical"]:
            df[col] = df[col].fillna(df[col].mode()[0])

        missing_after = df[col].isnull().sum()

        stats[col] = {
            "missing_fixed_pct": (
                (missing_before - missing_after) / len(df) * 100
                if missing_before > 0 else 0
            )
        }

    return df, stats


def handle_outliers_and_track(df, plan, stats):
    for col in plan["numeric"]:
        q1, q3 = df[col].quantile([0.25, 0.75])
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr

        outliers_before = ((df[col] < lower) | (df[col] > upper)).sum()
        df[col] = np.clip(df[col], lower, upper)
        outliers_after = ((df[col] < lower) | (df[col] > upper)).sum()

        stats[col]["outliers_corrected_pct"] = (
            (outliers_before - outliers_after) / len(df) * 100
            if outliers_before > 0 else 0
        )

    return df, stats

# =========================
# BUSINESS INSIGHT ENGINE
# =========================

def generate_quality_insights(df, plan):
    insights = []

    for col in plan["numeric"]:
        skew = df[col].skew()
        if abs(skew) > 1:
            insights.append(
                f"'{col}' is highly skewed, which may distort average-based business decisions."
            )

        if df[col].std() > df[col].mean():
            insights.append(
                f"'{col}' shows high variability, indicating potential for customer segmentation."
            )

    for col in plan["categorical"]:
        uniqueness = df[col].nunique()
        if uniqueness > 20:
            insights.append(
                f"'{col}' has high cardinality, which may increase model and reporting complexity."
            )

    return insights


def dataset_health_score(stats):
    penalties = 0
    for col, s in stats.items():
        penalties += s.get("missing_fixed_pct", 0)
        penalties += s.get("outliers_corrected_pct", 0)

    score = max(0, 100 - penalties)
    return round(score, 2)

# =========================
# REPORTER AGENT
# =========================

def generate_business_summary(df, original_shape, stats, insights):
    score = dataset_health_score(stats)

    lines = [
        "EXECUTIVE OVERVIEW",
        f"Dataset processed on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Rows: {original_shape[0]} | Columns: {original_shape[1]}",
        "",
        "DATA QUALITY ASSESSMENT",
        f"Overall Dataset Health Score: {score}/100",
        "",
        "COLUMN-LEVEL FIXES",
    ]

    for col, s in stats.items():
        lines.append(
            f"- {col}: Missing fixed {s.get('missing_fixed_pct',0):.2f}%, "
            f"Outliers corrected {s.get('outliers_corrected_pct',0):.2f}%"
        )

    lines.extend([
        "",
        "KEY BUSINESS RISKS",
    ])

    if insights:
        for i in insights:
            lines.append(f"- {i}")
    else:
        lines.append("- No major data-driven risks detected.")

    lines.extend([
        "",
        "OPPORTUNITIES IDENTIFIED",
        "- Data is now suitable for segmentation, trend analysis, and predictive modeling.",
        "- Clean numeric distributions enable reliable KPI tracking.",
        "",
        "RECOMMENDED NEXT ACTIONS",
        "- Segment customers based on cleaned numeric features.",
        "- Track KPIs using median-based metrics where skew exists.",
        "- Proceed with ML or BI pipelines using this cleaned dataset."
    ])

    return "\n".join(lines)

# =========================
# MAIN PIPELINE
# =========================

def run_pipeline(input_path, output_dir="outputs"):
    ensure_dir(output_dir)

    if input_path.endswith(".csv"):
        df = pd.read_csv(input_path)
    else:
        df = pd.read_excel(input_path)

    original_shape = df.shape
    plan = planner_agent(df)

    df, stats = clean_missing_and_track(df, plan)
    df, stats = handle_outliers_and_track(df, plan, stats)

    insights = generate_quality_insights(df, plan)

    df.to_csv(os.path.join(output_dir, "cleaned_data.csv"), index=False)

    profile = ProfileReport(df, explorative=True)
    # Manual dark mode injection if needed or try another way
    # Let's try the theme parameter which might be supported in some versions
    profile.to_file(os.path.join(output_dir, "eda_report.html"))
    
    # Post-process the HTML to inject dark mode CSS and enable Bootstrap dark theme
    with open(os.path.join(output_dir, "eda_report.html"), "r", encoding="utf-8") as f:
        html_content = f.read()
    
    # 1. Enable Bootstrap 5 dark theme
    html_content = html_content.replace("<html lang=en>", '<html lang=en data-bs-theme=dark>')
    
    # 2. Add custom CSS for extra compatibility and Full Width
    dark_css = """
    <style>
        :root {
            --bs-body-bg: #0f172a !important;
            --bs-body-color: #f8fafc !important;
            --bs-tertiary-bg: #1e293b !important;
        }
        body { 
            background-color: #0f172a !important; 
            color: #f8fafc !important; 
        }
        /* Force Full Width - Fix for the left/right awkward space */
        .container, .container-fluid { 
            max-width: 100% !important; 
            width: 100% !important;
            background-color: transparent !important; 
            padding-left: 2rem !important;
            padding-right: 2rem !important;
        }
        .card, .panel, .well { 
            background-color: #1e293b !important; 
            border-color: #334155 !important; 
        }
        .table { --bs-table-bg: transparent !important; color: #f8fafc !important; }
        .text-muted { color: #94a3b8 !important; }
        svg text { fill: #94a3b8 !important; }
        .navbar { display: none !important; }
    </style>
    """
    
    # 3. Add Navigation Fix Script to prevent "mini web page" issue
    nav_fix_script = """
    <script>
        // Prevent internal links from escaping the iframe
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && target.getAttribute('href')) {
                const href = target.getAttribute('href');
                if (href.startsWith('#')) {
                    // It's a hash link, let the browser handle it internally
                    return;
                }
                // If it's an external link, open in new tab
                if (href.startsWith('http') || href.startsWith('data:')) {
                    target.setAttribute('target', '_blank');
                }
            }
        }, true);
    </script>
    """
    
    if "</body>" in html_content:
        html_content = html_content.replace("</body>", f"{dark_css}{nav_fix_script}</body>")
    else:
        html_content += f"{dark_css}{nav_fix_script}"
        
    with open(os.path.join(output_dir, "eda_report.html"), "w", encoding="utf-8") as f:
        f.write(html_content)

    score = dataset_health_score(stats)

    import json
    summary_data = {
        "overview": {
            "processedOn": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "rows": original_shape[0],
            "columns": original_shape[1],
            "healthScore": score
        },
        "fixes": [
            {
                "id": col,
                "missing": s.get("missing_fixed_pct", 0),
                "outliers": s.get("outliers_corrected_pct", 0)
            }
            for col, s in stats.items()
        ],
        "risks": insights if insights else ["No major data-driven risks detected."],
        "opportunities": [
            "Data is now suitable for segmentation, trend analysis, and predictive modeling.",
            "Clean numeric distributions enable reliable KPI tracking."
        ],
        "nextActions": [
            "Segment customers based on cleaned numeric features.",
            "Track KPIs using median-based metrics where skew exists.",
            "Proceed with ML or BI pipelines using this cleaned dataset."
        ]
    }
    
    with open(os.path.join(output_dir, "summary_stats.json"), "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=4)

    # Generate human-readable business insights
    business_insights = generate_business_insights(df)

    # Save insights.json
    with open(os.path.join(output_dir, "insights.json"), "w", encoding="utf-8") as f:
        json.dump(business_insights, f, indent=2)

    # Generate executive summary from structured insights
    executive_summary = generate_executive_summary_from_insights(
        insights=business_insights,
        rows=original_shape[0],
        columns=original_shape[1],
        health_score=score
    )

    with open(os.path.join(output_dir, "executive_summary.txt"), "w", encoding="utf-8") as f:
        f.write(executive_summary)

    return {
        "cleaned_data": "cleaned_data.csv",
        "eda_report": "eda_report.html",
        "business_summary": "executive_summary.txt",
        "summary_stats": "summary_stats.json",
        "insights": "insights.json"
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    args = parser.parse_args()
    run_pipeline(args.input)
