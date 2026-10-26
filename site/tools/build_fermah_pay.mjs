import fs from "node:fs";
import {fileURLToPath} from "node:url";
import {FERMAH_PAY as pay} from "../data/fermah-pay.js";
const root=fileURLToPath(new URL("..",import.meta.url));
const esc=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const link=(url,label)=>`<a class="brief-source" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
const file=root+"powered.html",html=fs.readFileSync(file,"utf8");
const marker=/<!-- fermah-pay:start -->[\s\S]*?<!-- fermah-pay:end -->/g;
if([...html.matchAll(marker)].length!==1)throw Error("Missing Fermah Pay section markers");
const section=`<section class="pay-update" id="fermah-pay" aria-labelledby="pay-title"><div class="wrap">
  <p class="eyebrow">Product update · October 26, 2026</p><h2 class="sec" id="pay-title">${esc(pay.title)}</h2>
  <p class="sec">${esc(pay.summary)}</p>
  <ol class="pay-flow">${pay.steps.map(step=>`<li><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join("")}</ol>
  <div class="pay-findings">${pay.findings.map(item=>`<article><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p>${link(item.source,item.label)}</article>`).join("\n")}</div>
  <p class="brief-boundary">${esc(pay.boundary)}</p>
  <details class="pay-next"><summary>What the announcement lists next</summary><p>${esc(pay.next)}</p>${link(pay.announcement,"October 26 thread")}</details>
  <div class="acts">${link(pay.announcement,"Read the announcement")}${link(pay.repository,"Official source code")}${link(pay.evidence,"Testnet evidence")}${link(pay.contract,"Testnet ledger contract")}${link(pay.replayTransaction,"98-charge replay transaction")}${link(pay.ci,"Successful testnet CI run")}</div>
  <p class="hint">Sources checked ${pay.checked}. Testnet evidence records retain their own dates; the September 29 replay record was discussed in the October 26 announcement.</p>
</div></section>`;
fs.writeFileSync(file,html.replace(marker,`<!-- fermah-pay:start -->\n${section}\n<!-- fermah-pay:end -->`));
console.log(`Fermah Pay: ${pay.status}, ${pay.findings.length} source-backed findings; checked ${pay.checked}.`);
