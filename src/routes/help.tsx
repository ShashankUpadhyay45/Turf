import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useSupportStore } from '@/store/useSupportStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { SupportTicket, SupportTicketCategory, SupportTicketPriority } from '@/types';

export const Route = createFileRoute('/help')({
  head: () => ({
    meta: [
      { title: 'Help Center & Support — Playo' },
      { name: 'description', content: 'Need assistance with your booking, refund, or account? Contact the Playo customer support team.' },
    ],
  }),
  component: HelpCenterPage,
});

const FAQS = [
  {
    q: 'How does the cancellation and refund policy work?',
    a: 'Every verified venue maintains a transparent cancellation policy displayed right on its booking ticket. Generally, cancellations made at least 4 hours before kickoff receive an instant 100% full refund.',
  },
  {
    q: 'How do I redeem my TurfPoints for discounts?',
    a: 'When booking any turf or gaming zone, simply toggle "Use TurfPoints" during checkout. 1 TurfPoint equals ₹1 off your total match fee.',
  },
  {
    q: 'What benefits do I get with the All-Access Annual Pass?',
    a: 'Annual Pass holders receive a flat 25% discount on all bookings, 2.5x TurfPoints multiplier, zero rescheduling fees, and priority reservations during peak evening hours (7 PM - 10 PM).',
  },
  {
    q: 'How do I reach the venue with Google Maps?',
    a: 'Every venue page has an interactive Google Maps location card with turn-by-turn navigation. Tap "Get Directions" to open live directions in Google Maps directly from your phone.',
  },
];

function HelpCenterPage() {
  const user = useAuthStore((s) => s.user);
  const targetUserId = user?.id ?? 'user-1';
  const allTickets = useSupportStore((s) => s.tickets);
  const tickets = useMemo(() => allTickets.filter((t) => t.userId === targetUserId), [allTickets, targetUserId]);
  const createTicket = useSupportStore((s) => s.createTicket);
  const addMessage = useSupportStore((s) => s.addMessage);

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form states
  const [category, setCategory] = useState<SupportTicketCategory>('booking');
  const [priority, setPriority] = useState<SupportTicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const t = createTicket({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      category,
      priority,
      subject,
      description,
      bookingId: bookingRef.trim() || undefined,
    });

    setNewModalOpen(false);
    setActiveTicket(t);
    setSubject('');
    setDescription('');
    setBookingRef('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !user || !replyText.trim()) return;

    addMessage(activeTicket.id, user.id, user.name, user.role, replyText.trim());
    setReplyText('');
    // Refresh active ticket view
    const updated = useSupportStore.getState().getTicketById(activeTicket.id);
    if (updated) setActiveTicket(updated);
  };

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-primary tracking-wider">
            Customer Care & Resolution
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Help Center & Support Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse instant answers or raise a support ticket directly with the operations team.
          </p>
        </div>

        <Button
          tone="primary"
          onClick={() => setNewModalOpen(true)}
          className="rounded-xl px-5 py-2.5 font-bold shrink-0 shadow-xs"
        >
          <Plus className="size-4 mr-2" /> Raise Support Ticket
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Tickets List */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="font-display text-base font-black text-foreground flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" /> Your Support Tickets ({tickets.length})
          </h3>

          {tickets.length === 0 ? (
            <div className="card-shell p-6 text-center text-xs text-muted-foreground space-y-2">
              <p>You have no active or historical support tickets.</p>
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

          {/* Quick FAQ Accordion */}
          <div className="card-shell p-5 space-y-3 mt-6">
            <h4 className="font-display text-sm font-black text-foreground flex items-center gap-2">
              <FileQuestion className="size-4 text-primary" /> Frequently Asked Questions
            </h4>
            <div className="space-y-2 text-xs divide-y divide-border/50">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="pt-2">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex items-center justify-between w-full font-bold text-foreground text-left py-1"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="size-3.5 shrink-0" /> : <ChevronDown className="size-3.5 shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <p className="text-muted-foreground leading-relaxed pt-1 pb-2">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-2">
          {activeTicket ? (
            <div className="card-shell flex flex-col h-[600px] overflow-hidden">
              {/* Ticket Header */}
              <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/30 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Ticket #{activeTicket.id}
                    </span>
                    <Badge tone={activeTicket.status === 'resolved' ? 'success' : 'info'}>
                      {activeTicket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="font-display text-base font-black text-foreground">
                    {activeTicket.subject}
                  </h3>
                  {activeTicket.bookingId && (
                    <span className="text-xs text-primary font-bold">
                      Booking Ref: {activeTicket.bookingId}
                    </span>
                  )}
                </div>
              </div>

              {/* Message History */}
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

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-border/80 bg-background flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your response to support..."
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
              <MessageSquare className="size-10 text-muted-foreground/60" />
              <h4 className="font-display text-base font-bold text-foreground">Select a Support Ticket</h4>
              <p className="text-xs max-w-sm">
                Choose a ticket from the left panel to review responses, or raise a new inquiry regarding match reservations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Raise Support Ticket Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xl font-black text-foreground">
                  Raise Support Ticket
                </h3>
                <p className="text-xs text-muted-foreground">
                  Our operations team will respond to your inquiry promptly.
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
                  <label className="text-xs font-bold text-foreground">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    aria-label="Ticket Category"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="booking">Match Booking Issue</option>
                    <option value="refund">Cancellation & Refund</option>
                    <option value="payment">Demo Payment Query</option>
                    <option value="venue">Venue Facility Feedback</option>
                    <option value="account">Membership & Points</option>
                    <option value="other">General Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    aria-label="Ticket Priority"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Match Today</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need help cancelling slot at Champions Arena"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Booking Reference Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TB-2026-88124"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Please describe what happened so our support desk can assist you accurately."
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
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
