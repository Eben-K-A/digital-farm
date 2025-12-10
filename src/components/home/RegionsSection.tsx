import { Card } from "@/components/ui/card";
import { regions } from "@/data/products";
import { MapPin } from "lucide-react";

const regionData = [
  { name: "Greater Accra", farmers: 850, color: "bg-primary" },
  { name: "Ashanti", farmers: 1200, color: "bg-secondary" },
  { name: "Eastern", farmers: 680, color: "bg-accent" },
  { name: "Western", farmers: 450, color: "bg-primary" },
  { name: "Central", farmers: 320, color: "bg-secondary" },
  { name: "Volta", farmers: 520, color: "bg-accent" },
  { name: "Northern", farmers: 780, color: "bg-primary" },
  { name: "Brong Ahafo", farmers: 420, color: "bg-secondary" },
];

export function RegionsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Nationwide Coverage
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            Fresh Produce From All Regions
          </h2>
          <p className="text-muted-foreground mt-4">
            We connect you with farmers across Ghana. Find local produce from your
            region or discover specialties from across the country.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {regionData.map((region, index) => (
            <Card
              key={index}
              variant="elevated"
              className="p-6 text-center group cursor-pointer"
            >
              <div className={`h-12 w-12 rounded-full ${region.color}/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <MapPin className={`h-6 w-6 ${region.color === "bg-primary" ? "text-primary" : region.color === "bg-secondary" ? "text-secondary" : "text-accent"}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">
                {region.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {region.farmers.toLocaleString()} farmers
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
