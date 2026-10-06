import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Filter 
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useReviewStore } from '@/store/useReviewStore';
import type { Review } from '@/types';

export const Route = createFileRoute('/owner/reviews')({
  head: () => ({
    meta: [
      { title: 'Player Reviews & Ratings — Playo Owner' },
      { name: 'description', content: 'View player feedback, respond to reviews, and track satisfaction ratings.' },
    ],
  }),
  component: OwnerReviewsPage,
});

function OwnerReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';
  const turfs = useOwnerStore((s) => s.turfs);
  const storeReviews = useReviewStore((s) => s.reviews);
  const respondToReview = useReviewStore((s) => s.respondToReview);

  // Derive this owner's exact venues
  const myTurfIds = useMemo(() => {
    return new Set(turfs.filter((t) => t.ownerId === ownerId).map((t) => t.id));
  }, [turfs, ownerId]);

  // Isolate reviews to only venues owned by this user (or all if admin)
  const reviewsList = useMemo(() => {
    if (user?.role === 'admin') return storeReviews;
    return storeReviews.filter((r) => myTurfIds.has(r.turfId));
  }, [myTurfIds, user?.role, storeReviews]);
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | '5star' | 'complaints'>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const stats = useMemo(() => {
    const total = reviewsList.length;
    const avg = total > 0 ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '5.0';
    const unanswered = reviewsList.filter((r) => !r.ownerResponse).length;
    const fiveStars = reviewsList.filter((r) => r.rating === 5).length;
    const fourStars = reviewsList.filter((r) => r.rating === 4).length;
    const threeStars = reviewsList.filter((r) => r.rating === 3).length;

    return { total, avg, unanswered, fiveStars, fourStars, threeStars };
  }, [reviewsList]);

  const filteredReviews = useMemo(() => {
    if (filterMode === 'unanswered') {
      return reviewsList.filter((r) => !r.ownerResponse);
    }
    if (filterMode === '5star') {
      return reviewsList.filter((r) => r.rating === 5);
    }
    if (filterMode === 'complaints') {
      return reviewsList.filter((r) => r.complaintCategory && r.complaintCategory !== 'NONE');
    }
    return reviewsList;
  }, [reviewsList, filterMode]);

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    respondToReview(reviewId, replyText.trim());
    setRespondingTo(null);
    setReplyText('');
  };

  return (
    <div className="container-page py-10 space-y-8">
      <div>
        <p className="eyebrow">Customer Satisfaction</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black">PLAYER REVIEWS & FEEDBACK</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public reviews verified from confirmed match bookings. Responding promptly builds trust and raises repeat games.
        </p>
      </div>

      {/* Ratings & Distribution Overview */}
      <div className="grid gap-5 md:grid-cols-[300px_1fr]">
        <div className="card-shell p-6 flex flex-col items-center justify-center text-center">
          <span className="font-display text-6xl font-black text-foreground">{stats.avg}</span>
          <div className="flex items-center gap-1 my-2 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-current" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-bold">Based on {stats.total} verified reviews</p>
          <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400">
            Top 5% Rated Arena in City
          </div>
        </div>

        {/* Rating Bars & Breakdown */}
        <div className="card-shell p-6 space-y-3">
          <h3 className="font-display text-xl font-bold">Rating Distribution</h3>
          <div className="space-y-2 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="w-12 text-muted-foreground">5 Stars</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(stats.fiveStars / stats.total) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right">{stats.fiveStars}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-12 text-muted-foreground">4 Stars</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full"
                  style={{ width: `${(stats.fourStars / stats.total) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right">{stats.fourStars}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-12 text-muted-foreground">3 Stars</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary/40 rounded-full"
                  style={{ width: `${(stats.threeStars / stats.total) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right">{stats.threeStars}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              <strong>Complaint rate:</strong> 0.8% (Facility Maintenance)
            </span>
            <span>
              <strong>Average response time:</strong> Under 2 hours
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'all', label: `All Reviews (${reviewsList.length})` },
          { id: 'unanswered', label: `Unanswered (${stats.unanswered})` },
          { id: '5star', label: `5 Stars (${stats.fiveStars})` },
          { id: 'complaints', label: 'Facility Notes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              filterMode === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div key={rev.id} className="card-shell p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary grid place-items-center font-display font-black text-sm text-foreground">
                  {rev.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-foreground">{rev.userName}</h4>
                    {rev.isVerifiedPlay && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                        <CheckCircle2 className="size-3" /> Verified Player
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Played {rev.sportsPlayed.toUpperCase()} · {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < rev.rating ? 'fill-current' : 'text-muted stroke-current'}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed">{rev.comment}</p>

            {rev.complaintCategory && rev.complaintCategory !== 'NONE' && (
              <div className="inline-flex items-center gap-1.5 rounded bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 font-bold">
                <AlertCircle className="size-3.5" /> Note: {rev.complaintCategory} issue mentioned
              </div>
            )}

            {/* Owner Response Block */}
            {rev.ownerResponse ? (
              <div className="rounded-xl border border-primary/20 bg-secondary/40 p-4 text-xs space-y-1.5 ml-4 sm:ml-8">
                <div className="flex items-center justify-between text-muted-foreground font-bold">
                  <span className="text-primary font-extrabold">Your Response (Champions Sports):</span>
                  <span>{new Date(rev.ownerResponse.respondedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-foreground leading-relaxed">{rev.ownerResponse.message}</p>
              </div>
            ) : (
              <div className="pt-2">
                {respondingTo === rev.id ? (
                  <div className="space-y-3 rounded-lg border border-border p-3.5 bg-background">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a courteous public reply to this player..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-card p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setRespondingTo(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSendReply(rev.id)}>
                        <Send className="size-3 mr-1" /> Post Response
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setRespondingTo(rev.id);
                      setReplyText('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <MessageSquare className="size-3.5" /> Reply to Player
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
