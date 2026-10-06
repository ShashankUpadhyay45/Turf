import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  Building2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useSupportStore } from '@/store/useSupportStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import type { SupportTicket, SupportTicketCategory, SupportTicketPriority } from '@/types';

export const Route = createFileRoute('/owner/help')({
  head: () => ({
    meta: [
      { title: 'Owner Support & Help Center — Playo' },
      { name: 'description', content: 'Contact the Playo Venue Operations team regarding listings, slot disputes, and payouts.' },
    ],
  }),
  component: OwnerHelpPage,
});

function OwnerHelpPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';
  const allTurfs = useOwnerStore((s) => s.turfs);
  const myVenues = useMemo(() => allTurfs.filter((t) => t.ownerId === ownerId), [allTurfs, ownerId]);

  const allTickets = useSupportStore((s) => s.tickets);
  const tickets = useMemo(() => allTickets.filter((t) => t.userId === ownerId), [allTickets, ownerId]);
  const createTicket = useSupportStore((s) => s.createTicket);
  const addMessage = useSupportStore((s) => s.addMessage);

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Form states
  const [category, setCategory] = useState<SupportTicketCategory>('venue');
  const [priority, setPriority] = useState<SupportTicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selVenue = myVenues.find((v) => v.id === selectedVenueId);

    const t = createTicket({
      userId: ownerId,
      userName: user?.name ?? 'Venue Owner',
      userRole: 'owner',
      category,
      priority,
      subject,
      description,
      venueId: selVenue?.id,
      venueName: selVenue?.name,
    });

    setNewModalOpen(false);
    setActiveTicket(t);
    setSubject('');
    setDescription('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    addMessage(activeTicket.id, ownerId, user?.name ?? 'Venue Owner', 'owner', replyText.trim());
    setReplyText('');
    const updated = useSupportStore.getState().getTicketById(activeTicket.id);
    if (updated) setActiveTicket(updated);
  };

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-primary tracking-wider">
            Owner Operations Support
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Venue Partner Help Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dedicated assistance for listing verification, availability violation disputes, and payout queries.
          </p>
        </div>

        <Button
          tone="primary"
          onClick={() => {
            if (myVenues.length > 0 && !selectedVenueId) setSelectedVenueId(myVenues[0]!.id);
            setNewModalOpen(true);
          }}
          className="rounded-xl px-5 py-2.5 font-bold shrink-0 shadow-xs"
        >
          <Plus className="size-4 mr-2" /> Submit Partner Ticket
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Tickets */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="font-display text-base font-black text-foreground flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" /> Active Partner Tickets ({tickets.length})
          </h3>

          {tickets.length === 0 ? (
            <div className="card-shell p-6 text-center text-xs text-muted-foreground space-y-2">
              <p>You have no active support inquiries.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-border/80 bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground">
                        {t.category}
                      </span>
                      <Badge tone={t.status === 'resolved' ? 'success' : 'info'}>
                        {t.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-xs text-foreground truncate">{t.subject}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(t.createdAt).toLocaleDateString()} · {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Conversation */}
        <div className="lg:col-span-2">
          {activeTicket ? (
            <div className="card-shell flex flex-col h-[580px] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/30 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Partner Ticket #{activeTicket.id}
                    </span>
                    <Badge tone={activeTicket.status === 'resolved' ? 'success' : 'info'}>
                      {activeTicket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="font-display text-base font-black text-foreground">
                    {activeTicket.subject}
                  </h3>
                  {activeTicket.venueName && (
                    <span className="text-xs text-primary font-bold">
                      Facility: {activeTicket.venueName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
                {activeTicket.messages.map((m) => {
                  const isAdmin = m.authorRole === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[10px] text-muted-foreground">
                        <span className="font-bold">{m.authorName}</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                          isAdmin
                            ? 'bg-muted/80 text-foreground border border-border/60 rounded-tl-xs'
                            : 'bg-primary text-primary-foreground rounded-tr-xs'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="p-4 border-t border-border/80 bg-background flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send reply to operations desk..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
                <Button tone="primary" type="submit" disabled={!replyText.trim()} className="rounded-xl px-4">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="card-shell p-12 text-center text-muted-foreground space-y-3 h-[400px] flex flex-col items-center justify-center">
              <Building2 className="size-10 text-muted-foreground/60" />
              <h4 className="font-display text-base font-bold text-foreground">Select a Partner Ticket</h4>
              <p className="text-xs max-w-sm">
                Track compliance notes, listing approvals, or submit a new inquiry regarding your facilities.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Raise Partner Ticket Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xl font-black text-foreground">
                  Submit Partner Inquiry
                </h3>
                <p className="text-xs text-muted-foreground">
                  Our venue support team handles partner inquiries with high priority.
                </p>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Topic Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    aria-label="Topic Category"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="venue">Listing & Inspection Delay</option>
                    <option value="technical">Slot Sync & Availability</option>
                    <option value="refund">Cancellation Dispute</option>
                    <option value="payment">Payout & Bank Settlement</option>
                    <option value="other">Compliance & Verification</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    aria-label="Priority"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="medium">Standard (24h SLA)</option>
                    <option value="high">Urgent Match Conflict</option>
                  </select>
                </div>
              </div>

              {myVenues.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Associated Facility</label>
                  <select
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    aria-label="Associated Facility"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {myVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Requesting expedited inspection for Court 2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details and reference IDs so operations can resolve quickly."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <Button variant="outline" type="button" onClick={() => setNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button tone="primary" type="submit">
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
