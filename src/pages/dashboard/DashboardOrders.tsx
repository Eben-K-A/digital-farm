import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockFarmerOrders, FarmerOrder } from "@/data/farmer-data";
import { Search, Eye, Package, MapPin, Calendar, CreditCard, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary-foreground",
  confirmed: "bg-primary/20 text-primary",
  shipped: "bg-accent/20 text-accent",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusOptions = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function DashboardOrders() {
  const [orders, setOrders] = useState<FarmerOrder[]>(mockFarmerOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<FarmerOrder | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus as FarmerOrder["status"] } : order
    ));
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
    setSelectedOrder(null);
  };

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <DashboardLayout
      title="Orders"
      description="Manage and track your customer orders"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([status, count]) => (
          <Card
            key={status}
            className="p-4 cursor-pointer hover:shadow-elevated transition-shadow"
            onClick={() => setStatusFilter(status)}
          >
            <p className="text-sm text-muted-foreground capitalize">{status}</p>
            <p className="text-2xl font-display font-bold">{count}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders List */}
      <Card variant="elevated">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Order</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Products</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-4 px-4 font-medium">{order.id}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">{order.buyerLocation}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {order.products.map((p, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {p.name} x{p.quantity}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-primary">₵{order.total}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{order.date}</td>
                  <td className="py-4 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className={statusColors[selectedOrder.status]} >
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedOrder.buyerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.buyerLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{selectedOrder.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-3">Products</h4>
                <div className="space-y-2">
                  {selectedOrder.products.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{product.name} x{product.quantity}</span>
                      <span className="font-medium">₵{product.price * product.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₵{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-3">Update Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.status === "pending" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, "confirmed")}>
                        Confirm Order
                      </Button>
                    )}
                    {selectedOrder.status === "confirmed" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}>
                        Mark as Shipped
                      </Button>
                    )}
                    {selectedOrder.status === "shipped" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}>
                        Mark as Delivered
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
