import { WarehouseLayout } from "@/components/warehouse/WarehouseLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ArrowUpDown, Truck, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { warehouseStats, warehouseInventory, stockMovements, warehouseLocations } from "@/data/warehouse-data";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const statusColors: Record<string, string> = {
  in_stock: "bg-green-500/10 text-green-600 border-green-500/20",
  low_stock: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  out_of_stock: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function WarehouseOverview() {
  const lowStockItems = warehouseInventory.filter(i => i.status === "low_stock" || i.status === "out_of_stock");
  const recentMovements = stockMovements.slice(0, 4);

  return (
    <WarehouseLayout 
      title="Warehouse Overview" 
      description="Monitor inventory and stock movements"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Products"
          value={warehouseStats.totalProducts}
          icon={Package}
        />
        <StatCard
          title="Low Stock Items"
          value={warehouseStats.lowStock + warehouseStats.outOfStock}
          icon={AlertTriangle}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Today's Intake"
          value={warehouseStats.intakeToday}
          icon={TrendingUp}
        />
        <StatCard
          title="Today's Release"
          value={warehouseStats.releaseToday}
          icon={TrendingDown}
        />
      </div>

      {/* Warehouse Locations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Warehouse Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {warehouseLocations.map((location) => (
              <div key={location.id} className="p-4 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-1">{location.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{location.region}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{location.capacity}%</span>
                  </div>
                  <Progress value={location.capacity} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Stock Alerts</CardTitle>
            <Link to="/warehouse/inventory">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status === "out_of_stock" ? "bg-red-500/10" : "bg-yellow-500/10"
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        item.status === "out_of_stock" ? "text-red-600" : "text-yellow-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} / {item.minStock} {item.unit} (min)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusColors[item.status]}>
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">All stock levels are healthy</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Movements</CardTitle>
            <Link to="/warehouse/movements">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    movement.type === "intake" ? "bg-green-500/10" : 
                    movement.type === "release" ? "bg-blue-500/10" : "bg-red-500/10"
                  }`}>
                    <ArrowUpDown className={`h-5 w-5 ${
                      movement.type === "intake" ? "text-green-600" : 
                      movement.type === "release" ? "text-blue-600" : "text-red-600"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{movement.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.type === "intake" ? "+" : "-"}{movement.quantity} {movement.unit}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={
                  movement.type === "intake" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                  movement.type === "release" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                  "bg-red-500/10 text-red-600 border-red-500/20"
                }>
                  {movement.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}
