import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bird, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const PageLayout = ({ children, title, subtitle }: PageLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-cta flex items-center justify-center shadow-button group-hover:shadow-glow transition-shadow">
                <Bird className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">WishBird</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Contact
              </Link>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Privacy
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              {user ? (
                <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              ) : (
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <motion.main 
        className="flex-1 container mx-auto px-4 py-24 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Page Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  );
};

export default PageLayout;
