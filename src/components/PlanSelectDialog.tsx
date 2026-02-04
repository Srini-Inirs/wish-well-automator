import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Sparkles, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  credits: number;
  features: { text: string; included: boolean }[];
  planKey: "basic" | "pro" | "premium";
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Basic",
    price: "₹49",
    period: "/month",
    description: "For regular wishers",
    credits: 15,
    features: [
      { text: "15 credits per month", included: true },
      { text: "Multi-language support", included: true },
      { text: "Unlimited images", included: true },
      { text: "Priority delivery", included: true },
    ],
    planKey: "basic",
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    description: "For power users",
    credits: 35,
    features: [
      { text: "35 credits per month", included: true },
      { text: "Everything in Basic", included: true },
      { text: "Video messages", included: true },
      { text: "Priority support", included: true },
    ],
    planKey: "pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "₹199",
    period: "/month",
    description: "Unlimited magic",
    credits: 80,
    features: [
      { text: "80 credits per month", included: true },
      { text: "Everything in Pro", included: true },
      { text: "AI generation (free)", included: true },
      { text: "Document messages", included: true },
    ],
    planKey: "premium",
  },
];

interface PlanSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (plan: "basic" | "pro" | "premium") => void;
  loadingPlan: string | null;
  currentPlan?: string;
}

export function PlanSelectDialog({
  open,
  onOpenChange,
  onSelectPlan,
  loadingPlan,
  currentPlan = "free",
}: PlanSelectDialogProps) {
  const getIcon = (planName: string) => {
    switch (planName) {
      case "Basic":
        return Star;
      case "Pro":
        return Crown;
      case "Premium":
        return Crown;
      default:
        return Sparkles;
    }
  };

  const availablePlans = plans.filter((p) => {
    const planOrder = { free: 0, basic: 1, pro: 2, premium: 3 };
    return planOrder[p.planKey] > planOrder[currentPlan as keyof typeof planOrder];
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-gold" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {availablePlans.map((plan, index) => {
            const Icon = getIcon(plan.name);
            const isLoading = loadingPlan === plan.planKey;

            return (
              <motion.div
                key={plan.planKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-card rounded-xl p-5 border ${
                  plan.popular
                    ? "border-primary shadow-glow"
                    : plan.name === "Premium"
                    ? "border-gold/50"
                    : "border-border/50"
                } transition-all duration-300 hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-cta rounded-full text-xs font-bold text-primary-foreground">
                    Most Popular
                  </div>
                )}

                {plan.name === "Premium" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gold rounded-full text-xs font-bold text-foreground">
                    Best Value
                  </div>
                )}

                <div
                  className={`w-10 h-10 rounded-lg ${
                    plan.popular
                      ? "bg-gradient-cta"
                      : plan.name === "Premium"
                      ? "bg-gold"
                      : "bg-indigo-light"
                  } flex items-center justify-center mb-3`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      plan.popular || plan.name === "Premium"
                        ? "text-primary-foreground"
                        : "text-primary"
                    }`}
                  />
                </div>

                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : plan.name === "Premium" ? "default" : "outline"}
                  className={`w-full ${
                    plan.name === "Premium" ? "bg-gold hover:bg-gold/90 text-foreground" : ""
                  }`}
                  onClick={() => onSelectPlan(plan.planKey)}
                  disabled={!!loadingPlan}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Get ${plan.name}`
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {availablePlans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-4 text-gold" />
            <p className="text-lg font-medium">You're on the highest plan!</p>
            <p className="text-sm">Enjoy all the premium features.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
