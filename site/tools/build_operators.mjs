import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {CHECKED, DOCS, OPERATOR_GUIDE} from "../data/operator-guide.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const snapshot = JSON.parse(fs.readFileSync(path.join(root, "data/explorer-operators.json"), "utf8"));
const contracts = JSON.parse(fs.readFileSync(path.join(root, "data/operator-contracts.json"), "utf8"));
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const number = value => new Intl.NumberFormat("en-US").format(value);
const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
const rows = snapshot.operators;
if (snapshot.pagination.hasMore || snapshot.pagination.total !== rows.length || new Set(rows.map(r => r.prover_name)).size !== rows.length) throw Error("Incomplete or duplicate Explorer snapshot");
for (const row of rows) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(row.prover_name) || row.profile_url !== `https://explorer.fermah.xyz/provers/${row.prover_name}` || row.ethereum_operator_address !== null) throw Error("Invalid operator profile");
  for (const key of ["machine_count", "connected_count", "completed_1h"]) if (!Number.isSafeInteger(Number(row[key])) || Number(row[key]) < 0) throw Error("Invalid operator metric");
  if (Number(row.connected_count) > Number(row.machine_count)) throw Error("Connected count exceeds machine count");
}
const connected = rows.reduce((s,r) => s + Number(r.connected_count), 0);
const withConnected = rows.filter(r => Number(r.connected_count) > 0).length;
if (rows.length !== snapshot.operator_count || connected !== snapshot.connected_machine_count || withConnected !== snapshot.operators_with_connected_machines) throw Error("Snapshot totals do not match rows");
const stamp = new Date(snapshot.fetched_at_utc).toISOString().slice(0,16).replace("T", " ") + " UTC";
const tableRows = rows.map(r => `      <tr><th scope="row">${link(r.profile_url, r.prover_name)}</th><td>${number(r.machine_count)}</td><td>${number(r.connected_count)}</td><td>${number(r.completed_1h)}</td><td>${esc(r.first_joined)}</td></tr>`).join("\n");
const snapshotHTML = `  <div class="sec-head"><div><p class="eyebrow">Fermah Proof Explorer</p><h2 class="sec">The prover names in the record.</h2></div></div>
  <p class="sec">A snapshot of the public Explorer, captured <time datetime="${esc(snapshot.fetched_at_utc)}">${stamp}</time>. These are Explorer display names; their Ethereum operator addresses have not been matched.</p>
  <dl class="op-summary"><div><dt>Prover names</dt><dd>${rows.length}</dd></div><div><dt>With connected machines</dt><dd>${withConnected}</dd></div><div><dt>Connected machines</dt><dd>${connected}</dd></div></dl>
  <div class="op-table-scroll" role="region" aria-label="Explorer prover snapshot" tabindex="0"><table class="op-table"><caption>Fermah Explorer snapshot · ${stamp}</caption><thead><tr><th scope="col">Prover name</th><th scope="col">Machines in source</th><th scope="col">Connected</th><th scope="col">Tasks completed · 1h</th><th scope="col">First seen in Explorer</th></tr></thead><tbody>
${tableRows}
  </tbody></table></div>
  <p class="hint op-note">Machine counts include all records in the source, including disconnected entries. They are not a count of operating servers. A zero connected count in this snapshot does not establish that an operator has left. The 1h counters belong to the source’s rolling window at capture time.</p>
  <div class="acts">${link("https://explorer.fermah.xyz/provers", "Open current Explorer")}<a href="data/explorer-operators.json" download>Download snapshot JSON</a></div>`;
