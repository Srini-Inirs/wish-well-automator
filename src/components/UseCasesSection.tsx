import { motion } from "framer-motion";

const useCases = [
  {
    emoji: "🎂",
    title: "Birthdays",
    description: "Never miss a birthday again with scheduled wishes that arrive exactly at midnight.",
    color: "bg-pink-soft border-pink-vibrant/30",
  },
  {
    emoji: "💍",
    title: "Anniversaries",
    description: "Celebrate love with romantic messages, photos, and personalized cards.",
    color: "bg-secondary border-primary/30",
  },
  {
    emoji: "🎉",
    title: "Festivals",
    description: "Diwali, Eid, Christmas, Pongal — send warm wishes in any language.",
    color: "bg-gold/20 border-gold/30",
  },
  {
    emoji: "💛",
    title: "Apologies",
    description: "Say sorry with heartfelt AI-crafted messages that truly express your feelings.",
    color: "bg-amber-50 border-amber-300/30",
  },
  {
    emoji: "🌟",
    title: "Appreciation",
    description: "Thank teachers, mentors, and friends with thoughtful gratitude messages.",
    color: "bg-cyan-50 border-cyan-300/30",
  },
  {
    emoji: "👩‍💼",
    title: "Employer → Employee",
    description: "Boost team morale with automated birthday and work anniversary wishes.",
    color: "bg-indigo-50 border-indigo-300/30",
  },
  {
    emoji: "🛍",
    title: "Business → Customer",
    description: "Build loyalty with personalized customer appreciation messages.",
    color: "bg-emerald-50 border-emerald-300/30",
  },
  {
    emoji: "💜",
    title: "Just Because",
    description: "Sometimes the best wishes need no occasion — surprise someone today!",
    color: "bg-primary/10 border-primary/30",
  },
];

const UseCasesSection = () => {
  return (
    <section id="use-cases" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">For Every Occasion</span>
          </span>
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Perfect for Every Moment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From personal celebrations to business relationships — WishBird has you covered ✨
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`${useCase.color} rounded-2xl p-5 border hover:shadow-card transition-all duration-300 group cursor-pointer`}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {useCase.emoji}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1">
                {useCase.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
