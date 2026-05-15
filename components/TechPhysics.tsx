"use client";

import { Database } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IoLogoTableau } from "react-icons/io5";
import {
  SiAlteryx,
  SiDatabricks,
  SiJupyter,
  SiKeras,
  SiNextdotjs,
  SiPandas,
  SiPython,
  SiR,
  SiReact,
  SiScikitlearn,
  SiSnowflake,
  SiTensorflow,
} from "react-icons/si";

interface PuckSpec {
  id: string;
  label: string;
  color: string;
  render: (size: number) => ReactNode;
}

const ICON_SIZE = 96;

/**
 * Custom Power BI mark — three vertical bars of increasing height. Power BI
 * was removed from simple-icons over trademark concerns; this is a hand-rolled
 * approximation. Uses `currentColor` so brand color is parent-driven.
 */
function PowerBILogo({ size = ICON_SIZE }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="14" width="4" height="7" rx="0.6" />
      <rect x="10" y="9" width="4" height="12" rx="0.6" />
      <rect x="17" y="3" width="4" height="18" rx="0.6" />
    </svg>
  );
}

/**
 * Custom Claude mark — 8-spoke asterisk burst, evoking Anthropic's official
 * starburst glyph. Uses `currentColor`.
 */
function ClaudeLogo({ size = ICON_SIZE }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <g>
        <rect x="11" y="3" width="2" height="18" rx="1" />
        <rect
          x="11"
          y="3"
          width="2"
          height="18"
          rx="1"
          transform="rotate(45 12 12)"
        />
        <rect
          x="11"
          y="3"
          width="2"
          height="18"
          rx="1"
          transform="rotate(90 12 12)"
        />
        <rect
          x="11"
          y="3"
          width="2"
          height="18"
          rx="1"
          transform="rotate(135 12 12)"
        />
      </g>
    </svg>
  );
}

/**
 * Excel mark — uses the official Microsoft 365 / Fluent PNG (saved to
 * /public from Shane's source). Rendered as an <img> rather than inline
 * SVG because the Fluent identity has multiple gradient layers that don't
 * round-trip cleanly to a hand-rolled path.
 */
