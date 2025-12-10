import { BuyerLayout } from "@/components/buyer/BuyerLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Wallet, Clock, Heart, ChevronRight, Package } from "lucide-react";
import { buyerStats, buyerOrders } from "@/data/buyer-data";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function BuyerOverview() {
  const recentOrders = buyerOrders.slice(0, 3);

  return (
    <BuyerLayout 
      title="My Dashboard" 
      description="Welcome back! Here's your shopping overview."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={buyerStats.totalOrders}
          icon={ShoppingBag}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Spent"
          value={`GH₵ ${buyerStats.totalSpent.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Orders"
          value={buyerStats.pendingOrders}
          icon={Clock}
        />
        <StatCard
          title="Favorites"
          value={buyerStats.favoriteProducts}
          icon={Heart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Link to="/buyer/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item(s) • {order.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {order.status.replace("_", " ")}
                  </Badge>
                  <p className="text-sm font-medium mt-1">GH₵ {order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link to="/marketplace">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <ShoppingBag className="h-6 w-6" />
                <span>Browse Products</span>
              </Button>
            </Link>
            <Link to="/buyer/orders">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>Track Orders</span>
              </Button>
            </Link>
            <Link to="/buyer/favorites">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Heart className="h-6 w-6" />
                <span>My Favorites</span>
              </Button>
            </Link>
            <Link to="/buyer/addresses">
              <Button variant="outline" className="w-full h-24 flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>Manage Addresses</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </BuyerLayout>
  );
}
