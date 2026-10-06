#!/usr/bin/env node

import fs from "node:fs";

const seedPath = process.argv[2] || "site/data/seed.json";
const indexPath = process.argv[3] || "site/index.html";
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let html = fs.readFileSync(indexPath, "utf8");

const latestWeek = Math.max(
  ...seed.creators.flatMap((creator) => creator.contributions.map((item) => item.week_label)),
);
const rows = seed.creators.filter(creator => !creator.suspended).flatMap((creator) =>
  creator.contributions
    .filter((item) => item.week_label === latestWeek)
    .map((item) => ({
      handle: creator.display_handle,
      slug: creator.display_handle.toLowerCase(),
      tier: item.tier,
      date: item.announcement_date,
    })),
);

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const day = (iso) => {
  const [, month, date] = iso.split("-").map(Number);
  return `${months[month - 1]} ${date}`;
};

const item = (row, selected) => {
  const hm = selected ? "" : " hm";
  const square = selected ? "" : row.tier === "collab" ? " collab" : " hm";
  const date = selected ? `<span class="w">${day(row.date)}</span>` : "";
  return `      <a class="latest-item${hm}" href="c/${row.slug}" aria-label="Open @${row.handle} creator card"><span class="latest-avatar-link" aria-hidden="true"><img class="latest-avatar" src="avatars/${row.slug}.jpg" alt="" loading="lazy"></span><span class="sq${square}"></span><span class="latest-handle">@${row.handle}</span>${date}</a>`;
};

const group = (label, list, selected, later = false) => [
  `    <p class="grouplabel${later ? " later" : ""}">${label} · ${list.length}</p>`,
  '    <div class="latest-grid">',
  ...list.map((row) => item(row, selected)),
  "    </div>",
].join("\n");

const selected = rows.filter((row) => row.tier === "spotlight");
const mentions = rows.filter((row) => row.tier === "honourable_mention");
const collaborations = rows.filter((row) => row.tier === "collab");
const latest = [
  '  <div id="latest-groups">',
  group("SELECTED", selected, true),
  group("HONOURABLE MENTIONS", mentions, false, true),
  ...(collaborations.length ? [group("COLLAB OF THE WEEK", collaborations, false, true)] : []),
  "  </div>",
].join("\n");

function replaceOne(pattern, replacement, label) {
  const matches = html.match(pattern);
  if (!matches || matches.length !== 1) throw new Error(`Could not uniquely replace ${label}`);
  html = html.replace(pattern, replacement);
}

replaceOne(/<b id="c-fermafia">\d+<\/b>/, `<b id="c-fermafia">${seed.source_summary.unique_creators}</b>`, "door count");
replaceOne(/<p class="week" id="week-label">WEEK \d+<\/p>/, `<p class="week" id="week-label">WEEK ${latestWeek}</p>`, "week label");
replaceOne(/  <div id="latest-groups">[\s\S]*?\n  <\/div>(?=\n  <div class="latest-links">)/, latest, "latest groups");
replaceOne(/<a class="btn" id="latest-week-link" href="week\/\d+\.html">OPEN WEEK \d+ →<\/a>/,
  `<a class="btn" id="latest-week-link" href="week/${latestWeek}.html">OPEN WEEK ${latestWeek} →</a>`, "week link");
replaceOne(/<span id="all-count">\d+<\/span>/, `<span id="all-count">${seed.source_summary.unique_creators}</span>`, "archive count");

fs.writeFileSync(indexPath, html);
console.log(`Homepage fallback: Week ${latestWeek}, ${selected.length} selected, ${mentions.length} mentions, ${seed.source_summary.unique_creators} creators`);
