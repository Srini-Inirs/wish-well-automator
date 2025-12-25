import { motion } from "framer-motion";
import {
  MessageSquare,
  Languages,
  Image,
  CreditCard,
  Clock,
  CheckCircle,
  CalendarHeart,
  Sparkles,
  Mic,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Automated WhatsApp Greetings",
    description: "Set it once, relax forever. Your wishes arrive perfectly on time.",
    gradient: "from-whatsapp to-emerald-600",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Text in Any Language",
    description: "Beautiful, emotional messages crafted by AI — sounds like you wrote it.",
    gradient: "from-primary to-violet-600",
  },
  {
    icon: Image,
    title: "Add Photos, Videos & Voice Notes",
    description: "Make it personal with memories, videos, and heartfelt voice messages.",
    gradient: "from-pink-vibrant to-rose-600",
  },
  {
    icon: CreditCard,
    title: "Personalized Greeting Cards",
    description: "AI creates stunning cards with names, photos, and occasion themes.",
    gradient: "from-gold to-amber-600",
  },
  {
    icon: Languages,
    title: "Multi-Language Translation",
    description: "Tamil, Hindi, English, Telugu, Malayalam, Kannada — we speak your language.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Clock,
    title: "Perfect Timing — Every Time",
    description: "Wishes delivered at exact moments, even at midnight across time zones.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: CheckCircle,
    title: "Delivery Confirmation",
    description: "Know exactly when your wish reached their heart with real-time status.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: CalendarHeart,
    title: "Never Forget Birthdays Again",
    description: "Smart reminders and auto-scheduling for all your important dates.",
    gradient: "from-pink-500 to-primary",
  },
  {
    icon: Mic,
    title: "AI Voice Messages",
    description: "Generate warm, natural voice greetings in multiple languages.",
    gradient: "from-indigo-500 to-purple-600",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-soft border border-pink-vibrant/20 mb-4">
            <span className="text-2xl">💜</span>
            <span className="text-sm font-medium text-pink-vibrant">Loved by Thousands</span>
          </span>
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why People Love WishBird
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create unforgettable moments for your loved ones ✨
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 border border-border/50 h-full overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-button group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="relative font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="relative text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
