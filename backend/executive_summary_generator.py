from datetime import datetime

def generate_executive_summary_from_insights(
    insights,
    rows,
    columns,
    health_score
):
    lines = []

    # -------------------------
    # EXECUTIVE SNAPSHOT
    # -------------------------
    lines.append("EXECUTIVE SNAPSHOT")
    lines.append(f"Processed on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"Dataset Size: {rows} rows | {columns} columns")
    lines.append(f"Overall Data Health Score: {health_score}/100")
    lines.append("")

    if health_score >= 75:
        readiness = "Data is ready for decision-making and advanced analytics."
    elif health_score >= 50:
        readiness = "Data is usable with caution in certain business areas."
    else:
        readiness = "Data quality issues may impact business decisions."

    lines.append(f"Readiness Assessment: {readiness}")
    lines.append("")

    # -------------------------
    # KEY FINDINGS (RANKED)
    # -------------------------
    lines.append("KEY BUSINESS FINDINGS")

    risks = insights.get("business_risks", [])
    if not risks:
        lines.append("- No high-risk business issues detected.")
    else:
        for idx, risk in enumerate(risks, 1):
            lines.append(f"{idx}. {risk['title']}")
            lines.append(f"   Context: {risk['explanation']}")
            lines.append(f"   Business Impact: {risk['why_it_matters']}")
            lines.append("")

    # -------------------------
    # OPPORTUNITIES ENABLED
    # -------------------------
    lines.append("OPPORTUNITIES ENABLED BY CLEAN DATA")
    opportunities = insights.get("strategic_opportunities", [])
    if opportunities:
        for opp in opportunities:
            lines.append(f"- {opp}")
    else:
        lines.append("- Reliable customer segmentation and profiling")
        lines.append("- Trustworthy KPI tracking using robust metrics")
        lines.append("- Safer deployment of ML and BI pipelines")
    lines.append("")

    # -------------------------
    # RECOMMENDED NEXT ACTIONS
    # -------------------------
    lines.append("RECOMMENDED NEXT ACTIONS")

    actions = insights.get("recommended_pipeline", [])
    if actions:
        for act in sorted(actions):
            lines.append(f"- {act}")
    else:
        lines.append("- Proceed with standard analytics and reporting workflows")

    return "\n".join(lines)
