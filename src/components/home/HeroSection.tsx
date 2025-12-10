import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, Users, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Ghanaian farmers harvesting crops"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm animate-fade-up">
            <Leaf className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground">
              Ghana's #1 Farm-to-Table Marketplace
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Fresh From <span className="text-gradient">Ghana's Farms</span> To Your Table
          </h1>

          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Connect directly with local farmers across all 16 regions of Ghana. 
            Get the freshest produce delivered to your doorstep while supporting 
            sustainable agriculture.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/marketplace">
              <Button variant="golden" size="xl">
                Shop Fresh Produce
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/farmers">
              <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Start Selling
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/20 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div>
              <div className="text-3xl font-display font-bold text-secondary">5,000+</div>
              <div className="text-sm text-primary-foreground/70">Active Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-secondary">50,000+</div>
              <div className="text-sm text-primary-foreground/70">Happy Buyers</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-secondary">16</div>
              <div className="text-sm text-primary-foreground/70">Regions Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-display font-semibold text-sm">Fast Delivery</div>
                <div className="text-xs text-muted-foreground">Nationwide shipping</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="font-display font-semibold text-sm">Secure Payments</div>
                <div className="text-xs text-muted-foreground">Mobile money & cards</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="font-display font-semibold text-sm">Verified Farmers</div>
                <div className="text-xs text-muted-foreground">Trusted suppliers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-display font-semibold text-sm">Fresh & Organic</div>
                <div className="text-xs text-muted-foreground">Farm to table</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
