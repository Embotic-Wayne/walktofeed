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
        <title>Steps</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; }
          .num { font-size: 4rem; margin: 0.5rem 0; }
          .sub { color: #555; }
        </style>
      </head>
      <body>
        <h1>Today’s Steps</h1>
        <div class="num" id="steps">--</div>
        <div class="sub" id="time">Waiting for data…</div>
        <script>
          async function pull() {
            try {
              const r = await fetch('/steps');
              const j = await r.json();
              document.getElementById('steps').textContent = j.steps ?? '--';
              document.getElementById('time').textContent =
                j.lastUpdated ? ('Last updated: ' + new Date(j.lastUpdated).toLocaleString()) : 'Waiting for data…';
            } catch (e) {
              document.getElementById('time').textContent = 'Cannot reach server';
            }
          }
          pull();
          setInterval(pull, 2000);
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