const contractHTML = `  <p class="eyebrow">Contract evidence</p><h2 class="sec">Keep the network explicit.</h2>
  <p class="sec">The Mainnet configuration example names the following addresses. Blockscout identifies contracts at both addresses on Ethereum Sepolia (chain ID 11155111). A production Ethereum Mainnet AVS deployment is not confirmed by this evidence.</p>
  <dl class="op-contracts">${contracts.contracts.map(c => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(c.address) || c.confirmed_network.chain_id !== 11155111 || !c.sepolia_indexer.is_contract) throw Error("Invalid contract evidence");
    return `<div><dt>${esc(c.role)}</dt><dd>${link(c.sepolia_explorer_url, c.address)}<span>Sepolia · ${c.sepolia_indexer.is_verified ? "verified source" : "source not verified"}</span></dd></div>`;
  }).join("")}</dl>
  <p class="hint op-note">Checked ${CHECKED}. On Ethereum Mainnet (chain ID 1), the indexer did not identify these addresses as contracts. An indexer response is not an independent bytecode check and does not prove that no deployment exists. These addresses are not used to assign Ethereum identities to the Explorer names above.</p>
  <div class="acts">${link(contracts.official_documentation_url, "Official configuration example")}<a href="data/operator-contracts.json" download>Download contract evidence</a></div>`;
const replace = (html, name, contents) => {
  const pattern = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  if (!pattern.test(html)) throw Error(`Missing ${name} markers`);
  return html.replace(pattern, `<!-- ${name}:start -->\n${contents}\n<!-- ${name}:end -->`);
};
const operatorPath = path.join(root, "operators.html");
let html = fs.readFileSync(operatorPath, "utf8");
html = replace(html, "operator-snapshot", snapshotHTML);
html = replace(html, "operator-contracts", contractHTML);
fs.writeFileSync(operatorPath, html);
const homePath = path.join(root,"index.html");
let home = fs.readFileSync(homePath,"utf8");
home = replace(home, "operator-door", `      <span class="chips"><span class="chip on">Explorer snapshot</span><span class="chip">Node requirements</span><span class="chip">AVS evidence</span></span></span>\n    <span class="count"><b>${rows.length}</b>prover names</span>`);
fs.writeFileSync(homePath, home);
const snapshotNotes = [
  {k:"operators provers explorer supply side names who moonli staking4all rubynodes blackblocks fermah natsai p-ops cp0x machines connected",t:`Fermah Explorer snapshot captured ${stamp}: ${rows.length} prover display names, ${withConnected} with connected machines, ${connected} connected machines total. Names: ${rows.map(r=>r.prover_name).join(", ")}. Full pagination was read. This is an Explorer snapshot, not an EigenLayer address registry or live measurement. No Ethereum operator address mapping has been confirmed. Machine counts include disconnected source records; zero connected at capture time does not establish departure.`,src:"https://fermahatlas.xyz/operators#explorer-snapshot",checked:CHECKED},
  ...rows.map(r=>({kind:"explorer-profile",k:`operator prover ${r.prover_name} explorer machines tasks`,t:`${r.prover_name}, Fermah Explorer snapshot ${stamp}: ${r.machine_count} machine records, ${r.connected_count} connected machines, ${r.completed_1h} tasks completed in the source's rolling 1h window; first seen ${r.first_joined}. This is a dated snapshot, not current uptime or an Ethereum registration date. Its Ethereum operator address is not confirmed.`,src:r.profile_url,checked:CHECKED})),
  {k:"avs service manager stake registry address contract mainnet sepolia network configuration",t:`The official Mainnet configuration example names fermahServiceManager ${contracts.contracts[0].address} and fermahStakeRegistry ${contracts.contracts[1].address}. Blockscout confirms contracts at both addresses in Ethereum Sepolia (11155111), with first indexed interaction April 14, 2025. Both source codes are unverified in the indexer. The same indexer did not identify contracts at these addresses on Ethereum Mainnet (1); a production Mainnet AVS address is not confirmed. This is indexer evidence, not an independent bytecode audit or an Explorer-name-to-address mapping.`,src:contracts.official_documentation_url,checked:CHECKED},
];
const context = [
  ...OPERATOR_GUIDE.map(note=>({...note,evidence:"checked"})),
  ...snapshotNotes.map(note=>({...note,evidence:note.src===contracts.official_documentation_url ? "checked" : "provided-extract"})),
];
fs.writeFileSync(path.join(root,"api/operator-context.js"), `// Generated by site/tools/build_operators.mjs.\nexport const OPERATOR_CONTEXT = ${JSON.stringify(context)};\n`);
console.log(`Operators: ${rows.length} names, ${withConnected} with connected machines, ${connected} connected machines. Snapshot: ${stamp}.`);
