'use client';

import { useEffect, useRef, useState } from 'react';

export interface HeroStat {
  value: number;
  /** Rendered after the counted number, e.g. "+" */
  suffix?: string;
  /** Decimal places. 0 counts as an integer with thousands separators. */
  decimals?: number;
  label: string;
}

/**
 * Hero stat counters.
 *
 * The numbers are authored at their FINAL value and only animate if the
 * animation timeline proves it is advancing. A count-up that starts at 0 and
 * relies on frames to reach its real value renders a permanent "0" in a
 * background tab, a throttled context, or a print/screenshot pass — so the
 * final value is the resting state and the animation is the enhancement.
 */
export function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <dl className="mt-9 flex flex-wrap gap-x-[34px] gap-y-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="bg-brand bg-clip-text font-mono text-[26px] font-semibold tracking-[-0.03em] text-transparent">
            <Counter {...stat} />
          </dd>
          <dt className="mt-0.5 text-[11.5px] tracking-[0.02em] text-white/50">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

const format = (n: number, decimals: number) =>
  decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();

function Counter({ value, suffix = '', decimals = 0 }: HeroStat) {
  const [display, setDisplay] = useState(() => format(value, decimals));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.hidden) return;

    let raf = 0;
    let cancelled = false;

    // Prove the timeline advances across two frames before rewinding to 0.
    const t0 = document.timeline.currentTime;
    raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (cancelled) return;
        const t1 = document.timeline.currentTime;
        if (typeof t0 !== 'number' || typeof t1 !== 'number' || t1 <= t0) return;

        const DURATION = 1100;
        let start: number | null = null;
        const tick = (now: number) => {
          if (cancelled) return;
          if (start === null) start = now;
          const p = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setDisplay(format(value * eased, decimals));
          if (p < 1) raf = requestAnimationFrame(tick);
          else setDisplay(format(value, decimals)); // land exactly
        };
        raf = requestAnimationFrame(tick);

        // Whatever happens, the true value is on screen by then.
        setTimeout(() => {
          if (!cancelled) setDisplay(format(value, decimals));
        }, DURATION + 400);
      }),
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
