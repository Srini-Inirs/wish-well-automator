import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Users, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import wishbirdLogo from "@/assets/wishbird-logo.png";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <img src={wishbirdLogo} alt="WishBird" className="w-20 h-20 object-contain mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About WishBird</h1>
          <p className="text-xl text-muted-foreground">
            Making moments magical with AI-powered WhatsApp greetings. Never miss wishing someone again.
          </p>
        </motion.div>

        {/* Story */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
          <div className="bg-card rounded-2xl p-8 border border-border/50">
            <p className="text-muted-foreground mb-4">
              WishBird was born from a simple problem — we kept forgetting to wish our loved ones on their special days. 
              Birthdays, anniversaries, festivals — life gets busy, and those important moments slip away.
            </p>
            <p className="text-muted-foreground mb-4">
              We built WishBird to solve this. Schedule your wishes in advance, personalize them with AI, 
              and let us deliver them right on time via WhatsApp. It's like having a personal assistant 
              dedicated to keeping your relationships warm.
            </p>
            <p className="text-muted-foreground">
              Today, WishBird has helped thousands of users send heartfelt messages across India, 
              making celebrations more special, one wish at a time.
            </p>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">What We Believe</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Connection Matters</h3>
              <p className="text-sm text-muted-foreground">
                Small gestures create big impacts. A timely wish can brighten someone's entire day.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Technology for Good</h3>
              <p className="text-sm text-muted-foreground">
                AI should help us be more human, not less. We use it to make your messages more personal.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Simplicity First</h3>
              <p className="text-sm text-muted-foreground">
                Complex tech, simple experience. Schedule a wish in under a minute.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Company */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The Team</h2>
          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-cta flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">16xstudios</h3>
            <p className="text-muted-foreground mb-4">
              A passionate team building products that make life a little more magical.
            </p>
            <p className="text-sm text-muted-foreground">
              📍 Hosur - 635126, Tamilnadu, India<br />
              🌐 16xstudios.space
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
