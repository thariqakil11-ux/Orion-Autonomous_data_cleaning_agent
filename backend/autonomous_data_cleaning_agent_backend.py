import os
import argparse
import pandas as pd
import numpy as np
from ydata_profiling import ProfileReport
from datetime import datetime

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

def generate_business_insights(df, plan):
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

    insights = generate_business_insights(df, plan)

    df.to_csv(os.path.join(output_dir, "cleaned_data.csv"), index=False)

    ProfileReport(df, explorative=True).to_file(
        os.path.join(output_dir, "eda_report.html")
    )

    summary = generate_business_summary(df, original_shape, stats, insights)
    with open(os.path.join(output_dir, "business_summary.txt"), "w", encoding="utf-8") as f:
        f.write(summary)

    return {
        "cleaned_data": "cleaned_data.csv",
        "eda_report": "eda_report.html",
        "business_summary": "business_summary.txt",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    args = parser.parse_args()
    run_pipeline(args.input)
