import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import wishbirdLogo from "@/assets/wishbird-logo.png";

const WhatsAppPreview = () => {
  return <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
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
      }} className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp-light border border-whatsapp/20 mb-4">
          <Phone className="w-4 h-4 text-whatsapp" />
          <span className="text-sm font-medium text-whatsapp">WhatsApp Preview</span>
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          This Is What They Receive
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A beautiful, magical greeting that makes them feel truly special ✨
        </p>
      </motion.div>

      {/* Phone Preview */}
      <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} whileInView={{
        opacity: 1,
        scale: 1
      }} viewport={{
        once: true
      }} className="flex justify-center">
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 bg-whatsapp/20 blur-3xl rounded-full" />

          {/* Phone */}
          <div className="relative w-80 bg-foreground/95 rounded-[3rem] p-3 shadow-2xl">
            <div className="bg-whatsapp-light rounded-[2.5rem] overflow-hidden">
              {/* Header */}
              <div className="bg-whatsapp px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center overflow-hidden">
                  <img src={wishbirdLogo} alt="WishBird" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="text-primary-foreground font-semibold text-sm">WishBird</div>
                  <div className="text-primary-foreground/70 text-xs">online</div>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 min-h-[350px] bg-[#e5ddd5]">
                <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} whileInView={{
                  opacity: 1,
                  y: 0
                }} viewport={{
                  once: true
                }} transition={{
                  delay: 0.3
                }} className="bg-card rounded-2xl rounded-tl-sm p-4 shadow-md max-w-[95%]">
                  {/* Greeting Card */}
                  <div className="bg-gradient-to-br from-pink-soft via-secondary to-primary/20 rounded-xl p-5 text-center mb-3">
                    <div className="text-4xl mb-2">✨🎂✨</div>
                    <div className="font-sans text-xl font-bold text-foreground mb-2">Happy Birthday Srini!</div>
                    <p className="text-sm text-muted-foreground">
                      May this year bring you endless joy, love, success, and all the happiness you truly deserve! You're an amazing person and the world is brighter because of you. 💜
                    </p>
                  </div>

                  <div className="text-sm text-foreground mb-2">
                    🎉 <strong>Ais</strong> asked us to send this special wish just for you!
                  </div>
                  <div className="text-sm text-foreground mb-2">
                    Here's a message full of love and joy, delivered at the perfect moment to make your day unforgettable. ✨
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">via WishBird 💜</span>
                    <span className="text-xs text-whatsapp">12:00 AM ✓✓</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>;
};
export default WhatsAppPreview;