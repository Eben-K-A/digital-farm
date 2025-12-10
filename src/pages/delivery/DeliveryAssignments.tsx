import { useState } from "react";
import { DeliveryLayout } from "@/components/delivery/DeliveryLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, MapPin, Phone, Navigation, Clock, Camera } from "lucide-react";
import { deliveryAssignments } from "@/data/delivery-data";

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  pending_pickup: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

export default function DeliveryAssignments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAssignments = deliveryAssignments.filter((assignment) => {
    const matchesSearch = 
      assignment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DeliveryLayout 
      title="Delivery Assignments" 
      description="Manage your delivery tasks"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="pending_pickup">Pending Pickup</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{assignment.orderId}</h3>
                      <Badge variant="outline" className={statusColors[assignment.status]}>
                        {assignment.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {assignment.customerName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{assignment.customerPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">GH₵ {assignment.earnings.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{assignment.distance}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">PICKUP</p>
                  <p className="text-sm font-medium text-foreground">{assignment.pickupLocation}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{assignment.pickupTime}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">DELIVERY</p>
                  <p className="text-sm font-medium text-foreground">{assignment.deliveryAddress}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Est: {assignment.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                <div className="flex flex-wrap gap-2">
                  {assignment.items.map((item, idx) => (
                    <Badge key={idx} variant="secondary">
                      {item.name} ({item.quantity} {item.unit})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2">
                  <Navigation className="h-4 w-4" />
                  Navigate
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Customer
                </Button>
                {assignment.status === "pending_pickup" && (
                  <Button size="sm">Start Pickup</Button>
                )}
                {assignment.status === "in_transit" && (
                  <Button size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Complete Delivery
                  </Button>
                )}
                {assignment.status === "delivered" && assignment.proofOfDelivery && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    Proof Uploaded
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No assignments found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
}
