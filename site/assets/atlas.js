/* ---------------------------------------------------------------------------
   Fermah Atlas — shared data and renderers.

   ECOSYSTEM is the single place ecosystem facts live. The graph, the entity
   pages and the source table are all generated from it. Never add an entry
   without `source` and `checked`: the renderers will refuse to draw it.
--------------------------------------------------------------------------- */

const CHECKED = "2026-08-26";
const FERMAH = "https://www.fermah.xyz/";
const DOCS = "https://docs.fermah.xyz/";
const PAY_DOCS = "https://docs.fermah.xyz/fermah-pay";
const DOCS_CHECKED = "2026-08-30";
const CONTACT = "fermahatlas@gmail.com";

const ECOSYSTEM = {
  nodes: [
    {id:"fermah",    label:"Fermah",          col:0, kind:"root"},
    {id:"kernel",    label:"Kernel",          col:1, kind:"engine",  note:"Protocol Agency Engine"},
    {id:"froben",    label:"Froben",          col:2, kind:"product", note:"ZK proof marketplace · live on mainnet"},
    {id:"flashcast", label:"Flashcast",       col:2, kind:"product", note:"Prediction markets · live"},
    {id:"pay",       label:"Fermah Pay",      col:2, kind:"product", note:"USDC payment layer · docs-listed"},
    {id:"marina",    label:"Marina",          col:2, kind:"product", note:"Privacy data infrastructure · docs-listed"},
    {id:"community", label:"Community apps",  col:2, kind:"open",    note:"open slot"},
    {id:"zksync",    label:"ZKsync Era",      col:3, kind:"customer"},
    {id:"abstract",  label:"Abstract Chain",  col:3, kind:"customer"},
    {id:"cpd",       label:"CPD",             col:1, kind:"hist",    note:"Confidential Proving Delegation"},
    {id:"reclaim",   label:"Reclaim",         col:2, kind:"hist"},
    {id:"3jane",     label:"3Jane",           col:3, kind:"hist"}
  ],
  edges: [
    {from:"fermah",  to:"kernel",    status:"live"},
    {from:"kernel",  to:"froben",    status:"live"},
    {from:"kernel",  to:"flashcast", status:"live"},
    {from:"fermah",  to:"pay",       status:"listed"},
    {from:"fermah",  to:"marina",    status:"listed"},
    {from:"kernel",  to:"community", status:"open"},
    {from:"froben",  to:"zksync",    status:"live"},
    {from:"froben",  to:"abstract",  status:"live"},
    {from:"fermah",  to:"cpd",       status:"hist"},
    {from:"cpd",     to:"reclaim",   status:"hist"},
    {from:"reclaim", to:"3jane",     status:"hist"}
  ],

  /* Powered by Fermah — production and integrations */
  powered: [
    {name:"Froben", kicker:"Product · live on mainnet", status:"live",
     text:"The universal proof market. Any protocol requests a proof and Kernel runs the whole generation workflow — any proof system, any chain, any VM.",
     source:"https://www.fermah.xyz/froben", checked:CHECKED},
    {name:"Flashcast Social", kicker:"Product · live", status:"live",
     text:"Prediction markets created in a second on any topic, resolved automatically by Kernel — no committee and no dispute window.",
     source:"https://flashcast.social/", checked:CHECKED},
    {name:"Fermah Pay", kicker:"Product · docs-listed", status:"listed",
     text:"The current Fermah docs list Fermah Pay as a payments layer for products that need to charge users in USDC without asking them to hold gas, manage keys or leave the app to acquire XLM.",
     source:PAY_DOCS, checked:DOCS_CHECKED},
    {name:"Marina", kicker:"Product · docs-listed", status:"listed",
     text:"The current Fermah docs list Marina as privacy-preserving data infrastructure for the decentralized web. The docs page marks its Documentation and API Reference as Soon, so Atlas does not label it as live.",
     source:DOCS, checked:DOCS_CHECKED},
    {name:"ZKsync Era", kicker:"Paying customer of Froben", status:"live",
     text:"Named on the Fermah site as a paying customer of the Froben proof market.",
     source:FERMAH, checked:CHECKED},
    {name:"Abstract Chain", kicker:"Paying customer of Froben", status:"live",
     text:"Named on the Fermah site as a paying customer of the Froben proof market.",
     source:FERMAH, checked:CHECKED},
    {name:"DeFi Automation", kicker:"Enabled by Kernel", status:"enabled",
     text:"Autonomous strategies. Any strategy runs on any condition, including off-chain ones — the trigger does not have to live on the same chain as the position.",
     source:FERMAH, checked:CHECKED},
    {name:"Programmable Liquidity", kicker:"Enabled by Kernel", status:"enabled",
     text:"Adaptive LP positions that react to macro events, cross-chain flows and volatility in real time instead of sitting on a fixed range.",
     source:FERMAH, checked:CHECKED},
    {name:"Price Feed Construction", kicker:"Enabled by Kernel", status:"enabled",
     text:"Kernel builds a feed from any verifiable source, so any measurable stream becomes tradeable — not just the pairs an oracle happens to publish.",
     source:FERMAH, checked:CHECKED},
    {name:"Cross-Protocol Sequencing", kicker:"Enabled by Kernel", status:"enabled",
     text:"Multi-step workflows: borrow, swap, stake, settle. One verified condition triggers the whole sequence with nobody clicking through it.",
     source:FERMAH, checked:CHECKED},
    {name:"Reclaim Protocol", kicker:"Announced integration", status:"hist",
     text:"Confidential Proving Delegation was announced as an integration with Reclaim, bringing faster private proofs to apps built on it, including 3Jane. Not listed as production on the current site.",
     source:"https://www.fermah.xyz/blog-posts/fermah-x-reclaim", checked:CHECKED},
    {name:"Industry partners", kicker:"Partner wall, not named customers", status:"hist",
     text:"Boundless, LayerEdge, Gateway, Hylé, Scroll, Aligned, zkVerify, FUNCTOR and Interstate appear under “Trusted by Industry Leaders”. That is a different claim from a paying customer, so Atlas keeps them here rather than in production.",
     source:FERMAH, checked:CHECKED}
  ],

  /* Built with Fermah — apps, tools and models that work on Fermah's own
     architecture. Each says in its own README what is real and what is modelled;
     Atlas repeats that label rather than smoothing it over. */
  builtWith: [
    {name:"proofmarket-mcp", kicker:"MCP server · by @0maxxdev", status:"reference",
     text:"An MCP server that exposes a machine-callable proof-market surface. An agent submits Proof Requests, reads supply / allocated / utilized, and composes multi-step workflows with no human in the loop. Vocabulary follows Fermah: Seekers, Matchmaker, Prover Nodes. A reference surface, not Fermah's production Kernel.",
     source:"https://github.com/Zhekinmaksim/proofmarket-mcp", checked:CHECKED},
    {name:"proofmarket-x402", kicker:"Payment-gated surface · by @0maxxdev", status:"reference",
     text:"An x402-gated proof-market surface: the agent gets 402 Payment Required, builds an X-PAYMENT payload, retries and receives a settled proof. No account, no API key, no human. Amounts and the USDC asset are real; signing and settlement are modelled.",
     source:"https://github.com/Zhekinmaksim/proofmarket-x402", checked:CHECKED},
    {name:"proofmarket-sim", kicker:"Coordination model · by @0maxxdev", status:"reference",
     text:"A deterministic model of where proving capacity is lost — the gap between supply, allocated and utilized. Same supply in every regime, only coordination changes, and utilization moves from ~39% to ~91%. Powers the Proof Desk dispatch dashboard. A model, not Fermah's live telemetry.",
     source:"https://github.com/Zhekinmaksim/proofmarket-sim", checked:CHECKED}
  ],


  sources: [
    {rel:"Kernel is the engine under both live products", status:"live", url:FERMAH, checked:CHECKED},
    {rel:"Froben — ZK proof marketplace, live on mainnet", status:"live",
     url:"https://www.fermah.xyz/froben", checked:CHECKED},
    {rel:"Flashcast Social — prediction markets, live", status:"live",
     url:"https://flashcast.social/", checked:CHECKED},
    {rel:"Fermah Pay — payments layer listed separately in the current Fermah docs",
     status:"listed", url:PAY_DOCS, checked:DOCS_CHECKED},
    {rel:"Marina — privacy-preserving data infrastructure listed separately in the current Fermah docs",
     status:"listed", url:DOCS, checked:DOCS_CHECKED},
    {rel:"ZKsync Era — paying customer of Froben", status:"live", url:FERMAH, checked:CHECKED},
    {rel:"Abstract Chain — paying customer of Froben", status:"live", url:FERMAH, checked:CHECKED},
    {rel:"DeFi automation, programmable liquidity, price feeds and cross-protocol sequencing — listed as enabled by Kernel, not as shipped products", status:"enabled",
     url:FERMAH, checked:CHECKED},
    {rel:"CPD → Reclaim → 3Jane — announced integration, not on the current site", status:"hist",
     url:"https://www.fermah.xyz/blog-posts/fermah-x-reclaim", checked:CHECKED},
    {rel:"Scroll, Boundless, Aligned, zkVerify and others — industry partners, not named customers",
     status:"hist", url:FERMAH, checked:CHECKED}
  ]
};

