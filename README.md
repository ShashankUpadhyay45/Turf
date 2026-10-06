# Playo — Commercial Turf & Sports Facility Booking Platform

> **A Production-Ready, Frontend-First Sports Arena Booking & Venue Management System**  
> *Engineered with React 19, TypeScript, TanStack Start & Router, Zustand, Tailwind CSS v4, Three.js / React Three Fiber, and Recharts.*

---

## 1. Project Overview

**Playo** is a comprehensive, multi-role sport-tech web platform connecting sports players with verified sports turfs, grounds, and indoor arenas across **14 major Indian cities** (Dehradun, Delhi, Noida, Gurugram, Chandigarh, Lucknow, Jaipur, Mumbai, Pune, Bengaluru, Hyderabad, Kolkata, Chennai, and Ahmedabad).

The application provides:
1. **For Players (Customers):** Verified venue discovery, GPS geolocation distance sorting, date-dependent exact slot availability grids, 10-minute cart holds, double-booking prevention, membership discounts (Play 10%, Pro 20%), TurfPoints loyalty rewards, digital ticket passes with QR codes, self-service cancellation with refund status, and turn-by-turn Google Maps directions.
2. **For Turf Owners (Multi-Tenant Isolated):** Independent dashboard with strict multi-tenancy isolation (Owner A never sees Owner B's data), 7-step venue listing wizard, listing status lifecycle (Draft, Pending Approval, Approved, Rejected with feedback), real-time day/week slot matrix manager (bulk block, maintenance, clear), reservation oversight, customer review responses, Recharts business analytics, availability accuracy negative-marking scores, and an offline Heuristic AI Assistant.
3. **For Super Administrators:** Platform-wide oversight console, listing request approval/rejection queue with required feedback, availability violation detection and penalty ledger, player dispute arbitration, audit log ledger, revenue tracking, and system configuration.

---

## 2. Strict Frontend-First Scope & Backend Boundary

> [!IMPORTANT]
> **Strict Scope Boundary:**  
> This repository is delivered as a **100% complete, runnable frontend application**. The backend (`server/` directory) is intentionally **out of scope** and untouched. No live database, external payment gateway, SMS, WhatsApp, or AI API keys are connected.
>
> All features run smoothly in-browser using reactive Zustand state stores and typed mock API service adapters with simulated latency.
>
> When you are ready to connect a live backend, consult [BACKEND_INTEGRATION_MAP.md](file:///c:/Users/ASUS/Desktop/Projects/Turf/BACKEND_INTEGRATION_MAP.md) for complete REST/GraphQL endpoint specifications, schemas, database indexes, and transition steps. **Zero UI component refactoring is required.**

---

## 3. Technology Stack

- **Meta-Framework:** TanStack Start (`v1.168.32`) + Vite 8 + Nitro 3
- **Routing:** TanStack Router (`v1.170.18`) with 100% typed file routes, route loaders, and multi-role guards
- **UI & Runtime:** React 19.2.0 + TypeScript 5.8.3
- **State Management:** Zustand 5.0.15 with modular stores & localStorage persistence (`playo-auth-v2`, `playo-bookings-v2`, `playo-owner-store-v2`, `playo-notifications-store`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with OKLCH semantic design tokens
- **3D Graphics:** Three.js 0.186 + React Three Fiber (R3F 9.x) with lazy loading & `prefers-reduced-motion` compliance
- **Data Visuals:** Recharts 2.15 for owner footfall and revenue metrics
- **Icons & Primitives:** Lucide React, Radix UI primitives, CVA, Tailwind Merge
- **Validation & Date Math:** Zod 3.25, Date-fns 4.1

---

## 4. Key Architectural Highlights

- **Exact Slot Status Matrix:** Discrete slot states: `AVAILABLE`, `BOOKED`, `HELD`, `UNAVAILABLE`, `MAINTENANCE`.
- **Atomic Double-Booking Guard:** Verifies slot integrity immediately prior to checkout completion, halting race conditions with an instant toast alert.
- **10-Minute Cart Hold:** Slots temporarily lock (`HELD`) for 10 minutes during player checkout and auto-release upon expiration.
- **Multi-Tenant Turf Owner Isolation:** Turf owners only access their own venues, slots, incoming bookings, and analytics.
- **Availability Accuracy Engine:** Negative marking algorithm tracks double-booking or walk-in override violations, penalizing accuracy scores (0-100%).
- **Digital Ticket Pass:** Includes match date/time, venue address, reference code (`TB-2026-XXXXXX`), simulated QR code, status badges, dispute filing, and one-click Google Maps driving navigation.
- **In-App Notification Center:** Real-time badge counter, category filtering (Bookings, System, Violations, Rewards), mark all as read, and toast dispatch.

---

## 5. Demo Accounts & Persona Switcher

Use the **"Demo Roles"** dropdown in the top header to instantly switch personas, or sign in using these pre-configured credentials:

| Persona | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Ayush Player** | `ayush@example.com` | `player123` | Customer player; browse, book, redeem rewards, test digital tickets |
| **Champions Arena** | `owner@champions.com` | `owner123` | Turf Owner 1; manages Dehradun venues, slot matrix, incoming bookings |
| **Greenfield Arena** | `owner@greenfield.com` | `owner123` | Turf Owner 2; isolated tenant to test cross-tenant data privacy |
| **Super Admin** | `admin@playo.in` | `admin123` | Platform SuperAdmin; approve turfs, inspect violations, audit logs |

---

## 6. Project Directory Map

```text
src/
├── assets/                     # Ground photography and textures
├── components/                 # Global layout & shared primitives
│   ├── AppShell.tsx            # Header, persona switcher, drawers, notification bell, modals
│   ├── HeroScene.tsx           # Lazy 3D Three.js stadium experience
│   ├── RouteGuard.tsx          # Multi-role route authorization guard
│   ├── SportsHeroSlider.tsx    # Multi-sport carousel with autoplay
│   ├── TurfCard.tsx            # Reusable venue card with verification badges
│   └── ui.tsx                  # Semantic UI design primitives
├── data/                       # Rich seed datasets & initial mock states
│   ├── mock-users.ts           # Pre-configured test accounts
│   └── turfs.ts                # 14-city verified turfs, reviews, violations, audit logs
├── features/                   # Encapsulated modular domain components
│   ├── accuracy/               # Owner availability accuracy metrics & violation audit cards
│   ├── approval/               # Listing approval badges, timeline steps, resubmission banner
│   ├── availability/           # Interactive slot grid manager with bulk actions
│   └── verification/           # Verified turf, verified owner, location badges
├── routes/                     # TanStack Router file routes
│   ├── __root.tsx              # Root HTML shell & global provider wrapper
│   ├── index.tsx               # Home landing page with 3D stadium & featured turfs
│   ├── explore.tsx             # City filter (14 cities), GPS geolocation, sport filters
│   ├── turfs.$turfId.tsx       # Venue details, photo carousel, reviews, slot picker
│   ├── booking.$turfId.tsx     # Checkout, slot hold, membership discount, coupon code
│   ├── confirmation.$turfId.tsx# Digital pass, Google Maps directions, booking reference
│   ├── bookings.tsx            # Player booking history & active passes
│   ├── bookings.$bookingId.tsx # Booking detail pass with dispute, cancel & directions
│   ├── favorites.tsx           # Bookmarked arenas
│   ├── rewards.tsx             # TurfPoints ledger, redemption store, coupon vouchers
│   ├── membership.tsx          # Free, Play, Pro tiers with real-time checkout upgrade
│   ├── notifications.tsx       # Notification center with category filtering
│   ├── profile.tsx             # Player account settings & preferences
│   ├── owner.*.tsx             # 9 Dedicated Turf Owner routes (Dashboard, Slots, Bookings, Analytics, AI)
│   └── admin.*.tsx             # 11 Super Admin routes (Console, Approvals, Violations, Disputes, Audit)
├── services/                   # Business logic, boundary adapters & client layer
│   ├── ai/                     # Heuristic AI Assistant for turf owners (queries, insights)
│   ├── api/                    # Typed API client boundary layer with mock/HTTP abstraction
│   ├── location/               # Geolocation service (Haversine formula, GPS calibration)
│   └── notifications/          # Simulated WhatsApp and Email notification dispatchers
├── store/                      # Zustand reactive stores with localStorage persistence
│   ├── useAuthStore.ts         # User session, role switching, persona presets
│   ├── useAvailabilityStore.ts # Slot status matrix, 10-minute cart holds, bulk actions
│   ├── useBookingStore.ts      # Active/Past bookings, refund tracking, double-booking check
│   ├── useNotificationStore.ts # In-app notification center & unread count
│   └── useOwnerStore.ts        # Isolated turf owner listings, requests, audit logs
├── styles.css                  # Tailwind v4 theme, OKLCH design tokens, keyframes
└── types/                      # Comprehensive domain TypeScript declarations
    ├── index.ts                # General domain interfaces (User, Booking, Review, AuditLog)
    └── turf.ts                 # Turf, Slot, Approval, Accuracy & Violation contracts
```

---

## 7. Quickstart Commands

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
Generates `.output/` with Nitro production worker and static assets with **0 TypeScript and build errors**.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 8. Documentation Companion Guides

For detailed architectural diagrams and backend specifications, refer to:
- [FRONTEND_ARCHITECTURE.md](file:///c:/Users/ASUS/Desktop/Projects/Turf/FRONTEND_ARCHITECTURE.md): Complete frontend design system, routing topology, Zustand state lifecycles, and tenant isolation patterns.
- [BACKEND_INTEGRATION_MAP.md](file:///c:/Users/ASUS/Desktop/Projects/Turf/BACKEND_INTEGRATION_MAP.md): Complete REST/GraphQL endpoint specifications, JSON request/response schemas, database collections, and step-by-step connection checklist.
- [FEATURE_MATRIX.md](file:///c:/Users/ASUS/Desktop/Projects/Turf/FEATURE_MATRIX.md): Detailed capability comparison matrix across Player, Owner, and Admin roles.

---

## 9. License

Proprietary — Playo Technologies Inc. All rights reserved.
