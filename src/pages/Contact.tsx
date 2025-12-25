import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import wishbirdLogo from "@/assets/wishbird-logo.png";

const Contact = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-card rounded-2xl p-8 border border-border/50 h-full">
              <img src={wishbirdLogo} alt="WishBird" className="w-16 h-16 object-contain mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-light flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a href="mailto:support@16xstudios.space" className="text-muted-foreground hover:text-primary transition-colors">
                      support@16xstudios.space
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-light flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <a href="tel:+917871282354" className="text-muted-foreground hover:text-primary transition-colors">
                      +91 7871282354
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-light flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      Hosur - 635126<br />
                      Tamilnadu, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-light flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Company</h3>
                    <p className="text-muted-foreground">16xstudios</p>
                    <a href="https://16xstudios.space" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      16xstudios.space
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl p-8 border border-border/50 h-full">
              <h2 className="text-2xl font-bold text-foreground mb-6">Quick Links</h2>
              
              <div className="space-y-4">
                <div className="bg-background rounded-xl p-4 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">🎁 Need Help with Your Wish?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check our FAQ or reach out for assistance with scheduling or delivery issues.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@16xstudios.space?subject=Help with my wish">Email Support</a>
                  </Button>
                </div>

                <div className="bg-background rounded-xl p-4 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">💳 Billing Questions?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For payment or subscription inquiries, our team is here to help.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@16xstudios.space?subject=Billing inquiry">Contact Billing</a>
                  </Button>
                </div>

                <div className="bg-background rounded-xl p-4 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">🤝 Partnership Opportunities</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Interested in partnering with WishBird? Let's talk!
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@16xstudios.space?subject=Partnership inquiry">Reach Out</a>
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-cta/10 rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground text-center">
                  Average response time: <span className="text-foreground font-semibold">Under 24 hours</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
