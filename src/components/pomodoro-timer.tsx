import { useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo, useRef, useState } from "react";

import { Play, Pause, RotateCcw, Coffee, Timer as TimerIcon } from "lucide-react";
import { toast } from "sonner";
import { API_BASE, getAuthHeaders } from "@/lib/api";

type Subject = { id: string; name: string; color: string };
type Block = {
  id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_id: string | null;
};

const PRESETS = [
  { label: "Focus", mins: 25, type: "focus" as const },
  { label: "Sprint", mins: 5, type: "focus" as const },
  { label: "Short", mins: 5, type: "short_break" as const },
  { label: "Long", mins: 15, type: "long_break" as const },
];

export function PomodoroTimer() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [blockId, setBlockId] = useState<string>("");
  const [presetIdx, setPresetIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].mins * 60);
  const [running, setRunning] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const startedAtRef = useRef<Date | null>(null);
  const startSecondsRef = useRef<number>(PRESETS[0].mins * 60);

  // Refs to prevent stale closures in async callbacks/listeners
  const secondsLeftRef = useRef(secondsLeft);
  const subjectIdRef = useRef(subjectId);
  const blockIdRef = useRef(blockId);
  const presetTypeRef = useRef(PRESETS[0].type);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    subjectIdRef.current = subjectId;
  }, [subjectId]);

  useEffect(() => {
    blockIdRef.current = blockId;
  }, [blockId]);

  const preset = PRESETS[presetIdx];

  useEffect(() => {
    presetTypeRef.current = preset.type;
  }, [preset.type]);

  const total = preset.mins * 60;
  const progress = 1 - secondsLeft / total;

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("ff_token");
    if (!token) return;
    (async () => {
      try {
        const [subsRes, routineRes] = await Promise.all([
          fetch(`${API_BASE}?action=getSubjects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}?action=getRoutineBlocks`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const subs = await subsRes.json();
        const bs = await routineRes.json();
        setSubjects(subs.data?.subjects ?? []);
        setBlocks(bs.data?.blocks ?? []);
        setTodayMinutes(0);
        setTodayCount(0);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user]);

  // Auto-suggest current block
  useEffect(() => {
    const check = () => {
      if (!blocks.length) return;
      const now = new Date();
      const dow = (now.getDay() + 6) % 7; // 0=Mon
      const hhmm = now.toTimeString().slice(0, 8);
      
      // Prefer day-specific, fallback to template (day 0)
      const current = blocks.find(
        (b) => (b.day_of_week === dow || b.day_of_week === 0) && b.start_time <= hhmm && b.end_time >= hhmm,
      );
      
      if (current && current.id !== blockId) {
        setBlockId(current.id);
        if (current.subject_id) setSubjectId(current.subject_id);
      }
    };

    check();
    const t = setInterval(check, 60000); // Re-check every minute
    return () => clearInterval(t);
  }, [blocks, blockId]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          void logSession(true);
          return preset.mins * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  async function logSession(completed: boolean) {
    if (!user || !startedAtRef.current) return;
    const token = localStorage.getItem("ff_token");
    const currentSecondsLeft = completed ? 0 : secondsLeftRef.current;
    const elapsed = Math.max(0, startSecondsRef.current - currentSecondsLeft);
    if (elapsed < 30) return; // ignore tiny sessions
    
    try {
      const payload = {
        subjectId: subjectIdRef.current || null,
        blockId: blockIdRef.current || null,
        startedAt: startedAtRef.current.toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: elapsed,
        sessionType: presetTypeRef.current,
        completed,
      };

      console.log("[Pomodoro] addFocusSession payload", payload);

      const res = await fetch(`${API_BASE}?action=addFocusSession`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("[Pomodoro] addFocusSession response", data);

      if (!data.success) throw new Error(data.message);

      if (true) { // Log all types for feedback
        setTodayMinutes((m) => m + Math.round(elapsed / 60));
        if (completed && presetTypeRef.current === "focus") setTodayCount((c) => c + 1);

        const xpEarned = data.data?.xp_earned;
        const newTotalXp = data.data?.new_total_xp;

        toast.success(
          completed
            ? typeof xpEarned === "number"
              ? `Session complete! +${xpEarned} XP earned`
              : "Session complete"
            : "Session logged",
          {
            icon: presetTypeRef.current === "focus" ? "🔥" : "🧘",
            description:
              typeof newTotalXp === "number"
                ? `Total: ${newTotalXp} XP`
                : typeof xpEarned === "number"
                  ? `XP earned: ${xpEarned}`
                  : undefined,
          }
        );

        window.dispatchEvent(new Event("xp-update")); // Dispatch XP update event
        try {
          new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play();
        } catch {}
      }
    } catch (err) {
      toast.error("Could not log session");
    }
    startedAtRef.current = null;
  }

  function start() {
    if (!running) {
      if (!startedAtRef.current) {
        startedAtRef.current = new Date();
        startSecondsRef.current = secondsLeft;
      }
      setRunning(true);
    } else {
      setRunning(false);
    }
  }

  function reset() {
    if (running || (startedAtRef.current && secondsLeft < startSecondsRef.current)) {
      void logSession(false);
    }
    setRunning(false);
    setSecondsLeft(preset.mins * 60);
    startedAtRef.current = null;
  }

  function selectPreset(i: number) {
    setPresetIdx(i);
    setRunning(false);
    setSecondsLeft(PRESETS[i].mins * 60);
    startedAtRef.current = null;
  }

  const m = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const s = (secondsLeft % 60).toString().padStart(2, "0");

  const C = 2 * Math.PI * 90;
  const dash = useMemo(() => C * progress, [progress]);

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Focus Timer
          </span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          TODAY · {todayMinutes}m · {todayCount} sessions
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => selectPreset(i)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              presetIdx === i
                ? "bg-primary/15 text-primary border-primary/40"
                : "border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.type !== "focus" && <Coffee className="h-3 w-3 inline mr-1" />}
            {p.label} · {p.mins}m
          </button>
        ))}
      </div>

      <div className="grid place-items-center my-2">
        <div className="relative h-52 w-52">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#g)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${C}`}
              style={{ transition: "stroke-dasharray 0.6s linear" }}
            />
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.18 55)" />
                <stop offset="100%" stopColor="oklch(0.65 0.22 35)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-mono text-5xl font-bold tracking-tight">
                {m}:{s}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                {preset.type === "focus" ? "Deep work" : "Break"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <button
          onClick={start}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-(image:--gradient-primary) text-primary-foreground font-medium glow-primary"
        >
          {running ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-xs"
        >
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={blockId}
          onChange={(e) => {
            setBlockId(e.target.value);
            const b = blocks.find((x) => x.id === e.target.value);
            if (b?.subject_id) setSubjectId(b.subject_id);
          }}
          className="bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-xs"
        >
          <option value="">No block</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][b.day_of_week]} ·{" "}
              {b.start_time.slice(0, 5)} {b.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
