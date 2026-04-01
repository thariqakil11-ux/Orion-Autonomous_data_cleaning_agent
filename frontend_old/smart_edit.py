import os
import re

html_path = r"d:\My Projects\Orion\frontend\index.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Upload Data from sidebar
content = re.sub(
    r'<button\s+class="sidebar-link"\s+onclick="setView\(\'upload\'\)".*?</button>',
    '',
    content,
    flags=re.DOTALL
)

# 2. Change the view-upload ID to view-pipeline, but wait there is already a view-pipeline block!
# Let's completely nuke the <div id="view-pipeline" class="hidden"> boundary to merge them.
content = re.sub(
    r'\s+</div>\s+<!-- ── PIPELINE VIEW ── -->\s+<div id="view-pipeline" class="hidden">',
    r'\n      <div style="margin-top:40px; padding-top:40px; border-top:1px solid var(--border);" id="pipeline-results-block">',
    content
)

# Also rename the first one from view-upload to view-pipeline
content = content.replace('id="view-upload" class="hidden"', 'id="view-pipeline" class="hidden"')
content = content.replace('id="view-upload"', 'id="view-pipeline"')

# 3. Fix the array
content = re.sub(
    r"\['overview',\s*'upload',\s*'pipeline',\s*'history',\s*'reports'\]",
    "['overview','pipeline','history','reports']",
    content
)

# 4. Inject Insights Fetch
# Target the setTimeout(() => { block inside startProcessing
target_js = r"(setTimeout\(\(\)\s*=>\s*\{)(.*?overlay\.classList\.add\('hidden'\);)"

replacement_js = r"""// FETCH INSIGHTS
    let newInsightsHtml = "";
    try {
        const insightsRes = await fetch('http://localhost:8000/view/insights.json');
        if (insightsRes.ok) {
            const insightsJSON = await insightsRes.json();
            if (insightsJSON.business_risks && insightsJSON.business_risks.length > 0) {
                newInsightsHtml = insightsJSON.business_risks.map(r => `
                    <div class="eda-risk err">
                        <div class="eda-risk-icon">🔴</div>
                        <div>
                        <div class="eda-risk-title" style="color:var(--red)">${r.title}</div>
                        <div class="eda-risk-desc" style="white-space:pre-line; margin-top:8px;">${r.explanation.replace(/\\n/g, '<br/>')}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch(e) { console.error("Failed to fetch insights", e); }
    
    \1
      if (newInsightsHtml) {
          const container = document.getElementById('eda-risk-container');
          if (container) container.innerHTML = newInsightsHtml;
      }
      \2"""
content = re.sub(target_js, replacement_js, content, flags=re.DOTALL)

# 5. Make sure the eda-risk-container exists!
content = re.sub(
    r'(<div class="card-title">EDA Risk Signals</div>)(\s*)(<div class="eda-risk warn">)',
    r'\1\2<div id="eda-risk-container">\3',
    content
)

content = re.sub(
    r'(<div class="eda-risk-desc">28 columns classified: 12 numeric .*?</div>\s*</div>\s*</div>)(\s*</div>\s*</div>)',
    r'\1\n          </div>\2',
    content,
    flags=re.DOTALL
)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Finished rewriting index.html")
