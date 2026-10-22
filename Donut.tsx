import { ReactNode, useEffect, useState } from "react";
import { fmt } from "../data";
import { useCountUp, useInView } from "../hooks";

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: number;
  centerSub?: string;
  activeId?: string | null;
  hoverId?: string | null;
  onSegmentClick?: (id: string) => void;
}

export function Donut({
  segments,
  size = 240,
  thickness = 26,
  centerLabel = "",
  centerValue = 0,
  centerSub,
  activeId = null,
  hoverId = null,
  onSegmentClick,
}: DonutProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [armed, setArmed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setArmed(true), 120);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const R = (200 - thickness) / 2 - 4;
  const C = 2 * Math.PI * R;
  const total = segments.reduce((s, x) => s + x.value, 0);
  const positive = segments.filter((s) => s.value > 0).length;
  const gap = positive > 1 ? 3.2 : 0;

  const effectiveId = hovered ?? hoverId ?? activeId;
  const active = effectiveId ? segments.find((s) => s.id === effectiveId) ?? null : null;
  const animatedValue = useCountUp(active ? active.value : centerValue);

  let acc = 0;
  const arcs = segments.map((s) => {
    const frac = total > 0 ? s.value / total : 0;
    const len = armed ? Math.max(frac * C - gap, frac > 0 ? 0.8 : 0.001) : 0.001;
    const offset = armed ? -(acc * C + gap / 2) : 0;
    acc += frac;
    return { ...s, len, offset, frac };
  });

  return (
    <div ref={ref} className="relative inline-block select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className="block overflow-visible" onPointerLeave={() => setHovered(null)}>
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(38,52,86,0.6)" strokeWidth={thickness - 8} />
          {arcs.map((a) => {
            const isActive = effectiveId === a.id;
            const dimmed = effectiveId !== null && !isActive;
            return (
              <circle
                key={a.id}
                cx="100" cy="100" r={R} fill="none" stroke={a.color}
                strokeWidth={isActive ? thickness + 8 : thickness}
                strokeDasharray={`${a.len} ${C - a.len}`}
                strokeDashoffset={a.offset}
                strokeLinecap="butt"
                opacity={dimmed ? 0.22 : 1}
                style={{ transition: "stroke-dasharray 0.8s, stroke-dashoffset 0.8s, stroke-width 0.25s, opacity 0.25s", cursor: onSegmentClick ? "pointer" : "default" }}
                onPointerEnter={() => setHovered(a.id)}
                onClick={() => onSegmentClick?.(a.id)}
              />
            );
          })}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-500">{active ? active.label : centerLabel}</span>
        <span className="font-display font-bold leading-tight mt-1" style={{ fontSize: size / 8.2, color: active ? active.color : "#eef2fb" }}>
          {fmt(animatedValue)}
        </span>
        <span className="text-xs font-semibold text-mist-500 mt-0.5">
          {active && total > 0 ? `${Math.round((active.value / total) * 100)}%` : centerSub ?? ""}
        </span>
      </div>
    </div>
  );
}

export function Ring({ value, size = 120, thickness = 10, color = "#5aa7f0", children, delay = 0 }: { value: number; size?: number; thickness?: number; color?: string; children?: ReactNode; delay?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const clamped = Math.max(0, Math.min(value, 100));
  const R = (100 - thickness) / 2 - 2;
  const C = 2 * Math.PI * R;
  const filled = inView ? (clamped / 100) * C : 0;

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(38,52,86,0.65)" strokeWidth={thickness - 3} />
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={`${filled} ${C - filled}`} style={{ transition: `stroke-dasharray 1s cubic-bezier(0.22,0.9,0.3,1) ${delay}ms` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function RingValue({ value, className = "", suffix = "%" }: { value: number; className?: string; suffix?: string }) {
  const v = useCountUp(Math.round(value));
  return <span className={`tabular text-mist-100 ${className}`}>{v}{suffix}</span>;
}
