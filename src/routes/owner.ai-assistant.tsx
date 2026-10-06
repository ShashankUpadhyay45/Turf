import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Download, 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle, 
  HelpCircle,
  Lightbulb,
  FileSpreadsheet
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { ownerInsights, type AIResponse } from '@/services/ai/ownerInsights';

export const Route = createFileRoute('/owner/ai-assistant')({
  head: () => ({
    meta: [
      { title: 'AI Venue Copilot — Playo Owner' },
      { name: 'description', content: 'Natural language sports venue intelligence and automated revenue reporting.' },
    ],
  }),
  component: OwnerAiAssistantPage,
});

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: AIResponse;
}

const suggestedQuestions = [
  'How was my revenue this month?',
  'Which days generate the most revenue?',
  'What are my peak booking hours?',
  'Compare this month with last month.',
  'Generate my yearly revenue report.',
  'Which sport brings the most bookings?',
  'Analyze my player footfall and retention.',
];

function OwnerAiAssistantPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${user?.name ?? 'Champions Sports'}! I am your Playo Venue Intelligence Copilot. I analyze your ground bookings, dynamic pricing, and occupancy patterns in real time. How can I assist your operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText ?? inputPrompt;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputPrompt('');
    setIsTyping(true);

    try {
      const result = await ownerInsights.queryAssistant(textToSend, user?.name);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: result,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to analyze operational data at this moment. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadReport = (title: string = 'Executive Performance Report') => {
    setDownloadNotice(`Generated ${title} (PDF download placeholder).`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="container-page py-10 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/20 text-primary">
              <Bot className="size-5" />
            </span>
            <h1 className="font-display text-3xl font-black">AI VENUE COPILOT</h1>
            <Badge tone="green">Local Intelligence Engine</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ask natural language questions about your revenue, slot utilization, competitor rates, and player demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadReport('Monthly Executive Summary')}
            className="text-xs"
          >
            <Download className="size-3.5 mr-1" /> Download Monthly Report
          </Button>
        </div>
      </div>

      {downloadNotice && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-2">
          <CheckCircle className="size-4" />
          {downloadNotice}
        </div>
      )}

      {/* Suggested Prompts Carousel */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="size-3.5 text-amber-400" /> Suggested Inquiries
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-full border border-border bg-card hover:border-primary/50 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-muted-foreground hover:text-foreground transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Display Canvas */}
      <div className="card-shell min-h-[500px] flex flex-col justify-between p-4 sm:p-6 bg-card/40">
        <div className="space-y-6 overflow-y-auto max-h-[560px] pr-2">
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary mt-1">
                    <Bot className="size-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed space-y-3 ${
                    isMe
                      ? 'bg-primary text-primary-foreground font-semibold rounded-br-xs'
                      : 'bg-secondary/70 border border-border text-foreground rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Render Metrics & Actionable Suggestions if present */}
                  {msg.data?.metrics && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                      {msg.data.metrics.totalRevenue && (
                        <div className="rounded-md bg-background/50 p-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Gross Revenue</span>
                          <p className="font-display text-base font-black text-foreground">{msg.data.metrics.totalRevenue}</p>
                        </div>
                      )}
                      {msg.data.metrics.growth && (
                        <div className="rounded-md bg-background/50 p-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Growth Rate</span>
                          <p className="font-display text-base font-black text-emerald-400">{msg.data.metrics.growth}</p>
                        </div>
                      )}
                      {msg.data.metrics.peakTimes && (
                        <div className="rounded-md bg-background/50 p-2 col-span-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Peak Occupancy Window</span>
                          <p className="font-extrabold text-foreground">{msg.data.metrics.peakTimes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.data?.recommendations && (
                    <div className="pt-2 border-t border-border/50 space-y-1.5">
                      <p className="text-[11px] font-extrabold text-primary uppercase">Actionable Recommendations:</p>
                      {msg.data.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="text-primary font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {msg.data?.suggestedFollowUps && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.data.suggestedFollowUps.map((fu) => (
                        <button
                          key={fu}
                          onClick={() => handleSend(fu)}
                          className="rounded-full bg-background/80 hover:bg-background border border-border px-2.5 py-1 text-[11px] font-bold text-foreground transition"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground text-right pt-1 opacity-70">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <div className="grid size-7 place-items-center rounded bg-primary/20 text-primary">
                <Bot className="size-4" />
              </div>
              <span>Analyzing venue occupancy & revenue history...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about revenue, peak hours, footfall, or request a periodic report..."
              className="h-12 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary font-normal"
            />
            <Button type="submit" disabled={!inputPrompt.trim() || isTyping} className="h-12 px-5">
              <Send className="size-4 mr-1.5" /> Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
