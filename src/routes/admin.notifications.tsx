import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Bell, Send, CheckCircle, Radio } from 'lucide-react';
import { Button } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';

export const Route = createFileRoute('/admin/notifications')({
  head: () => ({
    meta: [
      { title: 'Platform Broadcasts — SuperAdmin' },
      { name: 'description', content: 'Broadcast platform notices, tournament alerts, and weather advisories.' },
    ],
  }),
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'players' | 'owners'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification({
      userId: targetAudience === 'owners' ? 'owner-1' : 'user-1',
      category: 'system',
      title,
      message,
    });

    setToast(`Broadcast dispatched to ${targetAudience.toUpperCase()} audience.`);
    setTitle('');
    setMessage('');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container-page py-10 space-y-6 max-w-3xl">
      <div className="border-b border-border pb-5">
        <p className="eyebrow">Communications Dispatch</p>
        <h1 className="font-display text-4xl font-black">PLATFORM BROADCASTS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send urgent platform alerts, maintenance downtime notices, or tournament announcements.
        </p>
      </div>

      {toast && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-2">
          <CheckCircle className="size-4" />
          {toast}
        </div>
      )}

      <form onSubmit={handleBroadcast} className="card-shell p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Radio className="size-5 text-primary animate-pulse" />
          <h2 className="font-display text-2xl font-black">Create Platform Announcement</h2>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Target Audience</label>
          <div className="flex gap-2">
            {(['all', 'players', 'owners'] as const).map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setTargetAudience(aud)}
                className={`rounded px-3 py-1.5 text-xs font-bold capitalize transition ${
                  targetAudience === aud
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {aud === 'all' ? 'All Platform Users' : aud}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-xs font-bold">
          Announcement Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled Turf Maintenance Window — Oct 2"
            required
            className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 font-normal text-sm"
          />
        </label>

        <label className="block text-xs font-bold">
          Message Body
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to be pushed into recipient notification inboxes..."
            rows={4}
            required
            className="mt-1 w-full rounded-md border border-input bg-background p-3 font-normal text-sm"
          />
        </label>

        <div className="flex justify-end pt-2">
          <Button type="submit">
            <Send className="size-4 mr-1.5" /> Dispatch Announcement
          </Button>
        </div>
      </form>
    </div>
  );
}
