"use client";

import { useEffect, useRef } from "react";

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; hot: boolean };

const HOT = "#A0694A"; // clay — the site's one accent

/**
 * "Fungibl" as a dot matrix. Dots scatter away from the pointer and spring
 * back; a few glow clay while displaced. Idle when nothing is moving.
 */
export function DotWordmark({ text = "Fungibl", className = "" }: { text?: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const canvas = cvs.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let INK = getComputedStyle(box).color || "#20201E";
    let dots: Dot[] = [];
    let step = 10;
    let r = 4;
    let W = 0;
    let H = 0;
    let raf = 0;
    const ptr = { x: -9999, y: -9999, active: false };

    const build = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = box.clientWidth;
      step = W < 640 ? 6.5 : W < 1100 ? 9 : 11;
      r = step * 0.42;

      // Render the word large on an offscreen canvas, then sample it on a grid.
      const family = getComputedStyle(box).fontFamily || "Arial";
      const off = document.createElement("canvas");
      const octx = off.getContext("2d", { willReadFrequently: true })!;
      let size = 100;
      const setFont = () => {
        octx.font = `560 ${size}px ${family}`;
        if ("letterSpacing" in octx) (octx as unknown as { letterSpacing: string }).letterSpacing = `${-size * 0.06}px`;
      };
      setFont();
      const w100 = octx.measureText(text).width;
      size = (100 * W) / w100;
      setFont();
      const m = octx.measureText(text);
      const asc = m.actualBoundingBoxAscent;
      const desc = m.actualBoundingBoxDescent;
      const left = m.actualBoundingBoxLeft;
      const tw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const scale = W / tw;
      H = Math.ceil((asc + desc) * scale) + Math.ceil(step);

      off.width = Math.ceil(W);
      off.height = Math.ceil(H);
      octx.setTransform(scale, 0, 0, scale, 0, 0);
      setFont();
      octx.fillStyle = "#000";
      octx.textBaseline = "alphabetic";
      octx.fillText(text, left, asc + step / 2 / scale);
      const data = octx.getImageData(0, 0, off.width, off.height).data;

      dots = [];
      for (let y = step / 2; y < off.height; y += step) {
        for (let x = step / 2; x < off.width; x += step) {
          const a = data[(Math.floor(y) * off.width + Math.floor(x)) * 4 + 3];
          if (a > 110) dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, hot: Math.random() < 0.16 });
        }
      }

      canvas.width = Math.ceil(W * dpr);
      canvas.height = Math.ceil(H * dpr);
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const lim = step * 0.9;
      ctx.fillStyle = INK;
      ctx.beginPath();
      for (const d of dots) {
        const off = Math.abs(d.x - d.hx) + Math.abs(d.y - d.hy);
        if (d.hot && off > lim) continue;
        ctx.moveTo(d.x + r, d.y);
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = HOT;
      ctx.beginPath();
      for (const d of dots) {
        const off = Math.abs(d.x - d.hx) + Math.abs(d.y - d.hy);
        if (!d.hot || off <= lim) continue;
        ctx.moveTo(d.x + r, d.y);
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    };

    const tick = () => {
      const R = step * 9;
      let moving = false;
      for (const d of dots) {
        if (ptr.active) {
          const dx = d.x - ptr.x;
          const dy = d.y - ptr.y;
          const dist = Math.hypot(dx, dy);
          if (dist < R && dist > 0.01) {
            const f = Math.pow(1 - dist / R, 2) * step * 1.35;
            // push outward, with a little sideways jitter so it shatters rather than rings
            const j = (Math.random() - 0.5) * f * 0.9;
            d.vx += (dx / dist) * f - (dy / dist) * j;
            d.vy += (dy / dist) * f + (dx / dist) * j;
          }
        }
        d.vx += (d.hx - d.x) * 0.045;
        d.vy += (d.hy - d.y) * 0.045;
        d.vx *= 0.8;
        d.vy *= 0.8;
        d.x += d.vx;
        d.y += d.vy;
        if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02 || Math.abs(d.x - d.hx) + Math.abs(d.y - d.hy) > 0.1) moving = true;
        else {
          d.x = d.hx;
          d.y = d.hy;
        }
      }
      draw();
      raf = moving || ptr.active ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      ptr.x = e.clientX - b.left;
      ptr.y = e.clientY - b.top;
      ptr.active = true;
      kick();
    };
    const onLeave = () => {
      ptr.active = false;
      ptr.x = ptr.y = -9999;
      kick();
    };

    let built = false;
    const ro = new ResizeObserver(() => {
      if (Math.abs(box.clientWidth - W) > 1 || !built) {
        built = true;
        build();
      }
    });
    document.fonts?.ready.then(() => {
      ro.observe(box);
    });

    const onTheme = () => {
      requestAnimationFrame(() => {
        INK = getComputedStyle(box).color || INK;
        draw();
      });
    };
    window.addEventListener("fungibl-theme", onTheme);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && onLeave());
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("fungibl-theme", onTheme);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return (
    <div ref={wrap} className={`font-sans text-ink ${className}`}>
      <canvas ref={cvs} role="img" aria-label={text} className="block w-full touch-pan-y" />
    </div>
  );
}
