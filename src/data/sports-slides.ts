import type { SportsSlide } from '@/types';

export const sportsSlides: SportsSlide[] = [
  {
    id: 'cricket',
    sport: 'cricket',
    title: 'CRICKET',
    description: 'Box cricket, practice nets, and tournament-grade pitches with professional surfaces.',
    cta: 'Find Cricket Turfs',
    imageUrl: '', // We'll use CSS gradients as fallback
    bgGradient: 'from-emerald-900 via-emerald-800 to-green-900',
  },
  {
    id: 'football',
    sport: 'football',
    title: 'FOOTBALL',
    description: 'High-grip surfaces, bright floodlights, and zero hassle. Play 5-a-side or 7-a-side.',
    cta: 'Find Football Turfs',
    imageUrl: '',
    bgGradient: 'from-blue-900 via-blue-800 to-indigo-900',
  },
  {
    id: 'badminton',
    sport: 'badminton',
    title: 'BADMINTON',
    description: 'Indoor courts with perfect lighting, wooden flooring, and shuttle-ready nets.',
    cta: 'Find Badminton Courts',
    imageUrl: '',
    bgGradient: 'from-purple-900 via-purple-800 to-violet-900',
  },
  {
    id: 'basketball',
    sport: 'basketball',
    title: 'BASKETBALL',
    description: 'Full courts and half courts with regulation hoops, smooth hardwood, and night lighting.',
    cta: 'Find Basketball Courts',
    imageUrl: '',
    bgGradient: 'from-orange-900 via-orange-800 to-amber-900',
  },
  {
    id: 'multi-sport',
    sport: 'multi-sport',
    title: 'MULTI-SPORT',
    description: 'Versatile arenas that switch between sports. Cricket today, football tomorrow.',
    cta: 'Explore All Turfs',
    imageUrl: '',
    bgGradient: 'from-gray-900 via-slate-800 to-zinc-900',
  },
];
