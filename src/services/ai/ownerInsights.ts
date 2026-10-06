// ============================================================================
// OWNER AI INSIGHTS & COPILOT SERVICE (FRONTEND MOCK ADAPTER)
// ============================================================================
// NOTE: Purely frontend client intelligence generator using mock analytics.
// DO NOT CONNECT TO OPENAI / ANTHROPIC / GEMINI DIRECTLY IN FRONTEND.
//
// Future Backend AI Integration:
// Endpoint: POST /api/v1/owner/ai-assistant/query
// Headers: Authorization: Bearer <ownerToken>
// Body: { prompt: string, timeframe?: string, turfId?: string }
// Response: { answer: string, insights: OwnerAIInsight[], metrics: Record<string, any> }
// ============================================================================

import type { OwnerAnalyticsSummary, OwnerAIInsight } from '@/types';

export interface AIResponse {
  answer: string;
  reportType?: 'revenue' | 'footfall' | 'trends' | 'recommendations' | 'period';
  metrics?: {
    totalRevenue?: string;
    growth?: string;
    peakTimes?: string;
    topSport?: string;
    footfall?: string;
  };
  recommendations?: string[];
  suggestedFollowUps?: string[];
}

export const ownerInsights = {
  /**
   * Generates natural language summary for monthly/weekly revenue.
   */
  async generateRevenueSummary(ownerName: string = 'Champions Sports'): Promise<AIResponse> {
    await simulateDelay(600);
    return {
      answer: `Here is your current financial analysis for ${ownerName}. Your venue generated ₹1,48,500 over the past 30 days, representing an 18.2% increase compared to the previous period. Weekend peak slots (7 PM - 10 PM) accounted for 64% of total turnover.`,
      reportType: 'revenue',
      metrics: {
        totalRevenue: '₹1,48,500',
        growth: '+18.2% vs previous period',
        peakTimes: '07:00 PM – 10:00 PM',
        topSport: 'Football 7-a-side (62% share)',
      },
      recommendations: [
        'Apply a 10% dynamic surcharge to Friday & Saturday 8 PM slots to optimize yield.',
        'Offer a 15% discount for weekday morning slots (6 AM - 9 AM) to lift early-bird utilization.',
      ],
      suggestedFollowUps: [
        'Which days generate the most revenue?',
        'Compare this month with last month.',
        'What are my peak booking hours?',
      ],
    };
  },

  /**
   * Generates footfall and player retention analysis.
   */
  async generateFootfallSummary(): Promise<AIResponse> {
    await simulateDelay(600);
    return {
      answer: `Across your venues, total footfall reached 1,840 players this month across 184 completed bookings (average squad size of 10 players). Repeat customer retention stands strong at 41%, while 110 unique new captains booked for the first time.`,
      reportType: 'footfall',
      metrics: {
        footfall: '1,840 active players',
        growth: '+24% new player discovery',
        peakTimes: 'Fridays, Saturdays & Sundays',
        topSport: 'Box Cricket (Fastest growing group)',
      },
      recommendations: [
        'Launch a corporate league package targeting IT companies in the area.',
        'Introduce a loyalty card: Book 5 matches, get 1 hour free.',
      ],
      suggestedFollowUps: [
        'How was my revenue this month?',
        'Which sport brings the most bookings?',
        'Generate my yearly revenue report.',
      ],
    };
  },

  /**
   * Generates booking trends and sport distribution.
   */
  async generateTrendAnalysis(): Promise<AIResponse> {
    await simulateDelay(500);
    return {
      answer: `Football 7-a-side continues to lead volume with 58% of total hours, followed by Box Cricket at 32%, and Badminton at 10%. Thursday through Sunday maintain an 88% average occupancy rate, while Tuesdays remain the lowest occupancy day (44%).`,
      reportType: 'trends',
      metrics: {
        topSport: 'Football (107 hours)',
        growth: 'Cricket +35% MoM',
        peakTimes: 'Weekends 6 PM - 11 PM',
      },
      recommendations: [
        'Host a Tuesday Box Cricket Knockout Tournament to fill idle evening slots.',
        'Bundle equipment rental (balls, bibs, umpire) into higher-margin packages.',
      ],
      suggestedFollowUps: [
        'Compare this month with last month.',
        'What are my peak booking hours?',
      ],
    };
  },

  /**
   * Generates operational & pricing recommendations.
   */
  async generateOwnerRecommendations(): Promise<AIResponse> {
    await simulateDelay(500);
    return {
      answer: `Based on demand spikes and competitor density within a 5km radius, here are our top 3 growth opportunities for your venue:`,
      reportType: 'recommendations',
      recommendations: [
        'Dynamic Pricing: Increase Saturday 7-10 PM rate from ₹800 to ₹950/hr (Estimated +₹18,000/mo).',
        'Canteen Partnership: 68% of players stay 20+ mins post-match; adding protein shakes and refreshments can yield ₹25,000/mo.',
        'Zero Cancellation Penalty: Maintain your current 4-hour flexible cancellation policy; it converts 28% more first-time bookers.',
      ],
      suggestedFollowUps: [
        'How was my revenue this month?',
        'Generate my yearly revenue report.',
      ],
    };
  },

  /**
   * Generates comprehensive period reports (daily, weekly, monthly, yearly).
   */
  async generatePeriodReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<AIResponse> {
    await simulateDelay(700);
    const periodTitles = {
      daily: 'Daily Operational Snapshot (Today)',
      weekly: '7-Day Performance Digest',
      monthly: '30-Day Executive Performance Report',
      yearly: 'Annual Turf Operations Review (2026 YTD)',
    };

    return {
      answer: `Prepared your comprehensive ${periodTitles[period]}. Total revenue reached ₹${
        period === 'daily' ? '4,850' : period === 'weekly' ? '36,400' : period === 'monthly' ? '1,48,500' : '14,20,000'
      } with an overall venue occupancy rate of ${period === 'daily' ? '82%' : '79%'}.`,
      reportType: 'period',
      metrics: {
        totalRevenue: period === 'daily' ? '₹4,850' : period === 'weekly' ? '₹36,400' : period === 'monthly' ? '₹1,48,500' : '₹14,20,000',
        growth: '+14% YoY',
        peakTimes: '07:00 PM – 10:00 PM',
        footfall: period === 'daily' ? '64 players' : period === 'weekly' ? '480 players' : '1,840 players',
      },
      recommendations: [
        'Report is ready for export. Click the download button below for the PDF summary.',
      ],
      suggestedFollowUps: [
        'How was my revenue this month?',
        'Which days generate the most revenue?',
        'What are my peak booking hours?',
      ],
    };
  },

  /**
   * Router for free-form owner prompts with natural-language matching.
   */
  async queryAssistant(query: string, ownerName?: string): Promise<AIResponse> {
    const q = query.toLowerCase();

    if (q.includes('revenue') && (q.includes('month') || q.includes('how was'))) {
      return this.generateRevenueSummary(ownerName);
    }
    if (q.includes('day') || q.includes('which days')) {
      return {
        answer: `Friday, Saturday, and Sunday generate 71% of your weekly earnings. Saturday is your top revenue day, averaging ₹14,200 per week, while Tuesday is the slowest at ₹3,800.`,
        metrics: {
          peakTimes: 'Saturdays (Avg ₹14,200)',
          topSport: 'Football (Weekend Leagues)',
        },
        recommendations: [
          'Run a "Midweek Madness" 20% discount on Tuesday evenings to capture after-work groups.',
        ],
        suggestedFollowUps: ['What are my peak booking hours?', 'How was my revenue this month?'],
      };
    }
    if (q.includes('peak') || q.includes('hour')) {
      return {
        answer: `Your peak booking hours across all turfs are 07:00 PM to 10:00 PM on weekdays, and 06:00 AM to 10:00 AM plus 05:00 PM to 11:00 PM on weekends. Average occupancy during these windows exceeds 92%.`,
        metrics: {
          peakTimes: '07:00 PM – 10:00 PM (92% occupancy)',
          growth: '+8% vs last month',
        },
        recommendations: [
          'Enable peak pricing (+₹150/hr) for the 8 PM to 10 PM window.',
        ],
        suggestedFollowUps: ['Which sport brings the most bookings?', 'Compare this month with last month.'],
      };
    }
    if (q.includes('compare') || q.includes('last month')) {
      return {
        answer: `Compared to last month, your gross bookings increased by +22 (184 vs 162), and revenue rose by +18.2% (₹1,48,500 vs ₹1,25,600). Your cancellation rate also dropped from 6.8% to 4.1%.`,
        metrics: {
          totalRevenue: '₹1,48,500 (+18.2%)',
          growth: 'Cancellations down 2.7%',
        },
        recommendations: [
          'Player satisfaction is at an all-time high of 4.8 / 5.0 with 0 active penalty points.',
        ],
        suggestedFollowUps: ['Generate my yearly revenue report.', 'Which days generate the most revenue?'],
      };
    }
    if (q.includes('sport') || q.includes('bring')) {
      return this.generateTrendAnalysis();
    }
    if (q.includes('footfall') || q.includes('player')) {
      return this.generateFootfallSummary();
    }
    if (q.includes('yearly') || q.includes('annual')) {
      return this.generatePeriodReport('yearly');
    }

    // Default intelligent fallback
    return {
      answer: `Analyzing venue operational history for "${query}"... Your venue is currently operating at optimal efficiency with an availability accuracy rating of 98%. Revenue is trending upward +18% MoM.`,
      recommendations: [
        'Keep slot statuses updated in real-time to maintain your high Trust Score.',
        'Review unanswered player reviews to boost repeat bookings.',
      ],
      suggestedFollowUps: [
        'How was my revenue this month?',
        'Which days generate the most revenue?',
        'What are my peak booking hours?',
      ],
    };
  },
};

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
