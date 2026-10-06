/* Brand tokens lifted straight from the official Fermah kit. */
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

/* 120 BPM: a beat is 15 frames at 30fps, a bar is 60. The drop in the audio
   sits exactly on frame 240, and every cut below is a multiple of a bar. */
export const FPS = 30;
export const BEAT = 16.36;   // 110 BPM
export const BAR = 65.45;
export const DROP = 262;     // the lift in the track, on bar 4

/* 45 s = 1350 frames. The track runs at 110 BPM, so a beat is 16.36 frames and
   a bar 65.45; every boundary below sits on a beat, and the lift in the music
   lands on frame 262. */
export const SCENES = {
  intro:     {from: 0,    durationInFrames: 262},   // 0.0s - 8.7s
  title:     {from: 262,  durationInFrames: 131},   // 8.7s - 13.1s
  doors:     {from: 393,  durationInFrames: 163},   // 13.1s - 18.5s
  graph:     {from: 556,  durationInFrames: 131},   // 18.5s - 22.9s
  operators: {from: 687,  durationInFrames: 131},   // 22.9s - 27.3s
  wall:      {from: 818,  durationInFrames: 131},   // 27.3s - 31.6s
  card:      {from: 949,  durationInFrames: 131},   // 31.6s - 36.0s
  assistant: {from: 1080, durationInFrames: 131},   // 36.0s - 40.4s
  updates:   {from: 1211, durationInFrames: 65},   // 40.4s - 42.5s
  end:       {from: 1276, durationInFrames: 74},   // 42.5s - 45.0s
};
