(function () {
  if (document.getElementById("baki-widget-root")) return;

  var root = document.createElement("div");
  root.id = "baki-widget-root";
  document.body.appendChild(root);

  var accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--baki-accent")
    .trim() || "#6366f1";

  var styles = document.createElement("style");
  styles.textContent =
    "#baki-widget-root * { box-sizing: border-box; }" +
    ".baki-bubble {" +
    "  position: fixed; bottom: 24px; right: 24px; z-index: 9999;" +
    "  width: 56px; height: 56px; border-radius: 50%;" +
    "  background: " + accent + "; border: none; cursor: pointer;" +
    "  display: flex; align-items: center; justify-content: center;" +
    "  box-shadow: 0 4px 24px rgba(0,0,0,0.15);" +
    "  transition: transform 0.2s ease;" +
    "}" +
    ".baki-bubble:hover { transform: scale(1.05); }" +
    ".baki-bubble svg { width: 24px; height: 24px; color: #fff; }" +
    ".baki-panel {" +
    "  position: fixed; bottom: 96px; right: 24px; z-index: 9999;" +
    "  width: 380px; max-width: calc(100vw - 48px);" +
    "  background: #fff; border-radius: 16px;" +
    "  box-shadow: 0 8px 40px rgba(0,0,0,0.15);" +
    "  display: flex; flex-direction: column; overflow: hidden;" +
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
    "}" +
    ".baki-header {" +
    "  display: flex; align-items: center; gap: 12px; padding: 16px 20px;" +
    "  border-bottom: 1px solid #e5e7eb;" +
    "}" +
    ".baki-avatar {" +
    "  width: 36px; height: 36px; border-radius: 50%;" +
    "  background: " + accent + "; display: flex;" +
    "  align-items: center; justify-content: center;" +
    "  font-weight: 700; font-size: 14px; color: #fff;" +
    "}" +
    ".baki-header-name { font-weight: 600; font-size: 14px; color: #111; }" +
    ".baki-header-sub { font-size: 12px; color: #6b7280; }" +
    ".baki-messages {" +
    "  height: 400px; overflow-y: auto; padding: 16px 20px;" +
    "  display: flex; flex-direction: column; gap: 12px;" +
    "}" +
    ".baki-msg {" +
    "  max-width: 85%; padding: 10px 16px; border-radius: 16px;" +
    "  font-size: 14px; line-height: 1.5;" +
    "}" +
    ".baki-msg-user {" +
    "  background: " + accent + "; color: #fff;" +
    "  align-self: flex-end;" +
    "}" +
    ".baki-msg-assistant {" +
    "  background: #f3f4f6; color: #111; align-self: flex-start;" +
    "}" +
    ".baki-typing {" +
    "  display: flex; gap: 4px; align-self: flex-start;" +
    "  background: #f3f4f6; padding: 14px 18px; border-radius: 16px;" +
    "}" +
    ".baki-typing span {" +
    "  width: 8px; height: 8px; border-radius: 50%; background: #9ca3af;" +
    "  animation: baki-bounce 1.2s infinite;" +
    "}" +
    ".baki-typing span:nth-child(2) { animation-delay: 0.1s; }" +
    ".baki-typing span:nth-child(3) { animation-delay: 0.2s; }" +
    "@keyframes baki-bounce {" +
    "  0%, 60%, 100% { transform: translateY(0); }" +
    "  30% { transform: translateY(-4px); }" +
    "}" +
    ".baki-footer {" +
    "  display: flex; align-items: center; gap: 8px;" +
    "  padding: 12px 16px; border-top: 1px solid #e5e7eb;" +
    "}" +
    ".baki-footer input {" +
    "  flex: 1; border-radius: 999px; border: 1px solid #e5e7eb;" +
    "  padding: 8px 16px; font-size: 14px; outline: none;" +
    "}" +
    ".baki-footer input:focus { border-color: " + accent + "; }" +
    ".baki-send {" +
    "  width: 36px; height: 36px; border-radius: 50%; border: none;" +
    "  background: " + accent + "; color: #fff; cursor: pointer;" +
    "  display: flex; align-items: center; justify-content: center;" +
    "  transition: opacity 0.15s;" +
    "}" +
    ".baki-send:disabled { opacity: 0.5; cursor: not-allowed; }" +
    ".baki-send svg { width: 16px; height: 16px; }" +
    "@keyframes baki-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }" +
    ".baki-spinner {" +
    "  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);" +
    "  border-top-color: #fff; border-radius: 50%;" +
    "  animation: baki-spin 0.6s linear infinite;" +
    "}";
  document.head.appendChild(styles);

  var chatSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>' +
    "</svg>";
  var closeSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>' +
    "</svg>";
  var sendSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/>' +
    "</svg>";

  var bubble = document.createElement("button");
  bubble.className = "baki-bubble";
  bubble.innerHTML = chatSvg;
  bubble.setAttribute("aria-label", "Toggle chat");
  root.appendChild(bubble);

  var panel = document.createElement("div");
  panel.className = "baki-panel";
  panel.style.display = "none";
  root.appendChild(panel);

  var conversationId = null;
  var sending = false;
  var messages = [{ role: "assistant", content: "Hi! I'm baki. How can I help you today?" }];

  function render() {
    var isOpen = panel.style.display !== "none";
    bubble.innerHTML = isOpen ? closeSvg : chatSvg;

    if (!isOpen) return;

    panel.innerHTML =
      '<div class="baki-header">' +
      '<div class="baki-avatar">B</div>' +
      "<div><div class=\"baki-header-name\">baki</div>" +
      '<div class="baki-header-sub">AI Support Agent</div></div></div>';

    var msgDiv = document.createElement("div");
    msgDiv.className = "baki-messages";

    messages.forEach(function (m) {
      var el = document.createElement("div");
      el.className = "baki-msg baki-msg-" + m.role;
      el.textContent = m.content;
      msgDiv.appendChild(el);
    });

    panel.appendChild(msgDiv);

    var footer = document.createElement("div");
    footer.className = "baki-footer";
    footer.innerHTML =
      '<input type="text" placeholder="Type your message..." />' +
      '<button class="baki-send" disabled>' + sendSvg + "</button>";
    panel.appendChild(footer);

    var input = footer.querySelector("input");
    var sendBtn = footer.querySelector(".baki-send");

    input.addEventListener("input", function () {
      sendBtn.disabled = !input.value.trim();
    });

    function send() {
      var text = input.value.trim();
      if (!text || sending) return;

      sending = true;
      sendBtn.innerHTML = '<div class="baki-spinner"></div>';
      sendBtn.disabled = true;

      messages.push({ role: "user", content: text });
      input.value = "";
      sendBtn.disabled = true;

      var typing = document.createElement("div");
      typing.className = "baki-typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      msgDiv.appendChild(typing);
      msgDiv.scrollTop = msgDiv.scrollHeight;

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: conversationId }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          conversationId = data.conversationId;
          typing.remove();
          messages.push({ role: "assistant", content: data.reply });
          renderMessages();
          sendBtn.innerHTML = sendSvg;
          sendBtn.disabled = true;
          sending = false;
        })
        .catch(function () {
          typing.remove();
          messages.push({
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          });
          renderMessages();
          sendBtn.innerHTML = sendSvg;
          sendBtn.disabled = false;
          sending = false;
        });
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
    sendBtn.addEventListener("click", send);

    renderMessages();
  }

  function renderMessages() {
    var msgDiv = panel.querySelector(".baki-messages");
    if (!msgDiv) return;
    msgDiv.innerHTML = "";
    messages.forEach(function (m) {
      var el = document.createElement("div");
      el.className = "baki-msg baki-msg-" + m.role;
      el.textContent = m.content;
      msgDiv.appendChild(el);
    });
    msgDiv.scrollTop = msgDiv.scrollHeight;
  }

  bubble.addEventListener("click", function () {
    var isOpen = panel.style.display !== "none";
    panel.style.display = isOpen ? "none" : "flex";
    if (!isOpen) render();
    else bubble.innerHTML = chatSvg;
  });
})();