/* --------------------------- chrome ------------------------------------- */
function mountChrome(current, base){
  base = base || "";
  const pages = [
    ["powered.html",    "Powered by Fermah", "Production & integrations"],
    ["built-with.html", "Built with Fermah", "Apps & workflows"],
    ["fermafia.html",   "Fermafia",          "The community archive"],
    ["operators.html",  "Operators",         "Who runs the prover nodes"],
    ["play.html",       "Play",              "Three games about the ecosystem"]
  ];
  document.body.insertAdjacentHTML("afterbegin", `
    <header><div class="wrap bar">
      <a class="logo" href="${base}index.html" aria-label="Fermah Atlas">
        <img src="${base}brand/lockup-fermah-atlas.svg" alt="Fermah Atlas"></a>
      <nav>${pages.map(([h,l,t])=>
        `<a href="${base}${h}" title="${t}"${h===current?' aria-current="page"':''}>${l}</a>`).join("")}</nav>
      <span class="unofficial" id="freshness">UNOFFICIAL ARCHIVE</span>
    </div></header>`);
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="wrap">
      <span>
        <span class="by">Built by <a href="https://x.com/0maxxdev" target="_blank"
          rel="noopener">@0maxxdev</a></span><br>
        Fermah Atlas — an unofficial community archive. Not affiliated with Fermah.
      </span>
      <span class="cols">
        <span><a href="https://x.com/0maxxdev" target="_blank" rel="noopener">X</a> ·
              <a href="https://github.com/Zhekinmaksim" target="_blank" rel="noopener">GitHub</a></span>
        <span><a href="${FERMAH}" target="_blank" rel="noopener">fermah.xyz</a> ·
              <a href="https://docs.fermah.xyz/" target="_blank" rel="noopener">docs</a> ·
              <a href="https://discord.gg/zzJDPWppRU" target="_blank" rel="noopener">discord</a></span>
        <span><a href="mailto:${CONTACT}?subject=Fermah%20Atlas%20feedback">feedback</a> ·
              <a href="mailto:${CONTACT}?subject=Remove%20my%20profile">remove my profile</a></span>
      </span>
    </footer>`);
}

/* ---------------------------- graph ------------------------------------- */
const NS = "http://www.w3.org/2000/svg";
const el = (t,a={}) => {
  const n = document.createElementNS(NS,t);
  for (const k in a) n.setAttribute(k,a[k]);
  return n;
};

function drawGraph(target="graph-canvas"){
  const host = document.getElementById(target);
  if (!host) return;
  const COLS=[70,300,560,860], BW=190, BH=68, ROW=100, TOP=30;
  const wrapNote = (value, max=28) => {
    const lines=[];
    let line="";
    String(value).split(/\s+/).forEach(word => {
      if (line && (line + " " + word).length > max) {
        lines.push(line);
        line=word;
      } else {
        line=line ? line + " " + word : word;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 2);
  };
  const byCol={};
  ECOSYSTEM.nodes.forEach(n => (byCol[n.col] = byCol[n.col] || []).push(n));
  const pos={};
  const maxRows = Math.max(...Object.values(byCol).map(l => l.length));
  Object.keys(byCol).forEach(c => {
    const list = byCol[c];
    list.forEach((n,i) => {
      pos[n.id] = {x: COLS[c],
                   y: list.length === 1 ? TOP + (maxRows-1)*ROW/2 : TOP + i*ROW};
    });
  });

  const H = TOP + maxRows*ROW + 20, W = COLS[3] + BW + 30;
  const svg = el("svg",{viewBox:`0 0 ${W} ${H}`, width:"100%", role:"img",
                        "aria-label":"Fermah ecosystem graph"});

  ECOSYSTEM.edges.forEach(e => {
    const a=pos[e.from], b=pos[e.to];
    if(!a||!b) return;
    const x1=a.x+BW, y1=a.y+BH/2, x2=b.x, y2=b.y+BH/2, mx=(x1+x2)/2;
    const soft = e.status !== "live" && e.status !== "listed";
    svg.appendChild(el("path",{
      d:`M ${x1} ${y1} H ${mx} V ${y2} H ${x2}`, fill:"none",
      stroke: soft ? "#37456A" : "#06C19D",
      "stroke-width": soft ? 1.5 : 2,
      "stroke-dasharray": soft ? "5 5" : "none"
    }));
    svg.appendChild(el("circle",{cx:x2, cy:y2, r:3, fill: soft ? "#37456A" : "#06C19D"}));
  });

  ECOSYSTEM.nodes.forEach(n => {
    const p=pos[n.id], g=el("g",{transform:`translate(${p.x},${p.y})`});
    const solid = n.kind !== "hist" && n.kind !== "open";
    g.appendChild(el("rect",{
      width:BW, height:BH, rx:2,
      fill: n.kind==="root" ? "#06C19D" : "#04183a",
      stroke: n.kind==="hist" ? "#1a2740" : "#22314F", "stroke-width":1,
      "stroke-dasharray": n.kind==="open" ? "5 5" : "none"
    }));
    const noteLines = n.note ? wrapNote(n.note) : [];
    const t = el("text",{x:16, y:noteLines.length ? 24 : 40, "font-family":"Space Grotesk, sans-serif",
      "font-weight":"700","font-size":"16",
      fill: n.kind==="root" ? "#001030" : (solid ? "#fff" : "#808898")});
    t.textContent = n.label;
    g.appendChild(t);
    if(noteLines.length){
      const s = el("text",{x:16, y:43, "font-family":"JetBrains Mono, monospace",
        "font-size":"10", fill: n.kind==="root" ? "rgba(0,16,48,.72)" : "#55627F"});
      s.textContent = noteLines[0];
      g.appendChild(s);
      if (noteLines[1]) {
        const s2 = el("text",{x:16, y:56, "font-family":"JetBrains Mono, monospace",
          "font-size":"10", fill: n.kind==="root" ? "rgba(0,16,48,.72)" : "#55627F"});
        s2.textContent = noteLines[1];
        g.appendChild(s2);
      }
    }
    svg.appendChild(g);
  });
  host.appendChild(svg);
}

/* -------------------------- source table -------------------------------- */
function drawSources(target="src-body"){
  const body = document.getElementById(target);
  if (!body) return;
  ECOSYSTEM.sources.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td class="name">${s.rel}</td>` +
      `<td><span class="tag ${s.status}">` +
      `${({live:"live", enabled:"enabled", listed:"docs-listed"})[s.status] || "announced"}</span></td>` +
      `<td><a href="${s.url}" target="_blank" rel="noopener">` +
      `${s.url.replace(/^https?:\/\//,"")}</a></td><td>${s.checked}</td>`;
    body.appendChild(tr);
  });
}

