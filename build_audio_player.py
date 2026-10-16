import json, re

md_path = r"C:\Users\VAIBHAV WAGHELA\.gemini\antigravity\brain\3d1edbbc-9a34-415a-b627-1655cac12e79\interview_questions_all_topics.md"
out_html = r"C:\Users\VAIBHAV WAGHELA\Desktop\Tech_Stack_Audio_Player.html"

with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

tracks = []
current_topic = "Python"
current_q = None
current_a = []

for line in lines:
    line_s = line.strip()
    if line_s.startswith("# ") and "TOPIC" in line_s:
        current_topic = line_s.replace("# ", "").strip()
    elif line_s.startswith("### Q"):
        if current_q and current_a:
            tracks.append({
                "topic": current_topic,
                "question": current_q,
                "answer": " ".join(current_a).strip()
            })
        current_q = line_s.replace("### ", "").strip()
        current_a = []
    elif line_s.startswith("> ") and current_q:
        current_a.append(line_s[2:].strip())
    elif line_s and current_q and not line_s.startswith("---") and not line_s.startswith("#"):
        current_a.append(line_s.strip())

if current_q and current_a:
    tracks.append({
        "topic": current_topic,
        "question": current_q,
        "answer": " ".join(current_a).strip()
    })

print(f"Parsed {len(tracks)} tracks across all topics.")

