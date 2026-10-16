const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3006;
const ORCHESTRATOR_URL =
  process.env.ORCHESTRATOR_URL || "http://127.0.0.1:8000/whatsapp-incoming";

// ── Express + Socket.io ─────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      /localhost/,
      /127\.0\.0\.1/,
    ],
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [/localhost/, /127\.0\.0\.1/],
    credentials: true,
  },
});

// ── Global Error Traps (Prevents Node 24 unhandled promise exit) ───────────
process.on("unhandledRejection", (reason) => {
  console.warn("[Process] Ignored unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.warn("[Process] Ignored uncaught exception:", err.message);
});

// ── WhatsApp Client ─────────────────────────────────────────────────────────
const serviceStartTime = Math.floor(Date.now() / 1000) - 20;
let connectionStatus = "initializing"; // initializing | qr | authenticated | ready | disconnected
let lastQr = null;
let lastQrDataUrl = null;

// Self-test and loop prevention tracking
const botSentMessageIds = new Set();
const recentBotReplies = new Map(); // text -> timestamp

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, ".wwebjs_auth"),
  }),
  authTimeoutMs: 120000,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--disable-extensions",
    ],
  },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  webVersionCache: {
    type: "none",
  },
});

// ── WhatsApp Lifecycle Events ───────────────────────────────────────────────

client.on("qr", async (qr) => {
  connectionStatus = "qr";
  lastQr = qr;
  console.log("\n=======================================================");
  console.log("[WhatsApp] REAL WHATSAPP QR CODE GENERATED!");
  console.log("[WhatsApp] Scan this QR code in your phone or view at: http://localhost:3006/qr");
  console.log("=======================================================\n");
  try {
    lastQrDataUrl = await QRCode.toDataURL(qr);
    io.emit("wa_qr", { qr, qrDataUrl: lastQrDataUrl });
  } catch (err) {
    console.error("[WhatsApp] Failed to generate QR data URL:", err.message);
    io.emit("wa_qr", { qr, qrDataUrl: null });
  }
});

client.on("authenticated", () => {
  connectionStatus = "authenticated";
  lastQr = null;
  lastQrDataUrl = null;
  console.log("[WhatsApp] Authenticated successfully with your real phone.");
  io.emit("wa_authenticated", { timestamp: Date.now() });
});

client.on("auth_failure", (msg) => {
  connectionStatus = "disconnected";
  console.error("[WhatsApp] Authentication failure:", msg);
  io.emit("wa_disconnected", { reason: "auth_failure", detail: msg });
});

client.on("ready", () => {
  connectionStatus = "ready";
  lastQr = null;
  lastQrDataUrl = null;
  const info = client.info;
  console.log("\n=======================================================");
  console.log(`[WhatsApp] LIVE & READY! Connected as: ${info?.pushname} (${info?.wid?.user})`);
  console.log(`[WhatsApp] Ready to automatically ingest inquiries and send AI replies!`);
  console.log("=======================================================\n");
  io.emit("wa_ready", {
    pushname: info?.pushname,
    wid: info?.wid?.user,
    platform: info?.platform,
    timestamp: Date.now(),
  });
});

client.on("disconnected", (reason) => {
  connectionStatus = "disconnected";
  console.log("[WhatsApp] Client disconnected:", reason);
  io.emit("wa_disconnected", { reason, timestamp: Date.now() });
});

// ── Incoming Messages ───────────────────────────────────────────────────────

