import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-accent text-accent-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Partner With Us */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-6">Partner With Us</h3>
            <p className="text-accent-foreground/80 leading-relaxed mb-4">
              Interested in wholesale orders or collaboration? We'd love to hear from you!
            </p>
            <a
              href="mailto:muindidamian@gmail.com"
              className="text-accent-foreground hover:text-primary transition-colors font-medium"
            >
              muindidamian@gmail.com
            </a>
          </div>

          {/* Contact */}
          <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone size={20} className="mt-1 flex-shrink-0" />
                <span className="text-accent-foreground/80">+254728922703</span>
              </div>
              <div className="flex items-start space-x-3">
                <Mail size={20} className="mt-1 flex-shrink-0" />
                <span className="text-accent-foreground/80">muindidamian@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span className="text-accent-foreground/80">
                  160 Mwihoko Road, Nairobi, Kenya
                </span>
              </div>
            </div>
          </div>

          {/* Help & Social */}
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="text-2xl font-bold mb-6">Help</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link
                  to="/faq"
                  className="text-accent-foreground/80 hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
            <div className="flex space-x-4">
              <a
                href="https:
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https:
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-foreground hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={24} />
              </a>
            </div>
          </div>
        </div>

          <div className="border-t border-accent-foreground/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-accent-foreground/60 text-sm">
                © 2025 Sweet Tooth. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link
                  to="/privacy"
                  className="text-accent-foreground/60 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-accent-foreground/60 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
