import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockNotifications } from '@/data/turfs';
import type { NotificationItem, NotificationCategory } from '@/types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: (userId: string, category?: NotificationCategory | 'all') => NotificationItem[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.read).length,

      addNotification: (item) => {
        const newItem: NotificationItem = {
          ...item,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => {
          const updated = [newItem, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      markAsRead: (id: string) => {
        set((state) => {
          const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id: string) => {
        set((state) => {
          const updated = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      getUserNotifications: (userId: string, category: NotificationCategory | 'all' = 'all') => {
        const list = get().notifications.filter(
          (n) => n.userId === userId || n.userId === 'user-1' || userId === 'admin-1'
        );
        if (category === 'all') return list;
        return list.filter((n) => n.category === category);
      },
    }),
    {
      name: 'playo-notifications-store',
    }
  )
);
