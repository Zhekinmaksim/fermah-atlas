// Source summaries retain their individual check dates.
import {FERMAH_PAY} from "./fermah-pay.js";
export const CHECKED = "2026-10-24";
export const UPDATES_CHECKED = FERMAH_PAY.checked;
const HOME = "https://www.fermah.xyz/";
const POST = "https://x.com/fermah_xyz/status/";

export const UPDATES = [
  {
    id: "fermah-pay-testnet", date: FERMAH_PAY.date, checked: FERMAH_PAY.checked, kind: "Fermah Pay · Stellar testnet",
    title: "A prepaid balance, with replay protection.",
    text: "On October 26, @7wealthh reported Fermah Pay Tranche 1 on Stellar testnet. Public repository evidence records a replay of 98 settled charges with no repeat debit, plus sponsored buyer network fees, recurring mandates and an x402 facilitator interface.",
    source: FERMAH_PAY.announcement, href: "powered.html#fermah-pay", action: "Read the testnet evidence",
    note: "Testnet implementation and recorded cases; no production Mainnet release is established.",
  },
  {
    id: "consumption-horizon", date: "2026-10-24", kind: "Execution routing",
    title: "Route for where the result goes next.",
    text: "Fermah described routing the same computation differently depending on where its output will be consumed: locally, by the next action, or across future sequences. The longer the result must remain composable, the more durable its execution artifact needs to be.",
    source: POST + "2114025885648974132", href: "#consumption-horizon", action: "Explore consumption horizon",
  },
  {
    id: "early-access", date: "2026-10-19", kind: "Early access",
    title: "Access is opening in cohorts.",
    text: "Fermah shared Vanishree Rao's announcement of phased admission: the first 10,000 had been admitted on October 19, with more cohorts to follow. This is an admission milestone, not an active-user count.",
    source: POST + "2112251932291023222", href: "https://joinwaitlist.xyz/", action: "Open official waitlist",
    note: "External site. X and Discord sign-in are requested there, not on Atlas.",
  },
].map(item => ({...item, checked: item.checked || CHECKED}));

export const METRICS = {
  checked: CHECKED, source: HOME,
  items: [
    {value: "2.8M+", label: "Proofs settled"},
    {value: "1M+", label: "Markets resolved"},
    {value: "99.7%", label: "Reliability"},
    {value: "0", label: "Humans in the loop"},
  ],
  comparisonSource: POST + "2110049932941930943",
  latencySource: POST + "2110719594490961924",
  comparisonNote: "The October 13 post discusses 100,000+ resolved markets; the homepage reports 1M+. The sources do not define a shared reporting period or explain the relationship between these figures. Atlas keeps the dated claims separate rather than treating one as a correction or a growth series.",
  latencyNote: "On October 15, Fermah said queueing and routing dominated the interval between trigger intake and compute start across 2.8M+ production proofs. The post does not publish a millisecond breakdown or an end-to-end latency guarantee.",
};

export const WORKFLOWS = [
  {
    id: "proof", label: "Proof request", title: "From request to a usable proof.",
    description: "An illustrative Froben workflow, based on Fermah's product and execution descriptions. Not live network telemetry.",
    source: HOME,
    steps: [
      {name: "Initiate", text: "A protocol submits a proof request and its requirements."},
      {name: "Prepare", text: "The workflow obtains the inputs needed for that proof."},
      {name: "Route", text: "The request is allocated to a compatible prover."},
      {name: "Execute", text: "The prover generates the proof; the workflow verifies the result."},
      {name: "Settle", text: "The verified result is returned for onchain consumption."},
      {name: "Continue", text: "A consuming protocol can use that result as input to its next action."},
    ],
  },
  {
    id: "market", label: "Market resolution", title: "From a condition to an outcome.",
    description: "An illustrative Flashcast workflow. The condition and source rules are defined before resolution; this is not a live market or a betting interface.",
    source: HOME,
    steps: [
      {name: "Initiate", text: "A market reaches its defined condition or deadline."},
      {name: "Prepare", text: "The workflow fetches the sources specified by the market."},
      {name: "Route", text: "The required resolution work is coordinated for execution."},
      {name: "Execute", text: "The resolution logic evaluates the evidence against the condition."},
      {name: "Settle", text: "The resulting outcome is delivered onchain for settlement."},
      {name: "Continue", text: "The result can be consumed by a subsequent protocol action."},
    ],
  },
];

