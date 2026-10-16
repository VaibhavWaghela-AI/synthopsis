import markdown, os, subprocess

md_path = r"C:\Users\VAIBHAV WAGHELA\.gemini\antigravity\brain\3d1edbbc-9a34-415a-b627-1655cac12e79\interview_questions_all_topics.md"
temp_html = r"C:\Users\VAIBHAV WAGHELA\Desktop\HACK\temp_print.html"
output_pdf = r"C:\Users\VAIBHAV WAGHELA\Desktop\Upteky_Interview_Questions_75.pdf"

with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

body_html = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Upteky Interview Questions - 75 Technical Questions</title>
  <style>
    @page {{
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 13px;
      padding: 0;
      margin: 0;
    }}
    h1 {{
      color: #0f172a;
      font-size: 18px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 5px;
      margin-top: 24px;
      page-break-after: avoid;
    }}
    h1:first-of-type {{
      margin-top: 0;
    }}
    h3 {{
      color: #1d4ed8;
      font-size: 14px;
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }}
    blockquote {{
      margin: 4px 0 12px 0;
      padding: 7px 12px;
      background: #f8fafc;
      border-left: 3.5px solid #3b82f6;
      color: #334155;
      font-size: 12.5px;
      border-radius: 0 5px 5px 0;
      page-break-inside: avoid;
    }}
    code {{
      background: #e2e8f0;
      padding: 1px 4px;
      border-radius: 3px;
      font-family: Consolas, monospace;
      font-size: 11.5px;
      color: #b91c1c;
    }}
    hr {{
      border: none;
      border-top: 1px solid #cbd5e1;
      margin: 16px 0;
    }}
    .header-doc {{
      text-align: center;
      border-bottom: 3px double #94a3b8;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }}
    .header-doc h2 {{
      margin: 0 0 4px 0;
      color: #0f172a;
      font-size: 20px;
    }}
    .header-doc p {{
      margin: 0;
      color: #64748b;
      font-size: 12.5px;
    }}
  </style>
</head>
<body>
  <div class="header-doc">
    <h2>🎯 Upteky Technical Interview Preparation</h2>
    <p><b>Candidate:</b> Vaibhav Waghela • <b>Role:</b> Developer • 75 Verbal Q&As Across All 15 Resume Techs</p>
  </div>
  {body_html}
</body>
</html>
"""

with open(temp_html, "w", encoding="utf-8") as f:
    f.write(full_html)

print("Temp HTML created.")

edge_paths = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
]

edge_exe = None
for p in edge_paths:
    if os.path.exists(p):
        edge_exe = p
        break

if not edge_exe:
    edge_exe = "msedge"

args = [
    edge_exe,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={output_pdf}",
    temp_html
]

print("Running subprocess...")
res = subprocess.run(args, capture_output=True, text=True)
print("Subprocess return code:", res.returncode)

if os.path.exists(output_pdf):
    size_kb = os.path.getsize(output_pdf) / 1024
    print(f"SUCCESS: PDF created at {output_pdf} ({size_kb:.1f} KB)")
else:
    print("FAILED. Stderr:", res.stderr)
