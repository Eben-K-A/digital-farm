import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Wallet, Truck, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: TrendingUp,
    title: "Reach More Buyers",
    description: "Access thousands of buyers across all 16 regions of Ghana.",
  },
  {
    icon: Wallet,
    title: "Fair Prices",
    description: "Get better prices by selling directly to consumers without middlemen.",
  },
  {
    icon: Truck,
    title: "Delivery Support",
    description: "We handle logistics so you can focus on what you do best - farming.",
  },
  {
    icon: BarChart3,
    title: "Business Insights",
    description: "Track your sales, understand demand, and grow your farm business.",
  },
];

export function FarmerCTA() {
  return (
    <section className="py-20 gradient-hero">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block text-sm font-medium text-secondary uppercase tracking-wider">
              For Farmers
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              Grow Your Farm Business With Us
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Join thousands of Ghanaian farmers who are earning more by selling
              directly to buyers. No middlemen, fair prices, and support every
              step of the way.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/farmers">
                <Button variant="golden" size="lg">
                  Start Selling Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/success-stories">
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  Success Stories
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="p-6 bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-primary-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
