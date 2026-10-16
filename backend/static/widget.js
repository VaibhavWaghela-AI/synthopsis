(function() {
  const BACKEND_URL = window.NEXUSAI_BACKEND_URL || "http://localhost:8000";
  const AGENT_VERTICAL = window.NEXUSAI_VERTICAL || "manufacturing";

  // Create Container
  const container = document.createElement("div");
  container.id = "nexusai-widget-container";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "999999";
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // Floating Trigger Button
  const button = document.createElement("button");
  button.innerHTML = "💬 <span style='font-size:14px; font-weight:600;'>Chat with Us</span>";
  button.style.backgroundColor = "#059669";
  button.style.color = "#ffffff";
  button.style.border = "none";
  button.style.borderRadius = "30px";
  button.style.padding = "12px 20px";
  button.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
  button.style.cursor = "pointer";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.gap = "8px";
  button.style.transition = "transform 0.2s ease";

  button.onmouseover = () => button.style.transform = "scale(1.05)";
  button.onmouseout = () => button.style.transform = "scale(1)";

  // Chat Window
  const chatWindow = document.createElement("div");
  chatWindow.style.display = "none";
  chatWindow.style.flexDirection = "column";
  chatWindow.style.width = "360px";
  chatWindow.style.height = "520px";
  chatWindow.style.backgroundColor = "#111827";
  chatWindow.style.border = "1px solid rgba(255,255,255,0.15)";
  chatWindow.style.borderRadius = "16px";
  chatWindow.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
  chatWindow.style.overflow = "hidden";
  chatWindow.style.marginBottom = "12px";

  // Header
  chatWindow.innerHTML = `
    <div style="background:#065f46; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; color:#fff;">
      <div>
        <div style="font-weight:700; font-size:14px;">📦 JM PlastoPack Copilot</div>
        <div style="font-size:11px; opacity:0.85;">Powered by Synthopsis • Online 24/7</div>
      </div>
      <button id="nexus-close-btn" style="background:none; border:none; color:#fff; font-size:18px; cursor:pointer;">&times;</button>
    </div>
    <div id="nexus-messages" style="flex:1; padding:14px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; font-size:13px; color:#e5e7eb; background:#0b1320;">
      <div style="background:#1f2937; padding:10px 14px; border-radius:12px 12px 12px 2px; max-width:85%; line-height:1.4;">
        Namaste! Welcome to <b>JM PlastoPack</b>. Ask me for custom packaging quotes, minimum order quantities (MOQ), or tracking an existing order!
      </div>
    </div>
    <form id="nexus-form" style="padding:12px; background:#111827; border-top:1px solid #1f2937; display:flex; gap:8px;">
      <input id="nexus-input" type="text" placeholder="Type your message..." style="flex:1; background:#1f2937; border:1px solid #374151; color:#fff; border-radius:8px; padding:10px 12px; font-size:13px; outline:none;" required />
      <button type="submit" style="background:#059669; border:none; color:#fff; padding:0 14px; border-radius:8px; font-weight:600; cursor:pointer;">Send</button>
    </form>
  `;

  container.appendChild(chatWindow);
  container.appendChild(button);
  document.body.appendChild(container);

  // Toggle Window
  button.onclick = () => {
    const isHidden = chatWindow.style.display === "none";
    chatWindow.style.display = isHidden ? "flex" : "none";
    if (isHidden) document.getElementById("nexus-input").focus();
  };

  document.getElementById("nexus-close-btn").onclick = () => {
    chatWindow.style.display = "none";
  };

  // Form Submit & Live Streaming
  document.getElementById("nexus-form").onsubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById("nexus-input");
    const text = input.value.trim();
    if (!text) return;

    const messagesFeed = document.getElementById("nexus-messages");

    // Add User Bubble
    const userBubble = document.createElement("div");
    userBubble.style.alignSelf = "flex-end";
    userBubble.style.background = "#047857";
    userBubble.style.color = "#fff";
    userBubble.style.padding = "10px 14px";
    userBubble.style.borderRadius = "12px 12px 2px 12px";
    userBubble.style.maxWidth = "85%";
    userBubble.innerText = text;
    messagesFeed.appendChild(userBubble);

    input.value = "";
    messagesFeed.scrollTop = messagesFeed.scrollHeight;

    // Add Bot Placeholder
    const botBubble = document.createElement("div");
    botBubble.style.alignSelf = "flex-start";
    botBubble.style.background = "#1f2937";
    botBubble.style.padding = "10px 14px";
    botBubble.style.borderRadius = "12px 12px 12px 2px";
    botBubble.style.maxWidth = "85%";
    botBubble.style.lineHeight = "1.4";
    botBubble.style.whiteSpace = "pre-wrap";
    botBubble.innerText = "Typing...";
    messagesFeed.appendChild(botBubble);
    messagesFeed.scrollTop = messagesFeed.scrollHeight;

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          channel: "web",
          vertical: AGENT_VERTICAL,
          model: "auto"
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      botBubble.innerText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botBubble.innerText += decoder.decode(value);
        messagesFeed.scrollTop = messagesFeed.scrollHeight;
      }
    } catch (err) {
      botBubble.innerText = "Connection error. Ensure NexusAI backend is running on port 8000.";
    }
  };
})();
