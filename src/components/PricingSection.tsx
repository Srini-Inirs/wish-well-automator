import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Star, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { initiatePayment } from "@/lib/razorpay";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/forever",
    description: "Get started with WishBird",
    helper: "10 credits included",
    icon: Sparkles,
    features: [
      { text: "10 credits (one-time)", included: true },
      { text: "Basic text messages", included: true },
      { text: "English language only", included: true },
      { text: "1 image per wish", included: true },
      { text: "Video messages", included: false },
      { text: "Document messages", included: false },
      { text: "AI text generation", included: false },
    ],
    cta: "Start Free",
    variant: "outline" as const,
    popular: false,
    planKey: "free" as const,
  },
  {
    name: "Basic",
    price: "₹1",
    period: "/month",
    description: "For regular wishers",
    helper: "15 credits per month",
    icon: Star,
    features: [
      { text: "15 credits per month", included: true },
      { text: "Multi-language support", included: true },
      { text: "Unlimited images", included: true },
      { text: "Priority delivery", included: true },
      { text: "Video messages", included: false },
      { text: "Document messages", included: false },
      { text: "AI generation", included: false },
    ],
    cta: "Get Basic",
    variant: "outline" as const,
    popular: false,
    planKey: "basic" as const,
  },
  {
    name: "Pro",
    price: "₹2",
    period: "/month",
    description: "For power users",
    helper: "35 credits per month",
    icon: Crown,
    features: [
      { text: "35 credits per month", included: true },
      { text: "Everything in Basic", included: true },
      { text: "Video messages", included: true },
      { text: "Delivery confirmation", included: true },
      { text: "Priority support", included: true },
      { text: "Document messages", included: false },
      { text: "AI generation", included: false },
    ],
    cta: "Go Pro",
    variant: "hero" as const,
    popular: true,
    planKey: "pro" as const,
  },
  {
    name: "Premium",
    price: "₹3",
    period: "/month",
    description: "Unlimited magic",
    helper: "80 credits + free AI",
    icon: Crown,
    features: [
      { text: "80 credits per month", included: true },
      { text: "Everything in Pro", included: true },
      { text: "Document messages", included: true },
      { text: "AI text generation (free)", included: true },
      { text: "AI image generation (free)", included: true },
      { text: "Premium templates", included: true },
      { text: "24/7 support", included: true },
    ],
    cta: "Go Premium",
    variant: "golden" as const,
    popular: false,
    planKey: "premium" as const,
  },
];

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanClick = async (planKey: "free" | "basic" | "pro" | "premium") => {
    // Free plan - just go to auth/dashboard
    if (planKey === "free") {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
      return;
    }

    // Paid plans - need to be logged in
    if (!user) {
      // Redirect to auth with plan parameter, will trigger payment after login
      navigate(`/auth?plan=${planKey}`);
      return;
    }

    // User is logged in - initiate payment directly
    setLoadingPlan(planKey);
    
    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      await initiatePayment({
        plan: planKey,
        userId: user.id,
        userEmail: user.email || "",
        userName: profile?.display_name || "",
        onSuccess: (upgradedPlan, credits) => {
          toast({
            title: "🎉 Payment Successful!",
            description: `Welcome to ${upgradedPlan.charAt(0).toUpperCase() + upgradedPlan.slice(1)}! ${credits} credits added.`,
          });
          setLoadingPlan(null);
          navigate("/dashboard");
        },
        onError: (error) => {
          toast({ title: "Payment Failed", description: error, variant: "destructive" });
          setLoadingPlan(null);
        },
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to initiate payment", variant: "destructive" });
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-pricing">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-light border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Simple Pricing</span>
          </span>
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            🎁 Start free with 10 credits — upgrade when you need more magic.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl p-6 border ${
                plan.popular
                  ? "border-primary shadow-glow scale-105 z-10"
                  : plan.name === "Premium"
                  ? "border-gold/50 shadow-card"
                  : "border-border/50 shadow-card"
              } transition-all duration-300 hover:shadow-glow`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-cta rounded-full text-xs font-bold text-primary-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              {/* Premium Badge */}
              {plan.name === "Premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gold rounded-full text-xs font-bold text-foreground flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Best Value
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${
                  plan.popular
                    ? "bg-gradient-cta"
                    : plan.name === "Premium"
                    ? "bg-gold"
                    : "bg-indigo-light"
                } flex items-center justify-center mb-4`}
              >
                <plan.icon
                  className={`w-6 h-6 ${
                    plan.popular || plan.name === "Premium" ? "text-primary-foreground" : "text-primary"
                  }`}
                />
              </div>

              {/* Name & Price */}
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
              {plan.helper && <p className="text-xs text-primary font-medium mb-4">{plan.helper}</p>}

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant}
                className={`w-full ${
                  plan.name === "Premium" ? "bg-gold hover:bg-gold/90 text-foreground" : ""
                }`}
                onClick={() => handlePlanClick(plan.planKey)}
                disabled={loadingPlan === plan.planKey}
              >
                {loadingPlan === plan.planKey ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
