// server.js   
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
          const GOAL = 10000; // change your goal here
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

          // Auto refresh every 1s
          setInterval(pull, 1000);
          // Manual refresh button
          btn.addEventListener('click', pull);

          // First load
          pull();
        </script>
      </body>
    </html>
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Step server running on http://localhost:${PORT}`);
  console.log(`Open this in your browser after the phone sends data.`);
});
