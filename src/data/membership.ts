import type { MembershipPlan, RedemptionOption } from '@/types';

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free Starter',
    tagline: 'Casual play with transparent pricing',
    price: 0,
    annualPrice: 0,
    discountPercent: 0,
    rewardMultiplier: 1,
    benefits: [
      'Standard turf search and booking',
      'Earn 1x TurfPoints on matches',
      'Digital ticket with QR code check-in',
      'Basic slot availability view',
      'Standard cancellation rules',
    ],
  },
  {
    id: 'play',
    tier: 'play',
    name: 'Playo Play',
    tagline: 'For weekly recreational sports enthusiasts',
    price: 199,
    annualPrice: 1799,
    savingsBadge: 'Save ₹589 / yr',
    discountPercent: 10,
    rewardMultiplier: 1.5,
    benefits: [
      '10% instant discount on every turf',
      'Earn 1.5x TurfPoints per booking',
      '24-hour priority slot booking window',
      'Early access to newly verified grounds',
      'Free cancellation up to 4 hours before kickoff',
      'Community leaderboard badge',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    tier: 'pro',
    name: 'Playo Pro',
    tagline: 'For competitive players & corporate teams',
    price: 499,
    annualPrice: 4499,
    savingsBadge: 'Save ₹1,489 / yr',
    discountPercent: 20,
    rewardMultiplier: 2,
    benefits: [
      '20% instant discount on every turf',
      'Earn 2x TurfPoints per match booking',
      'Peak-hour slot reservation guarantee',
      'Free cancellation up to 2 hours prior',
      'Zero convenience & platform fees',
      'Exclusive pro-only weekend tournaments',
      'Dedicated concierge support line',
    ],
    popular: true,
  },
  {
    id: 'annual_pass',
    tier: 'annual_pass',
    name: 'All-Access Annual Pass',
    tagline: 'The ultimate VIP pass for year-round athletes',
    price: 249, // Effective monthly price equivalent
    annualPrice: 1999,
    savingsBadge: 'Best Value • Save 60%',
    discountPercent: 25,
    rewardMultiplier: 2.5,
    benefits: [
      '25% maximum platform discount on all grounds',
      'Earn 2.5x TurfPoints on every rupee spent',
      '48-hour VIP early slot booking access',
      'Unlimited zero-penalty slot rescheduling',
      'Free entry to official Playo Regional Cup',
      'Free equipment rental at partner venues',
      'Custom gold VIP digital membership card',
    ],
    highlighted: true,
  },
];

export const redemptionOptions: RedemptionOption[] = [
  {
    id: 'redeem-50',
    title: '₹50 Booking Discount',
    description: 'Get ₹50 off your next booking',
    pointsCost: 500,
    discountValue: 50,
    discountType: 'fixed',
  },
  {
    id: 'redeem-100',
    title: '₹100 Booking Discount',
    description: 'Get ₹100 off your next booking',
    pointsCost: 900,
    discountValue: 100,
    discountType: 'fixed',
  },
  {
    id: 'redeem-10pct',
    title: '10% Turf Discount',
    description: 'Get 10% off any booking',
    pointsCost: 1000,
    discountValue: 10,
    discountType: 'percentage',
  },
  {
    id: 'redeem-upgrade',
    title: 'Free Slot Upgrade',
    description: 'Upgrade to a peak-hour slot for free',
    pointsCost: 1500,
    discountValue: 200,
    discountType: 'fixed',
  },
];

export function getMembershipPlan(tier: string): MembershipPlan {
  return membershipPlans.find((p) => p.tier === tier) ?? membershipPlans[0]!;
}

export const MEMBERSHIP_PLANS = membershipPlans;
