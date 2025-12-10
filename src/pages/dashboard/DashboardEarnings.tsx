import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEarnings } from "@/data/farmer-data";
import { Wallet, TrendingUp, Clock, ArrowDownToLine, Download } from "lucide-react";
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
} from "recharts";
import { toast } from "sonner";

const payoutHistory = [
  { id: "PAY-001", amount: 2500, date: "2024-03-01", status: "completed", method: "MTN Mobile Money" },
  { id: "PAY-002", amount: 3200, date: "2024-02-15", status: "completed", method: "Bank Transfer" },
  { id: "PAY-003", amount: 1800, date: "2024-02-01", status: "completed", method: "MTN Mobile Money" },
  { id: "PAY-004", amount: 2100, date: "2024-01-15", status: "completed", method: "MTN Mobile Money" },
];

export default function DashboardEarnings() {
  const growthPercentage = ((mockEarnings.thisMonth - mockEarnings.lastMonth) / mockEarnings.lastMonth * 100).toFixed(1);

  const handleRequestPayout = () => {
    toast.success("Payout request submitted!", {
      description: "You'll receive your funds within 24 hours.",
    });
  };

  return (
    <DashboardLayout
      title="Earnings"
      description="Track your revenue and manage payouts"
      actions={
        <Button variant="hero" onClick={handleRequestPayout}>
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          Request Payout
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value={`₵${mockEarnings.totalEarnings.toLocaleString()}`}
          icon={Wallet}
        />
        <StatCard
          title="This Month"
          value={`₵${mockEarnings.thisMonth.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: parseFloat(growthPercentage), isPositive: parseFloat(growthPercentage) > 0 }}
        />
        <StatCard
          title="Pending Payout"
          value={`₵${mockEarnings.pendingPayouts.toLocaleString()}`}
          icon={Clock}
        />
        <StatCard
          title="Last Month"
          value={`₵${mockEarnings.lastMonth.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Earnings Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="font-display">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEarnings.monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [`₵${value}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(145 45% 28%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="font-display">Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEarnings.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Orders"]}
                  />
                  <Bar
                    dataKey="orders"
                    fill="hsl(42 85% 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Payout History</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payout ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((payout) => (
                  <tr key={payout.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{payout.id}</td>
                    <td className="py-3 px-4 font-semibold text-primary">₵{payout.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground">{payout.date}</td>
                    <td className="py-3 px-4">{payout.method}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </Badge>
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
