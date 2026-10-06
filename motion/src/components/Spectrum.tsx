import React from "react";
import {useAudioData, visualizeAudio} from "@remotion/media-utils";
import {staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {TEAL} from "../theme";

/**
 * Mirrored audio spectrum — the shape 4.0.518 added to the Elements catalog,
 * built here from visualizeAudio so it stays inside the brand: square pixels,
 * one colour, no gradients.
 */
export const Spectrum: React.FC<{bars?: number; height?: number; opacity?: number}> = ({
  bars = 48,
  height = 130,
  opacity = 0.85,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audioData = useAudioData(staticFile("audio.mp3"));
  if (!audioData) return null;

  const values = visualizeAudio({fps, frame, audioData, numberOfSamples: 64}).slice(0, bars);

  return (
    <div style={{display: "flex", alignItems: "center", gap: 6, height, opacity}}>
      {values.map((v, i) => {
        const h = Math.max(4, Math.min(height, v * height * 5.5));
        return (
          <div key={i} style={{width: 6, display: "flex", flexDirection: "column", gap: 3}}>
            <div style={{height: h / 2, background: TEAL, opacity: 0.9, alignSelf: "flex-end", width: "100%"}} />
            <div style={{height: h / 2, background: TEAL, opacity: 0.35, width: "100%"}} />
          </div>
        );
      })}
    </div>
  );
};
