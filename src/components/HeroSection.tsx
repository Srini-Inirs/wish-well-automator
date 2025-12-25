import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Calendar, Send, Sparkles } from "lucide-react";
import wishbirdLogo from "@/assets/wishbird-logo.png";

const HeroSection = () => {
  const navigate = useNavigate();
  return <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
    {/* Background Gradient Orbs */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-pink-vibrant/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: "1s"
      }} />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gold/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: "2s"
      }} />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-center lg:text-left">
          <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Greetings</span>
          </motion.div>

          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Never Miss Wishing{" "}
            <span className="gradient-text">Someone Again.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
            Schedule personalized WhatsApp greetings with AI — delivered automatically with love, emotion, photos, and your personal touch. ✨
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
              <Calendar className="w-5 h-5" />
              Schedule a Wish
            </Button>
            <Button variant="hero-ghost" size="xl" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({
              behavior: "smooth"
            })}>
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.6
          }} className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
            {[{
              number: "50K+",
              label: "Wishes Sent"
            }, {
              number: "99.9%",
              label: "On-Time Delivery"
            }, {
              number: "4.9★",
              label: "User Rating"
            }].map(stat => <div key={stat.label} className="text-center">
              <div className="font-sans text-2xl font-bold text-primary">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>)}
          </motion.div>
        </motion.div>

        {/* Right Content - Floating Phone Mockup */}
        <motion.div initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.8,
          delay: 0.3
        }} className="relative flex justify-center">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-cta opacity-20 blur-3xl rounded-full" />

          {/* Phone Container */}
          <div className="relative animate-float">
            {/* Phone Frame */}
            <div className="w-72 md:w-80 bg-foreground/95 rounded-[3rem] p-3 shadow-2xl">
              <div className="bg-whatsapp-light rounded-[2.5rem] overflow-hidden">
                {/* WhatsApp Header */}
                <div className="bg-whatsapp px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
                    <img src={wishbirdLogo} alt="WishBird" className="w-8 h-8 object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="text-primary-foreground font-semibold text-sm">WishBird</div>
                    <div className="text-primary-foreground/70 text-xs">online</div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-3 min-h-[400px] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22a%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%221%22%20fill%3D%22%23dcfce7%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22url(%23a)%22%2F%3E%3C%2Fsvg%3E')]">
                  {/* Message 1 */}
                  <motion.div initial={{
                    opacity: 0,
                    x: 20
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} transition={{
                    delay: 1
                  }} className="flex justify-end">
                    <div className="bg-emerald-100 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
                      <p className="text-sm text-foreground">🎂 Schedule birthday wish for Srini on Dec 15th</p>
                      <span className="text-xs text-muted-foreground">10:30 AM ✓✓</span>
                    </div>
                  </motion.div>

                  {/* Message 2 */}
                  <motion.div initial={{
                    opacity: 0,
                    x: -20
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} transition={{
                    delay: 1.5
                  }} className="flex justify-start">
                    <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%] shadow-sm">
                      <p className="text-sm text-foreground">✨ Creating magical birthday wish for Srini...</p>
                    </div>
                  </motion.div>

                  {/* Message 3 - Greeting Card */}
                  <motion.div initial={{
                    opacity: 0,
                    scale: 0.8
                  }} animate={{
                    opacity: 1,
                    scale: 1
                  }} transition={{
                    delay: 2
                  }} className="flex justify-start">
                    <div className="bg-card rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm">
                      <div className="bg-gradient-to-br from-pink-soft via-secondary to-primary/20 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">🎉</div>
                        <div className="font-sans text-lg font-bold text-foreground">Happy Birthday Srini!</div>
                        <p className="text-xs text-muted-foreground mt-1">Wishing you endless joy and love 💜</p>
                      </div>
                      <p className="text-sm text-foreground mt-2">Your wish is scheduled! 🎂✨</p>
                      <span className="text-xs text-muted-foreground">10:31 AM</span>
                    </div>
                  </motion.div>

                  {/* Typing indicator */}
                  <motion.div initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} transition={{
                    delay: 2.5
                  }} className="flex justify-start">
                    <div className="bg-card rounded-full px-4 py-2 shadow-sm flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{
                        animationDelay: "0ms"
                      }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{
                        animationDelay: "150ms"
                      }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{
                        animationDelay: "300ms"
                      }} />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div animate={{
              y: [-10, 10, -10],
              rotate: [-5, 5, -5]
            }} transition={{
              duration: 4,
              repeat: Infinity
            }} className="absolute -top-4 -left-8 w-16 h-16 bg-pink-soft rounded-2xl shadow-lg flex items-center justify-center">
              <Heart className="w-8 h-8 text-pink-vibrant fill-pink-vibrant" />
            </motion.div>

            <motion.div animate={{
              y: [10, -10, 10],
              rotate: [5, -5, 5]
            }} transition={{
              duration: 5,
              repeat: Infinity
            }} className="absolute -bottom-4 -right-8 w-14 h-14 bg-whatsapp-light rounded-2xl shadow-lg flex items-center justify-center">
              <Send className="w-7 h-7 text-whatsapp" />
            </motion.div>

            <motion.div animate={{
              y: [-5, 15, -5]
            }} transition={{
              duration: 6,
              repeat: Infinity
            }} className="absolute top-1/3 -right-12 w-12 h-12 bg-secondary rounded-full shadow-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </motion.div>

            {/* Sparkles */}
            <div className="sparkle top-10 right-0" style={{
              animationDelay: "0s"
            }} />
            <div className="sparkle bottom-20 left-0" style={{
              animationDelay: "0.5s"
            }} />
            <div className="sparkle top-1/2 -right-4" style={{
              animationDelay: "1s"
            }} />
          </div>
        </motion.div>
      </div>
    </div>
  </section>;
};
export default HeroSection;