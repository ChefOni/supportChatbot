/**
 * SupportChatbot Embeddable Widget
 * Usage: <script src="https://your-domain.com/widget/embed.js" data-embed-token="xxx"></script>
 */

(function () {
  'use strict';

  // Get configuration from script tag
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const embedToken = currentScript.getAttribute('data-embed-token');
  const customGreeting = currentScript.getAttribute('data-greeting') || 'Hi! How can I help you today?';
  const primaryColor = currentScript.getAttribute('data-color') || '#3B82F6';
  const chatbotName = currentScript.getAttribute('data-name') || 'Support Bot';

  if (!embedToken) {
    console.error('SupportChatbot: Missing data-embed-token attribute');
    return;
  }

  // Generate unique session ID
  const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);

  // Create widget container
  const container = document.createElement('div');
  container.id = 'support-chatbot-widget';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  document.body.appendChild(container);

  // Widget state
  let isOpen = false;
  let messages = [];

  // API endpoint (will be configured)
  const apiUrl = currentScript.src.replace('/widget/embed.js', '') + '/api/embed';

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = '💬';
  toggleButton.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${primaryColor};
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  `;
  toggleButton.onmouseover = () => toggleButton.style.transform = 'scale(1.1)';
  toggleButton.onmouseout = () => toggleButton.style.transform = 'scale(1)';
  toggleButton.onclick = toggleChat;

  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.style.cssText = `
    display: none;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 10px;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px;
    background: ${primaryColor};
    color: white;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `<span>${chatbotName}</span><button id="close-btn" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">×</button>`;

  // Messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
    padding: 12px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
  `;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message...';
  input.style.cssText = `
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    outline: none;
    font-size: 14px;
  `;

  const sendButton = document.createElement('button');
  sendButton.textContent = 'Send';
  sendButton.style.cssText = `
    padding: 8px 16px;
    background: ${primaryColor};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  `;

  inputArea.appendChild(input);
  inputArea.appendChild(sendButton);

  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputArea);

  container.appendChild(chatWindow);
  container.appendChild(toggleButton);

  // Add greeting message
  addMessage('assistant', customGreeting);

  // Event listeners
  document.getElementById('close-btn').onclick = toggleChat;
  sendButton.onclick = sendMessage;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    toggleButton.style.display = isOpen ? 'none' : 'flex';
  }

  function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 80%;
      font-size: 14px;
      line-height: 1.4;
      ${role === 'user' ? 'align-self: flex-end; background: ' + primaryColor + '; color: white;' : 'align-self: flex-start; background: #f3f4f6; color: #111827;'}
    `;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    messages.push({ role, content });
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.style.cssText = 'align-self: flex-start; padding: 10px 14px; font-size: 14px; color: #6b7280;';
    typingDiv.textContent = 'Typing...';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-embed-token': embedToken,
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      });

      messagesContainer.removeChild(typingDiv);

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      addMessage('assistant', data.response);
    } catch (error) {
      messagesContainer.removeChild(typingDiv);
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
      console.error('SupportChatbot error:', error);
    }
  }
})();
