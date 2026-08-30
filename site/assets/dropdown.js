/* ---------------------------------------------------------------------------
   Fermah Atlas — dropdowns, in the site's own skin.
   Progressive: the real <select> stays in the DOM and keeps the value, so
   forms and keyboards still work; it is only visually replaced.
--------------------------------------------------------------------------- */
(function () {
  function build(sel) {
    if (sel.dataset.dressed) return;
    sel.dataset.dressed = "1";

    const wrap = document.createElement("div");
    wrap.className = "dd";
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd-btn";
    btn.innerHTML = `<span class="dd-val"></span><span class="dd-caret">▾</span>`;
    wrap.appendChild(btn);

    const list = document.createElement("div");
    list.className = "dd-list";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    wrap.appendChild(list);

    [...sel.options].forEach((o, i) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dd-item";
      item.textContent = o.textContent;
      item.dataset.i = i;
      list.appendChild(item);
    });

    const paint = () => {
      btn.querySelector(".dd-val").textContent = sel.options[sel.selectedIndex].textContent;
      [...list.children].forEach((c, i) => c.classList.toggle("on", i === sel.selectedIndex));
    };
    const open = (on) => {
      list.hidden = !on;
      wrap.classList.toggle("open", on);
    };

    btn.addEventListener("click", (e) => { e.stopPropagation(); open(list.hidden); });
    list.addEventListener("click", (e) => {
      const it = e.target.closest(".dd-item");
      if (!it) return;
      sel.selectedIndex = Number(it.dataset.i);
      sel.dispatchEvent(new Event("change", {bubbles: true}));
      paint(); open(false);
    });
    document.addEventListener("click", () => open(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
    paint();
  }

  const dress = () => document.querySelectorAll("select").forEach(build);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", dress);
  else dress();
})();
