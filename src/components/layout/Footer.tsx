import { Link } from "react-router-dom";
import { Leaf, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="gradient-earth text-primary-foreground">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Farm<span className="text-secondary">Connect</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Connecting Ghanaian farmers directly to buyers. Fresh produce from farm to table, supporting local agriculture.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link to="/marketplace" className="hover:text-secondary transition-colors">Browse Products</Link></li>
              <li><Link to="/farmers" className="hover:text-secondary transition-colors">Become a Seller</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/help" className="hover:text-secondary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">For Farmers</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link to="/farmers" className="hover:text-secondary transition-colors">Farmer Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-secondary transition-colors">Pricing & Fees</Link></li>
              <li><Link to="/resources" className="hover:text-secondary transition-colors">Resources</Link></li>
              <li><Link to="/success-stories" className="hover:text-secondary transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+233 201629359</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary" />
                <span>hello@farmconnect.gh</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                <span>123 Agriculture Road,<br />Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>© 2025 FarmConnect Ghana. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
