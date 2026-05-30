import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Flame,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE } from "@/lib/api";

import { CoachBubble } from "@/components/coach-bubble";
import maleAvatar from "@/assets/male avtar.png";
import femaleAvatar from "@/assets/female avtar.webp";

export const Route = createFileRoute("/_authenticated")({


  component: AuthLayout,
});

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Command Center" },
  { to: "/routine", icon: Calendar, label: "Study Planner" },
  { to: "/attendance", icon: ClipboardList, label: "Attendance" },
  { to: "/exams", icon: GraduationCap, label: "Exam Tracker" },
  { to: "/practice-log", icon: Target, label: "Practice Log" },
  { to: "/revisions", icon: RefreshCw, label: "Revision Queue" },
  { to: "/habits", icon: Flame, label: "Habit Forge" },
  { to: "/notes", icon: BookOpen, label: "Notes Vault" },
  { to: "/analytics", icon: BarChart3, label: "Weekly Report" },
];

function AuthLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<{ full_name: string | null; xp?: number; rank?: string; rank_color?: string; level?: number; gender?: string; avatar_url?: string; trial_expired?: boolean; days_left?: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    } else if (user) {
      const justRegistered =
        typeof window !== "undefined" &&
        localStorage.getItem("ff_just_registered") === "1";

      if (!user.onboarded && justRegistered && path !== "/onboarding") {
        navigate({ to: "/onboarding" });
      } else if (user.onboarded && path === "/onboarding") {
        navigate({ to: "/dashboard" });
      }
    }
  }, [loading, user, navigate, path]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = () => {
      // Fetch profile from PHP backend.
      fetch(`${API_BASE}?action=getProfile&t=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ff_token") ?? ""}`,
        },
        body: JSON.stringify({ action: "getProfile" }),
      })
        .then((r) => r.json())
        .then((json) => {
          const data = json?.data?.profile;
          if (!data) return;
          console.log("[AuthLayout] getProfile xp update", data.xp, data);

          setProfile({
            full_name: data.full_name ?? null,
            xp: data.xp ?? 0,
            rank: data.rank ?? "Rookie",
            rank_color: data.rank_color ?? "#94A3B8",
            level: data.level ?? 1,
            gender: data.gender ?? "",
            avatar_url: data.avatar_url ?? "",
            trial_expired: data.trial_expired ?? false,
            days_left: data.days_left ?? 0,
          });
        })
        .catch((err) => {
          console.warn("[onboarding-gate] profile fetch failed", err);
        });
    };

    fetchProfile();

    window.addEventListener("xp-update", fetchProfile);
    return () => window.removeEventListener("xp-update", fetchProfile);
  }, [user, path, navigate]);





  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (path === "/onboarding") {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  // Allow pricing overlay to render without the layout
  if (path === "/pricing") {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  const fullName = profile?.full_name || user.full_name || user.uid || "Operator";
  const initial = (fullName[0] || "?").toUpperCase();
  let finalAvatar = null;
  if (profile?.avatar_url) {
    finalAvatar = profile.avatar_url;
  } else if (profile?.gender === "female") {
    finalAvatar = femaleAvatar;
  } else if (profile?.gender === "male") {
    finalAvatar = maleAvatar;
  }

  function getLevelInfo(totalXp: number) {
    const level = Math.floor(Math.pow(totalXp / 100, 1 / 1.5)) + 1;
    const prevLevelThreshold = Math.floor(100 * Math.pow(level - 1, 1.5));
    const nextLevelThreshold = Math.floor(100 * Math.pow(level, 1.5));

    const currentXpInLevel = Math.max(0, totalXp - prevLevelThreshold);
    const xpNeededForNextLevel = nextLevelThreshold - prevLevelThreshold;

    return { level, currentXp: currentXpInLevel, nextLvlXp: xpNeededForNextLevel };
  }

  const totalXp = profile?.xp ?? 0;
  const { level, currentXp: xp, nextLvlXp: xpMax } = getLevelInfo(totalXp);
  const rank = profile?.rank || "Rookie";

  // Avoid NaN/Infinity when xpMax is 0
  const xpProgressPct = xpMax > 0 ? Math.min(100, Math.max(0, (xp / xpMax) * 100)) : 0;
  const rankColor = profile?.rank_color || "#94A3B8";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between bg-background/80 backdrop-blur border-b border-border px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" strokeWidth={2.5} />
          <span className="font-display font-bold tracking-widest text-primary text-sm">
            eduvix
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {finalAvatar ? (
            <img src={finalAvatar} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-border" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/40 grid place-items-center text-primary font-bold text-xs">
              {initial}
            </div>
          )}
          <button onClick={() => setOpen(true)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) / Mobile Drawer */}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-[oklch(0.11_0.008_30)] border-r border-border
        transition-transform duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" strokeWidth={2.5} />
            <span className="font-display font-bold tracking-widest text-primary text-sm">
              eduvix
            </span>
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile / Level card */}
        <div className="mx-3 p-3 rounded-md bg-secondary/40 border border-border">
          <div className="flex items-center gap-2.5">
            {finalAvatar ? (
              <img src={finalAvatar} alt="Profile" className="h-9 w-9 rounded-full object-cover border border-border" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/40 grid place-items-center text-primary font-bold">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{user?.uid || fullName}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: rankColor }}>
                {rank}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <Flame className="h-3.5 w-3.5" /> 0
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>LVL {level}</span>
            <span className="font-mono text-foreground">
              {xp} / {xpMax} XP
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-background overflow-hidden">
            <div
              className="h-full bg-(image:--gradient-primary) transition-all duration-500"
              style={{ width: `${xpProgressPct}%` }}
            />
          </div>
        </div>

        {/* Free Trial Banner */}
        {profile?.trial_expired === false && profile?.days_left !== undefined && (
          <div className="mx-3 mt-3 p-3 rounded-md bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-1">
              <Zap className="h-3 w-3" /> Free Trial
            </div>
            <div className="text-xs text-muted-foreground">
              You have <strong className="text-foreground">{profile.days_left} days</strong> left in your trial. 
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event("show-pricing"))}
              className="mt-2 block w-full text-center text-xs font-medium bg-primary text-primary-foreground py-1.5 rounded-md hover:bg-primary/90 transition cursor-pointer"
            >
              View Plans
            </button>
          </div>
        )}

        <div className="px-5 mt-5 mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Navigation
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const active = path === n.to;
            const cls = `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition
              ${
                active
                  ? "bg-primary/15 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground border-l-2 border-transparent"
              }`;
            return (
              <Link key={n.to} to={n.to} className={cls} onClick={() => setOpen(false)}>
                <n.icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => navigate({ to: "/settings" })}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button

            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-background/90 backdrop-blur border-t border-border flex items-center justify-around px-2">
        {NAV.slice(0, 5).map((n) => {
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <n.icon className="h-5 w-5" />
              <span className="text-[9px] font-medium tracking-wide">{n.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      <CoachBubble />
    </div>
  );
}
