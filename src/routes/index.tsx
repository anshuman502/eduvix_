import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Flame,
  Calendar,
  Target,
  BarChart3,
  Timer,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Trophy,
  Brain,
  ClipboardList,
  GraduationCap,
  Bell,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eduvix — The Productivity OS for Students" },
      {
        name: "description",
        content:
          "Plan routines, track attendance, crush exams, and build study streaks. A premium dashboard built for disciplined students.",
      },
      { property: "og:title", content: "Eduvix — Productivity OS for Students" },
      {
        property: "og:description",
        content:
          "Routines, focus timers, habits, attendance, analytics — all in one disciplined dashboard.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Calendar,
    title: "Routine Builder",
    desc: "Drag-and-drop time blocks for every subject of your day.",
  },
  {
    icon: ClipboardList,
    title: "Attendance Tracker",
    desc: "Subject-wise % with low-attendance warnings.",
  },
  {
    icon: Timer,
    title: "Pomodoro Focus",
    desc: "Fullscreen 25/5 timer with ambient sounds and analytics.",
  },
  {
    icon: Flame,
    title: "Habit Streaks",
    desc: "Daily heatmaps, XP rewards, and consistency scoring.",
  },
  {
    icon: GraduationCap,
    title: "Exam Tracker",
    desc: "Countdowns, syllabus progress, and revision tracking.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Weekly reports across study hours, focus, and habits.",
  },
  {
    icon: BookOpen,
    title: "Smart Notes",
    desc: "Markdown notes, PDFs, and bookmark-ready folders.",
  },
  {
    icon: Brain,
    title: "AI Study Coach",
    desc: "A supportive assistant — not a scheduler. You stay in control.",
  },
];

const stats = [
  { value: "12.4h", label: "Avg weekly focus" },
  { value: "94%", label: "Attendance kept" },
  { value: "37 day", label: "Top streak" },
  { value: "+28%", label: "Productivity lift" },
];

