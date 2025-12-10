import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Package,
  Truck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  platformStats,
  pendingProducts,
  auditLogs,
  revenueData,
} from "@/data/admin-data";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminOverview = () => {
  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Platform overview and management"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={platformStats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: platformStats.monthlyGrowth, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={platformStats.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Platform Revenue"
          value={`₵${(platformStats.totalRevenue / 1000).toFixed(0)}k`}
          icon={TrendingUp}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          title="Pending Approvals"
          value={platformStats.pendingApprovals.toString()}
          icon={Package}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Platform Revenue</CardTitle>
            <Badge variant="success">+15.3%</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145, 45%, 28%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145, 45%, 28%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(45, 20%, 85%)" />
                  <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(25, 15%, 45%)" fontSize={12} tickFormatter={(v) => `₵${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(45, 30%, 97%)",
                      border: "1px solid hsl(45, 20%, 85%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₵${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(145, 45%, 28%)"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Farmers</p>
                  <p className="text-xs text-muted-foreground">Verified sellers</p>
                </div>
              </div>
              <span className="font-display font-bold text-primary">
                {platformStats.totalFarmers.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Buyers</p>
                  <p className="text-xs text-muted-foreground">Active customers</p>
                </div>
              </div>
              <span className="font-display font-bold text-secondary">
                {platformStats.totalBuyers.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Active Deliveries</p>
                  <p className="text-xs text-muted-foreground">In transit</p>
                </div>
              </div>
              <span className="font-display font-bold text-accent">
                {platformStats.activeDeliveries}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Product Approvals</CardTitle>
            <Link to="/admin/approvals">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    by {product.farmer} • ₵{product.price}/{product.unit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Link to="/admin/audit-logs">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.severity === "error"
                      ? "bg-destructive/10"
                      : log.severity === "warning"
                      ? "bg-secondary/20"
                      : "bg-primary/10"
                  }`}
                >
                  <AlertCircle
                    className={`h-4 w-4 ${
                      log.severity === "error"
                        ? "text-destructive"
                        : log.severity === "warning"
                        ? "text-secondary"
                        : "text-primary"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.details}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
