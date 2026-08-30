/* ---------------------------------------------------------------------------
   Fermah Atlas — background music.

   Off by default. Browsers block autoplay anyway, and a site that starts
   making noise on its own is a site people close. The choice is remembered.
--------------------------------------------------------------------------- */
(function () {
  const KEY = "atlas:music";
  const base = location.pathname.includes("/c/") ? "../" : "";

  const audio = new Audio(base + "brand/ambient.mp3");
  audio.loop = true;
  audio.volume = 0.34;
  audio.preload = "none";

  const btn = document.createElement("button");
  btn.className = "music-btn";
  btn.type = "button";
  btn.innerHTML = `<span class="bars"><i></i><i></i><i></i><i></i></span><span class="lbl">SOUND</span>`;
  document.body.appendChild(btn);

  let on = false;
  const paint = () => {
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.querySelector(".lbl").textContent = on ? "SOUND ON" : "SOUND";
    btn.title = on ? "Mute the music" : "Play the music";
  };

  const play = () => {
    audio.play().then(() => { on = true; paint(); localStorage.setItem(KEY, "on"); })
                .catch(() => { on = false; paint(); });
  };
  const stop = () => { audio.pause(); on = false; paint(); localStorage.setItem(KEY, "off"); };

  btn.addEventListener("click", () => (on ? stop() : play()));
  document.addEventListener("visibilitychange", () => { if (document.hidden && on) audio.pause();
                                                        else if (!document.hidden && on) audio.play().catch(() => {}); });

  // if it was on last time, start at the first interaction — never before
  if (localStorage.getItem(KEY) === "on") {
    const once = () => { play(); document.removeEventListener("pointerdown", once); };
    document.addEventListener("pointerdown", once, {once: true});
  }
  paint();
})();
