import assert from "node:assert/strict";

process.env.ANTHROPIC_API_KEY = "test-only";
const {default: handler} = await import("../api/ask.js");
const {ARCHIVE_STATS, DOCUMENTS} = await import("../api/knowledge.js");
let context;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => {
  context = JSON.parse(options.body).messages[0].content;
  return {ok: true, json: async () => ({content: [{type: "text",
    text: JSON.stringify({on_topic: true, answer: "Test answer"})}]})};
};

try {
  const response = {
    setHeader() {},
    status(code) { assert.equal(code, 200); return this; },
    json(value) { assert.equal(value.on_topic, true); },
  };
  await handler({method: "POST", headers: {}, body: {
    question: "Who has the longest selection streak in the Atlas archive?",
  }}, response);
  const leader = ARCHIVE_STATS.selection_runs[0];
  assert.ok(context.includes(`@${leader.handle}: ${leader.length} consecutive selected weeks`));
  assert.ok(context.includes("https://fermahatlas.xyz/stats"));
  assert.ok(DOCUMENTS.some(d => d.path === "site/week/22.html"));
  console.log("Assistant receives computed streak facts and indexed week pages: passed.");
} finally {
  globalThis.fetch = originalFetch;
}
