import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardStats, mockFarmerOrders, mockEarnings } from "@/data/farmer-data";
import { Package, ShoppingCart, Wallet, Star, ArrowRight, Eye, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useFarmerVerification } from "@/store/farmer-verification";
import { useAuth } from "@/store/auth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statusColors: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary-foreground",
  confirmed: "bg-primary/20 text-primary",
  shipped: "bg-accent/20 text-accent",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const { getVerification } = useFarmerVerification();
  const verification = getVerification(user?.id || "");
  const isVerified = verification?.status === "approved";
  const verificationPending = verification?.status === "pending";

  const recentOrders = mockFarmerOrders.slice(0, 4);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back, Kofi! Here's what's happening with your farm."
    >
      {/* Verification Status Alert */}
      {!isVerified && (
        <Card variant="elevated" className={`mb-6 border-l-4 ${verificationPending ? "border-l-amber-500 bg-amber-50" : "border-l-orange-500 bg-orange-50"}`}>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-start">
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${verificationPending ? "text-amber-600" : "text-orange-600"}`} />
              <div className="flex-1">
                <h3 className={`font-medium ${verificationPending ? "text-amber-900" : "text-orange-900"}`}>
                  {verificationPending ? "Verification Under Review" : "Farm Verification Required"}
                </h3>
                <p className={`text-sm mt-1 ${verificationPending ? "text-amber-800" : "text-orange-800"}`}>
                  {verificationPending
                    ? "Your verification is being reviewed by our team. You'll be notified once approved."
                    : "Complete your farm verification to start listing products and receiving orders."}
                </p>
                {!verificationPending && (
                  <Link to="/farmer-verification" className="inline-block mt-3">
                    <Button size="sm" variant="default" className="gap-2">
                      Complete Verification
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Products"
          value={dashboardStats.activeProducts}
          icon={Package}
        />
        <StatCard
          title="Pending Orders"
          value={dashboardStats.pendingOrders}
          icon={ShoppingCart}
        />
        <StatCard
          title="This Month"
          value={`₵${dashboardStats.monthlyRevenue.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: dashboardStats.revenueGrowth, isPositive: true }}
        />
        <StatCard
          title="Avg. Rating"
          value={dashboardStats.averageRating}
          icon={Star}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Revenue Overview</CardTitle>
            <Link to="/dashboard/earnings">
              <Button variant="ghost" size="sm">
                View Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEarnings.monthlyData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145 45% 28%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145 45% 28%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₵${value}`, "Earnings"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(145 45% 28%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/dashboard/products/new" className="block">
              <Button variant="default" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link to="/dashboard/orders" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            </Link>
            <Link to="/dashboard/earnings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card variant="elevated" className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Recent Orders</CardTitle>
          <Link to="/dashboard/orders">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{order.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{order.buyerLocation}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">₵{order.total}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
