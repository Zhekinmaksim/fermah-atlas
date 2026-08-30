/* ---------------------------------------------------------------------------
   Fermah Atlas — Play with Fermah.

   Three games, all client-side. Scores are kept locally and, when a scores
   endpoint is deployed (api/scores), also on a shared board. If the endpoint
   is missing the games still work — the board just shows local bests.
--------------------------------------------------------------------------- */

const SCORES_API = "/api/scores";

/* ----------------------------- score store ------------------------------ */
const Scores = {
  localKey: g => "atlas:best:" + g,
  localBest(g){ return Number(localStorage.getItem(this.localKey(g)) || 0); },
  setLocalBest(g, v){
    if (v > this.localBest(g)) { localStorage.setItem(this.localKey(g), v); return true; }
    return false;
  },
  async board(g){
    try{
      const r = await fetch(`${SCORES_API}?game=${encodeURIComponent(g)}`);
      if (!r.ok) throw 0;
      return await r.json();                       // [{name, score}]
    }catch(e){ return null; }
  },
  async submit(g, name, score){
    try{
      const r = await fetch(SCORES_API, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({game:g, name, score})
      });
      if (!r.ok) throw 0;
      return await r.json();
    }catch(e){ return null; }
  }
};

function who(){
  let n = localStorage.getItem("atlas:name");
  if (!n){
    n = (prompt("Handle for the leaderboard (without @):") || "").trim().replace(/^@/,"").slice(0,20);
    if (!n) return null;
    localStorage.setItem("atlas:name", n);
  }
  return n;
}

async function renderBoard(game, host){
  const rows = await Scores.board(game);
  const best = Scores.localBest(game);
  if (!rows){
    host.innerHTML = `<div class="board-row"><span class="rk">—</span>
      <span class="nm">your best</span><span class="sc">${best || "—"}</span></div>
      <p class="board-note">Shared board is offline. Deploy <code>api/scores</code> to turn it on.</p>`;
    return;
  }
  host.innerHTML = rows.slice(0,5).map((r,i) =>
      `<div class="board-row"><span class="rk">${String(i+1).padStart(2,"0")}</span>
       <span class="nm">@${r.name}</span><span class="sc">${r.score}</span></div>`).join("") +
    `<div class="board-row you"><span class="rk">—</span><span class="nm">your best</span>
     <span class="sc">${best || "—"}</span></div>`;
}

async function recordScore(game, score, host){
  const improved = Scores.setLocalBest(game, score);
  if (improved && score > 0){
    const n = who();
    if (n) await Scores.submit(game, n, score);
  }
  renderBoard(game, host);
}

