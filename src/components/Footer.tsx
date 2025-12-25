import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import wishbirdLogo from "@/assets/wishbird-logo.png";

const Footer = () => {
  const links = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "How It Works", href: "#how-it-works" },
    ],
    company: [
      { label: "About", href: "/about", isRoute: true },
      { label: "Contact", href: "/contact", isRoute: true },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy", isRoute: true },
      { label: "Terms of Service", href: "/terms-of-service", isRoute: true },
      { label: "Cookie Policy", href: "/cookie-policy", isRoute: true },
    ],
  };

  return (
    <footer className="bg-foreground/[0.02] border-t border-border/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={wishbirdLogo} alt="WishBird" className="w-10 h-10 object-contain" />
              <span className="font-bold text-xl text-foreground">WishBird</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-xs">
              Making moments magical with AI-powered WhatsApp greetings. Never miss wishing someone again. ✨
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              A product by <a href="https://16xstudios.space" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">16xstudios</a>
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-pink-vibrant fill-pink-vibrant" /> in Hosur, India
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="py-6 border-t border-b border-border/50 mb-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="mailto:support@16xstudios.space" className="hover:text-primary transition-colors">
              📧 support@16xstudios.space
            </a>
            <a href="tel:+917871282354" className="hover:text-primary transition-colors">
              📞 +91 7871282354
            </a>
            <span>📍 Hosur - 635126, Tamilnadu, India</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WishBird by 16xstudios. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              Instagram
            </a>
            <a href="https://16xstudios.space" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              16xstudios
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
