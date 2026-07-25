const API_URL = "http://127.0.0.1:8000/predict";
const form = document.getElementById('intake-form');
const statusMsg = document.getElementById('status-msg');
const runBtn = document.getElementById('run-btn');
const needle = document.getElementById('needle');
const scoreNum = document.getElementById('score-num');
const tierLabel = document.getElementById('tier-label');
const emptyState = document.getElementById('empty-state');
const resultBlock = document.getElementById('result-block');

function tierFor(score){
  if (score <= 3.5) return { text: "Signs of strain — consider talking to someone you trust.", color: "#E8836B" };
  if (score <= 6.5) return { text: "Middling balance — some habits could use attention.", color: "#C9A227" };
  return { text: "Looking steady — habits appear well balanced.", color: "#3E6E68" };
}

// needle sweeps from -90deg (score 0) to +90deg (score 10)
function setNeedle(score){
  const clamped = Math.max(0, Math.min(10, score));
  const angle = -90 + (clamped / 10) * 180;
  needle.style.transform = `rotate(${angle}deg)`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusMsg.textContent = "Sending to model…";
  statusMsg.classList.remove('err');
  runBtn.disabled = true;

  const payload = {
    Age: Number(document.getElementById('age').value),
    Gender: document.getElementById('gender').value,
    Country: document.getElementById('country').value,
    Academic_Level: document.getElementById('academic').value,
    most_Used_Platform: document.getElementById('platform').value,
    Purpose_Of_Use: document.getElementById('purpose').value,
    Avg_Daily_Usage_Hours: Number(document.getElementById('usage').value),
    Daily_Unlocks: Number(document.getElementById('unlocks').value),
    Study_Hours: Number(document.getElementById('study').value),
    Physical_Activity_Hours: Number(document.getElementById('activity').value),
    Sleep_Hours_Per_Night: Number(document.getElementById('sleep').value),
    Stress_Level: document.getElementById('stress').value
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Server responded ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const score = data.predicted_mental_health_score;

    emptyState.style.display = "none";
    resultBlock.style.display = "block";
    scoreNum.textContent = score.toFixed(2);
    const t = tierFor(score);
    tierLabel.textContent = t.text;
    tierLabel.style.color = t.color;
    setNeedle(score);

    statusMsg.textContent = "Prediction received.";
  } catch (err) {
    statusMsg.textContent = "Error: " + err.message + " — is the FastAPI server running at 127.0.0.1:8000 with CORS enabled?";
    statusMsg.classList.add('err');
  } finally {
    runBtn.disabled = false;
  }
});