/* ========================= 1. Question of the Day ======================== */
const QUESTIONS = [
  {q:"What does Fermah call its engine — the thing that turns “if this is true, do that” into an on-chain primitive?",
   a:["Protocol Agency Engine (Kernel)","Proof Relay","Agent Bus","Settlement Layer"], c:0,
   e:"Kernel is the Protocol Agency Engine: it observes the event, runs the logic in a sandboxed container and settles the verified result on-chain."},
  {q:"Which two products run on Kernel in production today?",
   a:["Froben and Flashcast","Marina and Seek","Froben and Reclaim","Pie and Flashcast"], c:0,
   e:"Froben and Flashcast are the two production Kernel products Atlas tracks. Fermah Pay and Marina are listed separately in the current docs."},
  {q:"Who is named on the Fermah site as a paying customer of Froben?",
   a:["ZKsync Era","Scroll","Boundless","zkVerify"], c:0,
   e:"ZKsync Era and Abstract Chain are the named paying customers. Scroll, Boundless and zkVerify appear on the partner wall, which is a different claim."},
  {q:"In Fermah's vocabulary, who submits a Proof Request?",
   a:["A Seeker","A Matchmaker","A Prover Node","An Operator"], c:0,
   e:"Seekers submit Proof Requests, the Matchmaker assigns them to Prover Nodes, and the Prover Nodes generate the proofs."},
  {q:"What does the Matchmaker do?",
   a:["Assigns proof requests to prover nodes","Prices GPU time","Verifies proofs on-chain","Runs the frontend"], c:0,
   e:"It is the allocation step between demand and supply: requests in, prover nodes out."},
  {q:"What sits on the supply side of the Fermah proof market?",
   a:["Machines such as GPUs and FPGAs","Validators staking tokens","Light clients","Sequencers"], c:0,
   e:"The supply side is hardware — GPUs and FPGAs run by operators — and the demand side is anything that needs a ZK proof."},
  {q:"Fermah prover nodes register through which system?",
   a:["EigenLayer smart contracts","A web dashboard only","A Discord bot","Manual email approval"], c:0,
   e:"Operators collect ECDSA and BLS keys and register with the Fermah AVS through EigenLayer contracts, which is why the operator set is readable on-chain."},
  {q:"How many humans are in the loop when Flashcast resolves a market?",
   a:["Zero","A three-person committee","One oracle operator","It depends on the topic"], c:0,
   e:"Kernel resolves automatically — no committee and no dispute window. Fermah puts the number at zero."},
  {q:"Roughly how many proofs has Fermah settled, according to its own site?",
   a:["2.8M+","28K+","280M+","12M+"], c:0,
   e:"The site reports 2.8M+ proofs settled and 1M+ markets resolved, at 99.7% reliability."},
  {q:"What is Froben, in one line?",
   a:["A universal proof market","A rollup","A wallet","A block explorer"], c:0,
   e:"Any protocol requests a proof; Kernel runs the whole generation workflow across any proof system, chain or VM."},
  {q:"Which animal-shaped constant is the Fermah mascot?",
   a:["Pi","Sigma","Delta","Lambda"], c:0,
   e:"The brand mark is the Greek letter pi — the same glyph this site pixelates for its logo."},
  {q:"What is the Community Spotlight?",
   a:["Fermah's weekly recognition of community creators","A grant program","A testnet faucet","A governance vote"], c:0,
   e:"Each week the team publishes selected creators and honourable mentions. Atlas archives all of it."},
  {q:"What does “utilized” mean in a proof market's three numbers?",
   a:["Allocated capacity that actually produced a proof","Capacity offered by nodes","Capacity a matchmaker committed","Capacity paid for in advance"], c:0,
   e:"supply → allocated → utilized. The gaps between them are where proving capacity is lost."},
  {q:"CPD, announced with Reclaim, stands for what?",
   a:["Confidential Proving Delegation","Continuous Proof Delivery","Chain Proof Dispatch","Cross-Protocol Data"], c:0,
   e:"It was announced as an integration bringing faster private proofs to apps built on Reclaim, including 3Jane."},
  {q:"Why does a protocol need a machine-callable surface?",
   a:["Because the primary user is becoming an agent, not a human","To reduce gas fees","To pass audits","To support mobile wallets"], c:0,
   e:"Without a callable surface a protocol is invisible to agents no matter how good its on-chain logic is."},
  {q:"Prover node telemetry is exported through which stack?",
   a:["An OpenTelemetry collector shipped as a sidecar","A custom TCP protocol","IPFS pubsub","Email digests"], c:0,
   e:"Nodes run a metrics sidecar, and operators can point it at additional collectors of their own."},
  {q:"Which of these is NOT a Fermah product?",
   a:["Boundless","Froben","Flashcast","Kernel"], c:0,
   e:"Boundless appears on the industry partner wall. Froben, Flashcast and Kernel are Fermah's own."},
  {q:"What is the point of the guarantee spectrum in a proof market?",
   a:["Trading strictness for far higher utilization","Setting token emissions","Choosing a hash function","Picking a chain"], c:0,
   e:"With the same hardware, moving off maxed guarantees takes utilization from roughly 39% to roughly 91%."},
  {q:"Where does Atlas get its Spotlight data?",
   a:["The official announcements, X handles only","Scraped Twitter timelines","Discord user IDs","Self-reported forms"], c:0,
   e:"Only what the team published. No Discord identifiers are stored anywhere in this project."},
  {q:"What does “0 humans in the loop” refer to on the Fermah site?",
   a:["Kernel executing and settling without operators","An empty Discord","No employees","Unaudited contracts"], c:0,
   e:"It is the claim that the engine observes, executes and settles on its own."}
];

function todayIndex(){
  const start = Date.UTC(2026, 0, 1);
  return Math.floor((Date.now() - start) / 86400000);
}

