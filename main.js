/* Aura-AI - Cloud Run ADK Agent Client */

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

  // Live Google Cloud Run HTTPS Endpoint
  const CLOUD_RUN_ENDPOINT = 'https://demo-agent-317584469189.us-central1.run.app/run';

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

    // Send Request directly to Cloud Run Service
    fetch(CLOUD_RUN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_name: 'router_agent',
        user_id: 'aura_user_' + Date.now(),
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
      console.warn('Cloud Run ADK agent connection error:', err);
      appendMessage('assistant', '⚠️ Cloud Run ADK agent server is temporarily unreachable.');
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
