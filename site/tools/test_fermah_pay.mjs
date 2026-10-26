import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {FERMAH_PAY as pay,FERMAH_PAY_NOTES} from "../data/fermah-pay.js";
import {UPDATES,METRICS,CHECKED} from "../data/briefing.js";
import {DOCUMENTS} from "../api/knowledge.js";
const root=fileURLToPath(new URL("..",import.meta.url));
const read=p=>fs.readFileSync(root+p,"utf8");
assert.equal(pay.status,"testnet");assert.equal(pay.date,"2026-10-26");
assert.equal(UPDATES[0].source,pay.announcement);
assert.equal(METRICS.checked,"2026-10-24");assert.equal(CHECKED,"2026-10-24");
const page=read("powered.html"),home=read("index.html");
for(const item of pay.findings)assert(page.includes(item.source));
for(const source of [pay.announcement,pay.contract,pay.ci,pay.replayTransaction])assert(page.includes(source));
assert(page.includes("98")&&page.includes("Duplicate")&&page.includes("error 110"));
assert(page.includes("transaction still has a fee"));
assert(page.includes("two-minute-period"));
assert(page.includes("does not establish completion"));
assert(home.includes('href="powered.html#fermah-pay"'));
const context=vm.createContext({});
vm.runInContext(read("assets/atlas.js"),context);
const facts=JSON.parse(vm.runInContext(`JSON.stringify({pay:ECOSYSTEM.powered.find(p=>p.name==='Fermah Pay'),edge:ECOSYSTEM.edges.find(e=>e.to==='pay'),live:ECOSYSTEM.powered.filter(p=>p.status==='live').length})`,context));
assert.equal(facts.pay.status,"testnet");assert.equal(facts.edge.status,"testnet");assert.equal(facts.live,3);
assert(!read("assets/atlas.js").includes('label:"Abstract Chain"'));
execFileSync(process.execPath,[root+"tools/build_fermah_pay.mjs"]);
assert.equal(read("powered.html"),page,"Pay generator must be deterministic");
for(const note of FERMAH_PAY_NOTES)assert(DOCUMENTS.some(d=>d.source===note.src&&d.text.includes(note.t)));
process.env.ANTHROPIC_API_KEY="test-only";
const {default:handler}=await import("../api/ask.js");
const originalFetch=globalThis.fetch;let captured;
globalThis.fetch=async(_url,options)=>{captured=JSON.parse(options.body);return {ok:true,json:async()=>({content:[{type:"text",text:JSON.stringify({on_topic:true,answer:"Test answer"})}]})};};
try{
 for(const question of ["What is Fermah Pay?","How does Fermah Pay handle duplicate charges?","Does Fermah Pay support x402?","What recurring payments are shown on Stellar testnet?"]){
  let answer;await handler({method:"POST",headers:{"x-forwarded-for":question},body:{question}},{setHeader(){},status(code){assert.equal(code,200);return this;},json(data){answer=data;}});
  assert.equal(answer.on_topic,true);const text=captured.messages[0].content;
  assert(text.includes("Stellar testnet"));assert(text.includes("98"));
  assert(text.includes("Network fees are sponsored, not absent"));
  assert(text.includes("batch-settlement"));assert(text.includes("Mainnet release"));
  assert(text.includes(pay.findings[0].source));
 }
}finally{globalThis.fetch=originalFetch;}
console.log("Pay testnet status, source boundaries, unchanged production count and assistant context: passed (mocked Anthropic).");
