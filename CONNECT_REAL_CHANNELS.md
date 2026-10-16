# 🌐 Connecting Synthopsis to Actual WhatsApp & Real Email

This guide explains how to connect **Synthopsis** to your actual, real communication channels: **Real Phone WhatsApp** and **Real Gmail / SMTP**.

---

## 📱 1. Connect Real Phone WhatsApp

Synthopsis includes a dedicated Node.js microservice (`whatsapp-service/`) powered by `whatsapp-web.js` that connects directly to your real WhatsApp account (personal or WhatsApp Business) via QR code pairing.

### How It Works:
1. When launched, `whatsapp-service` initializes a headless browser session and generates a real WhatsApp Web pairing QR code.
2. You scan the QR code using your smartphone (**WhatsApp > Linked Devices > Link a Device**).
3. Once linked, **any inbound message sent by a customer to your real phone** is immediately forwarded to `http://localhost:8000/whatsapp-incoming`.
4. Synthopsis runs Groq / Gemini inference with your grounded RAG catalog knowledge, stores the conversation in `synthopsis.db`, and dispatches the AI reply back through your phone to the customer!

### Step-by-Step Instructions:

#### Step 1: Start the WhatsApp Service
Open a new terminal and run:
```powershell
cd whatsapp-service
npm start
```

#### Step 2: Scan the QR Code
You have 3 easy ways to view and scan the QR code:
- **Direct in UI**: Go to the Omnichannel Inbox at [http://localhost:3000/dashboard/inbox](http://localhost:3000/dashboard/inbox), switch to the WhatsApp tab, and click **"LINK ACTUAL WHATSAPP"**. The QR code renders live in a popup modal!
- **Standalone Web Page**: Open [http://localhost:3006/qr](http://localhost:3006/qr) in any browser.
- **Terminal**: The QR code prints directly in your PowerShell terminal window.

#### Step 3: Test with a Real Phone!
Take another phone (or ask a colleague) to send a message to your WhatsApp number:
> *"Hello, what is the MOQ and rate for 10,000 HDPE drums?"*

Within 1.5 seconds, your phone will automatically type and send the AI response from Synthopsis!

---

## 📧 2. Connect Real Gmail & Email

Synthopsis supports both **Official Google Gmail API** and **Standard TLS SMTP** (Gmail, Outlook, Amazon SES, SendGrid).

### Method A: Google Gmail API (Recommended)
`backend/credentials.json` is already present in your project.

To authorize your Google Account with Gmail sending permissions:
1. Open a terminal in `backend/`:
   ```powershell
   cd backend
   python auth_google.py
   ```
2. Your browser will automatically open with the Google Sign-In prompt.
3. Sign in and click **"Allow"** to grant `gmail.send` permissions.
4. A fresh `token.json` is automatically generated and saved.
5. All outbound emails from the dashboard will now be sent directly from your authenticated Google Account!

---

### Method B: Gmail SMTP via 16-Character App Password
If you prefer not to use OAuth, you can use Gmail's standard SMTP protocol:

1. Go to your Google Account: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Create a new App Password named **"Synthopsis"**.
3. Copy the 16-character code (e.g., `abcd efgh ijkl mnop`).
4. Add these two lines to your `backend/.env` file:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_character_app_password
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   ```

---

### 🧪 Test Sending a Real Email

You can test real email dispatch in 2 ways:

#### Option 1: From the Dashboard UI
1. Open [http://localhost:3000/dashboard/inbox](http://localhost:3000/dashboard/inbox).
2. Switch to the **Email** tab.
3. Click the **"TEST REAL EMAIL"** button in the header.
4. Enter your email address and click **"SEND REAL EMAIL NOW"**.
5. Check your inbox!

#### Option 2: From the CLI Tool
Run the dedicated test tool:
```powershell
cd backend
python send_test_email.py --to your_email@gmail.com --subject "Live Synthopsis Test"
```

---

## 🌐 3. Connect Real Web Chat Widget

To embed Synthopsis on any external website, Shopify store, or HTML portal:

Add this single tag before the closing `</body>` tag on any webpage:
```html
<script src="http://localhost:8000/static/widget.js"></script>
```

You can test this live on our included client packaging factory website:
👉 **[http://localhost:8000/test-website](http://localhost:8000/test-website)**

---

## ⚡ Running All Services Together

```powershell
# Terminal 1: FastAPI Backend & RAG Database
cd backend
python main.py

# Terminal 2: WhatsApp Web Bridge (Real Phone Pairing)
cd whatsapp-service
npm start

# Terminal 3: Next.js Frontend Dashboard
cd frontend
npm run dev
```

Or run all three with Docker:
```bash
docker-compose up --build -d
```
