import React from "react";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {Eyebrow} from "../components/Type";
import {DISPLAY, MONO, DIM, FAINT, GRAY, NAVY_2, RULE, TEAL, WHITE} from "../theme";

const Q = "What is Kernel?";
const A =
  "Kernel is what Fermah calls the Protocol Agency Engine. It observes a verifiable event, " +
  "runs the logic in a sandboxed container and settles the result on-chain.";
const REFUSED = "What's the token price?";

/** 34 - 38 s. The shark, and the fence around it. */
export const Assistant: React.FC = () => {
  const frame = useCurrentFrame();
  const shark = String(frame % 24).padStart(3, "0");   // 24 frames, deterministic

  const typedQ = Math.round(interpolate(frame, [10, 34], [0, Q.length], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
  const answer = interpolate(frame, [40, 52], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const refuse = interpolate(frame, [72, 84], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const bubble: React.CSSProperties = {
    fontFamily: MONO, fontSize: 19, lineHeight: 1.6, padding: "16px 20px",
    border: `1px solid ${RULE}`, background: "rgba(0,16,48,.6)", color: GRAY,
  };

  return (
    <AbsoluteFill style={{padding: "0 130px", justifyContent: "center"}}>
      <div style={{display: "grid", gridTemplateColumns: "1fr 420px", gap: 70, alignItems: "center"}}>
        <div style={{display: "flex", flexDirection: "column", gap: 22}}>
          <Eyebrow>ASK THE SHARK</Eyebrow>
          <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, letterSpacing: "-0.03em", marginBottom: 8, color: WHITE}}>
            Answers only from the <span style={{color: TEAL}}>official docs</span>.
          </div>

          <div style={{...bubble, background: "rgba(6,193,157,.12)", borderColor: "rgba(6,193,157,.3)", color: WHITE, alignSelf: "flex-start"}}>
            {Q.slice(0, typedQ)}
            <span style={{opacity: frame % 16 < 8 ? 1 : 0.15}}>_</span>
          </div>

          <div style={{...bubble, opacity: answer}}>
            {A}
            <div style={{marginTop: 10, color: TEAL, fontSize: 15, letterSpacing: "0.12em"}}>source ↗</div>
          </div>

          <div style={{...bubble, opacity: refuse, borderColor: "#3a2440", color: DIM}}>
            <span style={{color: "#8f6f86"}}>{REFUSED}</span>
            <div style={{marginTop: 8}}>I only answer questions about Fermah.</div>
          </div>
        </div>

        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 26}}>
          <div style={{background: NAVY_2, border: `1px solid ${RULE}`, padding: 24}}>
            <Img src={staticFile(`shark/${shark}.png`)} style={{width: 300, display: "block"}} />
          </div>
          <div style={{fontFamily: MONO, fontSize: 14, letterSpacing: "0.18em", color: FAINT, textAlign: "center", lineHeight: 1.8}}>
            NO PRICES · NO PROMISES<br />NO PROMPT INJECTION
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
