import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revenueData, regionDistribution, platformStats } from "@/data/admin-data";
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(145, 45%, 28%)",
  "hsl(42, 85%, 55%)",
  "hsl(18, 75%, 55%)",
  "hsl(145, 40%, 45%)",
  "hsl(42, 70%, 45%)",
  "hsl(18, 60%, 45%)",
  "hsl(25, 35%, 35%)",
  "hsl(45, 15%, 55%)",
];

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("6months");

  return (
    <AdminLayout
      title="Platform Analytics"
      description="Insights and performance metrics"
    >
      {/* Time Range Filter */}
      <div className="flex justify-end mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-display font-bold text-foreground">
              ₵{(platformStats.totalRevenue / 1000000).toFixed(2)}M
            </p>
            <Badge variant="success" className="mt-2">+15.3%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {platformStats.totalOrders.toLocaleString()}
            </p>
            <Badge variant="success" className="mt-2">+8.2%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
            <p className="text-2xl font-display font-bold text-foreground">
              ₵{(platformStats.totalRevenue / platformStats.totalOrders).toFixed(0)}
            </p>
            <Badge variant="success" className="mt-2">+5.1%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Platform Fee</p>
            <p className="text-2xl font-display font-bold text-foreground">
              ₵{((platformStats.totalRevenue * 0.05) / 1000).toFixed(0)}k
            </p>
            <Badge variant="success" className="mt-2">5%</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorRevenue2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(45, 20%, 85%)" />
                  <XAxis dataKey="month" stroke="hsl(25, 15%, 45%)" fontSize={12} />
                  <YAxis stroke="hsl(25, 15%, 45%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(45, 30%, 97%)",
                      border: "1px solid hsl(45, 20%, 85%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Orders"]}
                  />
                  <Bar
                    dataKey="orders"
                    fill="hsl(42, 85%, 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="revenue"
                    nameKey="region"
                    label={({ region, percent }) =>
                      `${region} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {regionDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(45, 30%, 97%)",
                      border: "1px solid hsl(45, 20%, 85%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₵${value.toLocaleString()}`, "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionDistribution.map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {region.users.toLocaleString()} users
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₵{(region.revenue / 1000).toFixed(0)}k revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
