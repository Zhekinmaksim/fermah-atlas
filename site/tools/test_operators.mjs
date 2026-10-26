import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {OPERATOR_CONTEXT} from "../api/operator-context.js";
import {DOCUMENTS} from "../api/knowledge.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = relative => fs.readFileSync(root + relative, "utf8");
const snapshot = JSON.parse(read("data/explorer-operators.json"));
const contracts = JSON.parse(read("data/operator-contracts.json"));
const page = read("operators.html");
assert.equal(snapshot.pagination.hasMore, false);
assert.equal(snapshot.operators.length, snapshot.pagination.total);
assert.equal(snapshot.operator_count, 10);
assert.equal(snapshot.operators.reduce((n,r)=>n+Number(r.connected_count),0),7);
assert.equal(snapshot.operators.filter(r=>Number(r.connected_count)>0).length,6);
assert.equal((page.match(/href="https:\/\/explorer\.fermah\.xyz\/provers\//g)||[]).length,10);
for (const row of snapshot.operators) {
  assert.equal(row.ethereum_operator_address,null);
  assert(page.includes(row.profile_url));
  assert(OPERATOR_CONTEXT.some(note=>note.src===row.profile_url && note.t.includes("dated snapshot")));
  assert(DOCUMENTS.some(doc=>doc.source===row.profile_url));
}
assert(page.includes("2026-10-26 07:57 UTC"));
assert(page.includes("not a count of operating servers"));
assert(page.includes("not been matched"));
assert(page.includes("32 vCPU · 128 GB RAM") && page.includes("16 vCPU · 64 GB RAM"));
assert.equal(contracts.confirmed_production_mainnet_avs_address,null);
for(const contract of contracts.contracts){
  assert.equal(contract.confirmed_network.chain_id,11155111);
  assert.equal(contract.sepolia_indexer.is_contract,true);
  assert.equal(contract.ethereum_mainnet_indexer.is_contract,false);
}
assert(!page.includes("data/operators.js"));
assert(!page.includes("NOT YET INDEXED"));
const files=["operators.html","index.html","api/operator-context.js"];
const before=files.map(read);
execFileSync(process.execPath,[root+"tools/build_operators.mjs"]);
assert.deepEqual(files.map(read),before,"Operator generator must be idempotent");

process.env.ANTHROPIC_API_KEY="test-only";
const {default:handler}=await import("../api/ask.js");
let context="",calls=0;
const originalFetch=globalThis.fetch;
globalThis.fetch=async (_url,options)=>{
  calls++;context=JSON.parse(options.body).messages[0].content;
  return {ok:true,json:async()=>({content:[{type:"text",text:JSON.stringify({on_topic:true,answer:"Test answer"})}]})};
};
async function ask(question){
  let result;
  await handler({method:"POST",headers:{"x-forwarded-for":`operator-test-${calls}`},body:{question}}, {
    setHeader(){},status(code){assert.equal(code,200);return this;},json(value){result=value;}
  });
  assert.equal(result.on_topic,true);
  return result.answer;
}
try{
  const direct=await ask("How do I run a prover node?");
  assert.equal(calls,0);
  assert(direct.includes("Mainnet RPC") && direct.includes("docs disagree"));
  assert(!direct.includes("Sepolia RPC") && !direct.includes("/testnet/"));
  await ask("What GPU hardware does a Fermah operator need?");
  assert(context.includes("32 vCPU, 128 GB RAM"));
  assert(context.includes("16 vCPU/64 GB RAM"));
  assert(context.includes("do not resolve"));
  await ask("Who are the Fermah operators?");
  assert(context.includes("10 prover display names"));
  assert(context.includes("not an EigenLayer address registry"));
  await ask("How many machines did moonli have in the Explorer snapshot?");
  assert(context.includes("moonli, Fermah Explorer snapshot 2026-10-26 07:57 UTC"));
  assert(context.includes("not current uptime"));
}finally{globalThis.fetch=originalFetch;}
console.log("Operator snapshot completeness, network evidence, deterministic build and assistant context: passed (mocked Anthropic).");
