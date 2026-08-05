/* Aura AI - Interactive Application Script */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initAgentStudio();
  initMetricsChart();
});

/* Navbar scroll blur handler */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* Agent Studio Terminal & Sandbox logic */
function initAgentStudio() {
  const agentTabs = document.querySelectorAll('.agent-tab');
  const terminalOutput = document.getElementById('terminal-output');
  const promptInput = document.getElementById('prompt-input');
  const runBtn = document.getElementById('run-prompt-btn');
  
  const metricLatency = document.getElementById('metric-latency');
  const metricSubagents = document.getElementById('metric-subagents');
  const metricTokens = document.getElementById('metric-tokens');

  const agentData = {
    code: {
      name: 'Code Architect',
      latency: '14 ms',
      subagents: '16 Active',
      tokens: '3,120 t/s',
      presetPrompt: 'Refactor REST controller to async pipeline with error boundary',
      initialOutput: `// Agent: Code Architect (Aura v3)
[Info] Parsing repository tree...
[Info] Found 14 React components and 6 API handlers.
[Success] Generated optimized asynchronous execution pipeline.
[Output] Exporting <DashboardView /> with zero-layout-shift glassmorphism design.`
    },
    data: {
      name: 'Data Analyst',
      latency: '22 ms',
      subagents: '8 Active',
      tokens: '1,890 t/s',
      presetPrompt: 'Analyze hourly user retention and stream live SQL anomaly flags',
      initialOutput: `// Agent: Data Analyst
[Query] SELECT hourly_active_users, churn_risk FROM user_telemetry;
[Analysis] 99.4% retention rate sustained over 30 days.
[Alert] Zero data anomalies detected across current region.`
    },
    creative: {
      name: 'Design System',
      latency: '11 ms',
      subagents: '24 Active',
      tokens: '4,250 t/s',
      presetPrompt: 'Generate HSL design system tokens for dark mode theme switch',
      initialOutput: `// Agent: Design System
[Palette] Generated 8 HSL gradient tokens.
[CSS] Applying --gradient-primary: linear-gradient(135deg, #06b6d4, #6366f1, #8b5cf6).
[Status] Rendered responsive viewport layout cleanly.`
    },
    security: {
      name: 'SecOps Bot',
      latency: '9 ms',
      subagents: '32 Active',
      tokens: '5,100 t/s',
      presetPrompt: 'Audit zero-trust sandbox rules and API key permission scopes',
      initialOutput: `// Agent: SecOps Bot
[Scan] Auditing local sandbox permissions...
[Verified] All filesystem calls scoped to isolated sandbox directory.
[Shield] 0 vulnerabilities found. Security posture: Enterprise Optimal.`
    }
  };

  // Switch tabs
  agentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      agentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const key = tab.getAttribute('data-agent');
      const data = agentData[key];
      
      if (data) {
        promptInput.value = data.presetPrompt;
        metricLatency.textContent = data.latency;
        metricSubagents.textContent = data.subagents;
        metricTokens.textContent = data.tokens;
        
        terminalOutput.innerHTML = `<span style="color: #64748b;">// Switched agent to ${data.name}...</span>\n${data.initialOutput}`;
        showToast(`Switched active agent to ${data.name}`);
      }
    });
  });

  // Run prompt
  function executePrompt() {
    const userText = promptInput.value.trim();
    if (!userText) return;

    terminalOutput.innerHTML += `\n\n<span style="color: #a855f7;">❯ ${escapeHTML(userText)}</span>\n<span style="color: #38bdf8;">[Aura-Core]</span> Processing instruction...`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    runBtn.disabled = true;
    runBtn.textContent = 'Thinking...';

    setTimeout(() => {
      const simulatedResponse = `\n[Success] Task executed successfully in ${Math.floor(Math.random() * 15 + 8)}ms.\n[Result] Created component module with full responsive layout and interactive hooks.`;
      terminalOutput.innerHTML += `<span style="color: #10b981;">${simulatedResponse}</span>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      
      runBtn.disabled = false;
      runBtn.textContent = 'Execute';
      showToast('Task executed by Aura AI');
    }, 800);
  }

  runBtn.addEventListener('click', executePrompt);
  promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executePrompt();
  });
}

/* HTML Escaper */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* Toast Notifications */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* Canvas Performance Chart */
function initMetricsChart() {
  const canvas = document.getElementById('metricsChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrame;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const pointsCount = 40;
  let dataPoints = Array.from({ length: pointsCount }, () => Math.random() * 40 + 30);

  function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const step = w / (pointsCount - 1);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Smooth Line
    ctx.beginPath();
    ctx.moveTo(0, h - (dataPoints[0] / 100) * h);

    for (let i = 1; i < pointsCount; i++) {
      const x = i * step;
      const y = h - (dataPoints[i] / 100) * h;
      const prevX = (i - 1) * step;
      const prevY = h - (dataPoints[i - 1] / 100) * h;

      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
    }

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Fill Gradient Area
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Shift data
    dataPoints.shift();
    dataPoints.push(Math.min(95, Math.max(15, dataPoints[dataPoints.length - 1] + (Math.random() - 0.48) * 12)));

    setTimeout(() => {
      animationFrame = requestAnimationFrame(drawChart);
    }, 100);
  }

  drawChart();
}
