'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * Reveal-on-scroll wrapper.
 *
 * The important rule, learned the hard way: an animation must NEVER be the only
 * path from hidden to visible. In a background tab, a throttled context, or a
 * screenshot/print pipeline, frames do not arrive — transitions register and
 * then stick at their "from" value forever, and content that depends on them
 * renders blank.
 *
 * So: children are authored VISIBLE. This component hides them only after it has
 * proven the animation timeline advances, and un-hides on any failure path
 * (reduced motion, hidden document, stalled timeline, observer that never fires).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.hidden) return;

    let cancelled = false;
    const show = () => {
      el.style.opacity = '';
      el.style.transform = '';
    };
    const hide = () => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
    };

    // Prove the timeline is running before hiding anything.
    const t0 = document.timeline.currentTime;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (cancelled) return;
        const t1 = document.timeline.currentTime;
        if (typeof t0 !== 'number' || typeof t1 !== 'number' || t1 <= t0) return; // stalled — stay visible

        const near = () => el.getBoundingClientRect().top < window.innerHeight * 1.15;
        if (near()) return; // already on screen — no point animating it in

        hide();
        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              show();
              io.disconnect();
            }
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        );
        io.observe(el);

        const onScroll = () => near() && (show(), io.disconnect());
        window.addEventListener('scroll', onScroll, { passive: true });
        const failSafe = setTimeout(show, 1800); // observer never fired

        cleanup = () => {
          io.disconnect();
          window.removeEventListener('scroll', onScroll);
          clearTimeout(failSafe);
        };
      }),
    );

    let cleanup = () => {};
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn('ease-smooth transition-[opacity,transform] duration-500', className)}
    >
      {children}
    </div>
  );
}
