import { DeliveryLayout } from "@/components/delivery/DeliveryLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Wallet, Clock, Star, ChevronRight, MapPin, Navigation } from "lucide-react";
import { deliveryStats, deliveryAssignments } from "@/data/delivery-data";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  pending_pickup: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

export default function DeliveryOverview() {
  const activeDeliveries = deliveryAssignments.filter(d => d.status !== "delivered").slice(0, 3);

  return (
    <DeliveryLayout 
      title="Dashboard" 
      description="Your delivery overview for today"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Deliveries"
          value={deliveryStats.totalDeliveries}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="This Week Earnings"
          value={`GH₵ ${deliveryStats.thisWeekEarnings.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="On-Time Rate"
          value={`${deliveryStats.onTimeRate}%`}
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Rating"
          value={deliveryStats.rating.toFixed(1)}
          icon={Star}
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{deliveryStats.completedToday}</p>
            <p className="text-sm text-muted-foreground">Completed Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{deliveryStats.pendingPickups}</p>
            <p className="text-sm text-muted-foreground">Pending Pickups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{deliveryStats.inTransit}</p>
            <p className="text-sm text-muted-foreground">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">GH₵ {deliveryStats.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Active Deliveries</CardTitle>
          <Link to="/delivery/assignments">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-4 rounded-lg bg-muted/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{delivery.orderId}</h3>
                      <Badge variant="outline" className={statusColors[delivery.status]}>
                        {delivery.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {delivery.customerName} • {delivery.items.length} item(s)
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {delivery.distance}
                      </span>
                      <span>GH₵ {delivery.earnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </Button>
                  <Button size="sm">
                    {delivery.status === "pending_pickup" ? "Start Pickup" : "Mark Delivered"}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {activeDeliveries.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground">No active deliveries</h3>
              <p className="text-muted-foreground">New assignments will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DeliveryLayout>
  );
}
