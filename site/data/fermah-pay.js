const REPO = "https://github.com/fermah-xyz/fermah-pay-stellar";
const REVISION = "17e4d0a9b0d866b8db4df9ed1f0522179efba9d3";
const FILE = `${REPO}/blob/${REVISION}/`;

export const FERMAH_PAY = {
  date: "2026-10-26", checked: "2026-10-26", status: "testnet",
  announcement: "https://x.com/7wealthh/status/2114637166403891489",
  repository: REPO, revision: REVISION,
  evidence: FILE + "docs/evidence/README.md#prepaid-ledger-on-testnet",
  x402: FILE + "docs/api/x402.md",
  recurring: FILE + "docs/api/recurring.md",
  ci: "https://github.com/fermah-xyz/fermah-pay-stellar/actions/runs/39603810011",
  replayTransaction: "https://stellar.expert/explorer/testnet/tx/21919c05e19f7bbb6b4e139e6da2330a54b402fa9ba5297ff859e3b3db626d9a",
  contract: "https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI",
  title: "Fermah Pay on Stellar testnet.",
  summary: "Prepaid USDC accounts and seller billing, with sponsored transaction submission, replay protection, recurring mandates and an x402 facilitator interface. The October 26 announcement reports Tranche 1 on Stellar testnet; the public repository provides implementation and testnet evidence.",
  steps: [
    {title: "Deposit once", text: "For the prepaid-ledger flow, the buyer signs a deposit authorization. USDC moves to a separate treasury and the contract credits the buyer’s ledger balance."},
    {title: "Charge the ledger", text: "A charge moves credit from the buyer’s balance to seller revenue in the contract’s accounting. It does not transfer USDC between wallets on each charge."},
    {title: "Sponsor submission", text: "A submitter signs the transaction and a separate fee account pays through Stellar fee bumps. Zero buyer fees means the buyer pays no network fee; the transaction still has a fee."},
  ],
  findings: [
    {title: "98 replays, no second debit", text: "The published testnet record replays a previously settled batch of 98 charge IDs. All 98 return Duplicate and nothing is debited again. This is a recorded test case, not a guarantee against every failure mode.", source: FILE + "docs/evidence/testnet/2026-09-29T051328-charge-batch-98-first-replayed.json", label: "September 29 testnet record"},
    {title: "Retries retain their identity", text: "An API retry returns the original charge with created: false. The separate single-charge replay case is refused during pre-submission simulation as DuplicateCharge (error 110). The 98-entry batch replay is a distinct case that was included onchain.", source: FILE + "docs/evidence/README.md#prepaid-ledger-on-testnet", label: "Replay and API evidence"},
    {title: "Recurring mandates", text: "The buyer authorizes a mandate once; billing follows its periods and limits. The recorded two-minute-period test checks an early second charge (not_due), a later valid charge, an expired mandate (mandate_expired), and revocation with allowance zero. The testnet CI workflow also exercises recurring billing.", source: FILE + "docs/evidence/testnet/2026-10-01T034500-recurring-end-to-end.json", label: "Recurring testnet record"},
    {title: "A concrete x402 binding", text: "The gateway documents /supported, /verify and /settle for x402 v2 batch-settlement on Stellar. Authenticated verification and settlement use buyer-signed commitments against prepaid funds. Admission and later onchain batch inclusion are separate steps.", source: FILE + "docs/api/x402.md", label: "x402 facilitator reference"},
  ],
  boundary: "This record concerns Stellar testnet. It does not establish a production Mainnet release, an independent security audit or universal fee-free operation. The prepaid-ledger flow uses treasury custody and treasury-authorized withdrawals; the repository also describes a distinct vault flow, which should not be conflated with it.",
  next: "The October 26 thread names onchain risk monitoring/alerts and an ecosystem-partner testnet integration as work being closed out. That announcement does not establish completion of either item or identify the partner.",
};

export const FERMAH_PAY_NOTES = [
  {k: "fermah pay stellar testnet tranche one live status usdc prepaid ledger treasury deposit buyer fees gas xlm платежи тестнет",
   t: `${FERMAH_PAY.summary} ${FERMAH_PAY.steps.map(s=>s.text).join(" ")} ${FERMAH_PAY.boundary}`, src: FILE + "README.md"},
  {k: "fermah pay 98 duplicate charges replay double charge idempotency created false error 110 fee bump buyer fees повтор списания",
   t: `${FERMAH_PAY.findings[0].text} ${FERMAH_PAY.findings[1].text} The replay evidence is dated September 29, 2026; the thread discussing it was published October 26. Network fees are sponsored, not absent.`, src: FERMAH_PAY.findings[0].source},
  {k: "fermah pay recurring subscriptions mandate period not_due mandate_expired revoked allowance ci регулярные подписки",
   t: `${FERMAH_PAY.findings[2].text} These are testnet/CI cases; no production subscription deployment is established.`, src: FERMAH_PAY.recurring},
  {k: "fermah pay x402 difference protocol product facilitator verify settle supported batch settlement stellar compatibility agent api payment разница",
   t: `${FERMAH_PAY.findings[3].text} x402 is a payment protocol; Fermah Pay is the product implementing this documented Stellar binding. The older October 16 architecture post alone did not establish that implementation; the current official repository now documents it. Atlas's proofmarket-x402 remains a separate community reference model with modelled signing and settlement.`, src: FERMAH_PAY.x402},
  {k: "fermah pay october 26 announcement next monitoring alerts ecosystem partner integration video walkthrough sevenwealth 7wealthh",
   t: `In the October 26, 2026 @7wealthh thread, Tranche 1 is described as live on Stellar testnet with 98 duplicate charge requests producing no double charge and no buyer-paid network fee. ${FERMAH_PAY.next} The thread is an announcement; Atlas did not rerun the transactions or perform a security audit.`, src: FERMAH_PAY.announcement},
].map(note=>({...note,checked:FERMAH_PAY.checked,evidence:"checked"}));
