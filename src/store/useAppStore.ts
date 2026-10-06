import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  favorites: string[];
  selectedDate: string;
  selectedSlot: string;
  selectedSport: string;
  rewardApplied: boolean;
  rewardDiscount: number;
  
  toggleFavorite: (id: string) => void;
  setBooking: (date: string, slot: string) => void;
  setSelectedSport: (sport: string) => void;
  toggleReward: () => void;
  setRewardDiscount: (amount: number) => void;
  resetBookingState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: ['skyline-kickoff'],
      selectedDate: '',
      selectedSlot: '',
      selectedSport: '',
      rewardApplied: false,
      rewardDiscount: 50,

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),

      setBooking: (selectedDate, selectedSlot) =>
        set({ selectedDate, selectedSlot }),

      setSelectedSport: (sport) => set({ selectedSport: sport }),

      toggleReward: () => set((s) => ({ rewardApplied: !s.rewardApplied })),

      setRewardDiscount: (amount) => set({ rewardDiscount: amount }),

      resetBookingState: () =>
        set({
          selectedDate: '',
          selectedSlot: '',
          selectedSport: '',
          rewardApplied: false,
        }),
    }),
    {
      name: 'playo-app',
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
