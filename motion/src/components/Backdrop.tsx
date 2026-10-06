import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {FAINT, NAVY, TEAL} from "../theme";

/** The brand grid plus the 45-degree sweep from the logo, moving on the beat. */
export const Backdrop: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const step = 44;
  const sweep = ((frame * 6) % 2600) - 400;

  return (
    <AbsoluteFill style={{backgroundColor: NAVY}}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(to right, ${FAINT}22 0 1px, transparent 1px ${step}px),
                            repeating-linear-gradient(to bottom, ${FAINT}22 0 1px, transparent 1px ${step}px)`,
          opacity: 0.55 * intensity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${sweep / 26}%, ${TEAL}14 ${
            sweep / 26 + 4
          }%, transparent ${sweep / 26 + 9}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 52% at 76% 22%, ${TEAL}1f, transparent 70%)`,
          opacity: intensity,
        }}
      />
    </AbsoluteFill>
  );
};
