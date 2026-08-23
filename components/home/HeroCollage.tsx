'use client';

import { useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface HeroCollageProps {
  /** Up to 3 image URLs. Missing entries render as a neutral placeholder tile. */
  images?: (string | null | undefined)[];
  /** Set null to hide the floating card entirely — see the note in page.tsx. */
  responseTime?: string | null;
}

const WhatsAppGlyph = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.876.52 3.63 1.42 5.13L2 22l4.998-1.31A9.95 9.95 0 0012.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18.166a8.14 8.14 0 01-4.153-1.14l-.298-.177-3.077.807.821-2.997-.194-.308A8.14 8.14 0 013.834 12c0-4.5 3.665-8.166 8.167-8.166 4.5 0 8.166 3.666 8.166 8.166 0 4.501-3.665 8.166-8.166 8.166z" />
  </svg>
);

const Tile = ({ src, alt }: { src?: string | null; alt: string }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-white/25">
      <ImageIcon className="h-6 w-6" />
    </div>
  );

/**
 * Overlapping photo collage with pointer parallax.
 *
 * Layout is absolute at a fixed 430px height, so it is hidden below lg rather
 * than reflowed — a parallax collage has no sensible mobile form.
 */
export function HeroCollage({ images = [], responseTime = '~14 min' }: HeroCollageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return; // no pointer to track

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        for (const el of layers) {
          const d = Number(el.dataset.depth) || 1;
          el.style.transform = `translate3d(${dx * d * 9}px, ${dy * d * 9}px, 0)`;
        }
      });
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      for (const el of layers) el.style.transform = '';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', reset);
      reset();
    };
  }, []);

  return (
    <div ref={ref} className="relative hidden h-[430px] lg:block">
      <div
        data-depth="1.6"
        className="ease-smooth absolute right-[34px] top-0 h-[225px] w-[330px] overflow-hidden rounded-card border border-white/10 shadow-lg transition-transform duration-700 will-change-transform"
      >
        <Tile src={images[0]} alt="Featured rental vehicle" />
      </div>
      <div
        data-depth="2.4"
        className="ease-smooth absolute bottom-2 left-0 h-[170px] w-[250px] overflow-hidden rounded-card border border-white/10 shadow-lg transition-transform duration-700 will-change-transform"
      >
        <Tile src={images[1]} alt="Rental vehicle" />
      </div>
      <div
        data-depth="3"
        className="ease-smooth absolute bottom-16 right-0 h-[126px] w-[180px] overflow-hidden rounded-card border border-white/10 shadow-lg transition-transform duration-700 will-change-transform"
      >
        <Tile src={images[2]} alt="Vehicle interior" />
      </div>

      {responseTime && (
        <div
          data-depth="3.6"
          className="ease-smooth absolute left-[150px] top-[196px] z-[5] flex items-center gap-2.5 rounded-[15px] bg-white/[0.97] px-[15px] py-3 shadow-lg transition-transform duration-700 will-change-transform"
        >
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-whatsapp text-white">
            <WhatsAppGlyph />
          </span>
          <div>
            <b className="block text-[13px] text-ink">Reply in {responseTime}</b>
            <small className="text-[11px] text-text-muted">Median provider response</small>
          </div>
        </div>
      )}
    </div>
  );
}
