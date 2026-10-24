import fs from "node:fs";
import {fileURLToPath} from "node:url";
import {CHECKED, UPDATES, METRICS, WORKFLOWS, EXECUTION_DETAILS, CONSUMPTION_HORIZON, SCENARIOS} from "../data/briefing.js";

const site = fileURLToPath(new URL("..", import.meta.url));
const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const date = value => new Date(value + "T12:00:00Z").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric", timeZone:"UTC"});
const source = (url, label = "Official source") => `<a class="brief-source" href="${escape(url)}" target="_blank" rel="noopener">${escape(label)} &#8599;</a>`;

function replace(file, name, html) {
  const target = site + "/" + file;
  const before = fs.readFileSync(target, "utf8");
  const pattern = new RegExp(`<!-- briefing:${name} -->[\\s\\S]*?<!-- /briefing:${name} -->`, "g");
  if ([...before.matchAll(pattern)].length !== 1) throw new Error(`Missing or duplicate ${name} in ${file}`);
  const formatted = html.split("\n").map(line => line.trimEnd()).join("\n");
  fs.writeFileSync(target, before.replace(pattern, `<!-- briefing:${name} -->\n${formatted}\n<!-- /briefing:${name} -->`));
}

replace("index.html", "updates", `<section class="brief-updates" id="now" aria-labelledby="now-title"><div class="wrap">
  <div class="brief-section-head"><div><p class="eyebrow">Recent official notes</p><h2 class="sec" id="now-title">Now at Fermah.</h2></div><p class="brief-checked">Checked <time datetime="${CHECKED}">${date(CHECKED)}</time></p></div>
  <div class="brief-updates-list">${UPDATES.map(item => `<article class="brief-update" id="update-${item.id}">
    <div class="brief-update-meta"><time datetime="${item.date}">${date(item.date)}</time><span>${escape(item.kind)}</span></div>
    <div><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p>${item.note ? `<p class="brief-boundary">${escape(item.note)}</p>` : ""}</div>
    <div class="brief-update-links"><a class="brief-action" href="${escape(item.href)}"${item.href.startsWith("https:") ? ' target="_blank" rel="noopener"' : ""}>${escape(item.action)} ${item.href.startsWith("https:") ? "&#8599;" : "&#8594;"}</a>${source(item.source, "Announcement")}</div>
  </article>`).join("\n")}</div>
</div></section>`);

replace("index.html", "metrics", `<div class="statband brief-metrics" id="reported-metrics"><div class="wrap">
  <div class="row">${METRICS.items.map(item => `<div class="cell"><b>${escape(item.value)}</b><span>${escape(item.label)}</span></div>`).join("")}</div>
  <p class="src">FERMAH-REPORTED FIGURES, NOT ATLAS TELEMETRY &#183; CHECKED ${CHECKED} &#183; ${source(METRICS.source, "fermah.xyz")}</p>
  <details class="brief-metric-notes"><summary>Scope, sources and latency</summary>
    <div><h3>Different claims, separate records.</h3><p>${escape(METRICS.comparisonNote)}</p>${source(METRICS.comparisonSource, "October 13 post")}</div>
    <div><h3>Latency starts before compute.</h3><p>${escape(METRICS.latencyNote)}</p>${source(METRICS.latencySource, "October 15 post")}</div>
  </details>
</div></div>`);

replace("index.html", "kernel", `<section class="kernel-flow-section" id="kernel-flow" aria-labelledby="kernel-title"><div class="wrap">
  <div class="brief-section-head"><div><p class="eyebrow">Inside Kernel</p><h2 class="sec" id="kernel-title">From condition to continuation.</h2></div><img class="kernel-brand" src="brand/atlas-icon-64.png" width="48" height="48" alt="Fermah Atlas" loading="lazy"></div>
  <div class="kernel-tabs" role="tablist" aria-label="Kernel workflows">${WORKFLOWS.map((flow, i) => `<button type="button" role="tab" id="flow-tab-${flow.id}" aria-controls="flow-${flow.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? "0" : "-1"}" data-flow="${flow.id}" disabled>${escape(flow.label)}</button>`).join("")}</div>
  ${WORKFLOWS.map((flow, i) => `<div class="kernel-example" id="flow-${flow.id}" role="tabpanel" aria-labelledby="flow-tab-${flow.id}" tabindex="0"${i ? " hidden" : ""}>
    <h3>${escape(flow.title)}</h3><p class="brief-boundary">${escape(flow.description)}</p>
    <ol class="kernel-sequence">${flow.steps.map((step, n) => `<li><span class="kernel-step-index" aria-hidden="true">${String(n + 1).padStart(2, "0")}</span><h4>${escape(step.name)}</h4><p>${escape(step.text)}</p></li>`).join("")}</ol>
    ${source(flow.source, "Fermah execution and product descriptions")}
  </div>`).join("\n")}
  <details class="kernel-details"><summary>Execution details</summary><dl>${EXECUTION_DETAILS.map(item => `<div><dt>${escape(item.term)}</dt><dd>${escape(item.text)} ${source(item.source, "October 17 post")}</dd></div>`).join("")}</dl></details>
  <div class="kernel-horizon" id="consumption-horizon"><p class="eyebrow">Consumption horizon</p><h3>${escape(CONSUMPTION_HORIZON.title)}</h3><p>${escape(CONSUMPTION_HORIZON.text)}</p>
    <dl>${CONSUMPTION_HORIZON.routes.map(item => `<div><dt>${escape(item.consumer)}</dt><dd>${escape(item.artifact)}</dd></div>`).join("")}</dl>
    <p class="brief-boundary">${escape(CONSUMPTION_HORIZON.boundary)}</p>${source(CONSUMPTION_HORIZON.source, date(CONSUMPTION_HORIZON.date) + " post")}
  </div>
  <a class="brief-action kernel-build-link" href="built-with.html#build-scenarios">Build scenarios &#8594;</a>
</div></section>`);

replace("built-with.html", "scenarios", `<section class="build-scenarios" id="build-scenarios" aria-labelledby="scenarios-title"><div class="wrap">
  <p class="eyebrow">Starting points</p><h2 class="sec" id="scenarios-title">What could you build?</h2>
  <p class="sec">Development ideas grounded in Fermah's October posts. These are not shipped products or confirmed production integrations.</p>
  ${SCENARIOS.map((item, n) => `<article class="build-scenario" id="scenario-${item.id}">
    <div class="scenario-heading"><span class="scenario-number" aria-hidden="true">${String(n + 1).padStart(2, "0")}</span><div><p class="scenario-status">BUILD SCENARIO</p><h3>${escape(item.title)}</h3><p>${escape(item.task)}</p></div></div>
    <div class="scenario-body"><ol class="scenario-sequence">${item.sequence.map(step => `<li>${escape(step)}</li>`).join("")}</ol><p class="brief-boundary">${escape(item.boundary)}</p>
    ${item.reference ? `<p class="scenario-reference">Reference: <a href="${escape(item.reference.url)}" target="_blank" rel="noopener">${escape(item.reference.title)} &#8599;</a><span>${escape(item.reference.text)}</span></p>` : ""}
    <div class="scenario-actions"><a class="btn scenario-draft" data-scenario="${item.id}" href="built-with.html?scenario=${item.id}#board-submit">Discuss on Board &#8595;</a>${source(item.source, date(item.date) + " post")}</div></div>
  </article>`).join("\n")}
</div></section>`);

console.log(`Briefing: ${UPDATES.length} updates, ${WORKFLOWS.length} workflows, ${SCENARIOS.length} scenarios; source check ${CHECKED}.`);
