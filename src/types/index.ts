// ============================================================================
// PLAYO SPORTS PLATFORM — ENTERPRISE DATA CONTRACTS & TYPE DEFINITIONS
// Backend-ready interfaces with ISO date-strings and standard ID conventions
// ============================================================================

// User roles
export type UserRole = 'player' | 'owner' | 'admin';

// Venue Category (key distinction)
export type VenueCategory = 'sports_turf' | 'indoor_sports' | 'gaming_zone' | 'fitness';

// Gaming Zone Activity Types
export type GamingActivity = 
  | 'arcade' | 'bowling' | 'vr_zone' | 'laser_tag' | 'billiards' | 'snooker'
  | 'air_hockey' | 'foosball' | 'darts' | 'esports' | 'console_gaming' | 'pc_gaming'
  | 'racing_simulator' | 'karaoke' | 'kids_play' | 'trampoline' | 'party_room'
  | 'board_games' | 'interactive_gaming' | 'pool';

// Tournament/Event statuses and types
export type TournamentStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
export type EventType = 'tournament' | 'competition' | 'gaming_event' | 'workshop' | 'community_event' | 'league' | 'match_day' | 'kids_event' | 'corporate_event' | 'special_activity';

// Support ticket types
export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
export type SupportTicketCategory = 'booking' | 'payment' | 'venue' | 'account' | 'technical' | 'refund' | 'other';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Sport categories
export type Sport = 'football' | 'cricket' | 'badminton' | 'basketball' | 'multi-sport' | 'tennis' | 'pickleball';

// Slot statuses
export type SlotStatus = 'available' | 'booked' | 'held' | 'unavailable' | 'maintenance';

// Booking statuses
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';

// Listing approval workflow states
export type ListingApprovalStatus = 
  | 'DRAFT' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CHANGES_REQUESTED' 
  | 'SUSPENDED';

// Verification statuses
export type VerificationStatus = 
  | 'VERIFIED' 
  | 'PENDING' 
  | 'LOCATION_VERIFIED' 
  | 'DOCUMENTS_PENDING' 
  | 'FAILED' 
  | 'UNVERIFIED';

// Membership tiers
export type MembershipTier = 'free' | 'play' | 'pro' | 'annual_pass';

// Reward transaction types
export type RewardTransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'refunded';

// Availability Violation Severities & Statuses
export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ViolationStatus = 'PENDING_REVIEW' | 'WARNING_ISSUED' | 'PENALTY_APPLIED' | 'DISPUTED' | 'RESOLVED' | 'DISMISSED';

// Dispute & Refund statuses
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUNDED' | 'RESOLVED_REJECTED';
export type RefundStatus = 'NONE' | 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

// Notification categories
export type NotificationCategory = 
  | 'booking' 
  | 'payment' 
  | 'approval' 
  | 'availability' 
  | 'rewards' 
  | 'membership' 
  | 'admin_warning' 
  | 'review' 
  | 'system';

// ----------------------------------------------------------------------------
// Core User Models
// ----------------------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  membershipTier: MembershipTier;
  membershipDetails?: {
    tier: MembershipTier;
    billingCycle: 'monthly' | 'annual';
    startDate: string;
    expiryDate: string;
    autoRenew: boolean;
    totalSavings: number;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  };
  rewardPoints: number;
  createdAt: string; // ISO 8601
  avatarUrl?: string;
  isActive?: boolean;
  city?: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessRegistrationNumber?: string;
  gstNumber?: string;
  bankAccountVerified: boolean;
  contactEmail: string;
  contactPhone: string;
  totalTurfs: number;
  trustScore: number; // 0 - 100
  accuracyScore: number; // 0 - 100
  negativePoints: number;
  warningsCount: number;
  isSuspended: boolean;
}

// ----------------------------------------------------------------------------
// Turf & Pricing Models
// ----------------------------------------------------------------------------
export interface DynamicPricingRule {
  id: string;
  name: string;
  dayOfWeek?: number[]; // 0=Sun, 6=Sat
  startTime?: string;
  endTime?: string;
  multiplier: number; // e.g. 1.25 for peak
  fixedPrice?: number;
  sport?: Sport;
}

