import { useAuthStore } from '@/store/useAuthStore';
import { useRewardStore } from '@/store/useRewardStore';
import { redemptionOptions } from '@/data/membership';
import { useMemo } from 'react';

export function useRewards() {
  const user = useAuthStore((s) => s.user);
  const addRewardPoints = useAuthStore((s) => s.addRewardPoints);
  const deductRewardPoints = useAuthStore((s) => s.deductRewardPoints);
  const addTransaction = useRewardStore((s) => s.addTransaction);
  const getTransactions = useRewardStore((s) => s.getTransactions);
  const addRedemption = useRewardStore((s) => s.addRedemption);
  const getActiveRedemptions = useRewardStore((s) => s.getActiveRedemptions);

  const points = user?.rewardPoints ?? 0;

  const transactions = useMemo(() => {
    if (!user) return [];
    return getTransactions(user.id);
  }, [user, getTransactions]);

  const activeRedemptions = useMemo(() => {
    return getActiveRedemptions();
  }, [getActiveRedemptions]);

  const earnPoints = (amount: number, description: string, bookingId?: string) => {
    if (!user) return;
    addRewardPoints(amount);
    addTransaction({
      userId: user.id,
      type: 'earned',
      points: amount,
      description,
      bookingId,
    });
  };

  const redeemOption = (optionId: string) => {
    if (!user) return null;
    const option = redemptionOptions.find((o) => o.id === optionId);
    if (!option) return null;
    if (points < option.pointsCost) return null; // Insufficient balance
    
    const success = deductRewardPoints(option.pointsCost);
    if (!success) return null;
    
    addTransaction({
      userId: user.id,
      type: 'redeemed',
      points: -option.pointsCost,
      description: `${option.title} redeemed`,
    });
    
    const redemption = addRedemption({
      title: option.title,
      discountValue: option.discountValue,
      discountType: option.discountType,
    });
    
    return redemption;
  };

  return {
    points,
    transactions,
    activeRedemptions,
    redemptionOptions,
    earnPoints,
    redeemOption,
    canRedeem: (pointsCost: number) => points >= pointsCost,
  };
}
