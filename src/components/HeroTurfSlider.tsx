import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import aiFootballTurf from '@/assets/ai-football-turf.webp';
import aiCricketTurf from '@/assets/ai-cricket-turf.webp';
import aiBadmintonTurf from '@/assets/ai-badminton-turf.webp';
import aiBasketballTurf from '@/assets/ai-basketball-turf.webp';
import aiRooftopTurf from '@/assets/ai-rooftop-turf.webp';

const slides = [
  { id: 'football', image: aiFootballTurf, alt: 'Football Turf' },
  { id: 'cricket', image: aiCricketTurf, alt: 'Cricket Turf' },
  { id: 'badminton', image: aiBadmintonTurf, alt: 'Badminton Court' },
  { id: 'basketball', image: aiBasketballTurf, alt: 'Basketball Court' },
  { id: 'rooftop', image: aiRooftopTurf, alt: 'Rooftop Multi-Sport Turf' },
];

const AUTO_SLIDE_INTERVAL = 3800; // 3.8 seconds per slide

export function HeroTurfSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Automatic slide cycle with pause on hover
  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, nextSlide]);

  return (
    <div
      className="group relative size-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Sports Turf Showcase"
    >
      {/* Sliding Pure Clean Images (No Text) */}
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              // @ts-expect-error - React fetchPriority attribute
              fetchPriority={index === 0 ? "high" : "low"}
              className={`size-full object-cover transition-transform duration-[4000ms] ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        );
      })}

      {/* Subtle Slide Navigation Arrows (Appears on hover, non-text) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous turf image"
        className="absolute left-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/70 active:scale-95 group-hover:opacity-100"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next turf image"
        className="absolute right-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/70 active:scale-95 group-hover:opacity-100"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Minimal Non-Text Pagination Dots (Bottom) */}
      <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
            className="flex h-11 min-w-[28px] items-center justify-center p-1.5 cursor-pointer"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-6 bg-white shadow'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Subtle Auto-Slide Progress Bar at very bottom edge */}
      <div className="absolute inset-x-0 bottom-0 z-30 h-1 bg-black/20 overflow-hidden">
        <div
          key={current}
          className="h-full w-full bg-emerald-400 origin-left"
          style={{
            animation: isHovered
              ? 'none'
              : `progressGrow ${AUTO_SLIDE_INTERVAL}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes progressGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
