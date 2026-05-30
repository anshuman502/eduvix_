import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShieldAlert, Sparkles, Zap, ArrowRight, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pricing")({
  component: PricingPage,
});

function PricingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleChoosePlan(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch(`${API_BASE}?action=choosePlan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ff_token") ?? ""}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Plan updated successfully! Welcome back.");
        // Notify the layout that profile needs refreshing
        window.dispatchEvent(new CustomEvent("xp-update"));
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Failed to update plan.");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  }

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$0",
      period: "forever",
      description: "Essential tools for students getting started.",
      icon: <ShieldAlert className="h-5 w-5 text-zinc-400" />,
      features: ["Focus Timer", "Basic Notes", "Simple To-Do List"],
      button: "Continue with Basic",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9",
      period: "/ month",
      description: "Everything you need to crush your exams.",
      icon: <Zap className="h-5 w-5 text-primary" />,
      features: [
        "AI Coach Access",
        "Advanced Analytics",
        "Unlimited Routine Blocks",
        "Smart Revisions",
      ],
      button: "Upgrade to Pro",
      popular: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: "$19",
      period: "/ month",
      description: "Maximum power for the top 1%.",
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      features: [
        "All Pro Features",
        "Priority AI Processing",
        "1-on-1 Mentorship (Mock)",
        "Early Access to Features",
      ],
      button: "Go Elite",
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur overflow-y-auto">
      {/* Exit Button */}
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="absolute top-6 right-6 p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/40 border border-border/40 transition z-50 flex items-center gap-1.5 font-medium text-xs tracking-wider uppercase font-mono bg-background/50 cursor-pointer"
      >
        <X className="h-4 w-4" />
        Exit
      </button>

      <div className="min-h-screen py-12 px-4 w-full max-w-6xl flex flex-col items-center justify-center">
        
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Premium Plans
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4"
          >
            Choose your path forward.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Select a plan to unlock Eduvix and continue your journey to academic excellence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`relative flex flex-col p-6 rounded-3xl glass transition-transform duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? "border-primary/50 shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] bg-primary/5" 
                  : "border-border/50 hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-background/50 grid place-items-center shadow-inner">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>

              <div className="mb-2">
                <span className="text-4xl font-extrabold font-display">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 h-10">{plan.description}</p>

              <div className="flex-1">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 rounded-full bg-primary/20 p-0.5">
                        <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                      </div>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-(image:--gradient-primary) text-primary-foreground shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                    : "bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50"
                }`}
              >
                {loading === plan.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {plan.button}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
