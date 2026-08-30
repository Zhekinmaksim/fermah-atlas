/* ---------------------------------------------------------------------------
   Fermah Atlas — hero backdrop.

   A field of pixels in the brand grid. The Fermah pi sits in it, and a
   diagonal sweep — the same 45-degree stroke as the logo — passes across,
   lighting cells as it goes. Pauses when the tab is hidden and never runs
   for visitors who ask for reduced motion.
--------------------------------------------------------------------------- */
(function(){
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const PI_GRID = [
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTT",
    "...TTTT..TTTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "...TTT....TTT...",
    "TTT..........TTT",
    "TTT..........TTT",
    "TTT..........TTT"
  ];

  const CELL = 13, GAP = 3, STEP = CELL + GAP;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cols = 0, rows = 0, ox = 0, oy = 0, dpr = 1, mark = new Set();

  function layout(){
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(r.width / STEP) + 1;
    rows = Math.ceil(r.height / STEP) + 1;

    // pi sits in the right half, vertically centred
    ox = Math.max(Math.floor(cols * 0.62), cols - 22);
    oy = Math.max(Math.floor((rows - PI_GRID.length) / 2), 0);
    mark = new Set();
    PI_GRID.forEach((row, r2) => {
      for (let c = 0; c < row.length; c++){
        if (row[c] === "T") mark.add((oy + r2) + ":" + (ox + c));
      }
    });
  }

  function frame(t){
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    // sweep position along the anti-diagonal, in cell units
    const span = cols + rows;
    const head = reduce ? span * 10 : ((t / 26) % (span + 60)) - 30;

    for (let r = 0; r < rows; r++){
      for (let c = 0; c < cols; c++){
        const isMark = mark.has(r + ":" + c);
        const d = Math.abs((c + r) - head);          // distance from the sweep
        const wave = d < 7 ? (1 - d / 7) : 0;
        let a;
        if (isMark) a = 0.55 + wave * 0.45;
        else if (wave > 0) a = wave * 0.30;
        else a = 0.055;
        ctx.fillStyle = isMark
          ? `rgba(6,193,157,${a.toFixed(3)})`
          : `rgba(55,69,106,${a.toFixed(3)})`;
        ctx.fillRect(c * STEP, r * STEP, CELL, CELL);
      }
    }
  }

  let raf = null;
  function loop(t){ frame(t); raf = requestAnimationFrame(loop); }
  function start(){ if (!raf && !reduce) raf = requestAnimationFrame(loop); }
  function stop(){ if (raf){ cancelAnimationFrame(raf); raf = null; } }

  layout();
  frame(0);
  start();

  addEventListener("resize", () => { layout(); frame(performance.now()); });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
})();
