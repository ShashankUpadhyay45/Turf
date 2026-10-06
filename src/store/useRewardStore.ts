import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RewardTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus';

interface RewardTransaction {
  id: string;
  userId: string;
  type: RewardTransactionType;
  points: number;
  description: string;
  createdAt: string;
  bookingId?: string;
}

interface ActiveRedemption {
  id: string;
  title: string;
  discountValue: number;
  discountType: 'fixed' | 'percentage';
  code: string;
  expiresAt: string;
  used: boolean;
}

interface RewardState {
  transactions: RewardTransaction[];
  activeRedemptions: ActiveRedemption[];
  
  addTransaction: (tx: Omit<RewardTransaction, 'id' | 'createdAt'>) => void;
  getTransactions: (userId: string) => RewardTransaction[];
  addRedemption: (redemption: Omit<ActiveRedemption, 'id' | 'code' | 'expiresAt' | 'used'>) => ActiveRedemption;
  useRedemption: (redemptionId: string) => boolean;
  getActiveRedemptions: () => ActiveRedemption[];
}

const initialTransactions: RewardTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'earned',
    points: 100,
    description: 'Welcome bonus',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'earned',
    points: 80,
    description: 'Booking completed — Champions Arena',
    createdAt: '2026-09-15T18:00:00Z',
    bookingId: 'PL-250915-01',
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'redeemed',
    points: -50,
    description: '₹50 Booking Discount redeemed',
    createdAt: '2026-09-18T12:00:00Z',
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    type: 'earned',
    points: 100,
    description: 'Booking completed — Skyline Kickoff',
    createdAt: '2026-09-20T19:00:00Z',
    bookingId: 'PL-250920-062',
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    type: 'bonus',
    points: 200,
    description: 'Weekend bonus event',
    createdAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    type: 'earned',
    points: 80,
    description: 'Booking completed — Champions Arena',
    createdAt: '2026-09-25T20:00:00Z',
    bookingId: 'PL-250925-084',
  },
];

function generateCode(): string {
  return 'TP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      transactions: initialTransactions,
      activeRedemptions: [],

      addTransaction: (tx) => {
        const newTx: RewardTransaction = {
          ...tx,
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      getTransactions: (userId: string) => {
        return get().transactions.filter((t) => t.userId === userId);
      },

      addRedemption: (redemption) => {
        const newRedemption: ActiveRedemption = {
          ...redemption,
          id: `red-${Date.now()}`,
          code: generateCode(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          used: false,
        };
        set((state) => ({
          activeRedemptions: [newRedemption, ...state.activeRedemptions],
        }));
        return newRedemption;
      },

      useRedemption: (redemptionId: string) => {
        const redemption = get().activeRedemptions.find((r) => r.id === redemptionId);
        if (!redemption || redemption.used) return false;
        
        set((state) => ({
          activeRedemptions: state.activeRedemptions.map((r) =>
            r.id === redemptionId ? { ...r, used: true } : r
          ),
        }));
        return true;
      },

      getActiveRedemptions: () => {
        return get().activeRedemptions.filter(
          (r) => !r.used && new Date(r.expiresAt) > new Date()
        );
      },
    }),
    {
      name: 'playo-rewards',
    }
  )
);
