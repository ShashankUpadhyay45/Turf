import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tournaments as seedTournaments } from '@/data/tournaments';
import type { Tournament, TournamentRegistration } from '@/types';

interface TournamentState {
  tournaments: Tournament[];

  // Owner actions (filters strictly by ownerId)
  getOwnerTournaments: (ownerId: string) => Tournament[];
  createTournament: (data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'registrations'>) => Tournament;
  updateTournament: (id: string, ownerId: string, updates: Partial<Tournament>) => boolean;
  deleteTournament: (id: string, ownerId: string) => boolean;
  publishTournament: (id: string, ownerId: string) => boolean;
  unpublishTournament: (id: string, ownerId: string) => boolean;

  // Player actions
  getAllPublicTournaments: () => Tournament[];
  getTournamentsByVenueId: (venueId: string) => Tournament[];
  registerForTournament: (tournamentId: string, userId: string, userName: string, userEmail?: string, teamName?: string) => boolean;
  cancelRegistration: (tournamentId: string, userId: string) => boolean;
  getUserRegistrations: (userId: string) => Tournament[];
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: seedTournaments,

      getOwnerTournaments: (ownerId) => {
        return get().tournaments.filter((t) => t.ownerId === ownerId);
      },

      createTournament: (data) => {
        const newTournament: Tournament = {
          ...data,
          id: `tourn-${Date.now()}`,
          currentParticipants: 0,
          registrations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ tournaments: [newTournament, ...s.tournaments] }));
        return newTournament;
      },

      updateTournament: (id, ownerId, updates) => {
        const tournament = get().tournaments.find((t) => t.id === id && t.ownerId === ownerId);
        if (!tournament) return false;
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
        return true;
      },

      deleteTournament: (id, ownerId) => {
        const tournament = get().tournaments.find((t) => t.id === id && t.ownerId === ownerId);
        if (!tournament) return false;
        set((s) => ({ tournaments: s.tournaments.filter((t) => t.id !== id) }));
        return true;
      },

      publishTournament: (id, ownerId) => {
        return get().updateTournament(id, ownerId, {
          status: 'registration_open',
          publishedAt: new Date().toISOString(),
        });
      },

      unpublishTournament: (id, ownerId) => {
        return get().updateTournament(id, ownerId, { status: 'draft' });
      },

      getAllPublicTournaments: () => {
        return get().tournaments.filter((t) =>
          t.status === 'registration_open' || t.status === 'published' || t.status === 'ongoing'
        );
      },

      getTournamentsByVenueId: (venueId) => {
        return get().tournaments.filter((t) =>
          t.venueId === venueId &&
          (t.status === 'registration_open' || t.status === 'published' || t.status === 'ongoing')
        );
      },

      registerForTournament: (tournamentId, userId, userName, userEmail, teamName) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        if (!tournament) return false;
        if (tournament.currentParticipants >= tournament.maxParticipants) return false;
        if (tournament.status !== 'registration_open') return false;

        // Check if already registered
        const alreadyRegistered = tournament.registrations?.some((r) => r.userId === userId && r.status === 'registered');
        if (alreadyRegistered) return false;

        const registration: TournamentRegistration = {
          id: `reg-${Date.now()}`,
          tournamentId,
          userId,
          userName,
          userEmail,
          teamName,
          registeredAt: new Date().toISOString(),
          status: 'registered',
          paymentStatus: tournament.entryFee > 0 ? 'paid' : 'paid', // Demo registration is marked paid
          entryFeePaid: tournament.entryFee,
        };

        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  currentParticipants: t.currentParticipants + 1,
                  registrations: [...(t.registrations ?? []), registration],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        return true;
      },

      cancelRegistration: (tournamentId, userId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        if (!tournament) return false;

        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === tournamentId
              ? {
                  ...t,
                  currentParticipants: Math.max(0, t.currentParticipants - 1),
                  registrations: (t.registrations ?? []).map((r) =>
                    r.userId === userId ? { ...r, status: 'cancelled' as const } : r
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        return true;
      },

      getUserRegistrations: (userId) => {
        return get().tournaments.filter((t) =>
          t.registrations?.some((r) => r.userId === userId && r.status === 'registered')
        );
      },
    }),
    {
      name: 'playo-tournaments',
      partialize: (state) => ({ tournaments: state.tournaments }),
    }
  )
);