export interface Turf {
  id: string;
  name: string;
  sports: Sport[];
  area: string;
  city: string;
  pincode?: string;
  distance?: number; // Calculated dynamically in frontend based on user location
  rating: number; // 1.0 - 5.0
  reviewsCount: number;
  pricePerHour: number;
  peakPricePerHour?: number;
  weekendPricePerHour?: number;
  pricingRules?: DynamicPricingRule[];
  verified: boolean;
  verificationStatus: VerificationStatus;
  imageVerified: boolean;
  amenities: string[];
  image: string;
  images: string[];
  available: boolean;
  blurb: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  operatingHours: { open: string; close: string };
  approvalStatus: ListingApprovalStatus;
  rejectionReason?: string;
  changesRequestedNote?: string;
  submittedAt?: string;
  approvedAt?: string;
  trustScore?: number; // 0 - 100
  accuracyScore?: number; // 0 - 100
  cancellationPolicy?: string;
  // Venue category and gaming zone support
  venueCategory?: VenueCategory;
  gamingActivities?: Array<{
    id: string;
    name: string;
    type: GamingActivity;
    description: string;
    pricePerPerson?: number;
    pricePerHour?: number;
    pricePerGame?: number;
    minPlayers?: number;
    maxPlayers?: number;
    durationMinutes?: number;
    icon?: string;
  }>;
  bookingUnit?: 'per_hour' | 'per_person' | 'per_game' | 'per_session' | 'group_package' | 'event_package';
  // Video management
  videos?: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    durationSeconds?: number;
    uploadedAt: string;
  }>;
  // Additional venue metadata
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  websiteUrl?: string;
  instagramHandle?: string;
}

// ----------------------------------------------------------------------------
// Slot & Availability Models
// ----------------------------------------------------------------------------
export interface TurfSlot {
  id: string;
  turfId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. '06:00 AM'
  endTime: string; // e.g. '07:00 AM'
  status: SlotStatus;
  price?: number;
  bookingId?: string;
  heldUntil?: string; // ISO 8601
  heldByUserId?: string;
  isPeakHour?: boolean;
}

// ----------------------------------------------------------------------------
// Booking Models
// ----------------------------------------------------------------------------
export interface Booking {
  id: string;
  referenceCode: string; // e.g. TB-2026-98124
  turfId: string;
  turfName: string;
  turfAddress?: string;
  turfImage?: string;
  turfLatitude?: number;
  turfLongitude?: number;
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  ownerId?: string;
  sport: Sport;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  basePrice: number;
  membershipDiscount: number;
  rewardDiscount: number;
  taxes?: number;
  finalPrice: number;
  status: BookingStatus;
  rewardPointsEarned: number;
  createdAt: string; // ISO 8601
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  qrVerificationCode?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundStatus?: RefundStatus;
  refundAmount?: number;
  notes?: string;
}

// ----------------------------------------------------------------------------
// Membership Models
// ----------------------------------------------------------------------------
export interface MembershipPlan {
  id: string;
  tier: MembershipTier;
  name: string;
  tagline?: string;
  price: number; // Monthly price in INR (0 for Free)
  annualPrice?: number; // Annual price in INR
  billingPeriod?: 'monthly' | 'yearly';
  discountPercent: number;
  rewardMultiplier: number;
  benefits: string[];
  highlighted?: boolean;
  popular?: boolean;
  savingsBadge?: string;
  maxBookingsPerMonth?: number;
  freeCancellationsPerMonth?: number;
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  tier: MembershipTier;
  startDate: string; // ISO 8601
  expiryDate: string; // ISO 8601
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  autoRenew: boolean;
  usedBookingsThisMonth: number;
  freeCancellationsRemaining: number;
}

// ----------------------------------------------------------------------------
// Rewards Models
// ----------------------------------------------------------------------------
export interface RewardTransaction {
  id: string;
  userId: string;
  type: RewardTransactionType;
  points: number;
  description: string;
  createdAt: string; // ISO 8601
  bookingId?: string;
  expiryDate?: string;
}

export interface RedemptionOption {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountValue: number;
  discountType: 'fixed' | 'percentage';
  minBookingAmount?: number;
  couponCode?: string;
}