function initQotd(){
  const host = document.getElementById("qotd");
  if (!host) return;
  const day = todayIndex();
  const q = QUESTIONS[day % QUESTIONS.length];
  const order = q.a.map((t,i) => ({t, i})).sort((a,b) =>
    ((day * 31 + a.i * 7) % 11) - ((day * 31 + b.i * 7) % 11));

  const state = JSON.parse(localStorage.getItem("atlas:qotd") || "{}");
  const answeredToday = state.day === day;

  host.innerHTML = `
    <p class="q">${q.q}</p>
    <div class="opts">${order.map(o =>
      `<button class="opt" data-i="${o.i}">${o.t}</button>`).join("")}</div>
    <div class="explain" hidden></div>`;

  const streakEl = document.getElementById("qotd-streak");
  const paint = () => {
    const s = JSON.parse(localStorage.getItem("atlas:qotd") || "{}");
    streakEl.textContent = (s.streak || 0) + (s.streak === 1 ? " day" : " days");
  };
  paint();

  function reveal(picked){
    host.querySelectorAll(".opt").forEach(b => {
      const i = Number(b.dataset.i);
      b.disabled = true;
      if (i === q.c) b.classList.add("right");
      else if (i === picked) b.classList.add("wrong");
    });
    const ex = host.querySelector(".explain");
    ex.hidden = false;
    ex.innerHTML = `<b>${picked === q.c ? "Correct." : "Not this time."}</b> ${q.e}`;
  }

  if (answeredToday){
    reveal(state.picked);
    return;
  }

  host.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
    const picked = Number(b.dataset.i);
    const prev = JSON.parse(localStorage.getItem("atlas:qotd") || "{}");
    const consecutive = prev.day === day - 1;
    const streak = picked === q.c ? (consecutive ? (prev.streak || 0) + 1 : 1) : 0;
    localStorage.setItem("atlas:qotd", JSON.stringify({day, picked, streak}));
    reveal(picked);
    paint();
  }));
}

/* ============================ 2. Memory ================================= */
const MEMORY_PAIRS = ICON_ORDER.slice(0, 10);   // 10 icons -> 20 cards on a 5x4 board

function initMemory(){
  const board = document.getElementById("memory");
  if (!board) return;
  const movesEl = document.getElementById("memory-moves");
  const movesEl2 = document.getElementById("memory-moves-2");
  const pairsEl = document.getElementById("memory-pairs");
  const setMoves = (v) => { movesEl.textContent = v; if (movesEl2) movesEl2.textContent = v; };
  const setPairs = (v) => { if (pairsEl) pairsEl.textContent = `${v} / ${MEMORY_PAIRS.length}`; };
  const boardHost = document.getElementById("memory-board");
  let first = null, lock = false, moves = 0, found = 0, t0 = 0;

  function build(){
    const deck = [...MEMORY_PAIRS, ...MEMORY_PAIRS]
      .map(v => ({v, r: Math.random()}))
      .sort((a,b) => a.r - b.r);
    board.innerHTML = deck.map((c,i) =>
      `<button class="mcard" data-v="${c.v}" data-i="${i}" aria-label="card ${i+1}">
         <span class="face">${iconSvg(c.v, "#06C19D")}
           <span class="cap">${ICON_LABEL[c.v]}</span></span></button>`).join("");
    first = null; lock = false; moves = 0; found = 0; t0 = 0;
    setMoves(0); setPairs(0);
    board.querySelectorAll(".mcard").forEach(c => c.addEventListener("click", () => flip(c)));
  }

  function flip(card){
    if (lock || card.classList.contains("open") || card.classList.contains("done")) return;
    if (!t0) t0 = Date.now();
    card.classList.add("open");
    if (!first){ first = card; return; }
    moves++; setMoves(moves);
    if (first.dataset.v === card.dataset.v){
      first.classList.add("done"); card.classList.add("done");
      first = null; found++; setPairs(found);
      if (found === MEMORY_PAIRS.length) finish();
    } else {
      lock = true;
      setTimeout(() => {
        first.classList.remove("open"); card.classList.remove("open");
        first = null; lock = false;
      }, 620);
    }
  }

  function finish(){
    const seconds = Math.round((Date.now() - t0) / 1000);
    // fewer moves and less time score higher; a perfect run is 8 moves
    const score = Math.max(0, Math.round(1400 - (moves - 10) * 24 - seconds * 4));
    document.getElementById("memory-result").innerHTML =
      `Cleared in <b>${moves}</b> moves, <b>${seconds}s</b> — score <b>${score}</b>`;
    recordScore("memory", score, boardHost);
  }

  document.getElementById("memory-again").addEventListener("click", () => {
    document.getElementById("memory-result").textContent = "";
    build();
  });
  build();
  renderBoard("memory", boardHost);
}

/* ============================= 3. 2048 ================================== */
const LEVELS = {
  2:["request","Request"], 4:["seeker","Seeker"], 8:["matchmaker","Matchmaker"],
  16:["node","Prover"], 32:["proof","Proof"], 64:["froben","Froben"],
  128:["flashcast","Flashcast"], 256:["kernel","Kernel"], 512:["zksync","ZKsync"],
  1024:["abstract","Abstract"], 2048:["pi","FERMAH"], 4096:["atlas","ATLAS"]
};
const INK = v => (v >= 32 ? "#001030" : "#cfe6ef");