client.on("message_create", async (msg) => {
  try {
    // ── STRICT SAFETY GUARDS FOR PERSONAL WHATSAPP ─────────────────────────
    // 1. NEVER touch WhatsApp Group chats (@g.us)
    const isGroup =
      (msg.from || "").includes("@g.us") || (msg.to || "").includes("@g.us");
    if (isGroup) {
      return;
    }

    // 2. NEVER touch WhatsApp Status stories or broadcast lists
    if (
      msg.isStatus ||
      (msg.from || "").includes("broadcast") ||
      (msg.to || "").includes("broadcast")
    ) {
      return;
    }

    // 3. Ignore empty bodies or system messages
    if (!msg.body || !msg.body.trim()) {
      return;
    }

    // 4. Ignore historical messages synced upon initial connect
    if (msg.timestamp && msg.timestamp < serviceStartTime) {
      return;
    }

    // 5. Anti-loop protection: ignore messages generated by this bot
    const msgId = msg.id?._serialized || "";
    if (botSentMessageIds.has(msgId)) {
      return;
    }
    const cleanBody = (msg.body || "").trim();
    if (recentBotReplies.has(cleanBody)) {
      const sentTime = recentBotReplies.get(cleanBody);
      if (Date.now() - sentTime < 30000) {
        return; // Skip bot's own recent outbound message
      }
    }

    const payload = {
      from: msg.from,
      to: msg.to,
      body: msg.body,
      timestamp: msg.timestamp,
      chatId: msg.fromMe ? msg.to : msg.from,
      senderName: msg.fromMe ? "You" : (msg._data?.notifyName || msg.from),
      isGroup: false,
      fromMe: msg.fromMe,
      id: msgId || `${Date.now()}`,
    };

    console.log(
      `[WhatsApp] ${msg.fromMe ? "Sent" : "Received"} 1-on-1 message ${msg.fromMe ? "to" : "from"} ${payload.senderName}: ${(payload.body || "").substring(0, 80)}`
    );

    io.emit("wa_message", payload);

    // Detect if this is a "Message Yourself" (Self-Chat) test on the user's single phone
    const myWidUser = client.info?.wid?.user || "";
    const isSelfChat = msg.fromMe && (
      (msg.to || "").includes(myWidUser) ||
      (msg.from || "").includes(myWidUser) ||
      payload.senderName === "You" ||
      msg.to === msg.from
    );

    // Forward incoming 1-on-1 messages OR manual self-chat messages to orchestrator
    if (!msg.fromMe || isSelfChat) {
      if (isSelfChat) {
        if (myWidUser) {
          payload.chatId = `${myWidUser}@c.us`;
          payload.from = `${myWidUser}@c.us`;
        }
        console.log(`[WhatsApp] 🧪 Self-Chat Test detected from You: "${payload.body}" -> Forwarding to AI agent (${payload.chatId})!`);
      }
      forwardToOrchestrator(payload);
    }
  } catch (err) {
    console.error("[WhatsApp] Error processing message:", err.message);
  }
});

/**
 * Forward an incoming WhatsApp message to the Python orchestrator.
 * Fire-and-forget — we log errors and status clearly.
 */
