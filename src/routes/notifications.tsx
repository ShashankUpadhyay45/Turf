import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, Gift, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { NotificationCategory } from '@/types';

export const Route = createFileRoute('/notifications')({
  head: () => ({
    meta: [
      { title: 'Notifications & Alerts — Playo' },
      { name: 'description', content: 'Match passes, slot confirmations, and TurfPoints rewards updates.' },
    ],
  }),
  component: PlayerNotificationsPage,
});

function PlayerNotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'user-1';

  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');
  const allNotifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);

  const notifications = useMemo(() => {
    return allNotifications.filter((n) => {
      const matchUser = !n.userId || n.userId === userId || n.userId === 'all';
      const matchCat = activeCategory === 'all' || n.category === activeCategory;
      return matchUser && matchCat;
    });
  }, [allNotifications, userId, activeCategory]);

  const getIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'booking':
        return <Calendar className="size-4 text-emerald-400" />;
      case 'rewards':
        return <Gift className="size-4 text-amber-400" />;
      case 'membership':
        return <Sparkles className="size-4 text-primary" />;
      case 'admin_warning':
        return <ShieldAlert className="size-4 text-rose-400" />;
      default:
        return <Info className="size-4 text-blue-400" />;
    }
  };

  return (
    <div className="container-page py-10 space-y-6 max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Activity & Messages</p>
          <h1 className="font-display text-4xl font-black">NOTIFICATIONS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Match confirmation passes, TurfPoints earnings, and availability updates.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={markAllAsRead} className="text-xs">
          <CheckCheck className="size-3.5 mr-1" /> Mark All as Read
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'booking', 'rewards', 'membership', 'availability'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`card-shell p-4 transition flex items-start justify-between gap-4 cursor-pointer hover:border-primary/40 ${
                !n.read ? 'border-primary/40 bg-secondary/30' : 'opacity-85'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-card border border-border mt-0.5">
                  {getIcon(n.category)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                    {!n.read && <span className="size-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="text-muted-foreground hover:text-destructive p-1 rounded"
                title="Dismiss"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="card-shell p-12 text-center text-muted-foreground">
            <Bell className="mx-auto size-8 opacity-40 mb-2" />
            <h4 className="font-display text-lg font-bold">No Notifications</h4>
            <p className="text-xs mt-1">You are all caught up with your sports bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
