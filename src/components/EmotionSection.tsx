import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight } from "lucide-react";

const EmotionSection = () => {
  return <section className="py-24 bg-gradient-to-b from-background via-pink-soft/30 to-background overflow-hidden">
    <div className="container mx-auto px-4">
      {/* Header */}
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-pink-vibrant fill-pink-vibrant animate-pulse" />
          <Sparkles className="w-5 h-5 text-gold" />
          <Heart className="w-6 h-6 text-pink-vibrant fill-pink-vibrant animate-pulse" style={{
            animationDelay: "0.5s"
          }} />
        </div>
        <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Make Every Special Moment{" "}
          <span className="gradient-text">Unforgettable</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          WishBird creates greetings that feel personal, thoughtful, and beautifully timed — even when life gets busy. 💛
        </p>
      </motion.div>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
        {/* Before */}
        <motion.div initial={{
          opacity: 0,
          x: -30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="relative">
          <div className="absolute -top-4 left-4 px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
            Without WishBird
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-lg">😐</span>
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  "Happy Birthday"
                </p>
                <span className="text-xs text-muted-foreground/60">Sent 2 days late</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">Plain. Forgettable. Often late. 😕</span>
            </div>
          </div>


        </motion.div>

        {/* After */}
        <motion.div initial={{
          opacity: 0,
          x: 30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="relative">
          <div className="absolute -top-4 right-4 px-3 py-1 bg-gradient-cta rounded-full text-xs font-semibold text-primary-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            With WishBird
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-glow border border-primary/20 glow-violet">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✨</span>
              </div>
              <div className="bg-whatsapp-light rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
                <div className="bg-gradient-to-br from-pink-soft via-secondary to-primary/20 rounded-xl p-4 text-center mb-2">
                  <div className="text-2xl mb-1">🎂✨</div>
                  <div className="font-sans text-base font-bold text-foreground">Happy Birthday Srini!</div>
                  <p className="text-xs text-muted-foreground">May this year bring you endless joy, love, and all the happiness you deserve! 💜</p>
                </div>
                <p className="text-sm text-foreground">🎉 Ais sent you a magical birthday wish!</p>
                <span className="text-xs text-whatsapp">Delivered at 12:00 AM ✓✓</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-primary font-medium">Personal. Magical. Perfectly timed! ✨</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Arrow */}
      <div className="flex md:hidden justify-center my-4">
        <div className="w-12 h-12 rounded-full bg-gradient-cta flex items-center justify-center shadow-glow rotate-90">
          <ArrowRight className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  </section>;
};
export default EmotionSection;