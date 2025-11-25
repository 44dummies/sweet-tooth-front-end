import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6">
          {}
          <div>
            <h3 className="text-lg font-bold mb-3 text-white">Partner With Us</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              Interested in wholesale orders or collaboration?
            </p>
            <a
              href="mailto:muindidamian@gmail.com"
              className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
            >
              muindidamian@gmail.com
            </a>
          </div>

          {}
          <div>
            <h3 className="text-lg font-bold mb-3 text-white">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone size={16} className="flex-shrink-0 text-pink-400" />
                <span className="text-gray-400">+254795436192</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="flex-shrink-0 text-pink-400" />
                <span className="text-gray-400">muindidamian@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="flex-shrink-0 text-pink-400 mt-0.5" />
                <span className="text-gray-400">Mwihoko Road, Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {}
          <div>
            <h3 className="text-lg font-bold mb-3 text-white">Connect</h3>
            <ul className="space-y-1 mb-4">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/sweettooth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <a
                href="https://wa.me/254795436192"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-500 text-xs">
              © 2025 Sweet Tooth. All rights reserved.
            </p>
            <div className="flex space-x-4 text-xs">
              <Link
                to="/privacy"
                className="text-gray-500 hover:text-pink-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-gray-500 hover:text-pink-400 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
