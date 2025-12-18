import React, { useEffect, useRef } from "react";

function calcRms(u8) {
  let sumSq = 0;
  for (let i = 0; i < u8.length; i++) {
    const v = (u8[i] - 128) / 128;
    sumSq += v * v;
  }
  return Math.sqrt(sumSq / u8.length);
}

const Waveform = ({ audioData, width = 520, height = 120 }) => {
  const canvasRef = useRef(null);
  const levelRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const w = width;
    const h = height;
    const centerY = h / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!audioData || audioData.length === 0) return;

   
    const SILENCE_THRESHOLD = 0.01;
    const ATTACK = 0.35;
    const RELEASE = 0.08;
    const MAX_AMPLITUDE = h * 0.45;

    const rms = calcRms(audioData);
    const target =
      rms < SILENCE_THRESHOLD
        ? 0
        : Math.min(1, (rms - SILENCE_THRESHOLD) / (0.25 - SILENCE_THRESHOLD));

    let level = levelRef.current;
    if (target > level) level += (target - level) * ATTACK;
    else level += (target - level) * RELEASE;
    levelRef.current = level;

    if (level < 0.01) return;

    ctx.beginPath();

    const points = 90;
    const step = Math.max(1, Math.floor(audioData.length / points));

    for (let i = 0; i < points; i++) {
      const idx = i * step;
      const v = (audioData[idx] - 128) / 128;
      const x = (i / (points - 1)) * w;
      const y = centerY + v * MAX_AMPLITUDE * level;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, "rgba(56, 189, 248, 1)"); 
    gradient.addColorStop(0.5, "rgba(99, 102, 241, 1)"); 
    gradient.addColorStop(1, "rgba(37, 99, 235, 1)"); 

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(99, 102, 241, 0.3)";
    ctx.stroke();

    ctx.shadowBlur = 0;
  }, [audioData, width, height]);

  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-2xl"
    />
  );
};

export default Waveform;
