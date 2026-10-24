import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {CHECKED, UPDATES, METRICS, WORKFLOWS, EXECUTION_DETAILS, CONSUMPTION_HORIZON, SCENARIOS, OFFICIAL_NOTES} from "../data/briefing.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = path => fs.readFileSync(root + "/site/" + path, "utf8");
const home = read("index.html");
const builds = read("built-with.html");
assert.equal(UPDATES.length, 3);
assert.equal(WORKFLOWS.length, 2);
assert.equal(SCENARIOS.length, 3);
assert.equal(new Set(SCENARIOS.map(s => s.id)).size, SCENARIOS.length);

for (const item of [...UPDATES, ...SCENARIOS]) {
  assert.equal(item.checked, CHECKED);
  assert(item.date <= item.checked);
  assert.match(item.source, /^https:\/\/x\.com\/fermah_xyz\/status\/\d+$/);
}
for (const note of OFFICIAL_NOTES) {
  assert.equal(note.evidence, "checked");
  assert.equal(note.checked, CHECKED);
  assert.match(note.src, /^https:\/\//);
  assert(read("api/knowledge.js").includes(JSON.stringify(note.t).slice(1, -1)));
}
for (const update of UPDATES) {
  assert(home.includes(update.source));
  assert(home.includes(update.href));
}
assert(home.includes("https://joinwaitlist.xyz/"));
assert(home.includes("not an active-user count"));
assert(home.includes("X and Discord sign-in"));
assert(!home.includes("/r/"), "No referral URLs");
assert(home.includes(METRICS.comparisonSource));
assert(home.includes(METRICS.latencySource));
assert(home.includes(METRICS.checked));
assert(home.includes(METRICS.comparisonNote));
assert(home.includes("not ATLAS") || home.includes("NOT ATLAS TELEMETRY"));
for (const metric of METRICS.items) assert(home.includes(metric.value));
for (const flow of WORKFLOWS) {
  assert.equal(flow.steps.length, 6);
  assert(home.includes(`id="flow-${flow.id}"`));
  assert(home.includes(`aria-controls="flow-${flow.id}"`));
  assert(home.includes(flow.title));
}
for (const item of EXECUTION_DETAILS) assert(home.includes(item.source));
assert.equal(UPDATES[0].id, "consumption-horizon");
assert(home.includes('id="consumption-horizon"'));
assert(home.includes(CONSUMPTION_HORIZON.source));
assert.equal(CONSUMPTION_HORIZON.date, "2026-10-24");
assert.deepEqual(CONSUMPTION_HORIZON.routes.map(item => item.artifact), ["Native", "TEE", "ZK"]);
for (const route of CONSUMPTION_HORIZON.routes) {
  assert(home.includes(`<dt>${route.consumer}</dt><dd>${route.artifact}</dd>`));
}
for (const scenario of SCENARIOS) {
  assert(builds.includes(`id="scenario-${scenario.id}"`));
  assert(builds.includes(`?scenario=${scenario.id}#board-submit`));
  assert(builds.includes(scenario.source));
  assert(scenario.draftTitle.length <= 120);
  assert(scenario.draftBody.length <= 600);
  assert.equal(scenario.category, "ideas");
  assert(scenario.draftBody.includes(scenario.source));
}
assert(builds.indexOf('id="submit"') < builds.indexOf('id="build-scenarios"'));
assert(builds.indexOf('id="build-scenarios"') < builds.indexOf('id="community-board"'));
assert(!read("assets/briefing.js").includes("fetch("), "Draft selection must not make a network request");
assert(!read("assets/briefing.js").includes(".submit("));
assert(!read("assets/briefing.js").includes("requestSubmit("));
assert(read("assets/briefing.js").includes("window.confirm"));
assert(read("assets/dropdown.js").includes('sel.addEventListener("change", paint)'));

execFileSync(process.execPath, ["site/tools/build_briefing.mjs"], {cwd:root});
assert.equal(read("index.html"), home, "Generated home must be current and deterministic");
assert.equal(read("built-with.html"), builds, "Generated scenarios must be current and deterministic");
console.log("Briefing sources, bounded drafts, static fallbacks, shared metrics and deterministic generation: passed.");
