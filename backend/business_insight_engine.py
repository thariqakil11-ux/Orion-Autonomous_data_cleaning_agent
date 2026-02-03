import numpy as np

TECH_TO_BUSINESS_TRANSLATION = {
    "high_cardinality": {
        "title": "Too many unique values",
        "business_meaning": (
            "This column contains many different values, which makes analysis, "
            "reporting, and modeling more complex."
        ),
        "risk": (
            "Models may overfit and reports may become noisy or hard to interpret."
        ),
        "action": (
            "Group similar values or create categories before analysis."
        )
    },
    "skewed_distribution": {
        "title": "Uneven value distribution",
        "business_meaning": (
            "A small number of records dominate this metric, while most values remain low."
        ),
        "risk": (
            "Average-based metrics may not represent typical behavior."
        ),
        "action": (
            "Use median or percentile-based KPIs and create value segments."
        )
    }
}

def generate_business_insights(df):
    risks = []
    opportunities = []
    actions = []

    row_count = len(df)

    # -------- NUMERIC ANALYSIS --------
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 20:
            continue

        skew = series.skew()
        if skew > 1.5:
            info = TECH_TO_BUSINESS_TRANSLATION["skewed_distribution"]

            risks.append({
                "title": f"{col}: {info['title']}",
                "explanation": info["business_meaning"],
                "why_it_matters": info["risk"],
            })

            actions.append(
                f"Use median-based KPIs and segment '{col}' into value ranges."
            )

    # -------- CATEGORICAL ANALYSIS --------
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    for col in categorical_cols:
        unique_ratio = df[col].nunique() / row_count

        if unique_ratio > 0.3:
            info = TECH_TO_BUSINESS_TRANSLATION["high_cardinality"]

            risks.append({
                "title": f"{col}: {info['title']}",
                "explanation": info["business_meaning"],
                "why_it_matters": info["risk"],
            })

            actions.append(
                f"Reduce '{col}' complexity by grouping or standardizing values."
            )

            opportunities.append(
                f"'{col}' offers rich variation that can be used for detailed product or customer segmentation."
            )

    # Deduplicate actions
    actions = list(set(actions))

    return {
        "business_risks": risks,
        "strategic_opportunities": opportunities,
        "recommended_pipeline": actions
    }
