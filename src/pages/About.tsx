import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Leaf,
  Users,
  Target,
  Heart,
  TrendingUp,
  Shield,
  Truck,
  Globe,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Farmer First",
    description: "We prioritize the well-being and success of our farming community above all else.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "Every transaction is secure, every product verified, and every farmer accountable.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We promote sustainable farming practices that protect our land for future generations.",
  },
  {
    icon: Globe,
    title: "Community Impact",
    description: "We're committed to strengthening local economies and food security across Ghana.",
  },
];

const stats = [
  { value: "5,000+", label: "Active Farmers" },
  { value: "50,000+", label: "Happy Buyers" },
  { value: "16", label: "Regions Covered" },
  { value: "₵2.8M+", label: "Farmer Earnings" },
];

const team = [
  {
    name: "Clement Kojo Prempeh",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "Former agricultural economist with 15 years of experience in Ghana's farming sector.",
  },
  {
    name: "NEZER",
    role: "Chief Operations Officer",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop",
    bio: "Supply chain expert who has built logistics networks across West Africa.",
  },
  {
    name: "Kofi Mensah",
    role: "Head of Farmer Relations",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    bio: "Third-generation farmer passionate about bridging the gap between farms and markets.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-20 lg:py-28">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                Our Story
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                Connecting Ghana's <span className="text-gradient">Farmers</span> to the World
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                FarmConnect was born from a simple belief: Ghana's farmers deserve 
                fair prices, and Ghanaians deserve fresh, quality produce. We're 
                building the bridge that connects them.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-background border-b border-border">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  Our Mission
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                  Empowering Farmers, Nourishing Ghana
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  For too long, Ghanaian farmers have struggled with unfair prices, 
                  limited market access, and unreliable middlemen. Meanwhile, buyers 
                  in cities pay high prices for produce of questionable freshness.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  FarmConnect changes this equation. We connect farmers directly to 
                  buyers, ensuring fair prices for farmers and fresh produce for 
                  consumers. Our platform handles logistics, payments, and quality 
                  assurance—so everyone wins.
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Our Goal</p>
                    <p className="text-sm text-muted-foreground">
                      10,000 farmers empowered by 2025
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=600&h=500&fit=crop"
                  alt="Ghanaian farmer in field"
                  className="rounded-2xl shadow-elevated w-full"
                />
                <Card className="absolute -bottom-6 -left-6 p-4 shadow-elevated max-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">+120%</p>
                      <p className="text-xs text-muted-foreground">Avg. farmer income increase</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Our Values
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                What We Stand For
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} variant="elevated" className="p-6 text-center">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Our Team
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                Meet the People Behind FarmConnect
              </h2>
              <p className="text-muted-foreground mt-4">
                A passionate team dedicated to transforming agriculture in Ghana.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} variant="elevated" className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-primary/20"
                  />
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.bio}
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
                Simple, Transparent, Effective
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">1. Farmers List</h3>
                <p className="text-muted-foreground">
                  Verified farmers list their fresh produce with photos, prices, and quantities.
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full gradient-golden flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">2. Buyers Order</h3>
                <p className="text-muted-foreground">
                  Buyers browse, select products, and pay securely via Mobile Money.
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">3. We Deliver</h3>
                <p className="text-muted-foreground">
                  Our logistics network delivers fresh produce to buyers across Ghana.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 gradient-hero">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Join the FarmConnect Community
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Whether you're a farmer looking to grow your business or a buyer 
                seeking the freshest produce, we're here for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/farmers">
                  <Button variant="golden" size="xl">
                    Start Selling
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