function init2048(){
  const host = document.getElementById("g2048");
  if (!host) return;
  const N = 4;                       // classic 4x4
  const scoreEl = document.getElementById("g2048-score");
  const scoreEl2 = document.getElementById("g2048-score-2");
  const bestEl = document.getElementById("g2048-best");
  const boardHost = document.getElementById("g2048-board");
  const msg = document.getElementById("g2048-msg");
  host.setAttribute("tabindex", "0");
  host.style.removeProperty("grid-template-columns");   // layout belongs to the stylesheet

  let grid, score, over;

  const empty = () => {
    const out = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) out.push([r, c]);
    return out;
  };
  const spawn = () => {
    const cells = empty();
    if (!cells.length) return;
    const [r, c] = cells[Math.floor(Math.random() * cells.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  };

  function reset(){
    grid = Array.from({length: N}, () => Array(N).fill(0));
    score = 0; over = false;
    msg.textContent = "";
    spawn(); spawn(); draw();
  }

  function draw(){
    host.innerHTML = grid.flat().map(v => {
      if (!v) return '<div class="tile"></div>';
      const [icon, label] = LEVELS[v] || ["spark", String(v)];
      return `<div class="tile v${Math.min(v, 4096)}">
                <span class="ic">${iconSvg(icon, INK(v))}</span>
                <span class="l">${label}</span></div>`;
    }).join("");
    scoreEl.textContent = score;
    if (scoreEl2) scoreEl2.textContent = score;
    if (bestEl) bestEl.textContent = Math.max(Scores.localBest("2048"), score) || "—";
  }

  const slide = row => {
    const xs = row.filter(Boolean);
    const out = [];
    for (let i = 0; i < xs.length; i++){
      if (xs[i] === xs[i + 1]){ out.push(xs[i] * 2); score += xs[i] * 2; i++; }
      else out.push(xs[i]);
    }
    while (out.length < N) out.push(0);
    return out;
  };

  const transpose = g => g[0].map((_, c) => g.map(r => r[c]));

  function movesLeft(){
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){
      if (!grid[r][c]) return true;
      if (r < N - 1 && grid[r][c] === grid[r + 1][c]) return true;
      if (c < N - 1 && grid[r][c] === grid[r][c + 1]) return true;
    }
    return false;
  }

  function finish(){
    if (over) return;
    over = true;
    msg.textContent = "No moves left — " + score + " points.";
    recordScore("2048", score, boardHost);
  }

  function move(dir){
    if (over) return false;
    const before = JSON.stringify(grid);
    if (dir === "left")  grid = grid.map(slide);
    if (dir === "right") grid = grid.map(r => slide([...r].reverse()).reverse());
    if (dir === "up")    grid = transpose(transpose(grid).map(slide));
    if (dir === "down")  grid = transpose(transpose(grid).map(r => slide([...r].reverse()).reverse()));
    if (JSON.stringify(grid) === before){
      // a dead press still has to be able to end the game
      if (!movesLeft()) finish();
      return false;
    }

    spawn(); draw();
    if (!movesLeft()) finish();
    return true;
  }

  const KEYS = {ArrowLeft:"left", ArrowRight:"right", ArrowUp:"up", ArrowDown:"down",
                a:"left", d:"right", w:"up", s:"down",
                A:"left", D:"right", W:"up", S:"down"};

  // keys are handled on the document, with no visibility guard: the guard was
  // the kind of cleverness that silently eats input
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    const k = KEYS[e.key];
    if (!k) return;
    e.preventDefault();
    move(k);
  });

  // on-screen pad, so the game is playable with no keyboard at all
  const pad = document.getElementById("g2048-pad");
  if (pad){
    pad.innerHTML =
      '<button class="padbtn up" data-d="up" aria-label="up">↑</button>' +
      '<button class="padbtn left" data-d="left" aria-label="left">←</button>' +
      '<button class="padbtn down" data-d="down" aria-label="down">↓</button>' +
      '<button class="padbtn right" data-d="right" aria-label="right">→</button>';
    pad.querySelectorAll(".padbtn").forEach(b =>
      b.addEventListener("click", () => move(b.dataset.d)));
  }

  let sx = 0, sy = 0;
  host.addEventListener("touchstart", e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, {passive:true});
  host.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, {passive:true});

  const newBtn = document.getElementById("g2048-new");
  if (newBtn) newBtn.addEventListener("click", () => {
    if (score > 0 && !over) recordScore("2048", score, boardHost);
    reset();
  });
  const saveBtn = document.getElementById("g2048-save");
  if (saveBtn) saveBtn.addEventListener("click", () => recordScore("2048", score, boardHost));

  reset();
  renderBoard("2048", boardHost);
}

function boot(){
  [["question", initQotd], ["memory", initMemory], ["2048", init2048]]
    .forEach(([name, fn]) => { try { fn(); } catch (e) { console.error(name, e); } });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
