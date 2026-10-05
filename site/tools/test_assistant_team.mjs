import assert from "node:assert/strict";

process.env.ANTHROPIC_API_KEY = "test-only";
const {default: handler} = await import("../api/ask.js");
const {DOCUMENTS} = await import("../api/knowledge.js");

const originalFetch = globalThis.fetch;
let request;
globalThis.fetch = async (_url, options) => {
  request = JSON.parse(options.body);
  return {
    ok: true,
    json: async () => ({content: [{type: "text", text: JSON.stringify({on_topic: true, answer: "Test answer"})}]}),
  };
};

async function ask(question) {
  request = null;
  let response;
  const res = {
    setHeader() {},
    status(code) { assert.equal(code, 200); return this; },
    json(value) { response = value; },
  };
  await handler({method: "POST", headers: {}, body: {question}}, res);
  return {response, context: request?.messages[0].content};
}

try {
  const team = await ask("Who is behind Fermah?");
  assert.equal(team.response.on_topic, true);
  assert.match(team.context, /Vanishree Rao/);
  assert.match(team.context, /Patricio Napoli/);
  assert.match(team.context, /March 30, 2026/);
  assert.match(team.context, /appointment date, not his joining date/);

  const funding = await ask("Who funded Fermah and how much did it raise?");
  assert.equal(funding.response.on_topic, true);
  assert.match(funding.context, /\$5\.2 million/);
  assert.match(funding.context, /September 17, 2024/);
  assert.match(funding.context, /a16z CSX and Lemniscap/);
  assert.match(funding.context, /Daemon Ventures/);
  assert.match(funding.context, /Claire Kart/);

  const russian = await ask("Кто основатель Fermah и кто CTO?");
  assert.match(russian.context, /Vanishree Rao/);
  assert.match(russian.context, /Patricio Napoli/);

  const advice = await ask("Should I invest in Fermah?");
  assert.equal(advice.response.on_topic, false);
  assert.equal(request, null);

  assert.ok(DOCUMENTS.some((doc) => doc.path === "Fermah Atlas home" && /Who’s behind Fermah/.test(doc.text)));
  console.log("Assistant team/funding context, safety gate and archive index: passed.");
} finally {
  globalThis.fetch = originalFetch;
}
