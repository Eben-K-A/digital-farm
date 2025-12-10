import { DeliveryLayout } from "@/components/delivery/DeliveryLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, MapPin, Clock, CheckCircle, Star } from "lucide-react";
import { deliveryAssignments, deliveryHistory } from "@/data/delivery-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function DeliveryHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const completedDeliveries = deliveryAssignments.filter(d => d.status === "delivered");

  return (
    <DeliveryLayout 
      title="Delivery History" 
      description="View your past deliveries and performance"
    >
      {/* Performance Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryHistory}>
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
                  formatter={(value: number, name: string) => [
                    name === 'deliveries' ? value : `GH₵ ${value}`,
                    name === 'deliveries' ? 'Deliveries' : 'Earnings'
                  ]}
                />
                <Bar dataKey="deliveries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search past deliveries..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="week">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Completed Deliveries List */}
      <div className="space-y-4">
        {completedDeliveries.map((delivery) => (
          <Card key={delivery.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{delivery.orderId}</h3>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Delivered
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {delivery.customerName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {delivery.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {delivery.actualDelivery}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">GH₵ {delivery.earnings.toFixed(2)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">5.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {completedDeliveries.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No completed deliveries</h3>
            <p className="text-muted-foreground">Your completed deliveries will appear here</p>
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
}
