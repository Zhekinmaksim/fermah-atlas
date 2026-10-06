import React from "react";
import {AbsoluteFill} from "remotion";

/**
 * Social safe zones, the overlay added in 4.0.518. Off in renders — flip the
 * prop in Root.tsx while composing to check nothing important sits under a
 * platform's UI.
 */
export const SafeZones: React.FC<{show?: boolean}> = ({show = false}) => {
  if (!show) return null;
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <AbsoluteFill style={{border: "2px dashed #ff4d6d55", margin: "8%"}} />
      <AbsoluteFill style={{border: "2px dashed #ffd16655", margin: "5%"}} />
    </AbsoluteFill>
  );
};
