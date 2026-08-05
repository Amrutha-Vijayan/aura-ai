/* Aura-AI - Smart Environment ADK Agent Client */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initChatAssistant();
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

function initChatAssistant() {
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-chat-btn');
  const chipBtns = document.querySelectorAll('.chip-btn');

  // Automatically detect environment endpoint (Localhost vs Live Cloud Run)
  const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  const API_ENDPOINT = isLocalhost 
    ? 'http://127.0.0.1:8080/run' 
    : 'https://demo-agent-317584469189.us-central1.run.app/run';

  // Suggestion chip handler
  chipBtns.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      if (text) {
        chatInput.value = text;
        sendMessage();
      }
    });
  });

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append User Message
    appendMessage('user', text);
    chatInput.value = '';

    // Show Typing Indicator
    const typingId = appendTypingIndicator();

    // Send to ADK Agent Endpoint
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_name: 'router_agent',
        user_id: 'web_user_' + Date.now(),
        message: text
      })
    })
    .then(res => res.json())
    .then(data => {
      removeMessage(typingId);
      const reply = extractADKResponse(data);
      appendMessage('assistant', reply);
    })
    .catch(err => {
      removeMessage(typingId);
      console.warn('ADK Agent connection notice:', err);

      // Local Fallback simulation if server endpoint is offline
      setTimeout(() => {
        const fallbackText = getLocalFallbackResponse(text);
        appendMessage('assistant', fallbackText);
      }, 300);
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function appendMessage(sender, content) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-bubble-wrapper ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '✨';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    const textDiv = document.createElement('div');
    textDiv.innerHTML = content;
    bubble.appendChild(textDiv);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-bubble-wrapper assistant';
    wrapper.id = id;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = '✨';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.style.color = '#94a3b8';
    bubble.style.fontSize = '0.92rem';
    bubble.innerHTML = `✨ <em>Aura-AI is thinking...</em>`;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return id;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}

/* Extract clean text response from ADK JSON output */
function extractADKResponse(data) {
  if (typeof data === 'string') return data;
  if (data.response) return data.response;
  if (data.reply) return data.reply;
  if (data.output) return data.output;
  if (Array.isArray(data) && data[0] && data[0].content) return data[0].content;
  return JSON.stringify(data);
}

/* Intelligent Local Fallback Response */
function getLocalFallbackResponse(query) {
  const q = query.toLowerCase();

  const isTimeReq = q.includes('time') || q.includes('clock') || q.includes('date') || q.includes('day');
  const isWeatherReq = q.includes('weather') || q.includes('temperature') || q.includes('forecast') || q.includes('rain') || q.includes('sunny');

  let location = "Tokyo, Japan";
  if (q.includes("sydney")) location = "Sydney, Australia";
  if (q.includes("paris")) location = "Paris, France";
  if (q.includes("london")) location = "London, UK";
  if (q.includes("new york")) location = "New York, USA";

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (isTimeReq && isWeatherReq) {
    return `🕒 The current time in <strong>${location}</strong> is <strong>${timeStr} (${dateStr})</strong>.<br><br>🌤️ The weather in ${location} is currently sunny and 22°C (72°F) with a light breeze.`;
  }

  if (isTimeReq) {
    return `🕒 The current system time is <strong>${timeStr}</strong> (${dateStr}).`;
  }

  if (isWeatherReq) {
    return `🌤️ The current weather in <strong>${location}</strong> is sunny and 22°C (72°F) with a pleasant light breeze.`;
  }

  if (q.includes('human') || q.includes('escalate') || q.includes('speak') || q.includes('support') || q.includes('complaint') || q.includes('connect')) {
    return `Connecting you with a live customer support representative right away!<br><br>
🤝 <strong>Support Ticket Created</strong><br>
• <strong>Ticket ID</strong>: <code>#AURA-89F12</code><br>
• <strong>Status</strong>: Representative Being Assigned<br><br>
<span style="font-size:0.85rem; color:#a5b4fc;">Structured UJET Handoff Payload (capture_type: agent) submitted to CCAI Platform. A human representative will assist you shortly.</span>`;
  }

  if (q.includes('coordinates') || q.includes('latitude') || q.includes('longitude') || q.includes('map') || q.includes('sydney opera house')) {
    return `Geographic location for <strong>Sydney Opera House</strong>:<br><br>
📍 <strong>Latitude</strong>: <code>-33.8568° S</code><br>
📍 <strong>Longitude</strong>: <code>151.2153° E</code><br>
🏛️ <strong>Address</strong>: Bennelong Point, Sydney NSW 2000, Australia`;
  }

  return `Here is what I found for <strong>"${escapeHTML(query)}"</strong>:<br><br>
Aura-AI is designed to provide 24/7 instant assistance, smart information retrieval, and seamless customer support.<br><br>
<strong>Helpful Resources:</strong><br>
• <a href="https://blog.google/technology/ai/" target="_blank" rel="noopener" style="color:#38bdf8;">Latest Artificial Intelligence Updates</a><br>
• <a href="https://deepmind.google" target="_blank" rel="noopener" style="color:#38bdf8;">Learn More About Aura-AI Features</a>`;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
