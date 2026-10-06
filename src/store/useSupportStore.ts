import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockSupportTickets } from '@/data/supportTickets';
import type {
  SupportTicket,
  SupportMessage,
  UserRole,
  SupportTicketStatus,
  SupportTicketCategory,
  SupportTicketPriority,
} from '@/types';

interface SupportState {
  tickets: SupportTicket[];

  getUserTickets: (userId: string) => SupportTicket[];
  getAllTickets: () => SupportTicket[];
  getTicketById: (ticketId: string) => SupportTicket | undefined;
  createTicket: (data: {
    userId: string;
    userName: string;
    userRole: UserRole;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
    subject: string;
    description: string;
    bookingId?: string;
    venueId?: string;
    venueName?: string;
  }) => SupportTicket;
  addMessage: (ticketId: string, authorId: string, authorName: string, authorRole: UserRole, message: string) => boolean;
  updateStatus: (ticketId: string, status: SupportTicketStatus) => boolean;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set, get) => ({
      tickets: mockSupportTickets,

      getUserTickets: (userId) => get().tickets.filter((t) => t.userId === userId),
      getAllTickets: () => get().tickets,
      getTicketById: (ticketId) => get().tickets.find((t) => t.id === ticketId),

      createTicket: (data) => {
        const ticketId = `ticket-${Date.now()}`;
        const ticket: SupportTicket = {
          ...data,
          id: ticketId,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `msg-${Date.now()}`,
              ticketId,
              authorId: data.userId,
              authorName: data.userName,
              authorRole: data.userRole,
              message: data.description,
              createdAt: new Date().toISOString(),
            },
          ],
        };
        set((s) => ({ tickets: [ticket, ...s.tickets] }));
        return ticket;
      },

      addMessage: (ticketId, authorId, authorName, authorRole, message) => {
        const ticket = get().tickets.find((t) => t.id === ticketId);
        if (!ticket) return false;

        const msg: SupportMessage = {
          id: `msg-${Date.now()}`,
          ticketId,
          authorId,
          authorName,
          authorRole,
          message,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  messages: [...t.messages, msg],
                  updatedAt: new Date().toISOString(),
                  status: authorRole === 'admin' ? 'in_progress' : t.status,
                }
              : t
          ),
        }));
        return true;
      },

      updateStatus: (ticketId, status) => {
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status,
                  updatedAt: new Date().toISOString(),
                  resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : t.resolvedAt,
                }
              : t
          ),
        }));
        return true;
      },
    }),
    {
      name: 'playo-support-tickets',
      partialize: (state) => ({ tickets: state.tickets }),
    }
  )
);
