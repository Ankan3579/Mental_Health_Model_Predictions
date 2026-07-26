// ============================================================
// CONFIG — set this to your deployed FastAPI backend before shipping
// ============================================================
const API_URL = "http://127.0.0.1:8000/predict";
// ============================================================

const clockEl = document.getElementById('clock');
const linkDot = document.getElementById('link-dot');
const linkText = document.getElementById('link-text');
const form = document.getElementById('intake-form');
const statusMsg = document.getElementById('status-msg');
const runBtn = document.getElementById('run-btn');
const batteryFill = document.getElementById('battery-fill');
const emptyState = document.getElementById('empty-state');
const resultBlock = document.getElementById('result-block');
const pctNum = document.getElementById('pct-num');
const tierMsg = document.getElementById('tier-msg');
const chips = document.getElementById('chips');
const chipScreen = document.getElementById('chip-screen');
const chipSleep = document.getElementById('chip-sleep');
const chipStress = document.getElementById('chip-stress');

function tickClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}`;
}
tickClock();
setInterval(tickClock, 15000);

async function checkLink() {
  try {
    const base = new URL(API_URL);
    const rootUrl = `${base.protocol}//${base.host}/`;
    const res = await fetch(rootUrl, { method: 'GET' });
    if (res.ok) {
      linkDot.classList.add('linked');
      linkText.textContent = 'model · linked';
    } else {
      throw new Error('bad status');
    }
  } catch (_) {
    linkDot.classList.add('error');
    linkText.textContent = 'model · unreachable';
  }
}
checkLink();

function tierFor(pct) {
  if (pct <= 35) {
    return {
      msg: "Charge is low. Your habits point toward strain — worth talking to someone you trust.",
      color: "linear-gradient(90deg, #FF6B6B, #FF9B4A)"
    };
  }
  if (pct <= 65) {
    return {
      msg: "Charge is middling. A few habits — sleep, screen time, stress — could use attention.",
      color: "linear-gradient(90deg, #FFC24B, #FFE29A)"
    };
  }
  return {
    msg: "Charge is holding steady. Your habits look well balanced right now.",
    color: "linear-gradient(90deg, #16C8B4, #7CFFC4)"
  };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusMsg.textContent = "Reading your signal…";
  statusMsg.classList.remove('err');
  runBtn.disabled = true;

  const usage = Number(document.getElementById('usage').value);
  const sleep = Number(document.getElementById('sleep').value);
  const stress = document.getElementById('stress').value;

  const payload = {
    Age: Number(document.getElementById('age').value),
    Gender: document.getElementById('gender').value,
    Country: document.getElementById('country').value.trim(),
    Academic_Level: document.getElementById('academic').value,
    most_Used_Platform: document.getElementById('platform').value,
    Purpose_Of_Use: document.getElementById('purpose').value,
    Avg_Daily_Usage_Hours: usage,
    Daily_Unlocks: Number(document.getElementById('unlocks').value),
    Study_Hours: Number(document.getElementById('study').value),
    Physical_Activity_Hours: Number(document.getElementById('activity').value),
    Sleep_Hours_Per_Night: sleep,
    Stress_Level: stress
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let detail = "";
      try {
        const errJson = await res.json();
        detail = errJson.detail ? JSON.stringify(errJson.detail) : "";
      } catch (_) {
        detail = await res.text();
      }
      throw new Error(`Server responded ${res.status}${detail ? " — " + detail : ""}`);
    }

    const data = await res.json();
    const score = data.predicted_mental_health_score;
    const pct = Math.max(0, Math.min(100, Math.round((score / 10) * 100)));

    emptyState.style.display = "none";
    resultBlock.style.display = "block";
    chips.style.display = "flex";

    pctNum.textContent = pct;
    const t = tierFor(pct);
    tierMsg.textContent = t.msg;
    batteryFill.style.width = pct + "%";
    batteryFill.style.background = t.color;

    chipScreen.textContent = usage + "h";
    chipSleep.textContent = sleep + "h";
    chipStress.textContent = stress;

    statusMsg.textContent = "Signal received.";
  } catch (err) {
    let hint = "check the backend is deployed and reachable.";
    if (API_URL.includes("127.0.0.1")) {
      hint = "you're still pointing at 127.0.0.1 — update API_URL in this file to your deployed backend URL.";
    }
    statusMsg.textContent = "Couldn't reach the model — " + hint;
    statusMsg.classList.add('err');
  } finally {
    runBtn.disabled = false;
  }
});
