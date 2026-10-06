import { Link, useNavigate } from "@tanstack/react-router";
import {
  LockKeyhole,
  Loader2,
  Mail,
  User,
  AlertCircle,
  Sparkles,
  Trophy,
  Briefcase,
  Shield,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { Button, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { ownerDemoCredentials } from "@/data/mock-users";

// Lazy load the 3D Auth Scene to ensure fast initial page load and graceful fallback
const ThreeDAuthScene = lazy(() =>
  import("@/components/ThreeDAuthScene").then((m) => ({
    default: m.ThreeDAuthScene,
  }))
);

export function AuthPage({ register = false }: { register?: boolean }) {
  const [role, setRole] = useState<"player" | "owner" | "admin">("player");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedOwnerId, setSelectedOwnerId] = useState("owner-1");

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const demoAccounts = [
    {
      id: "player",
      name: "Ayush Sharma",
      role: "player" as const,
      roleBadge: "Player",
      email: "ayush@example.com",
      password: "player123",
      note: "Customer • Discover & Book",
    },
    {
      id: "owner-1",
      name: "Champions Sports Group",
      role: "owner" as const,
      roleBadge: "Owner 1",
      email: "owner@champions.com",
      password: "owner123",
      note: "Dehradun • 2 Venues",
    },
    {
      id: "owner-2",
      name: "Greenfield Sports LLP",
      role: "owner" as const,
      roleBadge: "Owner 2",
      email: "owner@greenfield.com",
      password: "owner123",
      note: "Dehradun • 1 Venue",
    },
    {
      id: "owner-delhi",
      name: "Capital Turfworks",
      role: "owner" as const,
      roleBadge: "Owner 3",
      email: "delhi@turfworks.in",
      password: "owner123",
      note: "Delhi • Hauz Khas Arena",
    },
    {
      id: "admin",
      name: "Platform SuperAdmin",
      role: "admin" as const,
      roleBadge: "Admin",
      email: "admin@playo.in",
      password: "admin123",
      note: "Platform Approvals & Control",
    },
  ];

  const handleRoleSelect = (selectedRole: "player" | "owner" | "admin") => {
    setRole(selectedRole);
    // Autofill demo accounts based on role to ease evaluation
    if (selectedRole === "player") {
      setEmail("ayush@example.com");
      setPassword("player123");
    } else if (selectedRole === "owner") {
      setEmail("owner@champions.com");
      setPassword("owner123");
    } else if (selectedRole === "admin") {
      setEmail("admin@playo.in");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (register) {
      const userRole = role === "admin" ? "player" : role;
      const success = await registerUser(name, email, password, userRole);
      if (success) {
        if (role === "owner") {
          navigate({ to: "/owner" });
        } else {
          navigate({ to: "/" });
        }
      }
    } else {
      const success = await login(email, password);
      if (success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === "admin") {
          navigate({ to: "/admin" });
        } else if (currentUser?.role === "owner") {
          navigate({ to: "/owner" });
        } else {
          navigate({ to: "/" });
        }
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetMessage(
      `Password reset instructions have been sent to ${forgotEmail}. Please check your inbox.`
    );
    setTimeout(() => {
      setForgotPasswordOpen(false);
      setResetMessage(null);
    }, 4000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.1fr_.9fr]">
        {/* Left Side: Interactive 3D Sports Environment */}
        <section className="relative hidden lg:block overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black">
          <Suspense
            fallback={
              <div className="grid h-full place-items-center text-white/50 text-sm">
                <Loader2 className="size-8 animate-spin text-primary mb-2" />
                <p>Loading 3D Sports Arena...</p>
              </div>
            }
          >
            <ThreeDAuthScene
              role={role}
              isHoveringButton={isHoveringSubmit}
            />
          </Suspense>

          {/* Floating Brand Narrative */}
          <div className="pointer-events-none absolute inset-x-0 top-12 z-10 px-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md">
              <Sparkles className="size-3.5" />
              Verified Multi-Sport Network
            </span>
            <h1 className="mt-4 font-display text-7xl font-black leading-[0.88] text-white tracking-tight">
              YOUR TURF.
              <br />
              YOUR GAME.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              Experience competition-grade artificial turf, exact real-time availability, instant digital tickets, and loyalty rewards on every booking.
            </p>
          </div>
        </section>

        {/* Right Side: Authentication Panel with Role Cards */}
        <section className="grid place-items-center p-6 sm:p-10 lg:p-14 z-10 bg-card">
          <div className="w-full max-w-md">
            <div>
              <p className="eyebrow">
                {register ? "Create Your Account" : "Secure Authentication"}
              </p>
              <h2 className="font-display text-5xl font-black tracking-tight text-foreground">
                {register ? "JOIN PLAYO." : "SIGN IN."}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Select your account persona to explore tailored features.
              </p>
            </div>

            {/* Active Session Guard: None can switch role while logged in */}
            {isAuthenticated && user && !register ? (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-xl text-center space-y-4 animate-in fade-in">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary font-black text-2xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-muted mb-2">
                    <span className="size-2 rounded-full bg-success animate-pulse" />
                    <span>Active Session</span>
                  </div>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    ALREADY SIGNED IN
                  </h3>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.email} • Role: <strong className="uppercase text-primary">{user.role}</strong>
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground bg-muted/60 p-2.5 rounded-lg border border-border leading-relaxed">
                    To switch roles or sign into another account, you must sign out first.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs font-bold"
                    onClick={() => {
                      if (user.role === "admin") navigate({ to: "/admin" });
                      else if (user.role === "owner") navigate({ to: "/owner" });
                      else navigate({ to: "/" });
                    }}
                  >
                    Go to {user.role === "owner" ? "Owner Portal" : user.role === "admin" ? "Admin Console" : "Home"}
                  </Button>
                  <Button
                    tone="destructive"
                    className="flex-1 text-xs font-bold"
                    onClick={() => {
                      logout();
                      setEmail("");
                      setPassword("");
                    }}
                  >
                    Sign Out to Switch
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Premium Interactive Role Selection Cards */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "player",
                      label: "Player",
                      icon: Trophy,
                      desc: "Book turfs & earn points",
                    },
                    {
                      id: "owner",
                      label: "Turf Owner",
                      icon: Briefcase,
                      desc: "Manage slots & revenue",
                    },
                    {
                      id: "admin",
                      label: "Admin",
                      icon: Shield,
                      desc: "Full platform oversight",
                    },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          handleRoleSelect(r.id as "player" | "owner" | "admin")
                        }
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? "border-primary bg-secondary/80 text-foreground shadow-sm ring-1 ring-primary/40"
                            : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/40"
                        }`}
                      >
                        <Icon
                          className={`size-5 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="mt-2 text-xs font-black tracking-tight">
                          {r.label}
                        </span>
                        <span className="mt-0.5 text-[9px] text-muted-foreground leading-tight hidden sm:block">
                          {r.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Demo Accounts Picker (Available only on Login page) */}
                {!register && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3 text-primary" /> Demo Account Selector (Click to Autofill)
                      </p>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black text-primary">
                        Pitch Ready
                      </span>
                    </div>

                    {/* If Owner role is active, show the 20+ owners across 14 cities dropdown */}
                    {role === "owner" ? (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                          <Building2 className="size-3 text-primary" /> Select Independent Owner Business:
                        </label>
                        <select
                          value={selectedOwnerId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedOwnerId(val);
                            const found = ownerDemoCredentials.find((c) => c.ownerId === val);
                            if (found) {
                              setEmail(found.email);
                              setPassword(found.password);
                              clearError();
                            }
                          }}
                          aria-label="Select Independent Owner Business"
                          className="w-full rounded-lg border border-border bg-card p-2 text-xs font-bold text-foreground focus:border-primary focus:outline-hidden"
                        >
                          {ownerDemoCredentials.map((o) => (
                            <option key={o.ownerId} value={o.ownerId}>
                              {o.city} · {o.businessName} ({o.venueCount} venue{o.venueCount === 1 ? '' : 's'})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                          Select any owner account to test strict data isolation across independent businesses.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {demoAccounts.map((acc) => {
                          const isSelected = email === acc.email;
                          return (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => {
                                setRole(acc.role);
                                setEmail(acc.email);
                                setPassword(acc.password);
                                clearError();
                              }}
                              className={`flex items-center justify-between rounded-lg border p-2 text-left text-xs transition ${
                                isSelected
                                  ? "border-primary bg-card text-foreground font-black ring-1 ring-primary/40 shadow-xs"
                                  : "border-border/70 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                              }`}
                            >
                              <div className="truncate pr-1">
                                <p className="font-extrabold truncate text-[11px] leading-tight text-foreground">
                                  {acc.name}
                                </p>
                                <p className="text-[9px] opacity-75 truncate">{acc.note}</p>
                              </div>
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                                  acc.role === "admin"
                                    ? "bg-destructive/15 text-destructive"
                                    : acc.role === "owner"
                                      ? "bg-info/15 text-info"
                                      : "bg-emerald-500/15 text-emerald-500"
                                }`}
                              >
                                {acc.roleBadge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Notification */}
                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-bold text-destructive animate-in fade-in">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Credentials Demo Chip */}
                <div className="mt-4 rounded-lg bg-muted/70 border border-border p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-foreground">
                      Active {role.toUpperCase()} credentials:{" "}
                    </span>
                    <span className="font-mono text-[11px] text-foreground">
                      {email || "ayush@example.com"} / {password || "••••••••"}
                    </span>
                  </div>
                  <Badge tone="neutral" size="sm">DEMO ONLY</Badge>
                </div>

            {/* Authentication Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {register && (
                <label className="block">
                  <span className="text-xs font-bold text-foreground">
                    Full Name
                  </span>
                  <div className="mt-1 flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 transition focus-within:border-primary">
                    <User className="size-4 text-muted-foreground" />
                    <input
                      className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="e.g. Ayush Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-xs font-bold text-foreground">
                  Email Address
                </span>
                <div className="mt-1 flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 transition focus-within:border-primary">
                  <Mail className="size-4 text-muted-foreground" />
                  <input
                    type="email"
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    Password
                  </span>
                  {!register && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 transition focus-within:border-primary">
                  <LockKeyhole className="size-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-muted-foreground hover:text-foreground p-1 transition"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary size-3.5"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <div
                onMouseEnter={() => setIsHoveringSubmit(true)}
                onMouseLeave={() => setIsHoveringSubmit(false)}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-12 text-sm font-bold shadow-action transition-all"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Authenticating...
                    </span>
                  ) : register ? (
                    "Create Account & Start Playing"
                  ) : (
                    `Sign In as ${role.toUpperCase()}`
                  )}
                </Button>
              </div>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              {register ? (
                <>
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-foreground underline hover:text-primary"
                  >
                    Sign in to your account
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-foreground underline hover:text-primary"
                  >
                    Create a free account
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="font-display text-2xl font-black text-foreground">
              RESET PASSWORD
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your account email to receive a secure recovery link.
            </p>

            {resetMessage ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-soft p-3 text-xs font-bold text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{resetMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  type="email"
                  placeholder="your-email@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 text-xs">
                    Send Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
