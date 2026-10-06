// ============================================================================
// PLAYO SPORTS CONCIERGE - PLAYER AI ASSISTANT (FRONTEND CLIENT INTELLIGENCE)
// ============================================================================
// NOTE: Natural language customer assistance rule-engine & semantic parser.
// Fully client-side mock adapter; ready to be swapped with backend LLM router.
//
// Future Backend Integration:
// POST /api/v1/chat/message
// Headers: Authorization: Bearer <playerToken>
// Body: { query: string, userContext: { tier, points, city } }
// ============================================================================

import { turfs } from '@/data/turfs';
import { MEMBERSHIP_PLANS } from '@/data/membership';
import type { Turf, Sport } from '@/types';

export interface ConciergeTurfCard {
  id: string;
  name: string;
  city: string;
  area: string;
  sports: string[];
  pricePerHour: number;
  rating: number;
  image: string;
  blurb?: string;
}

export interface ConciergeAction {
  type: 'navigate' | 'book' | 'explore' | 'membership' | 'rewards' | 'directions';
  label: string;
  to: string;
}

export interface ConciergeQueryResult {
  id: string;
  reply: string;
  sender: 'bot';
  timestamp: string;
  quickPills?: string[];
  turfCards?: ConciergeTurfCard[];
  action?: ConciergeAction;
}

export interface PlayerContext {
  userId?: string;
  userName?: string;
  city?: string;
  membershipTier?: string;
  rewardPoints?: number;
}

const DEFAULT_PILLS = [
  '⚽ Football turfs',
  '🏏 Cricket nets',
  '🎟️ Annual Pass perks',
  '💰 TurfPoints rewards',
  '📍 Turfs near me',
  '⏰ Slots tonight',
];

