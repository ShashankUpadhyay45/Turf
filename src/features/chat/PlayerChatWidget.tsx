import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  MessageSquare,
  Send,
  X,
  Minus,
  RotateCcw,
  Sparkles,
  Bot,
  MapPin,
  Star,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useChatStore, type ChatMessage } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Badge } from '@/components/ui';

export function PlayerChatWidget() {
  const {
    isOpen,
    isMinimized,
    unreadCount,
    isTyping,
    messages,
    openChat,
    closeChat,
    toggleChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    sendQuickPrompt,
    clearHistory,
    resetUnread,
  } = useChatStore();

  const user = useAuthStore((s) => s.user);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      resetUnread();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, resetUnread]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const query = inputText;
    setInputText('');

    await sendMessage(query, {
      userId: user?.id,
      userName: user?.name,
      membershipTier: user?.membershipTier,
      rewardPoints: user?.rewardPoints,
    });
  };

  const handleQuickClick = async (prompt: string) => {
    if (isTyping) return;
    await sendQuickPrompt(prompt, {
      userId: user?.id,
      userName: user?.name,
      membershipTier: user?.membershipTier,
      rewardPoints: user?.rewardPoints,
    });
  };

  // Helper to parse simple markdown formatting in bot text (*bold*, bullet points, line breaks)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process bold tokens **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-foreground">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          // Bullet point line
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-primary mt-0.5">•</span>
                <span>{formattedParts}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Hidden when chat modal is open and not minimized) */}
      {(!isOpen || isMinimized) && (
        <div className="fixed bottom-32 right-4 sm:bottom-6 sm:right-6 z-40">
          <button
            onClick={isOpen && isMinimized ? maximizeChat : toggleChat}
            aria-label="Open Playo Sports Concierge"
            className="group relative flex items-center gap-2.5 rounded-full bg-linear-to-r from-primary via-emerald-500 to-teal-500 p-3.5 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="relative">
              <Sparkles className="size-6 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-black text-destructive-foreground ring-2 ring-background animate-bounce">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-black tracking-wide leading-none">
                Playo Sports Concierge
              </span>
              <span className="text-[10px] text-primary-foreground/80 leading-tight">
                Ask about turfs, passes & slots
              </span>
            </div>
          </button>
        </div>
      )}

      {/* CHAT WINDOW / MODAL */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-32 right-4 sm:bottom-6 sm:right-6 w-72 h-14 overflow-hidden rounded-xl border border-border bg-card shadow-lg flex items-center justify-between px-4'
              : 'bottom-20 right-3 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[430px] h-[78vh] sm:h-[620px] max-h-[720px] rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5'
          }`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative grid size-9 place-items-center rounded-xl bg-linear-to-br from-primary to-emerald-600 text-primary-foreground shadow-xs">
                <Bot className="size-5" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-black text-foreground">
                    Playo Sports Concierge
                  </h3>
                  <Badge tone="success" size="sm">
                    AI Online
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Instant turf finder & membership assistant
                </p>
              </div>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-1">
              {isMinimized ? (
                <button
                  onClick={maximizeChat}
                  title="Expand"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <ChevronDown className="size-4 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={minimizeChat}
                  title="Minimize"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <Minus className="size-4" />
                </button>
              )}

              <button
                onClick={clearHistory}
                title="Clear Chat History"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                onClick={closeChat}
                title="Close Concierge"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES BODY (If not minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
                {messages.map((msg) => {
                  const isBot = msg.sender === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {isBot ? 'Playo Concierge' : 'You'}
                        </span>
                        <span className="text-[9px] text-muted-foreground/70">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[90%] rounded-2xl p-3.5 shadow-xs ${
                          isBot
                            ? 'bg-muted/70 text-foreground border border-border/60 rounded-tl-xs'
                            : 'bg-primary text-primary-foreground rounded-tr-xs font-medium'
                        }`}
                      >
                        {isBot ? renderFormattedText(msg.text) : <p className="text-xs sm:text-sm">{msg.text}</p>}

                        {/* Interactive Turf Cards */}
                        {isBot && msg.turfCards && msg.turfCards.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.turfCards.map((turf) => (
                              <div
                                key={turf.id}
                                className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-2.5 shadow-xs transition hover:border-primary/50"
                              >
                                <img
                                  src={turf.image}
                                  alt={turf.name}
                                  className="size-14 rounded-lg object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-xs truncate text-foreground">
                                    {turf.name}
                                  </h4>
                                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                    <MapPin className="size-3 text-primary shrink-0" />
                                    {turf.area}, {turf.city}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-xs text-primary">
                                        ₹{turf.pricePerHour}/hr
                                      </span>
                                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                                        <Star className="size-2.5 fill-amber-500" />
                                        {turf.rating}
                                      </span>
                                    </div>
                                    <Link
                                      to="/booking/$turfId"
                                      params={{ turfId: turf.id }}
                                      onClick={() => closeChat()}
                                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black text-primary hover:bg-primary hover:text-primary-foreground transition"
                                    >
                                      Book <ArrowRight className="size-2.5" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Direct Action Link */}
                        {isBot && msg.action && (
                          <div className="mt-3 pt-2 border-t border-border/40">
                            <Link
                              to={msg.action.to}
                              onClick={() => closeChat()}
                              className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm transition"
                            >
                              <span>{msg.action.label}</span>
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Quick Prompt Pills under latest bot message */}
                      {isBot && msg.quickPills && msg.quickPills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                          {msg.quickPills.map((pill, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleQuickClick(pill)}
                              disabled={isTyping}
                              className="rounded-full border border-border bg-card/80 px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition disabled:opacity-50 text-left"
                            >
                              {pill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing animation indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-muted-foreground p-2 bg-muted/40 rounded-xl w-24">
                    <Bot className="size-3.5 animate-bounce" />
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="size-1.5 rounded-full bg-primary animate-pulse delay-150" />
                      <span className="size-1.5 rounded-full bg-primary animate-pulse delay-300" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BAR */}
              <div className="border-t border-border/80 bg-muted/20 p-3 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about turfs, annual pass, slots..."
                    disabled={isTyping}
                    className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    tone="primary"
                    disabled={!inputText.trim() || isTyping}
                    className="rounded-xl px-3.5 py-2.5 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground px-1">
                  <span>Press Enter to send</span>
                  <span className="font-semibold text-primary/80">Playo AI Concierge</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
