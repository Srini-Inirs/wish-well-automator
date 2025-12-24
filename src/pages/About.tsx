import PageLayout from "@/components/PageLayout";
import { Bird, Heart, Zap, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <PageLayout 
      title="About WishBird" 
      subtitle="Making celebrations unforgettable, one wish at a time"
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <motion.section 
          className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-border/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-cta flex items-center justify-center shadow-glow">
              <Bird className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">WishBird</h2>
              <p className="text-muted-foreground">by 16xstudios</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            WishBird is an innovative platform that helps you never miss an important celebration. 
            Schedule personalized WhatsApp greetings for birthdays, anniversaries, and special occasions 
            with AI-powered messages that feel genuinely heartfelt.
          </p>
        </motion.section>

        {/* Story */}
        <motion.section 
          className="bg-card/50 rounded-2xl p-6 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              WishBird was born from a simple problem — we kept forgetting to wish our loved ones on their special days. 
              Birthdays, anniversaries, festivals — life gets busy, and those important moments slip away.
            </p>
            <p>
              We built WishBird to solve this. Schedule your wishes in advance, personalize them with AI, 
              and let us deliver them right on time via WhatsApp. It's like having a personal assistant 
              dedicated to keeping your relationships warm.
            </p>
            <p>
              Today, WishBird has helped thousands of users send heartfelt messages across India, 
              making celebrations more special, one wish at a time.
            </p>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">What We Believe</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card/50 rounded-2xl p-6 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Connection Matters</h3>
              <p className="text-sm text-muted-foreground">
                Small gestures create big impacts. A timely wish can brighten someone's entire day.
              </p>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Technology for Good</h3>
              <p className="text-sm text-muted-foreground">
                AI should help us be more human, not less. We use it to make your messages more personal.
              </p>
            </div>
            <div className="bg-card/50 rounded-2xl p-6 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Simplicity First</h3>
              <p className="text-sm text-muted-foreground">
                Complex tech, simple experience. Schedule a wish in under a minute.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Company Info */}
        <motion.section 
          className="bg-card/50 rounded-2xl p-6 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">About 16xstudios</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            16xstudios is a technology company focused on building products that enhance human connections. 
            Based in Hosur, Tamil Nadu, we're passionate about creating tools that make life simpler and relationships stronger.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-muted-foreground">
            <div className="bg-background/50 rounded-xl p-4">
              <strong className="text-foreground block mb-2">📍 Location</strong>
              Hosur - 635126<br />
              Tamilnadu, India
            </div>
            <div className="bg-background/50 rounded-xl p-4">
              <strong className="text-foreground block mb-2">📧 Contact</strong>
              support@16xstudios.space<br />
              +91 7871282354
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
};

export default About;