export const playerConciergeService = {
  /**
   * Main query parser and response generator
   */
  async processPlayerQuery(rawQuery: string, context?: PlayerContext): Promise<ConciergeQueryResult> {
    // Simulate real AI assistant streaming / thinking latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const q = rawQuery.toLowerCase().trim();
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. GREETING & INTRO
    if (/^(hi|hello|hey|greetings|hola|good morning|good evening|yo)\b/i.test(q)) {
      const name = context?.userName ? ` ${context.userName.split(' ')[0]}` : '';
      return {
        id,
        reply: `Hey${name}! 👋 I'm your **Playo Sports Concierge**. I can help you discover premier grounds, find open slots tonight, unlock Annual Pass savings, and manage match bookings. What sport are we playing today?`,
        sender: 'bot',
        timestamp: now,
        quickPills: DEFAULT_PILLS,
      };
    }

    // 2. ANNUAL PASS & MEMBERSHIPS
    if (
      q.includes('annual pass') ||
      q.includes('membership') ||
      q.includes('subscription') ||
      q.includes('pro pass') ||
      q.includes('upgrade') ||
      q.includes('discount plan')
    ) {
      const annualPlan = MEMBERSHIP_PLANS.find((p) => p.tier === 'annual_pass');
      const proPlan = MEMBERSHIP_PLANS.find((p) => p.tier === 'pro');
      const currentTier = context?.membershipTier ?? 'free';

      return {
        id,
        reply: `⭐ **Playo Membership & Annual Pass Guide**\n\n` +
          `• **All-Access Annual Pass (₹${annualPlan?.price}/year)**:\n` +
          `  - **25% Flat Discount** on every single match booking\n` +
          `  - **2.5x TurfPoints** multiplier (earn points 150% faster)\n` +
          `  - Zero cancellation and rescheduling penalty fees\n` +
          `  - Priority peak-hour slot reservations (7 PM - 10 PM)\n` +
          `  - Saves avg player over ₹4,800 annually!\n\n` +
          `• **Playo Pro (₹${proPlan?.price}/month or ₹${proPlan?.annualPrice}/year)**:\n` +
          `  - 20% discount + 2.0x TurfPoints\n\n` +
          `Your current tier: **${currentTier.toUpperCase().replace('_', ' ')}**.\nReady to lock in VIP perks and flat 25% savings?`,
        sender: 'bot',
        timestamp: now,
        action: {
          type: 'membership',
          label: 'View Membership Plans & Pass',
          to: '/membership',
        },
        quickPills: [
          'Upgrade to Annual Pass',
          'Calculate my savings',
          'How to book with discount',
          '⚽ Show football turfs',
        ],
      };
    }

    // 3. REWARDS & TURFPOINTS
    if (
      q.includes('reward') ||
      q.includes('turfpoint') ||
      q.includes('point') ||
      q.includes('cashback') ||
      q.includes('coins') ||
      q.includes('redeem')
    ) {
      const pts = context?.rewardPoints ?? 120;
      return {
        id,
        reply: `🪙 **TurfPoints Loyalty Program**\n\n` +
          `You currently hold **${pts} TurfPoints** in your Playo wallet.\n\n` +
          `• **How to earn**: Earn 100 points on every standard booking (up to 250 points with Annual Pass).\n` +
          `• **How to redeem**: Toggle "Use TurfPoints" during checkout at any participating venue to save ₹1 per point directly from your match bill.\n` +
          `• **Store Perks**: Redeem points for official match balls, training bibs, and sports hydration vouchers in the Rewards section.`,
        sender: 'bot',
        timestamp: now,
        action: {
          type: 'rewards',
          label: 'Open Rewards Hub',
          to: '/rewards',
        },
        quickPills: [
          'How to earn more points',
          '🎟️ Annual Pass perks',
          'Book a match now',
        ],
      };
    }

    // 4. CANCEL / REFUND / RESCHEDULE
    if (
      q.includes('cancel') ||
      q.includes('reschedule') ||
      q.includes('refund') ||
      q.includes('rain') ||
      q.includes('policy')
    ) {
      return {
        id,
        reply: `🛡️ **Fair-Play Guarantee & Cancellation Policy**\n\n` +
          `• **Full Refund (100%)**: Cancel up to 4 hours prior to match start time.\n` +
          `• **Partial Refund (50%)**: Cancel between 2 to 4 hours prior.\n` +
          `• **Rescheduling**: Free self-service rescheduling up to 2 hours before the game.\n` +
          `• **Annual Pass & Pro Members**: Enjoy zero-fee instant cancellations and rain-check slot credits anytime!`,
        sender: 'bot',
        timestamp: now,
        action: {
          type: 'navigate',
          label: 'View My Bookings',
          to: '/bookings',
        },
        quickPills: [
          'View my active bookings',
          '🎟️ Annual Pass perks',
          'Explore grounds',
        ],
      };
    }

    // 5. DIRECTIONS & NAVIGATION
    if (
      q.includes('direction') ||
      q.includes('maps') ||
      q.includes('navigate') ||
      q.includes('how to reach') ||
      q.includes('location of')
    ) {
      return {
        id,
        reply: `📍 **Turn-by-Turn Ground Navigation**\n\n` +
          `Every venue page includes direct **Google Maps navigation** with calibrated GPS coordinates.\n\n` +
          `Simply open the turf's detail page and tap **"Get Directions"** to launch real-time route directions from your current location!`,
        sender: 'bot',
        timestamp: now,
        action: {
          type: 'explore',
          label: 'Explore Turfs Near Me',
          to: '/explore',
        },
        quickPills: [
          'Champions Arena Dehradun',
          'Skyline Kickoff Arena',
          'Greenfield Sports Hub',
        ],
      };
    }

    // 6. SPECIFIC SPORT MATCHING
    const sportsKeywords: Record<Sport, string[]> = {
      football: ['football', 'soccer', 'fifa', 'futsal', '7v7', '5v5', 'goal'],
      cricket: ['cricket', 'box cricket', 'nets', 'pitch', 'batting', 'bowling'],
      badminton: ['badminton', 'shuttle', 'court', 'racquet'],
      basketball: ['basketball', 'hoops', 'court', 'nba'],
      tennis: ['tennis', 'clay court', 'hard court'],
      pickleball: ['pickleball', 'paddle'],
      swimming: ['swimming', 'pool', 'laps'],
    };

    let matchedSport: Sport | undefined;
    for (const [sport, keywords] of Object.entries(sportsKeywords)) {
      if (keywords.some((k) => q.includes(k))) {
        matchedSport = sport as Sport;
        break;
      }
    }

    // Check city / area mentions
    const knownCities = ['dehradun', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'];
    const matchedCity = knownCities.find((c) => q.includes(c));
    const knownAreas = ['rajpur', 'whitefield', 'indiranagar', 'koramangala', 'bandra', 'hitech', 'velachery'];
    const matchedArea = knownAreas.find((a) => q.includes(a));

    // Check price filter
    const priceMatch = q.match(/under\s*₹?\s*(\d+)/i) || q.match(/less\s*than\s*₹?\s*(\d+)/i);
    const maxBudget = priceMatch ? parseInt(priceMatch[1], 10) : undefined;

    // Filter candidate turfs
    let matchingTurfs = turfs.filter((t) => t.approvalStatus === 'APPROVED' && t.available);

    if (matchedSport) {
      matchingTurfs = matchingTurfs.filter((t) => t.sports.includes(matchedSport!));
    }
    if (matchedCity) {
      const cityQuery = matchedCity === 'bangalore' ? 'bengaluru' : matchedCity;
      matchingTurfs = matchingTurfs.filter((t) => t.city.toLowerCase().includes(cityQuery));
    }
    if (matchedArea) {
      matchingTurfs = matchingTurfs.filter((t) => t.area.toLowerCase().includes(matchedArea));
    }
    if (maxBudget) {
      matchingTurfs = matchingTurfs.filter((t) => t.pricePerHour <= maxBudget);
    }

    // If query was looking for open slots / tonight
    const isAvailabilityQuery = q.includes('slot') || q.includes('tonight') || q.includes('open') || q.includes('available');

    if (matchingTurfs.length > 0) {
      const topPicks = matchingTurfs.slice(0, 3);
      const sportLabel = matchedSport ? `${matchedSport.toUpperCase()} ` : '';
      const locLabel = matchedArea ? `in ${matchedArea.toUpperCase()} ` : matchedCity ? `in ${matchedCity.toUpperCase()} ` : '';
      const budgetLabel = maxBudget ? `under ₹${maxBudget} ` : '';

      const cards: ConciergeTurfCard[] = topPicks.map((t) => ({
        id: t.id,
        name: t.name,
        city: t.city,
        area: t.area,
        sports: t.sports,
        pricePerHour: t.pricePerHour,
        rating: t.rating,
        image: t.image,
        blurb: t.blurb,
      }));

      let intro = `Here are top-rated ${sportLabel}arenas ${locLabel}${budgetLabel}ready for instant booking:`;
      if (isAvailabilityQuery) {
        intro = `Here are prime venues with open evening/night slots available:`;
      }

      return {
        id,
        reply: `${intro}\n\nAll venues feature verified high-drainage turf, LED floodlights, and instant digital gate confirmation.`,
        sender: 'bot',
        timestamp: now,
        turfCards: cards,
        action: {
          type: 'explore',
          label: 'View All Matching Arenas',
          to: matchedSport ? `/explore?sport=${matchedSport}` : '/explore',
        },
        quickPills: [
          'Show open slots tonight',
          '🎟️ Apply Annual Pass 25% discount',
          'How do directions work?',
          'Compare prices',
        ],
      };
    }

    // 7. DEFAULT INTELLIGENT FALLBACK
    const defaultPicks = turfs.filter((t) => t.approvalStatus === 'APPROVED').slice(0, 2);
    return {
      id,
      reply: `I can help you reserve grounds across 14 cities, check real-time floodlit availability, apply your Annual Pass discounts, or navigate to any arena.\n\nTry asking me:\n• *"Find football turfs in Whitefield"*\n• *"What are the Annual Pass benefits?"*\n• *"Any cricket grounds under ₹800/hr?"*\n• *"How do I redeem my 120 TurfPoints?"*`,
      sender: 'bot',
      timestamp: now,
      turfCards: defaultPicks.map((t) => ({
        id: t.id,
        name: t.name,
        city: t.city,
        area: t.area,
        sports: t.sports,
        pricePerHour: t.pricePerHour,
        rating: t.rating,
        image: t.image,
      })),
      action: {
        type: 'explore',
        label: 'Browse All Sports Venues',
        to: '/explore',
      },
      quickPills: DEFAULT_PILLS,
    };
  },
};
