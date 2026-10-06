import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Star, ShieldCheck, Trash2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { reviews as initialReviews } from '@/data/turfs';
import type { Review } from '@/types';

export const Route = createFileRoute('/admin/reviews')({
  head: () => ({
    meta: [
      { title: 'Review Moderation — SuperAdmin' },
      { name: 'description', content: 'Moderate player reviews and ensure authentic community ratings.' },
    ],
  }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [toast, setToast] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setReviewsList((prev) => prev.filter((r) => r.id !== id));
    setToast(`Review #${id} has been removed by platform moderation.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Community & Content Moderation</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">PLATFORM REVIEWS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ensure public feedback remains constructive, authentic, and free of abuse.
          </p>
        </div>
      </div>

      {toast && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="space-y-4">
        {reviewsList.map((r) => (
          <div key={r.id} className="card-shell p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{r.userName}</h4>
                  <Badge tone="blue">{r.turfName ?? 'Champions Arena'}</Badge>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < r.rating ? 'fill-current' : 'text-muted stroke-current'}`}
                    />
                  ))}
                  <span className="text-muted-foreground text-[10px] ml-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(r.id)}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 font-bold p-1 rounded"
              >
                <Trash2 className="size-3.5" /> Remove Review
              </button>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