export const EXECUTION_DETAILS = [
  {term: "Program identity", text: "A content-addressed OCI image identifies the program by its content, rather than by a bespoke endpoint.", source: POST + "2111489165661536597"},
  {term: "Runtime context", text: "Fermah names gVisor runsc as carrying runtime context. A sandbox is not, by itself, a zero-knowledge proof.", source: POST + "2111489165661536597"},
  {term: "Onchain handoff", text: "A returned result becomes available as input to the next action. The source describes composability, not a universal deployment recipe.", source: POST + "2111489165661536597"},
];

export const CONSUMPTION_HORIZON = {
  date: "2026-10-24", checked: CHECKED, source: POST + "2114025885648974132",
  title: "Where will the result be used?",
  text: "Fermah describes identical computation taking different execution paths as its output serves different consumers. Its October 24 post calls this the consumption horizon.",
  routes: [
    {consumer: "Local consumption", artifact: "Native"},
    {consumer: "Next action", artifact: "TEE"},
    {consumer: "Future sequences", artifact: "ZK"},
  ],
  boundary: "This is Fermah's stated routing principle, drawn from its discussion of 2.8M+ production proofs. It is not a universal routing rule, a deployment command or a latency guarantee; the post does not specify detailed security assumptions or selection thresholds.",
};

export const SCENARIOS = [
  {
    id: "agent-api", title: "An agent pays for an API.", category: "ideas",
    task: "Keep an API-payment action stable while its execution route evolves.",
    sequence: ["API payment intent", "Payment requirements", "Policy and routing", "Settlement and API result"],
    boundary: "x402 is the payment protocol; Fermah Pay now documents a Stellar batch-settlement binding on testnet. This build scenario is still an idea, and the community reference model below does not inherit that deployment status.",
    checked: FERMAH_PAY.checked,
    source: POST + "2111137093439074785", date: "2026-10-16",
    reference: {title: "proofmarket-x402", url: "https://github.com/Zhekinmaksim/proofmarket-x402", text: "Community reference model; signing and settlement are modelled."},
    draftTitle: "A stable API-payment action for agents",
    draftBody: "Idea, not a shipped integration: build a reference workflow in which an agent requests an API payment while routing, policy and settlement can change underneath. Define payment verification, failure handling and the returned API result. Keep x402 distinct from Fermah Pay.\nSource: " + POST + "2111137093439074785",
  },
  {
    id: "composite-market", title: "A market with more than one condition.", category: "ideas",
    task: "Resolve whether event A happened before event B crossed a defined threshold.",
    sequence: ["Define events and sources", "Collect timestamped evidence", "Evaluate order and threshold", "Produce a defined outcome"],
    boundary: "A build scenario, not a listed market. It needs explicit deadlines, timestamp rules and missing-data handling before it can resolve safely.",
    source: POST + "2110049932941930943", date: "2026-10-13",
    draftTitle: "An executable two-condition market specification",
    draftBody: "Idea, not a shipped market: specify whether event A occurs before event B crosses a threshold. Define both data sources, deadlines, timestamp ordering and missing-data outcomes. Start with a testable reference specification rather than accepting bets.\nSource: " + POST + "2110049932941930943",
  },
  {
    id: "action-chain", title: "An output becomes the next input.", category: "ideas",
    task: "Compose two protocol actions without tying the caller to one executor endpoint.",
    sequence: ["Identify the program", "Prepare execution inputs", "Return a verified result", "Consume it in the next action"],
    boundary: "An architectural scenario, not a production integration. Define result validation, permissions and failure behavior for each handoff.",
    source: POST + "2111489165661536597", date: "2026-10-17",
    draftTitle: "A two-step Kernel workflow reference",
    draftBody: "Idea, not a shipped integration: demonstrate one program's result becoming the next action's input. Specify content-addressed program identity, input and output schemas, validation and failure behavior. Do not assume a sandbox alone proves execution.\nSource: " + POST + "2111489165661536597",
  },
].map(item => ({...item, checked: item.checked || CHECKED}));

