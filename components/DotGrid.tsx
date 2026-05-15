"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-reactive dot grid background.
 *
 * Renders a fixed-position canvas behind all content. The grid pattern offsets
 * itself based on window.scrollY so it appears to scroll with the page rather
 * than sit static behind it. Cursor reactivity remains in viewport coords.
 */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Cursor state. `target` is where the mouse is; `pos` lerps toward it
    // every frame for buttery motion even with sparse mouse events.
    const target = { x: -9999, y: -9999 };
    const pos = { x: -9999, y: -9999 };
    let scrollY = 0;
    let raf = 0;

    const SPACING = 28;
    const RADIUS_BASE = 0.85;
    const RADIUS_MAX = 2.8;
    const ALPHA_BASE = 0.06;
    const ALPHA_PEAK = 0.78;
    const INFLUENCE = 240;
    const INFLUENCE_SQ = INFLUENCE * INFLUENCE;

    // Top safe zone — fade dots out under the nav so they don't compete with
    // the section/wordmark text. Linear ramp in viewport space.
    // Sized to match the sticky nav (~58–64px tall) plus a small fade.
    const SAFE_TOP_FULL = 64;
    const SAFE_TOP_FADE = 28;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Vertical phase offset so the grid appears to scroll with the page.
      // Modulo by SPACING keeps the visible pattern infinitely tiled.
      const yPhase = -scrollY % SPACING;

      for (let x = SPACING / 2; x < w; x += SPACING) {
        for (
          let y = SPACING / 2 + yPhase;
          y < h + SPACING;
          y += SPACING
        ) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const dSq = dx * dx + dy * dy;

          let t = 0;
          if (dSq < INFLUENCE_SQ) {
            const d = Math.sqrt(dSq);
            t = 1 - d / INFLUENCE;
            t = t * t;
          }

          // Top safe-zone mask: 0 above SAFE_TOP_FULL, ramps to 1 by
          // SAFE_TOP_FULL + SAFE_TOP_FADE. y here is already in viewport
          // coords because the canvas is fixed-positioned.
          let topMask = 1;
          if (y < SAFE_TOP_FULL) {
            topMask = 0;
          } else if (y < SAFE_TOP_FULL + SAFE_TOP_FADE) {
            topMask = (y - SAFE_TOP_FULL) / SAFE_TOP_FADE;
          }
          if (topMask === 0) continue;

          const r = RADIUS_BASE + (RADIUS_MAX - RADIUS_BASE) * t;
          const alpha = (ALPHA_BASE + (ALPHA_PEAK - ALPHA_BASE) * t) * topMask;

          // Blend white -> cyan (#22d3ee) as t increases
          const rcol = Math.round(255 + (34 - 255) * t);
          const gcol = Math.round(255 + (211 - 255) * t);
          const bcol = Math.round(255 + (238 - 255) * t);

          ctx.fillStyle = `rgba(${rcol},${gcol},${bcol},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const onLeave = () => {
      target.x = -9999;
      target.y = -9999;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    onScroll();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
