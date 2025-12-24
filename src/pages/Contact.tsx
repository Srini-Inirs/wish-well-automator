import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <PageLayout 
      title="Get in Touch" 
      subtitle="Have questions? We'd love to hear from you"
    >
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div 
          className="bg-card/50 rounded-2xl p-8 border border-border/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your name" 
                  required 
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="How can we help?" 
                required 
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Tell us more about your inquiry..." 
                rows={5} 
                required 
                className="bg-background/50 resize-none"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Email Us</h3>
                <p className="text-muted-foreground mb-2">For general inquiries and support</p>
                <a 
                  href="mailto:support@16xstudios.space" 
                  className="text-primary hover:underline font-medium"
                >
                  support@16xstudios.space
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Call Us</h3>
                <p className="text-muted-foreground mb-2">Mon-Sat from 9am to 6pm IST</p>
                <a 
                  href="tel:+917871282354" 
                  className="text-primary hover:underline font-medium"
                >
                  +91 7871282354
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Visit Us</h3>
                <p className="text-muted-foreground mb-2">Our office location</p>
                <address className="text-foreground not-italic">
                  16xstudios<br />
                  Hosur - 635126<br />
                  Tamilnadu, India
                </address>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Company</h3>
                <p className="text-muted-foreground mb-2">16xstudios</p>
                <a 
                  href="https://16xstudios.space" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline font-medium"
                >
                  16xstudios.space
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-2">Quick Response</h3>
            <p className="text-muted-foreground">
              We typically respond within 24 hours. For urgent matters, please call us directly.
            </p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Contact;
