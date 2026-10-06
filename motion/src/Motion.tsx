import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {ATLAS_WORD, FERMAH_WORD, PI_GRID} from "./grids";
import {Count, Label, Pixels, Slam, Stage} from "./motion/kit";
import {
  BAR,
  BEAT,
  DIM,
  DISPLAY,
  DURATION,
  FAINT,
  GRAY,
  MONO,
  NAVY,
  NAVY_2,
  RULE,
  TEAL,
  WHITE,
  bar,
} from "./motion/theme";

const PAD = 110;
const CARDS = [
  "0x_angelarts", "bruno_jr_talent", "cd_sh51200", "eam__sha", "mr_satoshiii", "newko20110815",
  "oxkimia", "sah4r_core", "sarcastic_au", "shantelledore", "sn0wflakk", "themoewithin",
];

/* 1 — the mark assembles out of nothing */
const Open: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = interpolate(f, [2, 34], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const push = interpolate(f, [34, 64], [0, -40], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage flash={false}>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <div style={{transform: `translateY(${push}px)`}}>
          <Pixels grid={PI_GRID} cell={26} reveal={reveal} />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 2 — the name lands */
const Name: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  return (
    <Stage>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 34}}>
        <div style={{display: "flex", alignItems: "center", gap: 26}}>
          <Pixels grid={FERMAH_WORD} cell={9} reveal={r} color={WHITE} />
          <Pixels grid={ATLAS_WORD} cell={9} reveal={r} color={TEAL} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 19, letterSpacing: "0.3em", color: DIM}}>
          UNOFFICIAL COMMUNITY ARCHIVE
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 3 — the size of the thing, counted up on the beat */
const Numbers: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 26}}>
      <Label>THE ARCHIVE</Label>
      <div style={{display: "flex", alignItems: "baseline", gap: 60, flexWrap: "wrap"}}>
        <span><Count to={22} size={150} /><span style={{fontFamily: MONO, fontSize: 20, color: DIM, marginLeft: 14}}>WEEKS</span></span>
        <span><Count to={136} size={150} delay={4} /><span style={{fontFamily: MONO, fontSize: 20, color: DIM, marginLeft: 14}}>CREATORS</span></span>
      </div>
      <div style={{display: "flex", gap: 60}}>
        <span><Count to={84} size={72} delay={8} /><span style={{fontFamily: MONO, fontSize: 16, color: DIM, marginLeft: 12}}>SELECTED</span></span>
        <span><Count to={187} size={72} delay={12} /><span style={{fontFamily: MONO, fontSize: 16, color: DIM, marginLeft: 12}}>MENTIONED</span></span>
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 4 — who runs on it, three chips one per beat */
const RunsOnIt: React.FC = () => {
  const f = useCurrentFrame();
  const items = [["Kernel", "ENGINE"], ["Froben", "PROOF MARKET"], ["Flashcast", "MARKETS"]];
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 34}}>
        <Label>POWERED BY FERMAH</Label>
        <Slam text="Who runs on it." size={104} />
        <div style={{display: "flex", gap: 18, marginTop: 8}}>
          {items.map(([n, k], i) => {
            const t = interpolate(f - 14 - i * BEAT * 0.6, [0, 7], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div key={n} style={{
                opacity: t, transform: `translateY(${(1 - t) * 20}px)`,
                border: `1px solid ${RULE}`, background: NAVY_2, padding: "20px 28px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
              }}>
                <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: WHITE}}>{n}</div>
                <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: "0.2em", color: TEAL, marginTop: 8}}>{k}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 5 — and who makes the proofs */
