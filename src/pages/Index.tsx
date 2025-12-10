import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FarmerCTA } from "@/components/home/FarmerCTA";
import { RegionsSection } from "@/components/home/RegionsSection";
import { Testimonials } from "@/components/home/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <RegionsSection />
        <FarmerCTA />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
