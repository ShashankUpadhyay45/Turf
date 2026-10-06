import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Gift,
  Heart,
  Home,
  Menu,
  Search,
  UserRound,
  X,
  LogOut,
  Shield,
  Briefcase,
  Sparkles,
  ChevronDown,
  Layers,
  Crown,
  Bell,
  AlertCircle,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  Building2,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ActionLink, Badge, Button } from "./ui";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { PlayerChatWidget } from "@/features/chat/PlayerChatWidget";

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const showLogoutConfirm = useAuthStore((s) => s.showLogoutConfirm);
  const setShowLogoutConfirm = useAuthStore((s) => s.setShowLogoutConfirm);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";
  const isPlayerOrGuest = !user || user.role === "player";
  const isOwnerSection = isOwner || path.startsWith('/owner');
  const isAdminSection = isAdmin || path.startsWith('/admin');
  const showPlayerConcierge = !isOwnerSection && !isAdminSection;

  const playerNavLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/sports", label: "Sports" },
    { to: "/tournaments", label: "Tournaments" },
    { to: "/membership", label: "Membership" },
    { to: "/rewards", label: "Rewards" },
    { to: "/help", label: "Help" },
  ];

  const ownerNavLinks = [
    { to: "/owner", label: "Dashboard" },
    { to: "/owner/turfs", label: "My Venues" },
    { to: "/owner/slots", label: "Slots" },
    { to: "/owner/bookings", label: "Bookings" },
    { to: "/owner/tournaments", label: "Tournaments" },
    { to: "/owner/videos", label: "Videos" },
    { to: "/owner/analytics", label: "Analytics" },
    { to: "/owner/reviews", label: "Reviews" },
    { to: "/owner/help", label: "Help" },
  ];

  const adminNavLinks = [
    { to: "/admin", label: "Command Center" },
    { to: "/admin/turf-requests", label: "Approvals" },
    { to: "/admin/availability-violations", label: "Violations" },
    { to: "/admin/turfs", label: "Venues" },
    { to: "/admin/owners", label: "Owners" },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/tournaments", label: "Tournaments" },
    { to: "/admin/disputes", label: "Disputes" },
    { to: "/admin/revenue", label: "Revenue" },
  ];

  const notificationsPath = isOwner
    ? "/owner/notifications"
    : isAdmin
      ? "/admin/notifications"
      : "/notifications";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden max-w-[100vw]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6 xl:gap-8">
            <Link to={isOwner ? "/owner" : isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-foreground font-display text-xl font-black text-background">
                P
              </span>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black tracking-tight leading-none">
                  PLAYO
                </span>
                {isOwner && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-info">
                    Owner Portal
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-destructive">
                    Admin Portal
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation Links tailored by role */}
            <nav className="hidden items-center gap-5 lg:flex">
              {isOwner ? (
                ownerNavLinks.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="text-xs xl:text-sm font-bold text-muted-foreground transition hover:text-foreground"
                    activeProps={{ className: "text-info font-black" }}
                  >
                    {n.label}
                  </Link>
                ))
              ) : isAdmin ? (
                adminNavLinks.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="text-xs xl:text-sm font-bold text-muted-foreground transition hover:text-foreground"
                    activeProps={{ className: "text-destructive font-black" }}
                  >
                    {n.label}
                  </Link>
                ))
              ) : (
                <>
                  {playerNavLinks.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      className="text-sm font-bold text-muted-foreground transition hover:text-foreground"
                      activeProps={{ className: "text-foreground font-extrabold" }}
                    >
                      {n.label}
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <Link
                      to="/owner"
                      className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-info transition"
                    >
                      <Briefcase className="size-4" />
                      List Your Turf
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">


            {/* Role-specific Quick Icons */}
            {isPlayerOrGuest && (
              <>
                <Link
                  to="/explore"
                  aria-label="Search turfs"
                  className="hidden size-10 place-items-center rounded-md hover:bg-muted sm:grid"
                  title="Explore Turfs"
                >
                  <Search className="size-5 text-muted-foreground hover:text-foreground" />
                </Link>
                <Link
                  to="/favorites"
                  aria-label="Favorites"
                  className="hidden size-10 place-items-center rounded-md hover:bg-muted sm:grid"
                  title="Saved Favorites"
                >
                  <Heart className="size-5 text-muted-foreground hover:text-foreground" />
                </Link>
                <Link
                  to="/bookings"
                  aria-label="My bookings"
                  className="hidden size-10 place-items-center rounded-md hover:bg-muted md:grid"
                  title="My Bookings"
                >
                  <CalendarDays className="size-5 text-muted-foreground hover:text-foreground" />
                </Link>
              </>
            )}

            {isOwner && (
              <>
                <Link
                  to="/owner/turfs"
                  aria-label="My Venues"
                  className="hidden size-10 place-items-center rounded-md hover:bg-muted md:grid"
                  title="My Listed Venues"
                >
                  <Building2 className="size-5 text-muted-foreground hover:text-foreground" />
                </Link>
                <Link
                  to="/owner/bookings"
                  aria-label="Venue Bookings"
                  className="hidden size-10 place-items-center rounded-md hover:bg-muted md:grid"
                  title="Venue Bookings"
                >
                  <CalendarDays className="size-5 text-muted-foreground hover:text-foreground" />
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/turf-requests"
                aria-label="Approval Requests"
                className="hidden size-10 place-items-center rounded-md hover:bg-muted md:grid"
                title="Pending Approvals"
              >
                <CheckSquare className="size-5 text-muted-foreground hover:text-foreground" />
              </Link>
            )}

            {/* Notifications Bell */}
            <Link
              to={notificationsPath}
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-md hover:bg-muted transition"
              title="Notifications"
            >
              <Bell className="size-5 text-muted-foreground hover:text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown / Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pr-3 hover:bg-muted transition"
                  aria-label="User menu"
                >
                  <span
                    className={`grid size-8 place-items-center rounded-full font-bold text-white ${
                      isOwner
                        ? "bg-info"
                        : isAdmin
                          ? "bg-destructive"
                          : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {user.name.charAt(0)}
                  </span>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-extrabold leading-tight">
                      {user.name.split(" ")[0]}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-2xl z-50">
                    <div className="border-b border-border pb-3">
                      <p className="font-extrabold text-sm text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge
                          tone={
                            isAdmin
                              ? "gold"
                              : isOwner
                                ? "blue"
                                : "green"
                          }
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                        {user.role === "player" && (
                          <span className="rounded-full bg-reward-soft px-2 py-0.5 text-[11px] font-extrabold text-reward">
                            {user.rewardPoints} TP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role-specific menu links */}
                    <div className="py-2 space-y-1 text-sm">
                      {isOwner ? (
                        <>
                          <Link
                            to="/owner"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition text-info"
                          >
                            <Briefcase className="size-4" />
                            Owner Dashboard
                          </Link>
                          <Link
                            to="/owner/turfs"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <Building2 className="size-4 text-info" />
                            My Venues
                          </Link>
                          <Link
                            to="/owner/slots"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <Layers className="size-4 text-info" />
                            Slot Availability
                          </Link>
                          <Link
                            to="/owner/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <CalendarDays className="size-4 text-info" />
                            Manage Bookings
                          </Link>
                          <Link
                            to="/owner/analytics"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <BarChart3 className="size-4 text-info" />
                            Revenue & Analytics
                          </Link>
                          <Link
                            to="/owner/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <UserRound className="size-4 text-muted-foreground" />
                            Business Profile
                          </Link>
                        </>
                      ) : isAdmin ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition text-destructive"
                          >
                            <Shield className="size-4" />
                            Command Center
                          </Link>
                          <Link
                            to="/admin/turf-requests"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <CheckSquare className="size-4 text-destructive" />
                            Turf Approvals
                          </Link>
                          <Link
                            to="/admin/availability-violations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <AlertTriangle className="size-4 text-destructive" />
                            Violations & Negative Marking
                          </Link>
                          <Link
                            to="/admin/disputes"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <AlertCircle className="size-4 text-destructive" />
                            Customer Disputes
                          </Link>
                          <Link
                            to="/admin/revenue"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <TrendingUp className="size-4 text-destructive" />
                            Platform Revenue
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <UserRound className="size-4 text-info" />
                            My Profile
                          </Link>
                          <Link
                            to="/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <CalendarDays className="size-4 text-info" />
                            My Bookings
                          </Link>
                          <Link
                            to="/rewards"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <Gift className="size-4 text-reward" />
                            Rewards & Points
                          </Link>
                          <Link
                            to="/membership"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <Crown className="size-4 text-amber-500" />
                            Membership
                          </Link>
                          <Link
                            to="/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 font-bold hover:bg-muted transition"
                          >
                            <Heart className="size-4 text-rose-500" />
                            Saved Favorites
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-border pt-2">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-md border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-foreground px-3.5 py-2 text-xs font-bold text-background hover:bg-foreground/90 transition hidden sm:inline-flex"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Role-Specific Primary CTA Button */}
            {isOwner ? (
              <ActionLink to="/owner/add-turf" variant="primary" className="ml-1 hidden md:inline-flex">
                <Plus className="size-3.5 mr-1" />
                List New Turf
              </ActionLink>
            ) : isAdmin ? (
              <ActionLink to="/admin/turf-requests" variant="destructive" className="ml-1 hidden md:inline-flex">
                Review Queue
              </ActionLink>
            ) : (
              <ActionLink to="/explore" className="ml-1 hidden md:inline-flex">
                Book a turf
              </ActionLink>
            )}

            {/* Mobile Hamburger Button */}
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-10 place-items-center rounded-md hover:bg-muted lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-5 lg:hidden animate-in slide-in-from-top-2">


            {/* Mobile Nav Links Tailored by Role */}
            <nav className="grid gap-2.5 text-sm font-bold">
              {isOwner ? (
                <>
                  <Link
                    to="/owner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-info transition text-info font-black"
                  >
                    <Briefcase className="size-4" />
                    Owner Dashboard
                  </Link>
                  <Link
                    to="/owner/turfs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <Building2 className="size-4" />
                    My Listed Venues
                  </Link>
                  <Link
                    to="/owner/slots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <Layers className="size-4" />
                    Slot Availability & Maintenance
                  </Link>
                  <Link
                    to="/owner/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <CalendarDays className="size-4" />
                    Venue Bookings
                  </Link>
                  <Link
                    to="/owner/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <BarChart3 className="size-4" />
                    Revenue & Analytics
                  </Link>
                  <Link
                    to="/owner/reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <Sparkles className="size-4" />
                    Customer Reviews
                  </Link>
                  <Link
                    to="/owner/add-turf"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-info transition text-info"
                  >
                    <Plus className="size-4" />
                    List New Turf
                  </Link>
                  <Link
                    to="/owner/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="size-4" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-black text-destructive-foreground">
                        {unreadCount} new
                      </span>
                    )}
                  </Link>
                </>
              ) : isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-destructive transition text-destructive font-black"
                  >
                    <Shield className="size-4" />
                    Command Center
                  </Link>
                  <Link
                    to="/admin/turf-requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <CheckSquare className="size-4" />
                    Turf Approvals
                  </Link>
                  <Link
                    to="/admin/availability-violations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <AlertTriangle className="size-4" />
                    Availability Violations
                  </Link>
                  <Link
                    to="/admin/turfs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <Building2 className="size-4" />
                    All Grounds Directory
                  </Link>
                  <Link
                    to="/admin/disputes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <AlertCircle className="size-4" />
                    Customer Disputes
                  </Link>
                  <Link
                    to="/admin/revenue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1.5 hover:text-foreground transition text-muted-foreground"
                  >
                    <TrendingUp className="size-4" />
                    Platform Revenue
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/explore"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-primary transition py-1"
                  >
                    Explore Turfs
                  </Link>
                  <Link
                    to="/sports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-primary transition py-1"
                  >
                    Sports Arenas
                  </Link>
                  <Link
                    to="/membership"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-primary transition py-1"
                  >
                    Membership Plans
                  </Link>
                  <Link
                    to="/rewards"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-primary transition py-1"
                  >
                    TurfPoints Rewards
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between hover:text-primary transition py-1"
                  >
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-black text-destructive-foreground">
                        {unreadCount} new
                      </span>
                    )}
                  </Link>
                  {!isAuthenticated && (
                    <Link
                      to="/owner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-primary transition py-1 text-info"
                    >
                      Partner / Owner Portal
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="mt-5 border-t border-border pt-4">
              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive/10 p-2.5 text-sm font-bold text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md border border-border p-2.5 text-center text-sm font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md bg-primary p-2.5 text-center text-sm font-bold text-primary-foreground"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-16rem)]">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-foreground pb-24 text-background md:pb-8">
        <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-3xl font-black">PLAYO</div>
            <p className="mt-3 max-w-sm text-sm text-background/65">
              Great games start with a great ground. Find verified turfs, book
              live slots with exact availability, and earn TurfPoints every time
              you play.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-background/10 px-3 py-1 text-xs font-bold text-background/80">
                Dehradun, Uttarakhand
              </span>
            </div>
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide uppercase text-background/40">
              Discover
            </p>
            <div className="mt-3 grid gap-2 text-sm text-background/70">
              <Link to="/explore" className="hover:text-background transition">
                Nearby Turfs
              </Link>
              <Link to="/sports" className="hover:text-background transition">
                Sports Categories
              </Link>
              <Link
                to="/membership"
                className="hover:text-background transition"
              >
                Membership Plans
              </Link>
              <Link to="/rewards" className="hover:text-background transition">
                TurfPoints Rewards
              </Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide uppercase text-background/40">
              For Owners
            </p>
            <div className="mt-3 grid gap-2 text-sm text-background/70">
              <Link to="/owner" className="hover:text-background transition">
                Owner Dashboard
              </Link>
              <Link
                to="/owner/slots"
                className="hover:text-background transition"
              >
                Slot Availability
              </Link>
              <Link
                to="/owner/add-turf"
                className="hover:text-background transition"
              >
                List a Turf
              </Link>
              <Link
                to="/owner/bookings"
                className="hover:text-background transition"
              >
                Manage Bookings
              </Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide uppercase text-background/40">
              Account & Legal
            </p>
            <div className="mt-3 grid gap-2 text-sm text-background/70">
              <Link to="/profile" className="hover:text-background transition">
                My Profile
              </Link>
              <Link to="/bookings" className="hover:text-background transition">
                My Match Bookings
              </Link>
              <Link to="/login" className="hover:text-background transition">
                Sign In
              </Link>
              <span className="text-xs text-background/40 mt-2 block">
                © 2026 Playo Technologies Inc.
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden shadow-lg"
      >
        {(isOwner
          ? [
              { to: "/owner", label: "Dashboard", icon: Briefcase },
              { to: "/owner/turfs", label: "Venues", icon: Building2 },
              { to: "/owner/slots", label: "Slots", icon: Layers },
              { to: "/owner/bookings", label: "Bookings", icon: CalendarDays },
              { to: "/owner/analytics", label: "Revenue", icon: BarChart3 },
            ]
          : isAdmin
            ? [
                { to: "/admin", label: "Console", icon: Shield },
                { to: "/admin/turf-requests", label: "Approvals", icon: CheckSquare },
                { to: "/admin/availability-violations", label: "Violations", icon: AlertTriangle },
                { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
                { to: "/admin/revenue", label: "Revenue", icon: TrendingUp },
              ]
            : [
                { to: "/", label: "Home", icon: Home },
                { to: "/explore", label: "Explore", icon: Search },
                { to: "/bookings", label: "Bookings", icon: CalendarDays },
                { to: "/rewards", label: "Rewards", icon: Gift },
                { to: "/profile", label: "Profile", icon: UserRound },
              ]
        ).map((n) => {
          const I = n.icon;
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold transition ${
                active
                  ? isOwner
                    ? "text-info font-black"
                    : isAdmin
                      ? "text-destructive font-black"
                      : "text-primary font-black"
                  : "text-muted-foreground"
              }`}
            >
              <I className={`size-5 ${active ? "stroke-[2.5]" : ""}`} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Session Expired Modal */}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="size-6" />
              <h3 className="text-lg font-black">Session Expired</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Your authentication session has timed out or expired. Please sign back in to continue booking and managing your turfs.
            </p>
            <div className="mt-6 flex justify-end">
              <Button
                tone="primary"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                Sign In Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500">
              <LogOut className="size-6" />
              <h3 className="text-lg font-black text-foreground">Confirm Sign Out</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Are you sure you want to end your current session? You will need to sign in again to access your account, active bookings, or owner portal.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                tone="destructive"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Playo Sports Concierge (Player & Public Pages Only) */}
      {showPlayerConcierge && <PlayerChatWidget />}
    </div>
  );
}
