import markdown, os, subprocess

md_path = r"C:\Users\VAIBHAV WAGHELA\.gemini\antigravity\brain\3d1edbbc-9a34-415a-b627-1655cac12e79\ai_tech_stack_50_questions_and_coding.md"
temp_html = r"C:\Users\VAIBHAV WAGHELA\Desktop\HACK\temp_ai_print.html"
output_pdf = r"C:\Users\VAIBHAV WAGHELA\Desktop\Upteky_AI_50_Questions_and_Coding.pdf"

with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

body_html = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

full_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Upteky AI Interview - 50 Questions & Coding</title>
  <style>
    @page {{ size: A4; margin: 16mm 14mm 16mm 14mm; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.55; font-size: 13px; margin: 0; padding: 0; }}
    h1 {{ color: #0f172a; font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-top: 24px; page-break-after: avoid; }}
    h3 {{ color: #1d4ed8; font-size: 13.5px; margin-top: 12px; margin-bottom: 4px; page-break-after: avoid; }}
    blockquote {{ margin: 4px 0 12px 0; padding: 7px 12px; background: #f8fafc; border-left: 3.5px solid #2563eb; color: #334155; font-size: 12.5px; border-radius: 0 5px 5px 0; page-break-inside: avoid; }}
    pre {{ background: #0f172a; color: #f8fafc; padding: 10px 14px; border-radius: 6px; font-size: 11.5px; overflow-x: auto; page-break-inside: avoid; font-family: Consolas, monospace; }}
    code {{ font-family: Consolas, monospace; font-size: 11.5px; }}
    p code, li code {{ background: #e2e8f0; color: #b91c1c; padding: 1px 4px; border-radius: 3px; }}
    .header-doc {{ text-align: center; border-bottom: 3px double #94a3b8; padding-bottom: 10px; margin-bottom: 18px; }}
    .header-doc h2 {{ margin: 0 0 4px 0; color: #0f172a; font-size: 20px; }}
    .header-doc p {{ margin: 0; color: #64748b; font-size: 12.5px; }}
  </style>
</head>
<body>
  <div class="header-doc">
    <h2>🧠 Upteky AI/ML Interview: 50 Questions & Coding Challenges</h2>
    <p><b>Candidate:</b> Vaibhav Waghela • <b>Focus:</b> LangGraph, RAG, PEFT/LoRA, PyTorch, TinyML, Multi-Agent</p>
  </div>
  {body_html}
</body>
</html>"""

with open(temp_html, "w", encoding="utf-8") as f:
    f.write(full_html)

edge_paths = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
]
edge_exe = "msedge"
for p in edge_paths:
    if os.path.exists(p):
        edge_exe = p
        break

args = [
    edge_exe,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={output_pdf}",
    temp_html
]

res = subprocess.run(args, capture_output=True, text=True)
if os.path.exists(output_pdf):
    print(f"SUCCESS: Created {output_pdf} ({os.path.getsize(output_pdf)/1024:.1f} KB)")
else:
    print("FAILED to generate PDF:", res.stderr)
