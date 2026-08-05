/* Aura AI - Google ADK Agents Interactive Logic */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initADKStudio();
  initMetricsChart();
});

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

function initADKStudio() {
  const agentTabs = document.querySelectorAll('.agent-tab');
  const terminalOutput = document.getElementById('terminal-output');
  const promptInput = document.getElementById('prompt-input');
  const runBtn = document.getElementById('run-prompt-btn');
  const metricTools = document.getElementById('metric-tools');

  const adkAgents = {
    router: {
      name: 'router_agent',
      toolsCount: '3 Attached Sub-Agents',
      presetPrompt: 'I need current weather in Tokyo and I also want to lodge a complaint for supervisor support',
      initialOutput: `// Agent: google.adk.Agent("router_agent")
[Model] gemini-3.5-flash
[Instruction] Analyze intent and route immediately to specialist subagent.
[Subagents] time_weather_agent | search_agent | escalation_agent`
    },
    search: {
      name: 'search_agent',
      toolsCount: '1 Grounded Search Tool',
      presetPrompt: 'Search for official Gemini 3.5 AI model release notes and benchmarks',
      initialOutput: `// Agent: google.adk.Agent("search_agent")
[Model] gemini-3.5-flash
[Tools] google_search
[Requirement] Format references with target="_blank" HTML anchor tags.`
    },
    timeweather: {
      name: 'time_weather_agent',
      toolsCount: '2 FunctionTools + 1 Subagent',
      presetPrompt: 'What time is it in Tokyo right now and what is the current weather there?',
      initialOutput: `// Agent: google.adk.Agent("time_weather_agent")
[Tools] FunctionTool(get_current_time), FunctionTool(get_weather)
[Subagent] location_agent`
    },
    escalation: {
      name: 'escalation_agent',
      toolsCount: '2 FunctionTools',
      presetPrompt: 'Escalate my issue to a live agent. Name: Alex Dev, Email: alex@example.com, Phone: +15550192, Urgency: Critical, Reason: Billing query',
      initialOutput: `// Agent: google.adk.Agent("escalation_agent")
[Tools] FunctionTool(escalate_to_human), FunctionTool(check_escalation_status)
[Schema] Constructs UJET liveAgentHandoff structured JSON payload.`
    },
    location: {
      name: 'location_agent',
      toolsCount: '1 Coordinates Tool',
      presetPrompt: 'Get exact latitude and longitude coordinates for Sydney Opera House',
      initialOutput: `// Agent: google.adk.Agent("location_agent")
[Tools] FunctionTool(get_coordinates)
[Purpose] Resolves geographic coordinate bounds.`
    }
  };

  // Switch agent tab
  agentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      agentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const key = tab.getAttribute('data-agent');
      const data = adkAgents[key];

      if (data) {
        promptInput.value = data.presetPrompt;
        metricTools.textContent = data.toolsCount;

        terminalOutput.innerHTML = `<span style="color: #64748b;">// Active ADK Agent: ${data.name}</span>\n${data.initialOutput}`;
        showToast(`Loaded ADK Agent: ${data.name}`);
      }
    });
  });

  // Execute ADK Query
  function executeADKQuery() {
    const userText = promptInput.value.trim();
    if (!userText) return;

    const activeTab = document.querySelector('.agent-tab.active');
    const agentKey = activeTab ? activeTab.getAttribute('data-agent') : 'router';

    terminalOutput.innerHTML += `\n\n<span style="color: #a855f7;">❯ ${escapeHTML(userText)}</span>\n<span style="color: #38bdf8;">[ADK Engine]</span> Executing tool calls on gemini-3.5-flash...`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    runBtn.disabled = true;
    runBtn.textContent = 'Running ADK Tool...';

    setTimeout(() => {
      let response = '';

      if (agentKey === 'router') {
        response = `\n<span style="color: #38bdf8;">[router_agent]</span> Analyzing intent...
<span style="color: #f59e0b;">[Transfer]</span> Delegating weather query to <code>time_weather_agent</code>...
  ↳ <span style="color: #10b981;">get_weather("Tokyo, Japan")</span> ➔ "Sunny, 22°C (72°F)"
<span style="color: #ef4444;">[Transfer]</span> Delegating complaint to <code>escalation_agent</code>...
  ↳ <span style="color: #a855f7;">escalate_to_human()</span> ➔ ESC-89F12A1B payload generated.`;
      } else if (agentKey === 'search') {
        response = `\n<span style="color: #38bdf8;">[search_agent]</span> Executing <code>google_search</code>...
<span style="color: #10b981;">[Output]</span> Gemini 3.5 Flash offers 3x higher token throughput and zero-latency tool calling.
<br><strong>Sources:</strong>
• <a href="https://blog.google/technology/ai/" target="_blank" rel="noopener" style="color: #38bdf8;">Google AI Official Blog</a>
• <a href="https://deepmind.google" target="_blank" rel="noopener" style="color: #38bdf8;">Google DeepMind Gemini Documentation</a>`;
      } else if (agentKey === 'timeweather') {
        response = `\n<span style="color: #38bdf8;">[time_weather_agent]</span> Executing tools...
• <code>get_current_time(timezone="Asia/Tokyo")</code> ➔ 2026-08-06 02:34:12 (JST)
• <code>get_weather(location="Tokyo, Japan")</code> ➔ Sunny and 22°C (72°F) with light breeze.`;
      } else if (agentKey === 'escalation') {
        response = `\n<span style="color: #10b981;">✅ Escalation Case Created Successfully!</span>
• <strong>Case ID</strong>: <code>ESC-A1B2C3D4</code>
• <strong>User</strong>: Alex Dev (alex@example.com)
• <strong>Urgency</strong>: CRITICAL

<span style="color: #64748b;">// Structured UJET Payload:</span>
<pre style="background: #000; padding: 10px; border-radius: 6px; font-size: 0.8rem; color: #38bdf8;">{
  "ujet": {
    "type": "action",
    "action": "escalation",
    "escalation_reason": "by_virtual_agent",
    "liveAgentHandoff": "true",
    "session_variable": {
      "payload": {
        "username": "Alex Dev",
        "email_id": "alex@example.com",
        "urgency": "critical",
        "user_reason": "Billing query"
      }
    }
  }
}</pre>`;
      } else {
        response = `\n<span style="color: #38bdf8;">[location_agent]</span> Executing <code>get_coordinates("Sydney Opera House")</code>...
• <strong>Latitude</strong>: -33.8568° S
• <strong>Longitude</strong>: 151.2153° E
• <strong>Address</strong>: Bennelong Point, Sydney NSW 2000, Australia`;
      }

      terminalOutput.innerHTML += response;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;

      runBtn.disabled = false;
      runBtn.textContent = 'Run ADK Query';
      showToast('ADK Tool Execution Complete');
    }, 900);
  }

  runBtn.addEventListener('click', executeADKQuery);
  promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeADKQuery();
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

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

function initMetricsChart() {
  const canvas = document.getElementById('metricsChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

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

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

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

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    dataPoints.shift();
    dataPoints.push(Math.min(95, Math.max(15, dataPoints[dataPoints.length - 1] + (Math.random() - 0.48) * 12)));

    setTimeout(() => {
      requestAnimationFrame(drawChart);
    }, 100);
  }

  drawChart();
}
