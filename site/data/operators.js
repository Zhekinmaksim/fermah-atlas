/* Fermah Atlas — prover node registry.
   Filled by tools/fetch_operators.py from the on-chain AVS registration events.
   Empty until the service manager address is confirmed — nothing here is guessed. */
window.OPERATORS = {
  network: null,          // e.g. "sepolia"
  service_manager: null,  // address from fermah-xyz/avs-metadata
  fetched: null,          // ISO date of the last read
  rows: []                // [{address, registered, label}]
};