json_data = json.dumps(tracks)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎧 Tech Stack Practice Audio Player (75 Questions)</title>
  <style>
    :root {{
      --bg: #0b0f19;
      --card: #131b2e;
      --card-active: #1e293b;
      --accent: #38bdf8;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }}
    body {{
      margin: 0; padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg); color: var(--text);
      display: flex; flex-direction: column; align-items: center; min-height: 100vh;
    }}
    .container {{ max-width: 850px; width: 100%; }}
    .header {{ text-align: center; margin-bottom: 20px; }}
    .header h1 {{ font-size: 26px; color: var(--accent); margin: 0 0 6px 0; }}
    .header p {{ color: var(--text-muted); font-size: 14px; margin: 0; }}
    .tip-box {{
      background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 8px; padding: 12px; font-size: 13px; color: #7dd3fc;
      margin-bottom: 16px; text-align: center;
    }}
    .controls {{
      position: sticky; top: 12px;
      background: rgba(19, 27, 46, 0.95); backdrop-filter: blur(12px);
      border: 1px solid #334155; border-radius: 12px;
      padding: 14px 18px; margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 100;
      display: flex; flex-wrap: wrap; gap: 10px;
      align-items: center; justify-content: space-between;
    }}
    .btn-group {{ display: flex; gap: 8px; }}
    button {{
      background: #0284c7; color: white; border: none;
      padding: 9px 16px; border-radius: 7px; font-size: 13px;
      font-weight: 600; cursor: pointer; transition: 0.2s;
    }}
    button:hover {{ background: #0369a1; }}
    button.secondary {{ background: #334155; }}
    button.secondary:hover {{ background: #475569; }}
    select {{
      background: #1e293b; color: var(--text); border: 1px solid #475569;
      padding: 6px 10px; border-radius: 6px; font-size: 12px;
    }}
    .now-playing {{
      width: 100%; font-size: 13px; color: #38bdf8;
      margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }}
    .track-list {{ display: flex; flex-direction: column; gap: 12px; }}
    .track {{
      background: var(--card); border: 1px solid #1e293b;
      border-radius: 10px; padding: 14px 18px; cursor: pointer; transition: 0.2s;
    }}
    .track:hover {{ border-color: var(--accent); }}
    .track.active {{
      border-color: var(--accent); background: var(--card-active);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
    }}
    .track-tag {{
      font-size: 11px; font-weight: bold; color: #38bdf8;
      background: #0f172a; padding: 2px 8px; border-radius: 4px;
      display: inline-block; margin-bottom: 6px;
    }}
    .track-q {{ font-size: 15px; font-weight: 600; color: #f8fafc; margin-bottom: 6px; }}
    .track-a {{ font-size: 13.5px; line-height: 1.6; color: #cbd5e1; }}
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🎧 Complete Tech Stack Practice Audio Player</h1>
    <p>All 15 Technologies • 75 Questions & Answers from your resume</p>
  </div>

  <div class="tip-box">
    💡 <b>Eyes-Closed Listening:</b> Click <b>▶️ Play All</b>, lean back, and close your eyes. You can jump to any topic using the dropdown below! (Or press <b>Ctrl + Shift + U</b> in Edge for Natural AI voice).
  </div>

  <div class="controls">
    <div class="btn-group">
      <button id="playBtn" onclick="togglePlay()">▶️ Play All</button>
      <button class="secondary" onclick="prevTrack()">⏮️ Prev</button>
      <button class="secondary" onclick="nextTrack()">⏭️ Next</button>
      <button class="secondary" onclick="stopAudio()">⏹️ Stop</button>
    </div>

    <div style="display:flex; gap:8px; align-items:center;">
      <select id="topicFilter" onchange="filterByTopic(this.value)">
        <option value="ALL">All Topics (75 Questions)</option>
      </select>

      <select id="speedSelect" onchange="changeSpeed(this.value)">
        <option value="0.9">0.9x Relaxed</option>
        <option value="1.0" selected>1.0x Normal</option>
        <option value="1.1">1.1x Brisk</option>
        <option value="1.25">1.25x Fast</option>
      </select>

      <select id="voiceSelect" onchange="changeVoice()"></select>
    </div>

    <div class="now-playing" id="nowPlaying">Ready. Click Play All to begin.</div>
  </div>

  <div class="track-list" id="trackList"></div>
</div>

<script>
const allTracks = {json_data};

let filteredTracks = [...allTracks];
let currentIndex = 0;
let isPlaying = false;
let synth = window.speechSynthesis;
let currentUtterance = null;
let speechRate = 1.0;
let voices = [];
let selectedVoice = null;

// Populate Topic dropdown
const uniqueTopics = [...new Set(allTracks.map(t => t.topic))];
const topicSelect = document.getElementById("topicFilter");
uniqueTopics.forEach(t => {{
  const opt = document.createElement("option");
  opt.value = t;
  opt.textContent = t;
  topicSelect.appendChild(opt);
}});

function filterByTopic(topic) {{
  if (topic === "ALL") {{
    filteredTracks = [...allTracks];
  }} else {{
    filteredTracks = allTracks.filter(t => t.topic === topic);
  }}
  currentIndex = 0;
  renderTracks();
  if (isPlaying) {{
    speakTrack(0);
  }} else {{
    document.getElementById("nowPlaying").textContent = `Loaded ${{filteredTracks.length}} questions for: ${{topic}}`;
  }}
}}

function populateVoices() {{
  voices = synth.getVoices().filter(v => v.lang.startsWith("en"));
  const select = document.getElementById("voiceSelect");
  select.innerHTML = "";
  voices.forEach((v, idx) => {{
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = `${{v.name.slice(0, 24)}} (${{v.lang}})`;
    if (v.name.includes("Natural") || v.name.includes("Google") || v.default) {{
      opt.selected = true;
      selectedVoice = v;
    }}
    select.appendChild(opt);
  }});
  if (!selectedVoice && voices.length > 0) selectedVoice = voices[0];
}}

if (speechSynthesis.onvoiceschanged !== undefined) {{
  speechSynthesis.onvoiceschanged = populateVoices;
}}
populateVoices();

function changeVoice() {{
  const idx = document.getElementById("voiceSelect").value;
  selectedVoice = voices[idx];
  if (isPlaying) speakTrack(currentIndex);
}}

function changeSpeed(val) {{
  speechRate = parseFloat(val);
  if (isPlaying) speakTrack(currentIndex);
}}

function renderTracks() {{
  const list = document.getElementById("trackList");
  list.innerHTML = "";
  filteredTracks.forEach((item, i) => {{
    const div = document.createElement("div");
    div.className = `track ${{i === currentIndex ? "active" : ""}}`;
    div.id = `track-${{i}}`;
    div.onclick = () => {{
      currentIndex = i;
      speakTrack(i);
    }};
    div.innerHTML = `
      <div class="track-tag">${{i + 1}}/${{filteredTracks.length}} • ${{item.topic}}</div>
      <div class="track-q">${{item.question}}</div>
      <div class="track-a">${{item.answer}}</div>
    `;
    list.appendChild(div);
  }});
}}

function updateActiveUI() {{
  document.querySelectorAll(".track").forEach((el, i) => {{
    el.classList.toggle("active", i === currentIndex);
  }});
  const currentEl = document.getElementById(`track-${{currentIndex}}`);
  if (currentEl) currentEl.scrollIntoView({{ behavior: "smooth", block: "nearest" }});
  const item = filteredTracks[currentIndex];
  document.getElementById("nowPlaying").textContent = `[${{currentIndex + 1}}/${{filteredTracks.length}}] ${{item.topic}} - ${{item.question}}`;
}}

function speakTrack(idx) {{
  if (idx >= filteredTracks.length) {{
    stopAudio();
    document.getElementById("nowPlaying").textContent = "Completed all tracks!";
    return;
  }}
  synth.cancel();
  currentIndex = idx;
  updateActiveUI();

  const item = filteredTracks[idx];
  const text = `${{item.question}}. ... ${{item.answer}}`;

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = speechRate;
  if (selectedVoice) currentUtterance.voice = selectedVoice;

  currentUtterance.onend = () => {{
    if (isPlaying) {{
      setTimeout(() => {{
        if (isPlaying) {{
          currentIndex++;
          speakTrack(currentIndex);
        }}
      }}, 1500);
    }}
  }};

  isPlaying = true;
  document.getElementById("playBtn").textContent = "⏸️ Pause";
  synth.speak(currentUtterance);
}}

function togglePlay() {{
  if (isPlaying) {{
    synth.cancel();
    isPlaying = false;
    document.getElementById("playBtn").textContent = "▶️ Resume";
    document.getElementById("nowPlaying").textContent = "Paused.";
  }} else {{
    isPlaying = true;
    document.getElementById("playBtn").textContent = "⏸️ Pause";
    speakTrack(currentIndex);
  }}
}}

function nextTrack() {{
  if (currentIndex < filteredTracks.length - 1) {{
    currentIndex++;
    speakTrack(currentIndex);
  }}
}}

function prevTrack() {{
  if (currentIndex > 0) {{
    currentIndex--;
    speakTrack(currentIndex);
  }}
}}

function stopAudio() {{
  synth.cancel();
  isPlaying = false;
  document.getElementById("playBtn").textContent = "▶️ Play All";
  document.getElementById("nowPlaying").textContent = "Stopped.";
}}

renderTracks();
</script>
</body>
</html>
"""

with open(out_html, "w", encoding="utf-8") as f:
    f.write(html)

print("Tech_Stack_Audio_Player.html created successfully!")
