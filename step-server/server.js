// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
console.log(">>> LOADED:", __filename);

app.use(cors());
app.use(express.json());

// simple request logger
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

/* =========================
   (A) STEPS ENDPOINTS
   ========================= */
let latestSteps = 0;
let lastUpdated = null;

// Receive steps from the phone
app.post("/steps", (req, res) => {
  const { steps } = req.body || {};
  if (typeof steps === "number") {
    latestSteps = steps;
    lastUpdated = new Date().toISOString();
    console.log(`[${lastUpdated}] Steps = ${latestSteps}`);
    return res.json({ ok: true });
  }
  return res.status(400).json({ ok: false, error: "Missing 'steps' number" });
});

// Simple API to read steps (for the web page below or debugging)
app.get("/steps", (_req, res) => {
  res.json({ steps: latestSteps, lastUpdated });
});

// Minimal web page that shows the steps and auto-refreshes
app.get("/", (_req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Today’s Steps</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          :root { --fg:#0f172a; --sub:#64748b; --card:#f8fafc; }
          *{ box-sizing:border-box }
          body{
            margin:0; background:#eef2f7; color:var(--fg);
            font: 16px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            display:grid; place-items:center; min-height:100vh;
          }
          .wrap{
            width:min(720px, 92vw);
            background:var(--card); border-radius:20px; padding:28px 24px;
            box-shadow:0 12px 30px rgba(2,6,23,.1);
          }
          h1{ margin:0 0 6px 0; font-weight:700; letter-spacing:.2px }
          .sub{ color:var(--sub); margin-bottom:18px }
          .big{ font-size:80px; font-weight:800; margin:8px 0 12px 0 }
          .row{ display:flex; gap:12px; align-items:center; flex-wrap:wrap }
          .pill{ padding:8px 12px; border-radius:999px; background:#e2e8f0; color:#0f172a }
          .progress{
            height:14px; background:#e5e7eb; border-radius:999px; overflow:hidden; margin-top:8px
          }
          .bar{ height:100%; width:0% }
          footer{ margin-top:16px; color:var(--sub); font-size:14px }
          button{
            border:0; padding:10px 14px; border-radius:10px; cursor:pointer;
            background:#111827; color:white; font-weight:600
          }
        </style>
      </head>
      <body>
        <main class="wrap">
          <h1>Today’s Steps</h1>
          <div class="sub">Live from your iPhone over your local network</div>

          <div class="big" id="steps">--</div>

          <div class="row">
            <div class="pill">Goal: <span id="goal">10000</span></div>
            <div class="pill">Progress: <span id="pct">0%</span></div>
            <button id="refreshBtn" title="Refresh now">Refresh</button>
          </div>

          <div class="progress"><div class="bar" id="bar"></div></div>

          <footer id="time">Waiting for data…</footer>
        </main>

        <script>
          const GOAL = 10000;
          const stepsEl = document.getElementById('steps');
          const timeEl = document.getElementById('time');
          const pctEl = document.getElementById('pct');
          const goalEl = document.getElementById('goal');
          const barEl = document.getElementById('bar');
          const btn = document.getElementById('refreshBtn');

          goalEl.textContent = GOAL.toLocaleString();

          async function pull() {
            try {
              const r = await fetch('/steps', { cache: 'no-store' });
              const j = await r.json();
              const steps = j.steps ?? 0;
              stepsEl.textContent = steps.toLocaleString();
              const pct = Math.min(100, Math.round((steps / GOAL) * 100));
              pctEl.textContent = pct + '%';
              barEl.style.width = pct + '%';
              timeEl.textContent = j.lastUpdated
                ? 'Last updated: ' + new Date(j.lastUpdated).toLocaleString()
                : 'Waiting for data…';
            } catch {
              timeEl.textContent = 'Cannot reach server';
            }
          }
          setInterval(pull, 1000);
          btn.addEventListener('click', pull);
          pull();
        </script>
      </body>
    </html>
  `);
});

/* =========================
   (B) CLAUDE CHAT PROXY
   ========================= */

// Node 18+ has global fetch; for Node <18, install node-fetch and polyfill.
// const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307";

app.get("/chat-test", (_req, res) => res.send("chat route is registered ✅"));

app.post("/chat", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });
    }

    const clientMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = clientMessages.map((m) => ({
      role: m.role,
      content: [{ type: "text", text: String(m.content ?? "") }],
    }));

    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Anthropic HTTP", r.status, r.statusText);
      console.error("Anthropic error body:", errText);
      return res.status(500).json({ error: "Claude request failed", status: r.status, details: errText });
    }

    const data = await r.json();
    const reply = data?.content?.[0]?.text ?? "";
    res.json({ reply });
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "Server error", details: String(e) });
  }
});

// Mobile app endpoint: receives { petName, hungerLevel, steps, history }
// where `history` is an array of { role: 'user'|'assistant', content: string }
// Responds with { ok: true, reply: string }
app.post("/pet-chat", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ ok: false, error: "Server missing ANTHROPIC_API_KEY" });
    }

    const { petName, hungerLevel, steps, history } = req.body || {};
    const clientHistory = Array.isArray(history) ? history : [];

    // Convert to the same Anthropic message shape used by /chat
    const messages = clientHistory.map((m) => ({
      role: m.role,
      content: [{ type: "text", text: String(m.content ?? "") }],
    }));

    // Optionally prepend a system message describing the pet persona
    if (typeof petName === "string" && petName.trim()) {
      messages.unshift({ role: "system", content: [{ type: "text", text: `You are ${petName}, a friendly virtual pet.` }] });
    }

    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1024, messages }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Anthropic HTTP", r.status, r.statusText);
      console.error("Anthropic error body:", errText);
      return res.status(500).json({ ok: false, error: "Claude request failed", status: r.status, details: errText });
    }

    const data = await r.json();
    const reply = data?.content?.[0]?.text ?? "";
    return res.json({ ok: true, reply });
  } catch (e) {
    console.error("/pet-chat error:", e);
    return res.status(500).json({ ok: false, error: "Server error", details: String(e) });
  }
});

// Quick in-browser chat UI
app.get("/chat-ui", (_req, res) => {
  res.send(`<!doctype html><html><head><meta charset="utf-8"/><title>Chat UI</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font:16px system-ui;margin:0;padding:24px;background:#f6f7fb;color:#111}
    .wrap{max-width:720px;margin:0 auto}
    h1{margin:0 0 12px}
    #log{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;height:50vh;overflow:auto}
    .msg{padding:8px 10px;border-radius:10px;margin:6px 0;max-width:85%}
    .me{background:#2563eb;color:#fff;margin-left:auto}
    .bot{background:#fff;border:1px solid #e5e7eb}
    .row{display:flex;gap:8px;margin-top:12px}
    input,button{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb}
    input{flex:1;background:#fff}
    button{background:#111827;color:#fff;border:0}
  </style>
  </head><body><div class="wrap">
  <h1>💬 Chat (browser)</h1>
  <div id="log"></div>
  <div class="row">
    <input id="inp" placeholder="Type a message..."/>
    <button id="send">Send</button>
  </div>
  <script>
    const log = document.getElementById('log');
    const inp = document.getElementById('inp');
    const sendBtn = document.getElementById('send');
    const messages = [{ role:'assistant', content:'Hi! I\\'m Claude. Ask me anything.' }];

    function add(role, text){
      const div=document.createElement('div');
      div.className='msg '+(role==='user'?'me':'bot');
      div.textContent=text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }
    add('assistant', messages[0].content);

    async function send(){
      const text = inp.value.trim();
      if(!text) return;
      inp.value = '';
      messages.push({ role:'user', content:text });
      add('user', text);
      sendBtn.disabled = true; sendBtn.textContent='Sending...';
      try{
        const r = await fetch('/chat', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ messages })
        });
        const j = await r.json();
        const reply = j.reply || '(no reply)';
        messages.push({ role:'assistant', content: reply });
        add('assistant', reply);
      }catch(e){
        add('assistant', 'Error reaching /chat');
      }finally{
        sendBtn.disabled = false; sendBtn.textContent='Send';
      }
    }
    sendBtn.onclick = send;
    inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter') send(); });
  </script>
  </div></body></html>`);
});

/* =========================
   (C) ROUTE LIST & START
   ========================= */
function listRoutes(app) {
  const out = [];
  function walk(stack, prefix = "") {
    if (!Array.isArray(stack)) return;
    for (const layer of stack) {
      // If this layer is a route, collect its methods + path
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).join(",").toUpperCase() || "GET";
        out.push(`${methods} ${prefix}${layer.route.path}`);
      }
      // If this layer has a nested router, recurse
      if (layer.name === "router" && layer.handle && layer.handle.stack) {
        // If the layer has a path regex, try to read its path (best-effort)
        const path = layer.regexp && layer.regexp.fast_star ? "/*" : "";
        walk(layer.handle.stack, `${prefix}${path}`);
      }
    }
  }
  if (app && app._router && app._router.stack) walk(app._router.stack);
  return out;
}

const routes = listRoutes(app);
console.log("Registered routes:", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Step server running on http://localhost:${PORT}`);
  console.log(`LAN access: http://<your_LAN_IP>:${PORT}`);
});
