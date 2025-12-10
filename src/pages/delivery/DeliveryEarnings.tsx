import { DeliveryLayout } from "@/components/delivery/DeliveryLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Calendar, CreditCard, ArrowUpRight } from "lucide-react";
import { deliveryStats, deliveryHistory } from "@/data/delivery-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DeliveryEarnings() {
  const totalWeekEarnings = deliveryHistory.reduce((sum, day) => sum + day.earnings, 0);

  return (
    <DeliveryLayout 
      title="Earnings" 
      description="Track your delivery earnings"
      actions={
        <Button className="gap-2">
          <CreditCard className="h-4 w-4" />
          Withdraw
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value={`GH₵ ${deliveryStats.totalEarnings.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="This Week"
          value={`GH₵ ${deliveryStats.thisWeekEarnings.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Avg per Delivery"
          value={`GH₵ ${(deliveryStats.totalEarnings / deliveryStats.totalDeliveries).toFixed(2)}`}
          icon={Calendar}
        />
        <StatCard
          title="Pending Payout"
          value={`GH₵ ${deliveryStats.thisWeekEarnings.toLocaleString()}`}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deliveryHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`GH₵ ${value}`, 'Earnings']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats & Payout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryHistory.slice(0, 5).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <p className="text-sm text-muted-foreground">{day.deliveries} deliveries</p>
                  </div>
                  <p className="font-semibold text-primary">GH₵ {day.earnings.toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payout Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-border bg-muted/50 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-yellow-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-600">MTN</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">MTN Mobile Money</p>
                      <p className="text-sm text-muted-foreground">024 *** *567</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">Change Payout Method</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DeliveryLayout>
  );
}
