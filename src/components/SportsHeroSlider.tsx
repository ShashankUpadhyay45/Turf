import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Trophy, Users, Volleyball, CircleDot, Layers } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Slide {
  id: string;
  sport: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
  searchParams: { q: string; sport: string };
  icon: typeof Trophy;
  gradient: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: 'cricket',
    sport: 'Cricket',
    title: 'CRICKET',
    subtitle: 'Box Cricket & Nets',
    description: 'Tournament-grade pitches, practice nets, and box cricket arenas with professional surfaces.',
    cta: 'Find Cricket Turfs',
    ctaLink: '/explore',
    searchParams: { q: 'Dehradun', sport: 'Cricket' },
    icon: Trophy,
    gradient: 'from-emerald-950 via-emerald-900 to-green-950',
    accentColor: 'text-emerald-400',
  },
  {
    id: 'football',
    sport: 'Football',
    title: 'FOOTBALL',
    subtitle: '5-a-side & 7-a-side',
    description: 'High-grip artificial turf, bright floodlights, and zero-hassle booking for your team.',
    cta: 'Find Football Turfs',
    ctaLink: '/explore',
    searchParams: { q: 'Dehradun', sport: 'Football' },
    icon: CircleDot,
    gradient: 'from-blue-950 via-blue-900 to-indigo-950',
    accentColor: 'text-blue-400',
  },
  {
    id: 'badminton',
    sport: 'Badminton',
    title: 'BADMINTON',
    subtitle: 'Indoor Courts',
    description: 'Indoor courts with perfect lighting, wooden flooring, and regulation nets ready to play.',
    cta: 'Find Badminton Courts',
    ctaLink: '/explore',
    searchParams: { q: 'Dehradun', sport: 'Badminton' },
    icon: Volleyball,
    gradient: 'from-purple-950 via-purple-900 to-violet-950',
    accentColor: 'text-purple-400',
  },
  {
    id: 'basketball',
    sport: 'Basketball',
    title: 'BASKETBALL',
    subtitle: 'Full & Half Courts',
    description: 'Regulation hoops, smooth hardwood surfaces, and night lighting for evening games.',
    cta: 'Find Basketball Courts',
    ctaLink: '/explore',
    searchParams: { q: 'Dehradun', sport: 'Basketball' },
    icon: CircleDot,
    gradient: 'from-orange-950 via-amber-900 to-yellow-950',
    accentColor: 'text-amber-400',
  },
  {
    id: 'multi-sport',
    sport: 'Multi-Sport',
    title: 'MULTI-SPORT',
    subtitle: 'Versatile Arenas',
    description: 'Switch between sports on the same ground. Cricket today, football tomorrow.',
    cta: 'Explore All Turfs',
    ctaLink: '/explore',
    searchParams: { q: 'Dehradun', sport: 'All sports' },
    icon: Layers,
    gradient: 'from-slate-950 via-gray-900 to-zinc-950',
    accentColor: 'text-slate-400',
  },
];

export function SportsHeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const goTo = useCallback((index: number, dir?: 'left' | 'right') => {
    setDirection(dir ?? (index > current ? 'right' : 'left'));
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection('right');
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection('left');
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isHovered || reducedMotion.current) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const slide = slides[current]!;
  const Icon = slide.icon;

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Sports carousel"
      aria-roledescription="carousel"
    >
      <div
        className={`relative min-h-[420px] bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-out md:min-h-[480px]`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -right-20 -top-20 size-96 rounded-full border-[30px] ${slide.accentColor} opacity-[0.07] transition-transform duration-700`} />
          <div className={`absolute -bottom-16 -left-16 size-72 rounded-full border-[24px] ${slide.accentColor} opacity-[0.05] transition-transform duration-700`} />
        </div>

        <div className="container-page relative z-10 grid min-h-[420px] items-center py-16 md:min-h-[480px] lg:grid-cols-2 lg:gap-12">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold ${slide.accentColor} backdrop-blur`}>
              <Icon className="size-3.5" />
              {slide.subtitle}
            </div>
            <h2 className="mt-5 font-display text-7xl font-black leading-[0.85] text-white md:text-8xl lg:text-9xl">
              {slide.title}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60 md:text-lg">
              {slide.description}
            </p>
            <Link
              to={slide.ctaLink}
              search={slide.searchParams}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-gray-900 transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              {slide.cta}
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Sport visual - large icon */}
          <div className="hidden items-center justify-center lg:flex">
            <div className={`grid size-64 place-items-center rounded-full border-[3px] border-white/10 bg-white/5 backdrop-blur-sm`}>
              <Icon className={`size-32 ${slide.accentColor} opacity-80`} />
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          aria-label="Previous sport"
          className="absolute left-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 md:left-5 md:size-12"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next sport"
          className="absolute right-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 md:right-5 md:size-12"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Pagination dots */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.sport}`}
              aria-current={i === current ? 'true' : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