function Landing() {
  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center glow-primary">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Eduvix</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">
              Features
            </a>
            <a href="#dashboard" className="hover:text-foreground transition">
              Dashboard
            </a>
            <a href="#workflow" className="hover:text-foreground transition">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-foreground transition">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-medium text-primary-foreground glow-primary hover:scale-[1.03] transition"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-hero">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              The productivity OS for serious students
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Forge focus.
              <br />
              Build the <span className="text-gradient-primary">discipline</span>
              <br />
              that builds your future.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Plan routines, track attendance, run focus sessions, and grow streaks — all in one
              premium, manually-controlled dashboard. No auto-scheduling. Just you, sharper.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary hover:scale-[1.03] transition"
              >
                Start forging <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-medium hover:bg-surface-elevated transition"
              >
                Explore the dashboard
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <div className="font-mono text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating preview cards */}
          <div className="relative mt-20" id="dashboard">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="max-w-2xl mb-16">
          <div className="text-sm font-mono text-primary mb-3">// MODULES</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Every system a disciplined student needs.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Twelve interconnected modules, one cohesive dashboard. Track everything that matters.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group glass rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-4 group-hover:bg-primary/20 transition">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sm font-mono text-accent mb-3">// PHILOSOPHY</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              You stay in control.
              <br />
              The system keeps the score.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Eduvix is not an AI scheduler. You manually plan routines, mark attendance, and
              run focus sessions. The platform organizes, visualizes, and motivates — so consistency
              compounds.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Manual routines with drag-and-drop blocks",
                "Subject-wise attendance with smart alerts",
                "Pomodoro focus mode with session history",
                "Gamified XP, levels, and streak heatmaps",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-[image:var(--gradient-primary)] opacity-20 blur-3xl rounded-full" />
            <div className="relative glass-strong rounded-3xl p-6 shadow-elevated">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Today's progress</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">LEVEL 14</span>
              </div>
              {[
                { name: "Physics — Mechanics", pct: 92, color: "var(--primary)" },
                { name: "Mathematics — Calculus", pct: 78, color: "var(--accent)" },
                { name: "Coding — Data Structures", pct: 65, color: "var(--info)" },
                { name: "Chemistry — Organic", pct: 41, color: "var(--warning)" },
              ].map((s) => (
                <div key={s.name} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground/90">{s.name}</span>
                    <span className="font-mono text-muted-foreground">{s.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-border/60">
                <Stat icon={Zap} label="Focus" value="4.2h" />
                <Stat icon={Flame} label="Streak" value="23d" />
                <Stat icon={Target} label="XP" value="1,840" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="relative overflow-hidden glass-strong rounded-3xl p-12 md:p-20 text-center shadow-elevated">
          <div className="absolute inset-0 bg-hero opacity-60 pointer-events-none" />
          <div className="relative">
            <Layers className="h-10 w-10 text-primary mx-auto mb-5" />
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
              Your most disciplined semester starts now.
            </h2>
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
              Join students forging their focus. Free to start, no credit card required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary hover:scale-[1.03] transition"
              >
                Create your dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-medium hover:bg-surface-elevated transition"
              >
                <Bell className="h-4 w-4" /> Get updates
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Eduvix</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <a className="hover:text-foreground transition" href="#">
              Privacy
            </a>
            <a className="hover:text-foreground transition" href="#">
              Terms
            </a>
            <a className="hover:text-foreground transition" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
      <div className="font-mono text-sm font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <div className="absolute -inset-6 bg-[image:var(--gradient-primary)] opacity-20 blur-3xl rounded-full" />
      <div className="relative glass-strong rounded-3xl p-2 shadow-elevated">
        <div className="rounded-2xl bg-background/80 overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <div className="ml-4 font-mono text-xs text-muted-foreground">
              eduvix.app / dashboard
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3 p-4">
            {/* Sidebar */}
            <aside className="col-span-3 hidden md:block space-y-1">
              {[
                { icon: BarChart3, label: "Dashboard", active: true },
                { icon: Calendar, label: "Routine" },
                { icon: ClipboardList, label: "Attendance" },
                { icon: Timer, label: "Focus" },
                { icon: Flame, label: "Habits" },
                { icon: BookOpen, label: "Notes" },
                { icon: GraduationCap, label: "Exams" },
                { icon: Brain, label: "AI Coach" },
              ].map((i) => (
                <div
                  key={i.label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition
                  ${i.active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary/50"}`}
                >
                  <i.icon className="h-4 w-4" />
                  {i.label}
                </div>
              ))}
            </aside>

            {/* Main */}
            <main className="col-span-12 md:col-span-9 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Focus today", value: "3h 42m", trend: "+18%", color: "primary" },
                  { label: "Attendance", value: "94%", trend: "+2%", color: "success" },
                  { label: "Streak", value: "23 days", trend: "🔥", color: "warning" },
                  { label: "XP", value: "1,840", trend: "Lvl 14", color: "accent" },
                ].map((c) => (
                  <div key={c.label} className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </div>
                    <div className="font-mono text-xl font-bold mt-1">{c.value}</div>
                    <div className="text-[10px] text-primary mt-1">{c.trend}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium">Weekly focus hours</span>
                    <span className="font-mono text-[10px] text-muted-foreground">7d</span>
                  </div>
                  <div className="flex items-end gap-2 h-28">
                    {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                        className="flex-1 rounded-md bg-[image:var(--gradient-primary)] opacity-90"
                      />
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs font-medium mb-3">Pomodoro</div>
                  <div className="grid place-items-center py-2">
                    <div
                      className="relative h-24 w-24 rounded-full grid place-items-center"
                      style={{
                        background: "conic-gradient(var(--primary) 70%, var(--secondary) 0)",
                      }}
                    >
                      <div className="h-[78px] w-[78px] rounded-full bg-background grid place-items-center">
                        <span className="font-mono text-lg font-bold">17:42</span>
                      </div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                      Session 3 of 4
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium">Habit streaks</span>
                  <span className="font-mono text-[10px] text-muted-foreground">90d heatmap</span>
                </div>
                <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
                  {Array.from({ length: 90 }).map((_, i) => {
                    const intensity = Math.random();
                    const op =
                      intensity < 0.2 ? 0.08 : intensity < 0.5 ? 0.35 : intensity < 0.8 ? 0.65 : 1;
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-[3px]"
                        style={{ background: `oklch(0.74 0.2 50 / ${op})` }}
                      />
                    );
                  })}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
