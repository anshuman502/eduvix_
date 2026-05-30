import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Zap, Crown, Flame, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useLocation } from "@tanstack/react-router";

interface PricingPlan {
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  description: string;
  icon: any;
  iconColor: string;
  borderColor: string;
  popular?: boolean;
  features: string[];
}

const PLANS: PricingPlan[] = [
  {
    name: "Basic",
    priceMonthly: 49,
    priceAnnually: 470, // ~20% off
    description: "Essential tools to kickstart your study discipline.",
    icon: Zap,
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20",
    features: [
      "Routine Builder (up to 3 subjects)",
      "Daily Attendance tracker",
      "Basic Pomodoro Focus timer",
      "Earn standard XP & Streaks",
      "Clean, ad-free workspace",
    ],
  },
  {
    name: "Infinity",
    priceMonthly: 99,
    priceAnnually: 950, // ~20% off
    popular: true,
    description: "Supercharge your productivity with advanced tools.",
    icon: Sparkles,
    iconColor: "text-primary",
    borderColor: "border-primary/50",
    features: [
      "Everything in Basic Plan",
      "Unlimited Routine subjects",
      "AI Study Coach (standard queries)",
      "Advanced Weekly Analytics reports",
      "Up to 50 syllabus revision items",
      "1.5x XP Multiplier boost",
    ],
  },
  {
    name: "Infinity Pro",
    priceMonthly: 199,
    priceAnnually: 1910, // ~20% off
    description: "The ultimate productivity OS for peak performance.",
    icon: Crown,
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    features: [
      "Everything in Infinity Plan",
      "Unlimited AI Coach queries",
      "Streak Rescue tokens (save missed days)",
      "Priority Syllabus builder tools",
      "Premium custom profile themes",
      "2x XP Multiplier & Avatar frames",
    ],
  },
];

export function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the user is currently on the login page.
    const isAuthPage = location.pathname === "/auth";
    if (isAuthPage) return;

    // Trigger 1: Explicit login/registration trigger
    const showExplicit = localStorage.getItem("ff_show_pricing");
    
    if (showExplicit === "1") {
      setIsOpen(true);
      localStorage.removeItem("ff_show_pricing"); // Clear trigger
      localStorage.setItem("ff_pricing_last_shown", Date.now().toString());
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleShowPricing = () => {
      setIsOpen(true);
    };
    window.addEventListener("show-pricing", handleShowPricing);
    return () => window.removeEventListener("show-pricing", handleShowPricing);
  }, []);

  const handleSubscribe = (planName: string) => {
    toast.success(`Subscribing to ${planName} Plan (${isAnnual ? "Annually" : "Monthly"})!`, {
      description: "Redirecting to checkout...",
    });
    // Add checkout redirection or payment gateway hook here if needed
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          {/* Backdrop wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl bg-[oklch(0.12_0.008_30)] border border-border/80 rounded-3xl p-6 sm:p-8 shadow-elevated z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/40 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scrollable Content wrapper */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-6">
              {/* Header */}
              <div className="text-center max-w-xl mx-auto space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Flame className="h-3.5 w-3.5" /> Unleash Your Potential
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                  Choose your level of <span className="text-gradient-primary">discipline</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Upgrade your productivity workspace and build unstoppable habits with our flexible plans.
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm ${!isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative w-11 h-6 rounded-full bg-secondary border border-border transition-colors focus:outline-none"
                >
                  <motion.div
                    layout
                    className="absolute top-[2.5px] left-[3px] w-4.5 h-4.5 rounded-full bg-primary"
                    animate={{ x: isAnnual ? 20 : 0 }}
                  />
                </button>
                <span className={`text-sm flex items-center gap-1.5 ${isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  Yearly
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Save 20%
                  </span>
                </span>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {PLANS.map((plan) => {
                  const Icon = plan.icon;
                  const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
                  const period = isAnnual ? "/ year" : "/ month";

                  return (
                    <div
                      key={plan.name}
                      className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 border ${
                        plan.popular
                          ? "bg-secondary/20 shadow-glow border-primary/50 md:scale-[1.03] z-10"
                          : "bg-surface/30 border-border/80 hover:border-muted-foreground/30"
                      }`}
                    >
                      {/* Popular ribbon */}
                      {plan.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider glow-primary">
                          Most Popular
                        </div>
                      )}

                      {/* Header info */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold font-display">{plan.name}</span>
                          <div className={`p-2 rounded-lg bg-surface border border-border/40 ${plan.iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Price */}
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-extrabold font-mono">₹{price}</span>
                            <span className="text-xs text-muted-foreground">{period}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 min-h-[32px] leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        <hr className="border-border/60" />

                        {/* Features list */}
                        <ul className="space-y-3 pt-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      <div className="mt-8 pt-2">
                        <button
                          onClick={() => handleSubscribe(plan.name)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition duration-200 active:scale-98 ${
                            plan.popular
                              ? "bg-[image:var(--gradient-primary)] text-primary-foreground glow-primary hover:scale-[1.02]"
                              : "bg-secondary text-foreground hover:bg-secondary/75"
                          }`}
                        >
                          Choose {plan.name}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer info */}
              <div className="text-center pt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span>All plans come with a 7-day money-back guarantee. No questions asked.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