function ExcelLogo({ size = ICON_SIZE }: { size?: number }) {
  return (
    <img
      src="/excel-icon.png"
      alt=""
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
}

const PUCKS: readonly PuckSpec[] = [
  {
    id: "python",
    label: "python",
    color: "#3776AB",
    render: (s) => <SiPython size={s} />,
  },
  {
    id: "r",
    label: "r",
    color: "#276DC3",
    render: (s) => <SiR size={s} />,
  },
  {
    id: "sql",
    label: "sql",
    color: "#EBE9E3",
    render: (s) => <Database size={s} strokeWidth={1.7} />,
  },
  {
    id: "jupyter",
    label: "jupyter",
    color: "#F37626",
    render: (s) => <SiJupyter size={s} />,
  },
  {
    id: "pandas",
    label: "pandas",
    color: "#E70488",
    render: (s) => <SiPandas size={s} />,
  },
  {
    id: "scikit-learn",
    label: "scikit-learn",
    color: "#F7931E",
    render: (s) => <SiScikitlearn size={s} />,
  },
  {
    id: "tensorflow",
    label: "tensorflow",
    color: "#FF6F00",
    render: (s) => <SiTensorflow size={s} />,
  },
  {
    id: "keras",
    label: "keras",
    color: "#D00000",
    render: (s) => <SiKeras size={s} />,
  },
  {
    id: "snowflake",
    label: "snowflake",
    color: "#29B5E8",
    render: (s) => <SiSnowflake size={s} />,
  },
  {
    id: "databricks",
    label: "databricks",
    color: "#FF3621",
    render: (s) => <SiDatabricks size={s} />,
  },
  {
    id: "tableau",
    label: "tableau",
    color: "#E97627",
    render: (s) => <IoLogoTableau size={s} />,
  },
  {
    id: "powerbi",
    label: "power bi",
    color: "#F2C811",
    render: (s) => <PowerBILogo size={s} />,
  },
  {
    id: "alteryx",
    label: "alteryx",
    color: "#0095BB",
    render: (s) => <SiAlteryx size={s} />,
  },
  {
    id: "excel",
    label: "excel",
    color: "#107C41",
    render: (s) => <ExcelLogo size={s} />,
  },
  {
    id: "react",
    label: "react",
    color: "#61DAFB",
    render: (s) => <SiReact size={s} />,
  },
  {
    id: "nextjs",
    label: "next.js",
    color: "#EBE9E3",
    render: (s) => <SiNextdotjs size={s} />,
  },
  {
    id: "claude",
    label: "claude code",
    color: "#D97757",
    render: (s) => <ClaudeLogo size={s} />,
  },
];

/* ── physics constants ──────────────────────────────────────────────────── */
const PUCK_RADIUS = 52;            // base collision radius at scale=1
// Reference dimensions: the desktop arena (~1000×500). Smaller arenas
// scale down both the icon size and the collision radius proportionally
// so every puck always has enough headroom to fit comfortably.
const REFERENCE_W = 1000;
const REFERENCE_H = 500;
const MIN_SCALE = 0.7;             // floor on icon scaling for tiny phones
const GRAVITY = 0.35;              // px / frame² downward — calmer fall
const DAMPING = 0.992;             // mild air drag
const WALL_BOUNCE = 0.32;          // low: icons thud against walls
const FLOOR_FRICTION = 0.88;       // sliding decay on the floor
const SLEEP_THRESHOLD = 1.1;       // |vy| below this snaps to rest
const COLLISION_RESTITUTION = 0.6; // slightly more bouncy than before
const COLLISION_FRICTION = 0.22;   // tangential damping at contact — without
                                   // this, circles slide off each other and
                                   // never stack. With it, pucks "grip" each
                                   // other and pile up like real objects.
const MAX_VELOCITY = 52;
const DRAG_THRESHOLD = 5;

interface PuckState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface DragState {
  puckIndex: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
}

/**
 * TechPhysics — gravity playground for the tech stack.
 *
 * Each tool is a brand-colored glyph (no container) that falls under gravity,
 * settles on the floor, and bounces off walls and other glyphs. The only
 * interaction is press-and-drag: pick a glyph up, move it, release with
 * momentum, watch it fall again. Hovering or holding a glyph glows it and
 * floats its name above the icon in its brand color.
 *
 * Hand-rolled physics, no engine. Renders via direct ref-based transform
 * writes so React state never thrashes during the animation loop. The
 * collision radius is intentionally smaller than the visible icon so stacks
 * read as "shapes touching" rather than "circles in invisible bubbles" —
 * a poor man's polygon collision.
 *
 * A11y: a hidden semantic <ul> mirrors the tool list for screen readers.
 */
export function TechPhysics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const puckElRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pucksRef = useRef<PuckState[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number>(0);
  const initializedRef = useRef(false);
  // Physics stays frozen until the arena scrolls into view. That way the
  // pucks start at the top of the box and visibly *drop* as the user
  // reveals the section — the motion itself is the "these are interactive"
  // signal. Set once via IntersectionObserver, never reset.
  const armedRef = useRef(false);
  // Runtime collision radius, derived from container size via the same
  // scale that drives icon size. Lives in a ref so the physics loop reads
  // it cheaply without going through React state.
  const puckRadiusRef = useRef(PUCK_RADIUS);

  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  // Visual scale factor for icons and puck wrapper sizing. Synced with
  // `puckRadiusRef` on resize so physics + rendering always agree.
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      // Derive a single scale factor from whichever dimension is tighter.
      // Capped at 1 (desktop reference) and floored at MIN_SCALE so pucks
      // never shrink to the point of unreadability.
      const wScale = rect.width / REFERENCE_W;
      const hScale = rect.height / REFERENCE_H;
      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(1, Math.min(wScale, hScale)),
      );
      puckRadiusRef.current = PUCK_RADIUS * nextScale;
      setScale((prev) =>
        Math.abs(prev - nextScale) > 0.005 ? nextScale : prev,
      );
      const r = puckRadiusRef.current;
      for (const p of pucksRef.current) {
        p.x = Math.max(r, Math.min(rect.width - r, p.x));
        p.y = Math.max(r, Math.min(rect.height - r, p.y));
      }
    };
    measure();

    // initial placement: grid sized so adjacent cells are guaranteed to
    // give pucks clearance (no overlap on first paint). Cells are slightly
    // larger than 2 * puckRadius so pucks fall freely before any collision
    // resolution kicks in.
    if (!initializedRef.current) {
      initializedRef.current = true;
      const { w } = sizeRef.current;
      const r = puckRadiusRef.current;
      const margin = r + 8;
      const cellPad = 16;
      const cellW = r * 2 + cellPad;
      const cellH = r * 2 + cellPad;
      const colsThatFit = Math.max(
        1,
        Math.floor((w - margin * 2) / cellW),
      );
      const cols = Math.min(PUCKS.length, colsThatFit);
      pucksRef.current = PUCKS.map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          x: margin + col * cellW + cellW / 2,
          y: margin + row * cellH,
          // Zero initial velocity so the pucks sit perfectly still until
          // the observer arms gravity. A tiny per-puck horizontal nudge
          // gets injected at arm-time below for natural drop variation.
          vx: 0,
          vy: 0,
        };
      });
    }

    const ro = new ResizeObserver(measure);
    ro.observe(container);

    // Arm physics when ~25% of the arena is in view. Threshold low enough
    // that the drop happens as the section reveals (not after it's already
    // fully on screen), high enough that scrolling fast past nearby
    // sections doesn't prematurely trigger it.
    const armObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            if (!armedRef.current) {
              armedRef.current = true;
              // Stagger initial horizontal nudges so pucks don't fall in
              // a perfectly uniform row.
              for (const p of pucksRef.current) {
                p.vx = (Math.random() - 0.5) * 1.6;
              }
            }
            armObserver.disconnect();
            return;
          }
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5] },
    );
    armObserver.observe(container);

    const tick = () => {
      const pucks = pucksRef.current;
      const { w, h } = sizeRef.current;
      const drag = dragRef.current;
      const r = puckRadiusRef.current; // current scaled collision radius

      // Physics is gated on `armedRef` — until the arena scrolls into view,
      // pucks sit motionless at their initial grid positions. The DOM
      // transform writes below still run every frame so the initial layout
      // paints correctly.
      if (armedRef.current) {
        for (let i = 0; i < pucks.length; i++) {
        const p = pucks[i];
        const isDragging = drag !== null && drag.puckIndex === i;
        if (isDragging) continue; // dragged puck position is set by pointer-move

        // gravity (the only ambient force)
        p.vy += GRAVITY;

        // mild air drag
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_VELOCITY) {
          p.vx = (p.vx / speed) * MAX_VELOCITY;
          p.vy = (p.vy / speed) * MAX_VELOCITY;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < r) {
          p.x = r;
          p.vx = -p.vx * WALL_BOUNCE;
        } else if (p.x > w - r) {
          p.x = w - r;
          p.vx = -p.vx * WALL_BOUNCE;
        }
        if (p.y < r) {
          p.y = r;
          p.vy = -p.vy * WALL_BOUNCE;
        } else if (p.y > h - r) {
          p.y = h - r;
          p.vy = -p.vy * WALL_BOUNCE;
          // floor friction + sleep so resting pucks don't jitter forever
          p.vx *= FLOOR_FRICTION;
          if (Math.abs(p.vy) < SLEEP_THRESHOLD) p.vy = 0;
        }
      }

      // pairwise collisions (O(n^2), 105 pairs for n=15 — trivial)
      for (let i = 0; i < pucks.length; i++) {
        for (let j = i + 1; j < pucks.length; j++) {
          const a = pucks[i];
          const b = pucks[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = r * 2;
          if (dist > 0 && dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            const aDrag = dragRef.current?.puckIndex === i;
            const bDrag = dragRef.current?.puckIndex === j;
            if (aDrag && !bDrag) {
              b.x += nx * overlap;
              b.y += ny * overlap;
            } else if (bDrag && !aDrag) {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
            } else if (!aDrag && !bDrag) {
              a.x -= nx * (overlap / 2);
              a.y -= ny * (overlap / 2);
              b.x += nx * (overlap / 2);
              b.y += ny * (overlap / 2);
            }

            // normal velocity exchange (the bounce)
            const va = a.vx * nx + a.vy * ny;
            const vb = b.vx * nx + b.vy * ny;
            const exchange = (vb - va) * COLLISION_RESTITUTION;
            if (!aDrag) {
              a.vx += exchange * nx;
              a.vy += exchange * ny;
            }
            if (!bDrag) {
              b.vx -= exchange * nx;
              b.vy -= exchange * ny;
            }

            // tangential friction at the contact point — without this, the
            // upper puck of a stack slides off the lower one and they spread
            // out instead of piling up. Scrubs a fraction of the relative
            // tangential velocity each frame they're in contact.
            const tx = -ny;
            const ty = nx;
            const tva = a.vx * tx + a.vy * ty;
            const tvb = b.vx * tx + b.vy * ty;
            const tFric = (tvb - tva) * COLLISION_FRICTION;
            if (!aDrag) {
              a.vx += tFric * tx;
              a.vy += tFric * ty;
            }
            if (!bDrag) {
              b.vx -= tFric * tx;
              b.vy -= tFric * ty;
            }
          }
        }
      }
      } // end armedRef gate

      for (let i = 0; i < pucks.length; i++) {
        const el = puckElRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${pucks[i].x - r}px, ${pucks[i].y - r}px, 0)`;
        }

        // Floor shadow: tracks the puck horizontally, sized & dimmed by how
        // far above the floor it sits. Sells the gravity by giving each
        // puck a visual anchor to the ground.
        const shadowEl = shadowRefs.current[i];
        if (shadowEl) {
          const floorY = h - r;
          const heightAbove = Math.max(0, floorY - pucks[i].y);
          const heightFactor = Math.min(
            1,
            heightAbove / Math.max(1, h - r * 2),
          );
          const baseWidth = r * 2 * 0.9;
          const shadowW = baseWidth * (1 - heightFactor * 0.5);
          const shadowOpacity = (1 - heightFactor * 0.85) * 0.55;
          shadowEl.style.transform = `translate3d(${pucks[i].x - shadowW / 2}px, ${h - 14}px, 0)`;
          shadowEl.style.width = `${shadowW}px`;
          shadowEl.style.opacity = `${shadowOpacity}`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      armObserver.disconnect();
    };
  }, []);

  /* ── pointer handlers ────────────────────────────────────────────────── */

  const localCoords = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const c = localCoords(e);
    if (!c) return;

    const drag = dragRef.current;
    if (drag && drag.puckIndex >= 0) {
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 8);

      if (
        !drag.moved &&
        Math.hypot(c.x - drag.startX, c.y - drag.startY) > DRAG_THRESHOLD
      ) {
        drag.moved = true;
      }

      const puck = pucksRef.current[drag.puckIndex];
      puck.vx = ((c.x - drag.lastX) / dt) * 16;
      puck.vy = ((c.y - drag.lastY) / dt) * 16;
      const tx = c.x - drag.offsetX;
      const ty = c.y - drag.offsetY;
      const r = puckRadiusRef.current;
      puck.x = Math.max(r, Math.min(sizeRef.current.w - r, tx));
      puck.y = Math.max(r, Math.min(sizeRef.current.h - r, ty));

      drag.lastX = c.x;
      drag.lastY = c.y;
      drag.lastT = now;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const c = localCoords(e);
    if (!c) return;

    const pucks = pucksRef.current;
    const r = puckRadiusRef.current;
    let hit = -1;
    for (let i = pucks.length - 1; i >= 0; i--) {
      const p = pucks[i];
      if (Math.hypot(p.x - c.x, p.y - c.y) <= r) {
        hit = i;
        break;
      }
    }

    dragRef.current = {
      puckIndex: hit,
      startX: c.x,
      startY: c.y,
      lastX: c.x,
      lastY: c.y,
      lastT: performance.now(),
      offsetX: hit >= 0 ? c.x - pucks[hit].x : 0,
      offsetY: hit >= 0 ? c.y - pucks[hit].y : 0,
      moved: false,
    };

    if (hit >= 0) {
      const p = pucks[hit];
      p.vx = 0;
      p.vy = 0;
      setDragging(hit);
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.puckIndex >= 0) {
      try {
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      } catch {
        // already released — safe to ignore
      }
    }

    dragRef.current = null;
    setDragging(null);
  };

  return (
    <div
      className="relative h-[420px] overflow-hidden rounded-2xl border border-white/[0.07] sm:h-[500px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(22, 23, 27, 0.94) 0%, rgba(15, 16, 20, 0.94) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.45), 0 14px 38px -18px rgba(0, 0, 0, 0.7)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute left-5 top-4 z-20 font-mono text-[12.5px] uppercase tracking-[0.2em] text-fg-dim">
        drag to pick up
      </div>

      <div
        ref={containerRef}
        className="relative h-full w-full select-none"
        style={{
          touchAction: "none",
          cursor: dragging !== null ? "grabbing" : "default",
        }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Floor shadows — one per puck, rendered before pucks so they
            stack below. Position + size + opacity driven by the rAF loop. */}
        {PUCKS.map((spec, i) => (
          <div
            key={`shadow-${spec.id}`}
            ref={(el) => {
              shadowRefs.current[i] = el;
            }}
            className="pointer-events-none absolute left-0 top-0"
            style={{
              height: 12,
              background:
                "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.65) 0%, transparent 65%)",
              willChange: "transform, width, opacity",
            }}
            aria-hidden="true"
          />
        ))}

        {PUCKS.map((spec, i) => {
          const isDragging = dragging === i;
          const isHovered = hovered === i && !isDragging;
          const isActive = isDragging || isHovered;

          return (
            <div
              key={spec.id}
              ref={(el) => {
                puckElRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 flex items-center justify-center"
              style={{
                width: PUCK_RADIUS * scale * 2,
                height: PUCK_RADIUS * scale * 2,
                willChange: "transform",
                cursor: isDragging ? "grabbing" : "grab",
                color: spec.color,
                // Active puck floats above everything so its label is never
                // hidden by other pucks stacked over it.
                zIndex: isActive ? 30 : 1,
              }}
              aria-label={spec.label}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() =>
                setHovered((h) => (h === i ? null : h))
              }
            >
              <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.2em] backdrop-blur-md transition-opacity duration-150"
                style={{
                  bottom: "calc(100% + 8px)",
                  color: spec.color,
                  backgroundColor: "rgba(10, 11, 13, 0.88)",
                  border: `1px solid ${spec.color}55`,
                  boxShadow: `0 6px 18px rgba(0,0,0,0.55), 0 0 12px ${spec.color}33`,
                  opacity: isActive ? 1 : 0,
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                {spec.label}
              </div>

              <div
                className="flex items-center justify-center transition-[transform,filter] duration-150 ease-out"
                style={{
                  transform: isDragging
                    ? "scale(1.12)"
                    : isHovered
                      ? "scale(1.06)"
                      : "scale(1)",
                  filter: isDragging
                    ? `drop-shadow(0 12px 26px ${spec.color}80) drop-shadow(0 4px 10px rgba(0,0,0,0.55))`
                    : isHovered
                      ? `drop-shadow(0 8px 18px ${spec.color}66) drop-shadow(0 4px 10px rgba(0,0,0,0.5))`
                      : "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
                }}
              >
                {spec.render(Math.round(ICON_SIZE * scale))}
              </div>
            </div>
          );
        })}
      </div>

      <ul className="sr-only">
        {PUCKS.map((p) => (
          <li key={p.id}>{p.label}</li>
        ))}
      </ul>
    </div>
  );
}
