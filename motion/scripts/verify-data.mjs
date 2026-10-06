import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.argv[2];
if (!dataDir) throw new Error('Pass the directory containing the verified stats.json and seed.json.');
const statsSource = await readFile(resolve(dataDir, 'stats.json'), 'utf8');
const seedSource = await readFile(resolve(dataDir, 'seed.json'), 'utf8');
const site = JSON.parse(statsSource);
const seed = JSON.parse(seedSource);

const literal = (node) => {
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) return literal(node.expression);
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.map((property) => {
      assert(ts.isPropertyAssignment(property), 'Expected a literal property');
      return [property.name.text, literal(property.initializer)];
    }));
  }
  throw new Error(`Expected a literal, got ${ts.SyntaxKind[node.kind]}`);
};
const declarations = async (file, names) => {
  const source = ts.createSourceFile(file, await readFile(resolve(root, file), 'utf8'),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = {};
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && names.includes(node.name.text)) {
      found[node.name.text] = literal(node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  for (const name of names) assert(name in found, `Missing declaration: ${name}`);
  return found;
};
const {STATS: video} = await declarations('src/statsData.ts', ['STATS']);
const {WEEKS} = await declarations('src/Week22.tsx', ['WEEKS']);
const week = video.week22;

for (const [videoKey, siteKey] of Object.entries({weeks: 'last_week', creators: 'creators',
  selections: 'selections', mentions: 'mentions', tierups: 'tierup_total',
  oneTimers: 'one_timers', cameBack: 'came_back'})) {
  assert.equal(video[videoKey], site[siteKey], `Stats20 ${videoKey}`);
}
assert.deepEqual(video.perWeek, site.per_week.map((item) => ({
  w: item.week, sel: item.selected, men: item.mentioned, new: item.new,
})));
assert.deepEqual(video.runs, site.selection_runs.slice(0, video.runs.length).map((item) => ({
  h: item.handle, n: item.length, from: item.from, to: item.to,
})));
assert.deepEqual(video.gap, site.gaps[0]);
assert.deepEqual(video.tierupFaces, site.tierups.slice(0, video.tierupFaces.length).map((item) => item.handle));
assert.equal(WEEKS, 22);
assert.equal(week.week, WEEKS);
assert.equal(week.date, site.per_week.find((item) => item.week === 22).date);
assert.equal(video.lastDate, site.last_date);
assert.equal(week.date, '2026-10-04');

const creators = seed.creators.filter((creator) => !creator.suspended);
const appearances = creators.flatMap((creator) => creator.contributions
  .map((item) => ({handle: creator.display_handle, ...item})));
const rankedContributions = creators.flatMap((creator) => creator.contributions
  .filter((item) => ['spotlight', 'honourable_mention'].includes(item.tier))
  .map((item) => ({handle: creator.display_handle, ...item})));
assert.equal(creators.length, site.creators, 'Seed creator count');
assert.equal(rankedContributions.filter((item) => item.tier === 'spotlight').length, site.selections);
assert.equal(rankedContributions.filter((item) => item.tier === 'honourable_mention').length, site.mentions);
const names = (items) => items.map((item) => item.toLowerCase().replace(/^@/, '')).sort();
const selected = rankedContributions.filter((item) => item.week_label === 22 && item.tier === 'spotlight');
const mentioned = rankedContributions.filter((item) => item.week_label === 22 && item.tier === 'honourable_mention');
const newNames = [...new Set([...selected, ...mentioned].map((item) => item.handle))]
  .filter((handle) => !appearances.some((item) => item.handle === handle && item.week_label < 22));
assert.deepEqual(names(week.selected), names(selected.map((item) => item.handle)));
assert.deepEqual(names(week.mentions), names(mentioned.map((item) => item.handle)));
assert.deepEqual(names(week.newNames), names(newNames));
assert.equal(newNames.length, 10);
assert.equal(Math.max(...site.per_week.map((item) => item.new)), 12);

for (const item of site.per_week) {
  const at = creators.filter((creator) => creator.contributions.some((row) => row.week_label === item.week));
  const fresh = at.filter((creator) => !creator.contributions.some((row) => row.week_label < item.week));
  assert.equal(item.selected, rankedContributions.filter((row) => row.week_label === item.week && row.tier === 'spotlight').length);
  assert.equal(item.mentioned, rankedContributions.filter((row) => row.week_label === item.week && row.tier === 'honourable_mention').length);
  assert.equal(item.new, fresh.length);
  assert.equal(item.returning, at.length - fresh.length);
  assert.equal(item.date, seed.source_summary.week_dates[item.week]);
}
assert.equal(creators.filter((creator) => new Set(creator.contributions.map((item) => item.week_label)).size === 1).length, video.oneTimers);
assert.equal(video.oneTimers + video.cameBack, creators.length);

for (const [key, handle] of Object.entries({nyuella: 'Nyuella', legend: 'legendary54321',
  aditya: 'Adityapunk01', bilal: 'Bilalearn'})) {
  const record = Object.fromEntries(rankedContributions.filter((item) =>
    item.handle.toLowerCase() === handle.toLowerCase()).map((item) =>
    [item.week_label, item.tier === 'spotlight' ? 'S' : 'm']));
  assert.deepEqual(week.records[key], record, `Week22 strip: ${handle}`);
}
const runs = (creator, selectedOnly) => {
  const result = [];
  const weeks = [...new Set(creator.contributions.filter((item) => !selectedOnly || item.tier === 'spotlight')
    .map((item) => item.week_label))].sort((a, b) => a - b);
  for (const week of weeks) {
    const previous = result.at(-1);
    if (previous && previous.to === week - 1) { previous.to = week; previous.length++; }
    else result.push({handle: creator.display_handle, length: 1, from: week, to: week});
  }
  return result;
};
const selectionRuns = creators.flatMap((creator) => runs(creator, true));
const appearanceRuns = creators.flatMap((creator) => runs(creator, false));
assert.deepEqual(selectionRuns.filter((run) => run.length >= 4).sort((a, b) => b.length - a.length)
  .map((run) => [run.handle, run.length, run.to]), [['Nyuella', 5, 21], ['legendary54321', 4, 21]]);
assert.deepEqual(selectionRuns.filter((run) => run.to === 22 && run.length >= 2)
  .map((run) => run.handle), ['Bilalearn']);
assert.equal(Math.max(...appearanceRuns.map((run) => run.length)), 6);
assert(appearanceRuns.some((run) => run.handle === 'cryptomasterAJ' && run.length === 6));
assert.deepEqual(names(week.endedFiveWeekAppearances), names(appearanceRuns
  .filter((run) => run.to === 21 && run.length === 5).map((run) => run.handle)));
assert.equal(week.endedFiveWeekAppearances.length, 3);
assert.deepEqual(appearanceRuns.filter((run) => run.to === 22 && run.length >= 4)
  .sort((a, b) => b.length - a.length).map((run) => [run.handle, run.length]),
  [['illfated_fr', 5], ['Faizan626371', 4]]);
const gapCreator = creators.find((creator) => creator.display_handle === video.gap.handle);
const gapWeeks = [...new Set(gapCreator.contributions.map((item) => item.week_label))].sort((a, b) => a - b);
assert(gapWeeks.some((week, index) => week === video.gap.from && gapWeeks[index + 1] === video.gap.back));
assert.equal(video.gap.back - video.gap.from - 1, video.gap.weeks);
for (const face of video.mosaic) {
  const appeared = new Set(appearances.filter((item) =>
    item.handle.toLowerCase() === face.h.toLowerCase()).map((item) => item.week_label));
  assert(appeared.size > 0, `Unknown mosaic creator: ${face.h}`);
  assert.equal(face.once, appeared.size === 1, `Mosaic appearance count: ${face.h}`);
}
for (const handle of video.hasAvatar) {
  await readFile(resolve(root, 'public', 'avatars', `${handle}.jpg`));
}
const report = {
  dataDir: resolve(dataDir),
  statsSha256: createHash('sha256').update(statsSource).digest('hex'),
  seedSha256: createHash('sha256').update(seedSource).digest('hex'),
  totals: {weeks: video.weeks, creators: video.creators, selections: video.selections, mentions: video.mentions},
  week22: {selected: selected.length, mentioned: mentioned.length, newNames: newNames.length},
  status: 'passed',
};
await mkdir(resolve(root, 'out'), {recursive: true});
await writeFile(resolve(root, 'out', 'data-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
