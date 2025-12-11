import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancial } from "@/store/financial";
import { DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle, Eye, Download, Search } from "lucide-react";
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

const REVENUE_DATA = [
  { month: "Jan", revenue: 45000, commissions: 2250 },
  { month: "Feb", revenue: 52000, commissions: 2600 },
  { month: "Mar", revenue: 48000, commissions: 2400 },
  { month: "Apr", revenue: 61000, commissions: 3050 },
  { month: "May", revenue: 55000, commissions: 2750 },
  { month: "Jun", revenue: 67000, commissions: 3350 },
];

const PAYOUT_STATUS_DATA = [
  { name: "Pending", value: 45, color: "#f59e0b" },
  { name: "Approved", value: 28, color: "#3b82f6" },
  { name: "Completed", value: 156, color: "#10b981" },
  { name: "Failed", value: 5, color: "#ef4444" },
];

export default function AdminFinancial() {
  const { transactions, payouts, disputes, platformCommissionRate, approvePayout, processPayout, completePayout, getTotalRevenue, getTotalCommissions, getPendingPayouts, getCompletedPayouts } = useFinancial();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);

  const totalRevenue = getTotalRevenue();
  const totalCommissions = getTotalCommissions();
  const pendingPayouts = getPendingPayouts();
  const completedPayouts = getCompletedPayouts();
  const openDisputes = disputes.filter((d) => d.status === "open").length;

  const statusColors: Record<string, string> = {
    pending_approval: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <AdminLayout
      title="Financial Management"
      description="Manage transactions, payouts, commissions, and disputes"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">₵{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Commissions</p>
                    <p className="text-3xl font-bold text-foreground">₵{totalCommissions.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">{platformCommissionRate}% of transactions</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Payouts</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingPayouts.length}</p>
                    <p className="text-xs text-amber-600 mt-1">Awaiting approval/processing</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Open Disputes</p>
                    <p className="text-3xl font-bold text-red-600">{openDisputes}</p>
                    <p className="text-xs text-red-600 mt-1">Requiring resolution</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA}>
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
                        formatter={(value: number) => `₵${value}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
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

            {/* Commission vs Payout */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Commission vs Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => `₵${value}`}
                      />
                      <Bar dataKey="commissions" fill="hsl(240 100% 50%)" name="Commissions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payout Status Pie Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Payout Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PAYOUT_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {PAYOUT_STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Farmer Payouts</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search payouts..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{payout.farmerName}</h4>
                        <p className="text-sm text-muted-foreground">{payout.email}</p>
                      </div>
                      <Badge className={statusColors[payout.status]}>
                        {payout.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">₵{payout.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Commission (5%)</p>
                        <p className="font-semibold text-red-600">-₵{payout.commission.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Amount</p>
                        <p className="font-semibold text-green-600">₵{payout.netAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Holding Period</p>
                        <p className="font-semibold">{payout.holdingPeriod} days</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {payout.status === "pending_approval" && (
                        <>
                          <Button
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => approvePayout(payout.id, "admin@farmconnect.com")}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {payout.status === "approved" && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => processPayout(payout.id)}
                        >
                          <Clock className="h-4 w-4" />
                          Process Payment
                        </Button>
                      )}
                      {payout.status === "processing" && (
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => completePayout(payout.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Transaction History</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search transactions..." className="pl-10" />
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-mono text-sm">{txn.id}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{txn.type}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{txn.description}</td>
                        <td className="py-3 px-4 font-semibold">₵{txn.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              txn.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : txn.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {txn.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-6">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Disputes & Refunds</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search disputes..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">Order {dispute.orderId}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dispute.buyerName} vs {dispute.farmerName}
                        </p>
                      </div>
                      <Badge
                        className={
                          dispute.status === "open"
                            ? "bg-red-100 text-red-800"
                            : dispute.status === "investigating"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {dispute.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold">₵{dispute.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reason</p>
                        <p className="font-semibold text-sm">{dispute.reason}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-semibold text-sm">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {dispute.status === "open" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Review Details
                        </Button>
                        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Issue Refund
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {disputes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No disputes found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
