/* Aura-AI - ADK Local & Tunnel Client */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initChatAssistant();
});

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
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
  const serverInput = document.getElementById('server-endpoint-input');
  const statusText = document.getElementById('agent-status-text');

  // Live Cloud Run / Serveo Backend URL Configuration
  const DEFAULT_SERVER_URL = "https://demo-agent-317584469189.us-central1.run.app";

  const urlParams = new URLSearchParams(window.location.search);
  const queryApi = urlParams.get('api');
  
  // Use query parameter if provided, otherwise default directly to the live tunnel URL
  let DEFAULT_BACKEND = (queryApi || DEFAULT_SERVER_URL).replace(/\/+$/, '');

  if (serverInput) {
    serverInput.value = DEFAULT_BACKEND;
    serverInput.addEventListener('change', () => {
      let val = serverInput.value.trim().replace(/\/+$/, '');
      if (val) {
        DEFAULT_BACKEND = val;
        activeSessionId = null; // Reset session for new backend
        if (statusText) statusText.textContent = 'Online';
      }
    });
  }

  let userId = 'aura_web_user_' + Math.floor(Math.random() * 10000);
  let activeSessionId = null;

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

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const currentBackend = (serverInput ? serverInput.value.trim() : DEFAULT_BACKEND).replace(/\/+$/, '');

    // Append User Message
    appendMessage('user', text);
    chatInput.value = '';

    // Show Typing Indicator
    const typingId = appendTypingIndicator();

    try {
      // 1. Create ADK Session if not active
      if (!activeSessionId) {
        if (statusText) statusText.textContent = 'Connecting...';
        const sessRes = await fetch(`${currentBackend}/apps/router_agent/users/${userId}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (!sessRes.ok) {
          throw new Error(`Session creation failed (HTTP ${sessRes.status})`);
        }

        const sessData = await sessRes.json();
        activeSessionId = sessData.id;
      }

      if (statusText) statusText.textContent = 'Online';

      // 2. Call ADK /run endpoint
      let runRes = await fetch(`${currentBackend}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: 'router_agent',
          userId: userId,
          sessionId: activeSessionId,
          newMessage: {
            role: 'user',
            parts: [{ text: text }]
          }
        })
      });

      // If session invalid or expired, recreate session and retry once
      if (runRes.status === 422 || runRes.status === 404) {
        const retrySessRes = await fetch(`${currentBackend}/apps/router_agent/users/${userId}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (retrySessRes.ok) {
          const retrySessData = await retrySessRes.json();
          activeSessionId = retrySessData.id;

          runRes = await fetch(`${currentBackend}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appName: 'router_agent',
              userId: userId,
              sessionId: activeSessionId,
              newMessage: {
                role: 'user',
                parts: [{ text: text }]
              }
            })
          });
        }
      }

      if (!runRes.ok) {
        const errText = await runRes.text();
        throw new Error(`Run request failed (HTTP ${runRes.status}): ${errText}`);
      }

      const runData = await runRes.json();
      removeMessage(typingId);
      const reply = extractADKResponse(runData);
      appendMessage('assistant', reply);

    } catch (err) {
      removeMessage(typingId);
      console.warn('ADK Agent server connection error:', err);
      activeSessionId = null; // Reset session so next attempt rebuilds session
      if (statusText) statusText.textContent = 'Server Unreachable';
      appendMessage('assistant', `⚠️ Could not communicate with ADK server.<br><br><strong>Note:</strong> Make sure your browser has reloaded the latest scripts by doing a Hard Refresh (Ctrl + Shift + R or Cmd + Shift + R).`);
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

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
  if (!data) return "No response received.";

  // Handle ADK event stream array
  if (Array.isArray(data)) {
    let texts = [];
    for (const event of data) {
      if (event.content && Array.isArray(event.content.parts)) {
        for (const part of event.content.parts) {
          if (part.text) texts.push(part.text);
        }
      } else if (event.text) {
        texts.push(event.text);
      }
    }
    if (texts.length > 0) {
      return texts.join('\n\n');
    }
  }

  // Handle direct objects
  if (data.reply) return data.reply;
  if (data.response) return data.response;
  if (data.output) return data.output;

  return JSON.stringify(data, null, 2);
}