async function forwardToOrchestrator(payload) {
  try {
    console.log(`[Orchestrator] Forwarding inbound message from ${payload.senderName} (${payload.chatId}) to ${ORCHESTRATOR_URL}...`);
    const res = await fetch(ORCHESTRATOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const resData = await res.json().catch(() => null);
    if (!res.ok) {
      console.warn(
        `[Orchestrator] Forward returned ${res.status}: ${res.statusText}`
      );
    } else {
      console.log(
        `[Orchestrator] Webhook successfully processed by FastAPI (Status: ${res.status}, Result: ${resData?.status || "ok"})`
      );
    }
  } catch (err) {
    console.warn(
      `[Orchestrator] Failed to forward message (orchestrator may be offline): ${err.message}`
    );
  }
}

// ── REST Endpoints ──────────────────────────────────────────────────────────

/** GET /status — connection status */
app.get("/status", (_req, res) => {
  const info = connectionStatus === "ready" ? client.info : null;
  res.json({
    status: connectionStatus,
    phone: info
      ? { pushname: info.pushname, wid: info.wid?.user, platform: info.platform }
      : null,
  });
});

/** GET /qr — visual scan page for browser */
app.get("/qr", (_req, res) => {
  if (connectionStatus === "ready") {
    return res.send(`
      <html>
        <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;text-align:center;padding:50px;background:#0b141a;color:#e9edef;">
          <div style="max-width:440px;margin:40px auto;background:#111b21;padding:36px;border-radius:16px;border:1px solid #222e35;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h2 style="color:#00a884;margin-top:0;">WhatsApp Connected!</h2>
            <p style="color:#8696a0;font-size:14px;">Connected as <strong>${client.info?.pushname || "Business Account"}</strong> (${client.info?.wid?.user || ""}).</p>
            <p style="color:#25d366;font-size:12px;font-weight:bold;">NexusAI is actively monitoring inbound messages & replying.</p>
          </div>
        </body>
      </html>
    `);
  }
  if (!lastQrDataUrl) {
    return res.send(`
      <html>
        <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;text-align:center;padding:50px;background:#0b141a;color:#e9edef;">
          <div style="max-width:440px;margin:40px auto;background:#111b21;padding:36px;border-radius:16px;border:1px solid #222e35;">
            <div style="font-size:36px;margin-bottom:12px;">⏳</div>
            <h2 style="color:#25d366;margin-top:0;">Initializing WhatsApp...</h2>
            <p style="color:#8696a0;font-size:14px;">Generating secure QR pairing code... Auto-refreshing in 4s.</p>
          </div>
          <script>setTimeout(() => window.location.reload(), 4000);</script>
        </body>
      </html>
    `);
  }
  res.send(`
    <html>
      <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;text-align:center;padding:40px;background:#0b141a;color:#e9edef;">
        <div style="max-width:440px;margin:20px auto;background:#111b21;padding:32px;border-radius:16px;border:1px solid #222e35;box-shadow:0 8px 30px rgba(0,0,0,0.5);">
          <h2 style="color:#00a884;margin-top:0;font-size:22px;">Connect Actual WhatsApp</h2>
          <div style="color:#8696a0;font-size:13px;line-height:1.6;text-align:left;background:#202c33;padding:14px;border-radius:8px;margin-bottom:20px;">
            1. Open <strong>WhatsApp</strong> on your phone<br/>
            2. Tap <strong>Linked Devices</strong> in Settings<br/>
            3. Tap <strong>Link a Device</strong> and point your camera here:
          </div>
          <div style="background:white;display:inline-block;padding:14px;border-radius:12px;">
            <img src="${lastQrDataUrl}" style="width:260px;height:260px;display:block;" alt="WhatsApp QR"/>
          </div>
          <p style="color:#8696a0;font-size:12px;margin-top:16px;">
            Status: <span style="color:#25d366;font-weight:bold;">${connectionStatus.toUpperCase()}</span> (Auto-links on scan)
          </p>
        </div>
        <script>
          setInterval(() => {
            fetch('/status').then(r => r.json()).then(data => {
              if (data.status === 'ready') window.location.reload();
            });
          }, 3000);
        </script>
      </body>
    </html>
  `);
});

/** GET /qr-data — JSON for frontend modals */
app.get("/qr-data", (_req, res) => {
  res.json({
    status: connectionStatus,
    qrDataUrl: lastQrDataUrl,
    phone: connectionStatus === "ready" && client.info ? {
      pushname: client.info.pushname,
      wid: client.info.wid?.user,
      platform: client.info.platform
    } : null
  });
});

/** GET /chats — list of chats with last message */
app.get("/chats", async (_req, res) => {
  if (connectionStatus !== "ready") {
    return res.status(503).json({
      error: "WhatsApp client is not ready",
      status: connectionStatus,
    });
  }

  try {
    const chats = await client.getChats();
    const chatList = chats.map((chat) => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      lastMessage: chat.lastMessage
        ? {
            body: chat.lastMessage.body,
            timestamp: chat.lastMessage.timestamp,
            fromMe: chat.lastMessage.fromMe,
          }
        : null,
      timestamp: chat.timestamp,
    }));

    res.json({ chats: chatList });
  } catch (err) {
    console.error("[REST] Error fetching chats:", err.message);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

/** GET /chats/:chatId/messages — last 50 messages for a chat */
app.get("/chats/:chatId/messages", async (req, res) => {
  if (connectionStatus !== "ready") {
    return res.status(503).json({
      error: "WhatsApp client is not ready",
      status: connectionStatus,
    });
  }

  try {
    const chat = await client.getChatById(req.params.chatId);
    const messages = await chat.fetchMessages({ limit: 50 });

    const messageList = messages.map((msg) => ({
      id: msg.id._serialized,
      body: msg.body,
      from: msg.from,
      to: msg.to,
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      hasMedia: msg.hasMedia,
      type: msg.type,
    }));

    res.json({ chatId: req.params.chatId, messages: messageList });
  } catch (err) {
    console.error("[REST] Error fetching messages:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/** POST /send & POST /api/send — send a text message or native PDF document attachment */
const handleSendMessage = async (req, res) => {
  if (connectionStatus !== "ready") {
    return res.status(503).json({
      error: "WhatsApp client is not ready",
      status: connectionStatus,
    });
  }

  const { chatId, phone, message, pdfUrl, pdfPath } = req.body;
  const rawTarget = chatId || phone;

  if (!rawTarget || !message) {
    return res.status(400).json({ error: "phone/chatId and message are required" });
  }

  let targetChatId = String(rawTarget).trim();
  if (targetChatId.includes("@")) {
    // Strip multi-device sub-id like 918780042609:0@c.us -> 918780042609@c.us
    targetChatId = targetChatId.replace(/:\d+@/, "@").replace(/@s\.whatsapp\.net$/, "@c.us");
  } else {
    targetChatId = `${targetChatId.replace(/[^0-9]/g, "")}@c.us`;
  }

  // Pre-register outgoing message text in anti-loop cache
  recentBotReplies.set(message.trim(), Date.now());

  try {
    let sentMsg = null;
    let sentAsMedia = false;

    // Check if a PDF file attachment was requested
    const targetPdf = pdfPath || pdfUrl;
    if (targetPdf) {
      let resolvedPdfPath = targetPdf;
      const isActualFilePath = /^[a-zA-Z]:[\\/]/.test(resolvedPdfPath);
      if (!isActualFilePath) {
        const cleanUrl = resolvedPdfPath.replace(/^https?:\/\/[^\/]+\//, "").replace(/^\/+/, "");
        const pubPath = path.resolve(__dirname, "..", "frontend", "public", cleanUrl);
        const backPath = path.resolve(__dirname, "..", "backend", "static", cleanUrl);
        if (fs.existsSync(pubPath)) {
          resolvedPdfPath = pubPath;
        } else if (fs.existsSync(backPath)) {
          resolvedPdfPath = backPath;
        }
      }

      if (fs.existsSync(resolvedPdfPath)) {
        try {
          const media = MessageMedia.fromFilePath(resolvedPdfPath);
          media.filename = path.basename(resolvedPdfPath);
          sentMsg = await client.sendMessage(targetChatId, media, {
            caption: message,
            sendMediaAsDocument: true
          });
          sentAsMedia = true;
          console.log(`[WhatsApp] Native PDF document sent to ${targetChatId}: ${path.basename(resolvedPdfPath)}`);
        } catch (mediaErr) {
          console.warn("[WhatsApp] Failed to attach media, falling back to text:", mediaErr.message);
        }
      }
    }

    // Fallback or standard text send
    if (!sentMsg) {
      sentMsg = await client.sendMessage(targetChatId, message);
      console.log(`[WhatsApp] Text message sent to ${targetChatId}: ${message.substring(0, 80)}`);
    }

    if (sentMsg?.id?._serialized) {
      botSentMessageIds.add(sentMsg.id._serialized);
      if (botSentMessageIds.size > 2000) {
        const first = botSentMessageIds.values().next().value;
        botSentMessageIds.delete(first);
      }
    }

    res.json({
      success: true,
      sentAsMedia,
      messageId: sentMsg?.id?._serialized,
      timestamp: sentMsg?.timestamp || Date.now(),
    });
  } catch (err) {
    console.error("[REST] Error sending message:", err.message);
    res.status(500).json({ error: "Failed to send message: " + err.message });
  }
};

app.post("/send", handleSendMessage);
app.post("/api/send", handleSendMessage);

// ── Socket.io Connection ────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send current status immediately on connect
  socket.emit("wa_status", { status: connectionStatus });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[WhatsApp Service] HTTP + WebSocket server listening on port ${PORT}`);
  console.log(`[WhatsApp Service] Initializing WhatsApp client...`);
  client.initialize().catch((err) => {
    console.error("[WhatsApp] Failed to initialize client:", err.message);
    connectionStatus = "disconnected";
  });
});

// ── Graceful Shutdown ───────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n[WhatsApp Service] ${signal} received. Shutting down gracefully...`);
  try {
    await client.destroy();
    console.log("[WhatsApp] Client destroyed.");
  } catch (err) {
    console.warn("[WhatsApp] Error destroying client:", err.message);
  }
  server.close(() => {
    console.log("[WhatsApp Service] HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
