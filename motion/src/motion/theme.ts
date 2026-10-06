/* Fermah Atlas — motion reel tokens.
   110 BPM: a beat is 16.36 frames at 30fps, a bar 65.45. Every cut sits on a
   bar, so each new idea lands on a downbeat — one every 2.2 s. */
export const FPS = 30;
export const BEAT = 16.3636;
export const BAR = 65.4545;
export const bar = (n: number) => Math.round(n * BAR);
export const DURATION = bar(12);          // 786 frames ≈ 26.2 s

export const NAVY = "#001030";
export const NAVY_2 = "#04183a";
export const TEAL = "#06C19D";
export const WHITE = "#FFFFFF";
export const GRAY = "#808898";
export const DIM = "#55627F";
export const FAINT = "#37456A";
export const RULE = "#16233D";

export const DISPLAY = '"Space Grotesk", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';
