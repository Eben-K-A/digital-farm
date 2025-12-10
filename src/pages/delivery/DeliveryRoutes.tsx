import { DeliveryLayout } from "@/components/delivery/DeliveryLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Package, Clock, ArrowRight } from "lucide-react";
import { deliveryAssignments } from "@/data/delivery-data";

export default function DeliveryRoutes() {
  const activeDeliveries = deliveryAssignments.filter(d => d.status !== "delivered");

  const statusColors: Record<string, string> = {
    pending_pickup: "bg-yellow-500",
    in_transit: "bg-blue-500",
  };

  return (
    <DeliveryLayout 
      title="Route Optimization" 
      description="View and optimize your delivery routes"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeDeliveries.length > 0 ? (
                activeDeliveries.map((delivery, index) => (
                  <div key={delivery.id} className="relative">
                    {index < activeDeliveries.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${statusColors[delivery.status]}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{delivery.orderId}</h4>
                          <Badge variant="outline" className="text-xs">
                            {delivery.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {delivery.customerName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{delivery.distance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active deliveries</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full gap-2">
            <Navigation className="h-4 w-4" />
            Start Navigation
          </Button>
        </div>

        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-muted/50 rounded-lg flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Route Map
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Interactive map showing optimized delivery routes. Connect to a maps API to enable full functionality.
                </p>

                {/* Route Summary */}
                {activeDeliveries.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-2xl font-bold text-primary">{activeDeliveries.length}</p>
                      <p className="text-xs text-muted-foreground">Stops</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-2xl font-bold text-primary">
                        {activeDeliveries.reduce((sum, d) => sum + parseFloat(d.distance), 0).toFixed(1)} km
                      </p>
                      <p className="text-xs text-muted-foreground">Total Distance</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-2xl font-bold text-primary">
                        ~{Math.ceil(activeDeliveries.length * 30)} min
                      </p>
                      <p className="text-xs text-muted-foreground">Est. Time</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DeliveryLayout>
  );
}