// ----------------------------------------------------------------------------
// Availability Accuracy & Negative Marking Models
// ----------------------------------------------------------------------------
export interface AvailabilityViolation {
  id: string;
  turfId: string;
  turfName: string;
  ownerId: string;
  ownerName: string;
  slotDate: string;
  slotTime: string;
  expectedStatus: SlotStatus;
  reportedStatus: SlotStatus;
  violationType: 'DOUBLE_BOOKING' | 'UNANNOUNCED_CLOSURE' | 'OFFLINE_OVERBOOKING' | 'PRICE_MISMATCH' | 'MAINTENANCE_FAILURE';
  severity: ViolationSeverity;
  negativePoints: number;
  status: ViolationStatus;
  evidenceNote?: string;
  reportedByUserId?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface AvailabilityAccuracy {
  ownerId: string;
  turfId?: string;
  accuracyScore: number; // 0 - 100%
  totalSlotsEvaluated: number;
  accurateSlotsCount: number;
  violationsCount: number;
  activeWarningsCount: number;
  negativePointsTotal: number;
  riskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  suspensionThreshold: number; // Negative points threshold e.g. 50
  lastAuditedAt: string;
}

export interface PenaltyEvent {
  id: string;
  ownerId: string;
  turfId: string;
  violationId: string;
  negativePointsAdded: number;
  previousScore: number;
  newScore: number;
  reason: string;
  issuedByAdminId: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Turf Approval & Workflow Models
// ----------------------------------------------------------------------------
export interface TurfApprovalRequest {
  id: string;
  turfId: string;
  turfName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  area: string;
  sports: Sport[];
  hourlyRate: number;
  status: ListingApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  rejectionReason?: string;
  changesRequestedNote?: string;
  statusHistory: Array<{
    status: ListingApprovalStatus;
    changedAt: string;
    changedBy: string;
    note?: string;
  }>;
}

// ----------------------------------------------------------------------------
// Review & Ratings Models
// ----------------------------------------------------------------------------
export interface Review {
  id: string;
  turfId: string;
  turfName?: string;
  bookingId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  sportsPlayed: Sport;
  createdAt: string;
  ownerResponse?: {
    message: string;
    respondedAt: string;
  };
  isVerifiedPlay: boolean;
  complaintCategory?: 'FACILITY' | 'LIGHTING' | 'STAFF' | 'PITCH_CONDITION' | 'PARKING' | 'NONE';
}

// ----------------------------------------------------------------------------
// Notifications Center Models
// ----------------------------------------------------------------------------
export interface NotificationItem {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// Waitlist Models
// ----------------------------------------------------------------------------
export interface WaitlistEntry {
  id: string;
  turfId: string;
  turfName: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: Sport;
  position: number;
  status: 'WAITING' | 'NOTIFIED_SLOT_AVAILABLE' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  notifiedAt?: string;
}

// ----------------------------------------------------------------------------
// Disputes & Refunds Models
// ----------------------------------------------------------------------------
export interface DisputeRecord {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  turfId: string;
  turfName: string;
  ownerId: string;
  reason: string;
  amount: number;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

export interface RefundRecord {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  status: RefundStatus;
  refundMethod: string;
  processedAt?: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// Audit Log Models (Admin)
// ----------------------------------------------------------------------------
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'TURF' | 'USER' | 'BOOKING' | 'VIOLATION' | 'MEMBERSHIP' | 'SETTING';
  targetId: string;
  targetName?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  reason?: string;
  ipAddress?: string;
}

// ----------------------------------------------------------------------------
// Owner AI & Analytics Models
// ----------------------------------------------------------------------------
export interface OwnerAnalyticsSummary {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalRevenue: number;
  previousPeriodRevenue: number;
  revenueGrowthPercent: number;
  totalBookings: number;
  occupancyRate: number; // e.g. 78%
  averageBookingValue: number;
  cancellationRate: number; // e.g. 4.2%
  footfallCount: number;
  uniquePlayersCount: number;
  repeatPlayersCount: number;
  peakHourRange: string;
  peakDays: string[];
  sportRevenueBreakdown: Array<{
    sport: Sport;
    revenue: number;
    bookingsCount: number;
    percentage: number;
  }>;
}

export interface OwnerAIInsight {
  id: string;
  type: 'REVENUE' | 'FOOTFALL' | 'PEAK_PRICING' | 'RETENTION' | 'WEATHER';
  title: string;
  summary: string;
  impactScore: 'HIGH' | 'MEDIUM' | 'OPPORTUNITY';
  actionableRecommendation: string;
  generatedAt: string;
}

export interface SportsSlide {
  id: string;
  sport: Sport;
  title: string;
  description: string;
  cta: string;
  imageUrl: string;
  bgGradient: string;
}

// ----------------------------------------------------------------------------
// Tournament / Event Models
// ----------------------------------------------------------------------------
export interface Tournament {
  id: string;
  venueId: string;      // maps to Turf.id
  ownerId: string;
  title: string;
  description: string;
  category?: string;
  sport?: Sport | string;
  eventType: EventType;
  format?: string;
  startDate: string;    // ISO 8601 date
  endDate: string;      // ISO 8601 date
  startTime: string;    // e.g. '09:00 AM'
  endTime: string;
  registrationDeadline: string;
  entryFee: number;     // 0 for free
  prizePool?: number;
  maxParticipants: number;
  currentParticipants: number;
  status: TournamentStatus;
  bannerImage?: string;
  rules?: string;
  contactEmail?: string;
  venueName?: string;
  venueCity?: string;
  venueArea?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  registrations?: TournamentRegistration[];
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  teamName?: string;
  registeredAt: string;
  status: 'registered' | 'waitlisted' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  entryFeePaid?: number;
}

// ----------------------------------------------------------------------------
// Support Ticket Models
// ----------------------------------------------------------------------------
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  bookingId?: string;
  venueId?: string;
  venueName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: SupportMessage[];
  adminNotes?: string;
  assignedTo?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  createdAt: string;
  attachmentUrl?: string;
}

// ----------------------------------------------------------------------------
// Owner Extended Profile (for Admin view)
// ----------------------------------------------------------------------------
export interface OwnerDemoCredential {
  ownerId: string;
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  city: string;
  venueCount: number;
  venueNames: string[];
  isVerified: boolean;
  notes?: string;
}
