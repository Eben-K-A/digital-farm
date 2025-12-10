import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  Truck,
  BarChart3,
  Users,
  Shield,
  Phone,
  CheckCircle2,
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Reach Thousands of Buyers",
    description: "Access a network of buyers across all 16 regions of Ghana looking for fresh produce.",
  },
  {
    icon: Wallet,
    title: "Better Prices, More Profit",
    description: "Sell directly to consumers and businesses without middlemen taking your profits.",
  },
  {
    icon: Truck,
    title: "We Handle Logistics",
    description: "Our delivery network picks up from your farm and delivers to buyers nationwide.",
  },
  {
    icon: BarChart3,
    title: "Smart Business Tools",
    description: "Track sales, manage inventory, and get insights to grow your farm business.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid directly to your Mobile Money or bank account. Fast and secure.",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join a community of farmers. Get tips, training, and support when you need it.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register Your Farm",
    description: "Sign up for free and tell us about your farm and what you grow.",
  },
  {
    number: "02",
    title: "List Your Products",
    description: "Add your produce with photos, prices, and available quantities.",
  },
  {
    number: "03",
    title: "Receive Orders",
    description: "Get notified when buyers order your products. Accept and prepare for pickup.",
  },
  {
    number: "04",
    title: "Get Paid",
    description: "Receive payment directly to your Mobile Money once delivery is confirmed.",
  },
];

const testimonials = [
  {
    name: "Ama Darko",
    location: "Eastern Region",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    quote: "Since joining FarmConnect, my income has doubled. I can now sell directly to buyers in Accra without traveling.",
    increase: "+120%",
  },
  {
    name: "Kofi Mensah",
    location: "Ashanti Region",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    quote: "The delivery support is amazing. I focus on farming while they handle getting my tomatoes to customers.",
    increase: "+85%",
  },
];

const Farmers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-20 lg:py-28">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                Join 5,000+ Farmers
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                Turn Your Farm Into A <span className="text-gradient">Thriving Business</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join Ghana's largest agricultural marketplace. Sell directly to thousands
                of buyers, get fair prices, and grow your income.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth?signup=true">
                  <Button variant="golden" size="xl">
                    Start Selling Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Us: +233 20 123 4567
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Why Join Us
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                Everything You Need To Succeed
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} variant="elevated" className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                How It Works
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                Start Selling In 4 Easy Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-display font-bold text-primary/10 mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-primary/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Success Stories
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                Farmers Like You Are Thriving
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} variant="elevated" className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      <Badge variant="success" className="mt-2">
                        {testimonial.increase} income increase
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-hero">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Ready to Grow Your Farm Business?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join thousands of Ghanaian farmers already selling on FarmConnect.
                Registration is free and takes less than 5 minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link to="/auth?signup=true">
                  <Button variant="golden" size="xl">
                    Create Free Account
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  Free to join
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  No hidden fees
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  24/7 support
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Farmers;
