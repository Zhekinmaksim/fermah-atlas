/* ---------------------------------------------------------------------------
   Fermah Atlas — the shark assistant.

   The widget only sends the question to /api/ask. The key, the rules and the
   knowledge base all live on the server; nothing here can be edited from the
   browser to make it answer something else.
--------------------------------------------------------------------------- */
(function () {
  const SUGGESTIONS = [
    "What is Kernel?",
    "What is Fermah Pay?",
    "What is Marina?",
    "Who pays for Froben?",
    "How do I run a prover node?",
  ];

  const wrap = document.createElement("div");
  wrap.className = "shark";
  wrap.innerHTML = `
    <div class="shark-panel" id="shark-panel" role="dialog" aria-label="Fermah assistant" hidden>
      <div class="shark-head">
        <span class="dot"></span>
        <span class="title">FERMAH ASSISTANT</span>
        <button class="shark-close" id="shark-close" aria-label="Close">×</button>
      </div>
      <div class="shark-log" id="shark-log">
        <div class="msg bot">Ask me about Fermah — Kernel, Froben, Fermah Pay, Marina,
          Flashcast, prover nodes, the Community Spotlight or anyone in the Atlas archive. I answer
          from the indexed archive and official material, and nothing else.</div>
        <div class="chips">${SUGGESTIONS.map((s) => `<button class="schip">${s}</button>`).join("")}</div>
      </div>
      <form class="shark-form" id="shark-form">
        <input id="shark-input" maxlength="400" autocomplete="off" placeholder="Ask about Fermah…">
        <button class="shark-send" type="submit" aria-label="Send">→</button>
      </form>
      <p class="shark-foot">Answers come from the indexed Fermah Atlas archive and official material.</p>
    </div>
    <button class="shark-fab" id="shark-fab" aria-label="Ask the Fermah assistant">
      <img id="shark-img" src="brand/shark/shark-idle.webp" alt="">
    </button>`;
  document.body.appendChild(wrap);

  const panel = wrap.querySelector("#shark-panel");
  panel.hidden = true;
  panel.style.display = "none";
  const fab = wrap.querySelector("#shark-fab");
  const img = wrap.querySelector("#shark-img");
  const log = wrap.querySelector("#shark-log");
  const form = wrap.querySelector("#shark-form");
  const input = wrap.querySelector("#shark-input");

  // pages in /c/ sit one level down
  const base = location.pathname.includes("/c/") ? "../" : "";
  img.src = base + "brand/shark/shark-idle.webp";

  let isOpen = false;
  const open = (on) => {
    isOpen = on;
    panel.hidden = !on;
    panel.style.display = on ? "flex" : "none";
    wrap.classList.toggle("open", on);
    fab.setAttribute("aria-expanded", String(on));
    if (on) setTimeout(() => input.focus(), 60);
  };
  fab.addEventListener("click", (e) => { e.stopPropagation(); open(!isOpen); });
  wrap.querySelector("#shark-close").addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation(); open(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) open(false); });
  // a click anywhere outside the widget closes it too
  document.addEventListener("click", (e) => { if (isOpen && !wrap.contains(e.target)) open(false); });
  wrap.addEventListener("click", (e) => e.stopPropagation());

  function say(text, who) {
    const d = document.createElement("div");
    d.className = "msg " + who;
    const parts = String(text).split(/\n?Source:\s*/);
    d.textContent = parts[0].trim();
    if (parts[1]) {
      const a = document.createElement("a");
      a.href = parts[1].trim();
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "src";
      a.textContent = "source ↗";
      d.appendChild(a);
    }
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  let busy = false;
  async function ask(question) {
    if (busy || !question) return;
    busy = true;
    say(question, "me");
    const thinking = say("…", "bot thinking");
    img.src = base + "brand/shark/shark-talk.webp";

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({question}),
      });
      const data = await r.json();
      thinking.remove();
      say(data.answer || "No answer came back.", "bot");
    } catch (e) {
      thinking.remove();
      say("The assistant is offline on this build — it needs the /api/ask function and a key.", "bot");
    } finally {
      img.src = base + "brand/shark/shark-idle.webp";
      busy = false;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    input.value = "";
    ask(q);
  });
  log.addEventListener("click", (e) => {
    if (e.target.classList.contains("schip")) ask(e.target.textContent);
  });
})();
