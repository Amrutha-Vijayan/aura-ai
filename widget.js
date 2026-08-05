/* ==========================================================================
   Aura-AI Google ADK Embeddable Web Chat Widget
   Embed this single script tag into ANY client website HTML:
   <script src="http://127.0.0.1:8000/widget.js" data-api-url="http://127.0.0.1:8000/api/chat"></script>
   ========================================================================== */

(function () {
  // Prevent duplicate initialization
  if (window.AuraAIWidgetLoaded) return;
  window.AuraAIWidgetLoaded = true;

  // Get current script element for data attributes
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const API_URL = (currentScript && currentScript.getAttribute('data-api-url')) || 'http://127.0.0.1:8000/api/chat';

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    #aura-widget-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #8b5cf6 100%);
      color: #ffffff;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #aura-widget-fab:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.8);
    }
    #aura-widget-box {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background: #070913;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    #aura-widget-box.open {
      display: flex;
      animation: auraWidgetPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes auraWidgetPop {
      from { opacity: 0; transform: translateY(16px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .aura-widget-header {
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .aura-widget-title {
      color: #ffffff;
      font-weight: 700;
      font-size: 1rem;
    }
    .aura-widget-status {
      font-size: 0.78rem;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
    .aura-widget-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
    }
    .aura-widget-messages {
      flex: 1;
      padding: 18px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #04060e;
    }
    .aura-msg {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.92rem;
      line-height: 1.5;
    }
    .aura-msg.assistant {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top-left-radius: 4px;
    }
    .aura-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #8b5cf6 100%);
      color: #ffffff;
      border-top-right-radius: 4px;
    }
    .aura-widget-input-wrapper {
      padding: 14px;
      background: #070913;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 10px;
    }
    .aura-widget-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 99px;
      padding: 12px 18px;
      color: #ffffff;
      font-size: 0.92rem;
      outline: none;
    }
    .aura-widget-send {
      background: linear-gradient(135deg, #06b6d4, #6366f1);
      color: #ffffff;
      border: none;
      border-radius: 99px;
      padding: 0 20px;
      font-weight: 600;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Render Widget DOM Elements
  const fab = document.createElement('button');
  fab.id = 'aura-widget-fab';
  fab.innerHTML = '✨';

  const box = document.createElement('div');
  box.id = 'aura-widget-box';
  box.innerHTML = `
    <div class="aura-widget-header">
      <div>
        <div class="aura-widget-title">Aura-AI</div>
        <div class="aura-widget-status">
          <span style="width:7px;height:7px;background:#10b981;border-radius:50%;display:inline-block;"></span>
          Online & Ready
        </div>
      </div>
      <button class="aura-widget-close" id="aura-widget-close-btn">&times;</button>
    </div>
    <div class="aura-widget-messages" id="aura-widget-msgs">
      <div class="aura-msg assistant">
        Hello! I am <strong>Aura-AI</strong>.<br>How can I help you today?
      </div>
    </div>
    <div class="aura-widget-input-wrapper">
      <input type="text" class="aura-widget-input" id="aura-widget-input" placeholder="Type a message..." autocomplete="off">
      <button class="aura-widget-send" id="aura-widget-send-btn">Send</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(box);

  // Toggle open/close
  fab.addEventListener('click', () => box.classList.toggle('open'));
  document.getElementById('aura-widget-close-btn').addEventListener('click', () => box.classList.remove('open'));

  // Message Handler
  const msgsContainer = document.getElementById('aura-widget-msgs');
  const inputEl = document.getElementById('aura-widget-input');
  const sendEl = document.getElementById('aura-widget-send-btn');

  function sendWidgetMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    // User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'aura-msg user';
    userMsg.textContent = text;
    msgsContainer.appendChild(userMsg);
    inputEl.value = '';
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    // Typing
    const typingMsg = document.createElement('div');
    typingMsg.className = 'aura-msg assistant';
    typingMsg.innerHTML = '✨ <em>Thinking...</em>';
    msgsContainer.appendChild(typingMsg);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    // Fetch from Local ADK Endpoint or Fallback Response
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
      typingMsg.innerHTML = data.reply || data.response || data.output || "I received your request.";
      msgsContainer.scrollTop = msgsContainer.scrollHeight;
    })
    .catch(() => {
      // Local fallback simulation if endpoint is offline
      setTimeout(() => {
        let replyText = `I got your query: "${text}".`;
        const q = text.toLowerCase();
        if (q.includes('time')) {
          replyText = `The current time is <strong>${new Date().toLocaleTimeString()}</strong>.`;
        } else if (q.includes('weather')) {
          replyText = `🌤️ The current weather in Tokyo is sunny and 22°C (72°F).`;
        } else if (q.includes('support') || q.includes('human')) {
          replyText = `Connecting you with a live customer support representative. Case ID: #AURA-89F12.`;
        }
        typingMsg.innerHTML = replyText;
        msgsContainer.scrollTop = msgsContainer.scrollHeight;
      }, 500);
    });
  }

  sendEl.addEventListener('click', sendWidgetMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendWidgetMessage();
  });
})();
