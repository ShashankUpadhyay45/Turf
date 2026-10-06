import { useAuthStore } from '@/store/useAuthStore';
import { membershipPlans, getMembershipPlan } from '@/data/membership';
import { useMemo } from 'react';

export function useMembership() {
  const user = useAuthStore((s) => s.user);
  const updateMembership = useAuthStore((s) => s.updateMembership);

  const currentPlan = useMemo(() => {
    return getMembershipPlan(user?.membershipTier ?? 'free');
  }, [user?.membershipTier]);

  const allPlans = membershipPlans;

  const calculateDiscount = (basePrice: number) => {
    return Math.round(basePrice * (currentPlan.discountPercent / 100));
  };

  const calculateRewardMultiplier = (basePoints: number) => {
    return Math.round(basePoints * currentPlan.rewardMultiplier);
  };

  const upgradeTo = (tier: 'free' | 'play' | 'pro') => {
    updateMembership(tier);
  };

  return {
    currentPlan,
    allPlans,
    currentTier: user?.membershipTier ?? 'free',
    calculateDiscount,
    calculateRewardMultiplier,
    upgradeTo,
  };
}
