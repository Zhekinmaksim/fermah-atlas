export const CHECKED = "2026-10-26";
export const DOCS = "https://docs.fermah.xyz/network/mainnet";
export const OPERATOR_GUIDE = [
  {
    k: "run prover node operator onboarding installation mainnet whitelist assigned name keys machine secret registration eigenlayer el",
    t: "The current Mainnet docs route operators through whitelisting a Mainnet Ethereum public address with Fermah, obtaining the assigned prover-node name, installation, configuration, a machine secret, registration, telemetry and startup. Ethereum Mainnet RPC access is required. Registration uses --el only when an already-registered EigenLayer operator wishes to participate as an EigenLayer operator, using the same operator identity key. Keep private keys and machine secrets private; Atlas never collects them. Use the official guide for exact commands.",
    src: `${DOCS}/installation`, checked: CHECKED,
  },
  {
    k: "node software ubuntu linux cuda glibc docker nvidia container toolkit rootless amd64 requirements",
    t: "The Mainnet installation docs list amd64 profiles: Ubuntu 22.04 LTS with CUDA 12.2 and GLIBC 2.34+, and Ubuntu 24.04 LTS with CUDA 12.9 and GLIBC 2.39+. These CUDA versions are not NVIDIA driver release numbers. Both NVIDIA drivers and CUDA toolkit are needed. Root Docker v24+ is used for telemetry; rootless Docker v24+ for prover containers, with NVIDIA Container Toolkit configured for rootless Docker. Other Linux distributions need compatible GLIBC.",
    src: `${DOCS}/installation`, checked: CHECKED,
  },
  {
    k: "hardware gpu vram cpu ram ssd zksync circuit prover cp witness generator wgc requirements minimum contradiction",
    t: "The Provers page lists ZKsync Circuit Prover at 32 vCPU, 128 GB RAM, 24 GB GPU VRAM and 375 GB SSD, and CPU Witness Generator all at 32 vCPU, 128 GB RAM. The Mainnet Overview instead lists 16 vCPU/64 GB RAM for both roles; the CP VRAM/SSD figures agree. The sources do not resolve which CPU/RAM minimum governs. Confirm the assigned profile with Fermah before choosing hardware. WGC includes a compressor requiring at least 24 GB GPU memory, so witness-round CPU figures alone do not describe a complete WGC machine.",
    src: `${DOCS}/provers`, checked: CHECKED,
  },
  {
    k: "witness round basic circuits leaf node aggregation recursion tip scheduler hardware",
    t: "The Provers page gives CPU witness-round profiles: basic_circuits 16 vCPU/32 GB RAM; leaf_aggregation 16/80 GB; node_aggregation 8/4 GB; recursion_tip 4/1 GB; scheduler 4/1 GB. Those CPU/RAM values agree with the Mainnet Overview. They are individual rounds, not a complete WGC hardware specification, and no disk minimum is stated for those rows.",
    src: `${DOCS}/provers`, checked: CHECKED,
  },
  {
    k: "multiple gpu multi gpu instances home machine secret independent registration container pinning",
    t: "Multi-GPU Setup describes one prover-node instance/container per GPU, each with a separate Fermah home directory, unique machine secret, independent registration and explicit GPU pinning. Its examples mount /var/run/docker.sock and use root systemd services; the guide does not explain how those examples relate to the rootless prover-container requirement. Follow the assigned setup and confirm the container context with Fermah.",
    src: `${DOCS}/multi-gpu-setup`, checked: CHECKED,
  },
  {
    k: "telemetry metrics monitoring sidecar prometheus node start fpn mainnet",
    t: "Telemetry uses an OpenTelemetry collector alongside the prover node. The installation guide uses root Docker for telemetry and rootless Docker for prover containers. Operators may configure collectors of their own. Explorer connection and task counters are a dated snapshot, not an uptime SLA or Atlas measurement.",
    src: `${DOCS}/installation`, checked: CHECKED,
  },
  {
    k: "operator requirements stake bandwidth uptime sla minimum",
    t: "The Mainnet Overview, Installation, Provers, Registration and Multi-GPU Setup pages checked on October 26 do not establish a universal stake minimum, bandwidth minimum or uptime SLA. This does not establish that no such conditions exist; confirm the operator terms with Fermah.",
    src: DOCS, checked: CHECKED,
  },
];