export const OFFICIAL_NOTES = [
  {k: "consumption horizon local native next action tee future sequences zk durable artifact output consumer execution path identical computation потребление горизонт результат артефакт",
    t: "Fermah's October 24, 2026 post describes consumption horizon: identical computation can take different routes depending on where the output will be consumed. Its mapping is local consumption to native execution, the next action to TEE, and future sequences to ZK. The team argues that results composed farther into future sequences need more durable execution artifacts, citing 2.8M+ production proofs. This is the team's stated routing principle, not a universal rule, an SDK command or a latency guarantee. The post does not specify detailed security assumptions or selection thresholds.", src: POST + "2114025885648974132"},
  {k: "protocol agency initiation autonomous conditions consensus kernel how works what means протокол агентность инициирование",
    t: "Protocol agency concerns how a protocol initiates and continues an action when its conditions hold, rather than waiting for an external operator to originate each transaction. Fermah's October 14, 2026 post distinguishes consensus and ordering from initiation. Atlas's proof-request and market-resolution walkthroughs illustrate Kernel's official execution descriptions; they are not live telemetry or deployment instructions.", src: POST + "2110357206688247911"},
  {k: "waitlist joinwaitlist access cohorts phases first 10000 admission ultramint early доступ очередь вайтлист",
    t: "On October 19, 2026, Fermah linked joinwaitlist.xyz and quoted Vanishree Rao: admission was phased and the first 10,000 had been admitted. This is a dated admission milestone, not a current active-user count or a promise of rewards. Checked October 24: the external page calls itself the ULTRAMINT waitlist, says Built by Fermah and requests X and Discord sign-in. Atlas does not perform that sign-in, collect those identities or require a wallet for browsing. The waitlist does not prove a product is publicly live.", src: POST + "2112251932291023222"},
  {k: "x402 agent api payment stable action interface routing policy settlement fermah pay difference агент платежи разница",
    t: "Fermah's October 16, 2026 post uses an x402 API-payment flow to explain a stable action interface: the agent's payment intent can stay fixed while policy, routing and settlement change. This dated post is a design explanation; use the separately dated Fermah Pay testnet entry for its implementation status. x402 is a protocol, while Fermah Pay is a payments product. Atlas lists proofmarket-x402 as a separate community reference model with modelled signing and settlement, not production Fermah infrastructure.", src: POST + "2111137093439074785"},
  {k: "oci content addressed program identity image gvisor runsc runtime sandbox execution handoff composable next action kernel контейнер песочница",
    t: "Fermah's October 17, 2026 post states that content-addressed OCI images give programs durable onchain identity, gVisor runsc carries runtime context, and onchain handoff makes an output the next action's input. These describe program identity, runtime and composition respectively. A sandbox alone is not a ZK proof. The post is not a complete installation guide and does not give universal deployment commands.", src: POST + "2111489165661536597"},
  {k: "latency queue queueing routing delay milliseconds handoffs compute 2.8m bottleneck задержка очередь маршрутизация",
    t: "Fermah's October 15, 2026 post says queueing and routing dominated delay between trigger intake and compute start across 2.8M+ production proofs. This is a specific interval, not a claim that compute never matters or a measurement of total settlement latency. The post gives no millisecond breakdown, benchmark percentages or latency guarantee. Do not invent those numbers.", src: POST + "2110719594490961924"},
  {k: "composite markets multiple conditions event threshold before executable resolution specification составные рынки условия",
    t: "Fermah's October 13, 2026 post discusses composite markets: whether event A occurred before event B crossed a threshold. It says executable specifications and resolution work remain a bottleneck across 100,000+ resolved markets. Atlas presents a builder idea, not a shipped market, with explicit source, deadline, ordering and missing-data requirements. This post's 100,000+ figure and the homepage's 1M+ markets do not have an established shared scope or reporting period; do not add them, subtract them or infer growth from them.", src: POST + "2110049932941930943"},
  {k: "live action position persistent state signal input assembly computation payment settlement froben x402 позиция состояние",
    t: "In its October 14, 2026 post, Fermah describes a live action position as state persisting through signal arrival, input assembly, computation, payment and settlement. The post assigns headless machine payments to x402 and carrying conditions through the sequence to Froben. This is the team's architectural framing, not a public API contract or evidence that every such application has shipped.", src: POST + "2110412319050125507"},
  {k: "action half life timing execution path immediate deeper computation resolutions latency время актуальность",
    t: "Fermah's October 9, 2026 post argues that an action's useful lifetime should guide its execution path: time-sensitive events need immediate execution, while some settlement outcomes can wait for deeper computation. It cites 100,000+ production autonomous resolutions without giving a universal timing threshold or service-level guarantee. Do not treat the count as a homepage market total or infer numerical latency from it.", src: POST + "2108545275832815656"},
].map(note => ({...note, checked: CHECKED, evidence: "checked"}));
