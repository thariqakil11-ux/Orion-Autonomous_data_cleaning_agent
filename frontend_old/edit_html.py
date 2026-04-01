import os
import re

html_path = r"d:\My Projects\Orion\frontend\index.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Upload Data sidebar link
content = re.sub(
    r'<button class="sidebar-link" onclick="setView\(\'upload\'\)">.*?</button>',
    '',
    content,
    flags=re.DOTALL
)

# 2. Merge views: Rename view-upload to view-pipeline, and remove the old view-pipeline wrapper, so it's all one flow.
content = content.replace('id="view-upload" class="hidden"', 'id="view-pipeline" class="hidden"')

view_pipeline_header = """    </div>

    <!-- ── PIPELINE VIEW ── -->
    <div id="view-pipeline" class="hidden">"""

replacement_header = """    </div>

    <!-- ── AGENT PIPELINE RESULTS ── -->
    <div style="margin-top:40px; padding-top:40px; border-top:1px solid var(--border);" id="pipeline-results-block">"""

content = content.replace(view_pipeline_header, replacement_header)

# 3. Fix JS setView so it doesn't look for 'upload'
content = content.replace("['overview','upload','pipeline','history','reports']", "['overview','pipeline','history','reports']")

# 4. Remove 'upload' from the setView array references
content = re.sub(r"const views = \['overview','upload','pipeline','history','reports'\];", "const views = ['overview','pipeline','history','reports'];", content)

# 5. Make the pre-flight Run Pipeline button show the results block
# Oh wait, we just need to append the JS fetch for insights.json.
# Let's target the exact fetch block.

js_target = """    const data = await res.json();
    const stats = data.outputs || {};

    // Update overlay to 100%
    document.getElementById('overlay-progress').style.width = '100%';
    document.getElementById('processing-title').textContent = 'Pipeline Complete!';
    document.getElementById('overlay-label').textContent = 'All 4 stages finished successfully.';

    setTimeout(() => {"""

js_replacement = """    const data = await res.json();
    const stats = data.outputs || {};

    // FETCH INSIGHTS
    let newInsightsHtml = "";
    try {
        const insightsRes = await fetch(`${API_URL}/view/insights.json`);
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

    // Update overlay to 100%
    document.getElementById('overlay-progress').style.width = '100%';
    document.getElementById('processing-title').textContent = 'Pipeline Complete!';
    document.getElementById('overlay-label').textContent = 'All 4 stages finished successfully.';

    setTimeout(() => {
      // IF WE FETCHED NEW INSIGHTS, INJECT THEM
      if (newInsightsHtml) {
          document.getElementById('eda-risk-container').innerHTML = newInsightsHtml;
      }
"""

content = content.replace(js_target, js_replacement)

# 6. Add ID 'eda-risk-container' to the hardcoded risks so we can inject into it.
risk_target = """        <div class="card">
          <div class="card-title">EDA Risk Signals</div>
          <div class="eda-risk warn">"""

risk_replacement = """        <div class="card">
          <div class="card-title">EDA Risk Signals</div>
          <div id="eda-risk-container">
          <div class="eda-risk warn">"""

content = content.replace(risk_target, risk_replacement)

# Ensure to close the container div where the OK badge ends
risk_end_target = """              <div class="eda-risk-desc">28 columns classified: 12 numeric · 9 categorical · 4 datetime · 3 boolean</div>
            </div>
          </div>
        </div>"""

risk_end_replacement = """              <div class="eda-risk-desc">28 columns classified: 12 numeric · 9 categorical · 4 datetime · 3 boolean</div>
            </div>
          </div>
          </div> <!-- end container -->
        </div>"""

content = content.replace(risk_end_target, risk_end_replacement)


with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("HTML modified successfully.")
