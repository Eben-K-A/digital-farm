import { useState } from "react";
import { WarehouseLayout } from "@/components/warehouse/WarehouseLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Search, Phone, Clock, CheckCircle, Package, Calendar } from "lucide-react";
import { farmerDropoffs } from "@/data/warehouse-data";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function WarehouseDropoffs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDropoffs = farmerDropoffs.filter((dropoff) => {
    const matchesSearch = dropoff.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dropoff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const scheduledCount = farmerDropoffs.filter(d => d.status === "scheduled").length;
  const completedCount = farmerDropoffs.filter(d => d.status === "completed").length;

  return (
    <WarehouseLayout 
      title="Farmer Drop-offs" 
      description="Manage scheduled farmer deliveries"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
              <p className="text-sm text-muted-foreground">Scheduled Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{farmerDropoffs.length}</p>
              <p className="text-sm text-muted-foreground">Total Drop-offs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by farmer name..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drop-offs List */}
      <div className="space-y-4">
        {filteredDropoffs.map((dropoff) => (
          <Card key={dropoff.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{dropoff.farmerName}</h3>
                      <Badge variant="outline" className={statusColors[dropoff.status]}>
                        {dropoff.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {dropoff.scheduledDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {dropoff.phone}
                      </span>
                    </div>
                  </div>
                </div>
                {dropoff.status === "scheduled" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button size="sm">
                      Start Receiving
                    </Button>
                  </div>
                )}
              </div>

              {/* Expected Products */}
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Expected Products:</p>
                <div className="flex flex-wrap gap-2">
                  {dropoff.products.map((product, idx) => (
                    <Badge key={idx} variant="secondary">
                      <Package className="h-3 w-3 mr-1" />
                      {product.name} ({product.expectedQty} {product.unit})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Completed Info */}
              {dropoff.status === "completed" && dropoff.actualProducts && (
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-sm font-medium text-green-600 mb-2">Received Products:</p>
                  <div className="flex flex-wrap gap-2">
                    {dropoff.actualProducts.map((product, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {product.name} - {product.receivedQty} {product.unit} (Grade {product.quality})
                      </Badge>
                    ))}
                  </div>
                  {dropoff.completedAt && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Completed at: {dropoff.completedAt}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredDropoffs.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No drop-offs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </WarehouseLayout>
  );
}
