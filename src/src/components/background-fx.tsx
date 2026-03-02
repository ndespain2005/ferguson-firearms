"use client";

import { useEffect, useRef } from "react";

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  life: number;
};

export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const spawn = (n: number) => {
      for (let i = 0; i < n; i++) {
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight + Math.random() * 120;
        const r = 0.8 + Math.random() * 2.6;
        const vx = (-0.15 + Math.random() * 0.3) * (0.7 + Math.random() * 1.2);
        const vy = -(0.35 + Math.random() * 1.35) * (0.8 + Math.random() * 1.2);
        const a = 0.08 + Math.random() * 0.22;
        const life = 240 + Math.floor(Math.random() * 260);
        embersRef.current.push({ x, y, vx, vy, r, a, life });
      }
    };

    // initial field
    spawn(240);

    const step = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // mild glow accumulation
      ctx.globalCompositeOperation = "lighter";

      const embers = embersRef.current;

      // top up embers
      if (!prefersReduced && embers.length < 280) spawn(16);

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 1;

        // drift + flicker
        e.vx += (-0.006 + Math.random() * 0.012);
        e.vx = Math.max(-0.4, Math.min(0.4, e.vx));

        const flicker = 0.75 + Math.random() * 0.5;
        const alpha = e.a * Math.max(0, Math.min(1, e.life / 180)) * flicker;

        // draw ember
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 9);
        g.addColorStop(0, `rgba(255,80,80,${alpha})`);
        g.addColorStop(0.35, `rgba(255,0,0,${alpha * 0.55})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 9, 0, Math.PI * 2);
        ctx.fill();

        // cull
        if (e.life <= 0 || e.y < -180 || e.x < -200 || e.x > window.innerWidth + 200) {
          embers.splice(i, 1);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = window.requestAnimationFrame(step);
    };

    if (!prefersReduced) {
      rafRef.current = window.requestAnimationFrame(step);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="ff-bgfx" aria-hidden="true">
      <canvas ref={canvasRef} className="ff-embers" />
      <div className="ff-scanline" />
      <div className="ff-watermark" />
    </div>
  );
}
