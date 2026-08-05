/* Aura AI - Simple Conversational Virtual Assistant Logic */

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

  // Suggestion chip click handler
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

    // Append User Message Bubble
    appendMessage('user', text);
    chatInput.value = '';

    // Show Typing Indicator from Assistant
    const typingId = appendTypingIndicator();

    // Process query via Google ADK Root Agent logic
    setTimeout(() => {
      removeMessage(typingId);
      const adkResult = processRootAgentQuery(text);
      appendMessage('assistant', adkResult.text, adkResult.routedAgent);
    }, 850);
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function appendMessage(sender, content, routedAgent = null) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-bubble-wrapper ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '✨';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    if (sender === 'assistant' && routedAgent) {
      const tag = document.createElement('div');
      tag.className = 'routing-tag';
      tag.innerHTML = `🧠 Root Agent (router_agent) ➔ <strong>${routedAgent}</strong>`;
      bubble.appendChild(tag);
    }

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
    bubble.style.fontSize = '0.9rem';
    bubble.innerHTML = `🧠 <em>Root Agent (router_agent) analyzing query...</em>`;

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

/* Google ADK Root Agent Intent Router */
function processRootAgentQuery(query) {
  const q = query.toLowerCase();

  // 1. Weather / Time -> time_weather_agent
  if (q.includes('weather') || q.includes('time') || q.includes('clock') || q.includes('temperature') || q.includes('forecast')) {
    let location = "Tokyo, Japan";
    if (q.includes("sydney")) location = "Sydney, Australia";
    if (q.includes("paris")) location = "Paris, France";
    if (q.includes("london")) location = "London, UK";
    if (q.includes("new york")) location = "New York, USA";

    return {
      routedAgent: 'time_weather_agent',
      text: `The current system time in <strong>${location}</strong> is <strong>2026-08-06 02:44 JST</strong>.<br><br>🌤️ Weather in ${location}: Sunny and 22°C (72°F) with light breeze.`
    };
  }

  // 2. Human Escalation -> escalation_agent
  if (q.includes('human') || q.includes('escalate') || q.includes('speak') || q.includes('support') || q.includes('complaint') || q.includes('supervisor')) {
    return {
      routedAgent: 'escalation_agent',
      text: `Connecting you to a live support agent right now...<br><br>
✅ <strong>Escalation Case Created</strong><br>
• <strong>Case ID</strong>: <code>ESC-89F12A1B</code><br>
• <strong>Urgency</strong>: HIGH<br>
• <strong>Status</strong>: Queued for Human Support Agent Assignment<br><br>
<span style="font-size:0.85rem; color:#a5b4fc;">Structured UJET Handoff Payload generated. A human representative will assist you shortly.</span>`
    };
  }

  // 3. Location / Coordinates -> location_agent
  if (q.includes('coordinates') || q.includes('latitude') || q.includes('longitude') || q.includes('map') || q.includes('sydney opera house')) {
    return {
      routedAgent: 'location_agent',
      text: `Geographic coordinates for <strong>Sydney Opera House</strong>:<br><br>
📍 <strong>Latitude</strong>: <code>-33.8568° S</code><br>
📍 <strong>Longitude</strong>: <code>151.2153° E</code><br>
🏛️ <strong>Address</strong>: Bennelong Point, Sydney NSW 2000, Australia`
    };
  }

  // 4. Search / Research -> search_agent
  return {
    routedAgent: 'search_agent',
    text: `Here is what I found for <strong>"${escapeHTML(query)}"</strong>:<br><br>
Google DeepMind's Gemini 3.5 Flash provides state-of-the-art multi-agent routing with high-speed reasoning.<br><br>
<strong>Verified Sources:</strong><br>
• <a href="https://blog.google/technology/ai/" target="_blank" rel="noopener" style="color:#38bdf8;">Google AI Official Announcement</a><br>
• <a href="https://deepmind.google" target="_blank" rel="noopener" style="color:#38bdf8;">Google DeepMind Gemini Documentation</a>`
  };
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