/* ------------------------- freshness marker ----------------------------- */
const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
function mountFreshness(seed){
  const el = document.getElementById("freshness");
  if (!el || !seed) return;
  const wd = seed.source_summary.week_dates;
  const wk = Math.max(...Object.keys(wd).map(Number));
  const [, m, d] = wd[String(wk)].split("-").map(Number);
  el.textContent = `WEEKLY · WEEK ${String(wk).padStart(2,"0")} · ${MON[m-1]} ${d}`;
  el.title = "Rebuilt from the official Spotlight announcements";
}

/* --------------------------- reveal on scroll --------------------------- */
function mountReveal(){
  const items = [...document.querySelectorAll(".reveal")];
  if (!items.length) return;
  const showAll = () => items.forEach(n => n.classList.add("in"));

  // fail-safe: a hidden block must never be able to swallow real content
  if (matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"){
    showAll();
    return;
  }
  setTimeout(showAll, 2500);
  document.documentElement.classList.add("snap");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const group = [...e.target.querySelectorAll("[data-stagger]")];
      group.forEach((n,i) => n.style.setProperty("--d", (i*90) + "ms"));
      e.target.classList.add("in");
      group.forEach(n => n.classList.add("in"));
      io.unobserve(e.target);
    });
  }, {rootMargin:"0px 0px -12% 0px", threshold:0.12});
  items.forEach(n => io.observe(n));
  // anything already on screen at load shows immediately
  requestAnimationFrame(() => items.forEach(n => {
    const r = n.getBoundingClientRect();
    if (r.top < innerHeight * 1.6) n.classList.add("in");
  }));
}

/* ----------------------------- seed ------------------------------------- */
let SEED = null;
async function loadSeed(){
  if (SEED) return SEED;
  if (window.SEED) return (SEED = window.SEED);   // data/seed.js, works from file://
  const r = await fetch("data/seed.json");        // fallback when served over http
  if (!r.ok) throw new Error("seed missing");
  SEED = await r.json();
  return SEED;
}
