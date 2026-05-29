(function () {
  if (document.getElementById("baki-feedback-root")) return;

  var root = document.createElement("div");
  root.id = "baki-feedback-root";
  document.body.appendChild(root);

  var accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--baki-accent")
    .trim() || "#6366f1";

  var styles = document.createElement("style");
  styles.textContent =
    "#baki-feedback-root * { box-sizing: border-box; }" +
    ".baki-fb-bubble {" +
    "  position: fixed; bottom: 24px; right: 96px; z-index: 9998;" +
    "  width: 56px; height: 56px; border-radius: 50%;" +
    "  background: " + accent + "; border: none; cursor: pointer;" +
    "  display: flex; align-items: center; justify-content: center;" +
    "  box-shadow: 0 4px 24px rgba(0,0,0,0.15);" +
    "  transition: transform 0.2s ease;" +
    "}" +
    ".baki-fb-bubble:hover { transform: scale(1.05); }" +
    ".baki-fb-bubble svg { width: 22px; height: 22px; color: #fff; }" +
    ".baki-fb-panel {" +
    "  position: fixed; bottom: 96px; right: 96px; z-index: 9998;" +
    "  width: 380px; max-width: calc(100vw - 48px);" +
    "  background: #fff; border-radius: 16px;" +
    "  box-shadow: 0 8px 40px rgba(0,0,0,0.15);" +
    "  display: flex; flex-direction: column; overflow: hidden;" +
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
    "}" +
    ".baki-fb-header {" +
    "  display: flex; align-items: center; gap: 12px; padding: 16px 20px;" +
    "  border-bottom: 1px solid #e5e7eb;" +
    "}" +
    ".baki-fb-avatar {" +
    "  width: 36px; height: 36px; border-radius: 50%;" +
    "  background: " + accent + "; display: flex;" +
    "  align-items: center; justify-content: center;" +
    "  color: #fff;" +
    "}" +
    ".baki-fb-avatar svg { width: 16px; height: 16px; }" +
    ".baki-fb-header-name { font-weight: 600; font-size: 14px; color: #111; }" +
    ".baki-fb-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }" +
    ".baki-fb-label { font-size: 12px; color: #6b7280; font-weight: 500; margin: 0 0 8px 0; }" +
    ".baki-fb-cats { display: flex; gap: 8px; }" +
    ".baki-fb-cat {" +
    "  border: none; border-radius: 999px; padding: 6px 14px;" +
    "  font-size: 12px; font-weight: 500; cursor: pointer;" +
    "  background: #f3f4f6; color: #6b7280; transition: all 0.15s;" +
    "}" +
    ".baki-fb-cat:hover { color: #111; }" +
    ".baki-fb-cat.active { background: " + accent + "; color: #fff; }" +
    ".baki-fb-textarea {" +
    "  width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" +
    "  padding: 12px 16px; font-size: 14px; resize: none; outline: none;" +
    "  font-family: inherit; min-height: 100px;" +
    "}" +
    ".baki-fb-textarea:focus { border-color: " + accent + "; }" +
    ".baki-fb-submit {" +
    "  border: none; border-radius: 999px; padding: 10px 24px;" +
    "  font-size: 14px; font-weight: 600; color: #fff;" +
    "  background: " + accent + "; cursor: pointer; align-self: flex-start;" +
    "  display: flex; align-items: center; gap: 8px;" +
    "  transition: opacity 0.15s;" +
    "}" +
    ".baki-fb-submit:disabled { opacity: 0.5; cursor: not-allowed; }" +
    ".baki-fb-done {" +
    "  display: flex; flex-direction: column; align-items: center;" +
    "  gap: 12px; padding: 32px 0;" +
    "}" +
    ".baki-fb-done-icon {" +
    "  width: 48px; height: 48px; border-radius: 50%;" +
    "  background: " + accent + "; display: flex;" +
    "  align-items: center; justify-content: center;" +
    "  color: #fff;" +
    "}" +
    ".baki-fb-done-icon svg { width: 20px; height: 20px; }" +
    ".baki-fb-done-title { font-size: 14px; font-weight: 500; color: #111; }" +
    ".baki-fb-done-sub { font-size: 12px; color: #6b7280; margin: 0; }" +
    ".baki-fb-close {" +
    "  border: none; border-radius: 999px; padding: 8px 20px;" +
    "  font-size: 12px; font-weight: 500; cursor: pointer;" +
    "  background: #e5e7eb; color: #111; margin-top: 8px;" +
    "}" +
    "@keyframes baki-fb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }" +
    ".baki-fb-spinner {" +
    "  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);" +
    "  border-top-color: #fff; border-radius: 50%;" +
    "  animation: baki-fb-spin 0.6s linear infinite;" +
    "}";
  document.head.appendChild(styles);

  var megaphoneSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>' +
    "</svg>";
  var closeSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>' +
    "</svg>";

  var bubble = document.createElement("button");
  bubble.className = "baki-fb-bubble";
  bubble.innerHTML = megaphoneSvg;
  bubble.setAttribute("aria-label", "Give feedback");
  root.appendChild(bubble);

  var panel = document.createElement("div");
  panel.className = "baki-fb-panel";
  panel.style.display = "none";
  root.appendChild(panel);

  var selectedCategory = "";
  var sending = false;

  function render() {
    var isOpen = panel.style.display !== "none";
    bubble.innerHTML = isOpen ? closeSvg : megaphoneSvg;
    if (!isOpen) return;

    panel.innerHTML =
      '<div class="baki-fb-header">' +
      '<div class="baki-fb-avatar">' + megaphoneSvg + '</div>' +
      '<div class="baki-fb-header-name">Submit Feedback</div></div>' +
      '<div class="baki-fb-body">' +
      '  <div><p class="baki-fb-label">Category</p>' +
      '    <div class="baki-fb-cats">' +
      '      <button class="baki-fb-cat" data-cat="bug">🐛 Bug</button>' +
      '      <button class="baki-fb-cat" data-cat="suggestion">💡 Suggestion</button>' +
      '      <button class="baki-fb-cat" data-cat="other">💬 Other</button>' +
      "    </div>" +
      "  </div>" +
      '  <div><p class="baki-fb-label">Message</p>' +
      '    <textarea class="baki-fb-textarea" placeholder="Describe your feedback..."></textarea>' +
      "  </div>" +
      '  <button class="baki-fb-submit" disabled>Send feedback</button>' +
      "</div>";

    var cats = panel.querySelectorAll(".baki-fb-cat");
    cats.forEach(function (btn) {
      btn.addEventListener("click", function () {
        cats.forEach(function (c) { c.classList.remove("active"); });
        btn.classList.add("active");
        selectedCategory = btn.getAttribute("data-cat");
        checkSubmit();
      });
    });

    var textarea = panel.querySelector(".baki-fb-textarea");
    textarea.addEventListener("input", checkSubmit);

    var submitBtn = panel.querySelector(".baki-fb-submit");
    submitBtn.addEventListener("click", function () {
      if (!selectedCategory || !textarea.value.trim() || sending) return;
      sending = true;
      submitBtn.innerHTML = '<div class="baki-fb-spinner"></div> Send feedback';
      submitBtn.disabled = true;

      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, message: textarea.value.trim() }),
      }).then(function () {
        panel.innerHTML =
          '<div class="baki-fb-body"><div class="baki-fb-done">' +
          '<div class="baki-fb-done-icon">' +
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>' +
          "</svg></div>" +
          '<div class="baki-fb-done-title">Thanks for your feedback!</div>' +
          '<p class="baki-fb-done-sub">We appreciate you taking the time.</p>' +
          '<button class="baki-fb-close">Close</button></div></div>';
        panel.querySelector(".baki-fb-close").addEventListener("click", function () {
          panel.style.display = "none";
          bubble.innerHTML = megaphoneSvg;
          selectedCategory = "";
        });
      });
    });

    function checkSubmit() {
      submitBtn.disabled = !selectedCategory || !textarea.value.trim();
    }
  }

  bubble.addEventListener("click", function () {
    var isOpen = panel.style.display !== "none";
    panel.style.display = isOpen ? "none" : "flex";
    if (!isOpen) render();
    else bubble.innerHTML = megaphoneSvg;
  });
})();
