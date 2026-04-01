import json
import numpy as np

# ─────────────────────────────────────────────
# Ollama / Phi-3 Mini integration
# ─────────────────────────────────────────────

OLLAMA_MODEL = "phi3:mini"


def _build_dataset_summary(df) -> str:
    """Turn a DataFrame into a concise text block for the LLM prompt."""
    rows, cols = df.shape
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    lines = [
        f"Dataset: {rows} rows × {cols} columns",
        f"Numeric columns  ({len(numeric_cols)}): {', '.join(numeric_cols) or 'none'}",
        f"Categorical cols ({len(categorical_cols)}): {', '.join(categorical_cols) or 'none'}",
        "",
        "Column statistics:",
    ]

    for col in numeric_cols[:15]:           # cap to keep prompt short
        s = df[col].dropna()
        if len(s) < 2:
            continue
        lines.append(
            f"  {col}: mean={s.mean():.2f}, median={s.median():.2f}, "
            f"std={s.std():.2f}, skew={s.skew():.2f}, "
            f"missing={df[col].isnull().sum()}"
        )

    for col in categorical_cols[:10]:
        lines.append(
            f"  {col}: {df[col].nunique()} unique values, "
            f"top='{df[col].mode()[0] if not df[col].mode().empty else 'N/A'}', "
            f"missing={df[col].isnull().sum()}"
        )

    return "\n".join(lines)


def _call_phi3(dataset_summary: str) -> dict:
    """Send dataset summary to Phi-3 Mini and return parsed JSON insights."""
    import ollama

    prompt = f"""You are an expert senior data scientist and principal business consultant. 
Analyze the dataset summary below and produce an extensively detailed JSON object with exactly three keys:
  "business_risks"         – list of objects with keys: title, explanation, why_it_matters. Go deep into potential revenue, compliance, or operational impacts. Explain exactly how anomalies (like specific skews or missing data) distort analytics and reporting.
  "strategic_opportunities"– list of plain strings. Detail specific, highly-actionable growth, operational, or cost-saving opportunities enabled by analyzing this exact data structure.
  "recommended_pipeline"   – list of plain strings (concrete next steps). Suggest specific machine learning models (e.g., XGBoost, K-Means), BI dashboard structures, or advanced analytical frameworks warranted by the data shape.

CRITICAL FORMATTING RULES:
- Use clear bullet points (pointed lines) in your text formatting when explaining details.
- Write AT LEAST 10 lines/sentences of deep explanation for EACH sector/point you generate. Do not be concise; provide a highly comprehensive, essay-like breakdown.
- Explicitly cite the mathematical column statistics (e.g., mean, median, skew, variance, missing counts) from the summary to justify your recommendations. Don't be vague.
- Return ONLY valid JSON. No markdown fences, no explanatory text outside the JSON.

Dataset Summary:
{dataset_summary}
"""

    response = ollama.chat(
        model=OLLAMA_MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.3},
    )
    raw = response["message"]["content"].strip()

    # Strip markdown fences if model wraps in ```json … ```
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


# ─────────────────────────────────────────────
# Rule-based fallback (used when Ollama offline)
# ─────────────────────────────────────────────

def _rule_based_insights(df) -> dict:
    """Original deterministic insight engine — kept as a safety fallback."""
    TECH_TO_BUSINESS = {
        "high_cardinality": {
            "title": "Too many unique values",
            "explanation": (
                "This column contains many different values, which makes analysis, "
                "reporting, and modelling more complex."
            ),
            "why_it_matters": (
                "Models may overfit and reports may become noisy or hard to interpret."
            ),
        },
        "skewed_distribution": {
            "title": "Uneven value distribution",
            "explanation": (
                "A small number of records dominate this metric, while most values remain low."
            ),
            "why_it_matters": (
                "Average-based metrics may not represent typical behaviour."
            ),
        },
    }

    risks, opportunities, actions = [], [], []
    row_count = len(df)

    for col in df.select_dtypes(include=[np.number]).columns:
        series = df[col].dropna()
        if len(series) < 20:
            continue
        if series.skew() > 1.5:
            info = TECH_TO_BUSINESS["skewed_distribution"]
            risks.append({"title": f"{col}: {info['title']}", **info})
            actions.append(f"Use median-based KPIs and segment '{col}' into value ranges.")

    for col in df.select_dtypes(include=["object", "category"]).columns:
        if df[col].nunique() / row_count > 0.3:
            info = TECH_TO_BUSINESS["high_cardinality"]
            risks.append({"title": f"{col}: {info['title']}", **info})
            actions.append(f"Reduce '{col}' complexity by grouping or standardising values.")
            opportunities.append(
                f"'{col}' offers rich variation useful for customer / product segmentation."
            )

    return {
        "business_risks": risks,
        "strategic_opportunities": list(set(opportunities)),
        "recommended_pipeline": list(set(actions)),
    }


# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────

def generate_business_insights(df) -> dict:
    """
    Generate AI-powered business insights using Phi-3 Mini (via Ollama).
    Falls back to the deterministic rule engine if Ollama is not available.
    """
    summary = _build_dataset_summary(df)

    try:
        insights = _call_phi3(summary)
        # Validate expected keys exist
        for key in ("business_risks", "strategic_opportunities", "recommended_pipeline"):
            if key not in insights:
                raise ValueError(f"Missing key in Phi-3 response: {key}")
        print("[Orion] ✅ Phi-3 Mini insights generated successfully.")
        return insights

    except Exception as exc:
        print(f"[Orion] ⚠️  Phi-3 unavailable ({exc}). Using rule-based fallback.")
        return _rule_based_insights(df)