const Supply: React.FC = () => {
  const f = useCurrentFrame();
  const steps = ["KEYS", "WHITELIST", "EIGENLAYER", "TELEMETRY"];
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 30}}>
        <Label>OPERATORS</Label>
        <Slam text="And who makes" size={96} />
        <Slam text="the proofs." size={96} color={TEAL} delay={5} />
        <div style={{display: "flex", gap: 14, marginTop: 10}}>
          {steps.map((s, i) => {
            const t = interpolate(f - 18 - i * 6, [0, 6], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div key={s} style={{
                opacity: t, fontFamily: MONO, fontSize: 15, letterSpacing: "0.18em",
                color: GRAY, border: `1px solid ${RULE}`, padding: "12px 18px",
              }}>{String(i + 1).padStart(2, "0")} · {s}</div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 6 — the wall of cards, moving */
const Wall: React.FC<{phase?: number}> = ({phase = 0}) => {
  const f = useCurrentFrame();
  const span = 6 * (470 + 20);
  const row = (speed: number, off: number, rev: boolean) => {
    const t = (f * speed + off) % span;
    return rev ? t - span : -t;
  };
  const strip = (list: string[], speed: number, off: number, rev: boolean) => (
    <div style={{display: "flex", gap: 20, transform: `translateX(${row(speed, off, rev)}px)`, width: "max-content"}}>
      {[...list, ...list].map((h, i) => (
        <Img key={`${h}-${i}`} src={staticFile(`cards/${h}.png`)}
             style={{width: 470, border: `1px solid ${RULE}`, display: "block", opacity: 0.8}} />
      ))}
    </div>
  );
  return (
    <Stage>
      <AbsoluteFill style={{justifyContent: "center", gap: 20}}>
        {strip(CARDS.slice(0, 6), 9, phase * 700, false)}
        {strip(CARDS.slice(6), 7, 300 + phase * 500, true)}
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: `linear-gradient(90deg, ${NAVY} 0%, transparent 14%, transparent 86%, ${NAVY} 100%)`,
      }} />
      <AbsoluteFill style={{padding: PAD, justifyContent: "flex-end", paddingBottom: 90}}>
        <Slam text={phase ? "Five selected. Twenty mentioned. Every week." : "136 creators, archived."}
              size={phase ? 60 : 74} />
      </AbsoluteFill>
    </Stage>
  );
};

/* 7 — the personal page, typed out */
const Page: React.FC = () => {
  const f = useCurrentFrame();
  const handle = "nyuella";
  const typed = Math.round(interpolate(f - 10, [0, 26], [0, handle.length], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 30}}>
        <Label>EVERY CREATOR HAS A PAGE</Label>
        <div style={{display: "flex", alignItems: "baseline", fontFamily: DISPLAY, fontWeight: 700, fontSize: 86, letterSpacing: "-0.022em"}}>
          <span style={{color: WHITE}}>fermahatlas.xyz/c/</span>
          <span style={{color: TEAL}}>
            {handle.slice(0, typed)}
            <span style={{opacity: f % 14 < 7 ? 1 : 0.15}}>_</span>
          </span>
        </div>
        <div style={{fontFamily: MONO, fontSize: 19, letterSpacing: "0.18em", color: GRAY}}>
          POST IT AND X UNFURLS YOUR CARD
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 8 — the shark, and the fence around it */
const Shark: React.FC = () => {
  const f = useCurrentFrame();
  const n = String(f % 24).padStart(3, "0");
  const refuse = interpolate(f, [32, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center"}}>
        <div style={{display: "grid", gridTemplateColumns: "1fr 320px", gap: 70, alignItems: "center"}}>
          <div style={{display: "flex", flexDirection: "column", gap: 22}}>
            <Label>ASK THE SHARK</Label>
            <Slam text="Only from the docs." size={86} color={WHITE} />
            <div style={{
              opacity: refuse, fontFamily: MONO, fontSize: 19, color: DIM,
              border: "1px solid #3a2440", padding: "16px 20px", background: "rgba(0,16,48,.6)",
            }}>
              “what’s the token price?” → I only answer questions about Fermah.
            </div>
          </div>
          <Img src={staticFile(`shark/${n}.png`)} style={{width: 320, display: "block"}} />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 9 — the hard light switch, one bar only */
const Switch: React.FC = () => (
  <Stage invert>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 16}}>
      <Slam text="Every week." size={150} color={NAVY} />
      <div style={{fontFamily: MONO, fontSize: 21, letterSpacing: "0.2em", color: "rgba(0,16,48,.7)"}}>
        NEW SPOTLIGHT, SAME DAY
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 10 — twenty-two weeks filling in */
const Weeks: React.FC = () => {
  const f = useCurrentFrame();
  const n = 22;
  const filled = interpolate(f, [4, 46], [0, n], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 30}}>
        <Label>SEASON 01</Label>
        <div style={{display: "flex", gap: 10}}>
          {Array.from({length: n}).map((_, i) => {
            const on = i < filled;
            const h = on ? 150 : 30;
            return <div key={i} style={{
              flex: 1, height: h, alignSelf: "flex-end",
              background: on ? (i === n - 1 ? WHITE : TEAL) : "#22314F",
            }} />;
          })}
        </div>
        <div style={{fontFamily: MONO, fontSize: 17, letterSpacing: "0.18em", color: FAINT}}>
          EVERY ANNOUNCEMENT, DATED AND LINKED
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 11 — the end card */
const End: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  const o = interpolate(f, [22, 34], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const out = interpolate(f, [52, 65], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage flash={false}>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 40, opacity: out}}>
        <div style={{display: "flex", alignItems: "center", gap: 26}}>
          <Pixels grid={FERMAH_WORD} cell={10} reveal={r} color={WHITE} />
          <Pixels grid={ATLAS_WORD} cell={10} reveal={r} color={TEAL} />
        </div>
        <div style={{opacity: o, fontFamily: MONO, fontSize: 32, letterSpacing: "0.22em", color: TEAL}}>
          FERMAHATLAS.XYZ
        </div>
        <div style={{opacity: o, fontFamily: MONO, fontSize: 19, letterSpacing: "0.2em", color: DIM}}>
          @FERMAH_ATLAS · BUILT BY @0MAXXDEV
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/** Standing credit from bar 2 onwards, so the address is never off screen. */
const Tag: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [bar(2), bar(2) + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const out = interpolate(f, [bar(11) - 14, bar(11)], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{
      position: "absolute", right: 56, bottom: 44, opacity: o * out, textAlign: "right",
      fontFamily: MONO, fontSize: 16, letterSpacing: "0.2em",
    }}>
      <div style={{color: TEAL}}>FERMAHATLAS.XYZ</div>
      <div style={{color: DIM, marginTop: 6}}>@FERMAH_ATLAS</div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const scenes: [React.FC, number, number][] = [
    [Open, 0, 1], [Name, 1, 1], [Numbers, 2, 1], [RunsOnIt, 3, 1],
    [Supply, 4, 1], [Wall, 5, 1], [Page, 6, 1], [Shark, 7, 1],
    [Switch, 8, 1], [Weeks, 9, 1], [End, 11, 1],
  ];
  return (
    <AbsoluteFill style={{backgroundColor: NAVY}}>
      <Audio src={staticFile("motion.mp3")} />
      {scenes.map(([C, from, len], i) => (
        <Sequence key={i} from={bar(from)} durationInFrames={bar(from + len) - bar(from)} name={C.name}>
          <C />
        </Sequence>
      ))}
      <Sequence from={bar(10)} durationInFrames={bar(11) - bar(10)} name="WallB">
        <Wall phase={1} />
      </Sequence>
      <Tag />
    </AbsoluteFill>
  );
};
