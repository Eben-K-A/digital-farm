import { useState } from "react";
import { WarehouseLayout } from "@/components/warehouse/WarehouseLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Search, Plus, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { stockMovements } from "@/data/warehouse-data";

const typeColors: Record<string, string> = {
  intake: "bg-green-500/10 text-green-600 border-green-500/20",
  release: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  damage: "bg-red-500/10 text-red-600 border-red-500/20",
};

const typeIcons: Record<string, typeof TrendingUp> = {
  intake: TrendingUp,
  release: TrendingDown,
  damage: AlertTriangle,
};

export default function WarehouseMovements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMovements = stockMovements.filter((movement) => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <WarehouseLayout 
      title="Stock Movements" 
      description="Track inventory intake, release, and adjustments"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Movement
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Movement type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="intake">Intake</SelectItem>
            <SelectItem value="release">Release</SelectItem>
            <SelectItem value="damage">Damage/Waste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movements List */}
      <div className="space-y-4">
        {filteredMovements.map((movement) => {
          const Icon = typeIcons[movement.type];
          return (
            <Card key={movement.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      movement.type === "intake" ? "bg-green-500/10" :
                      movement.type === "release" ? "bg-blue-500/10" : "bg-red-500/10"
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        movement.type === "intake" ? "text-green-600" :
                        movement.type === "release" ? "text-blue-600" : "text-red-600"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{movement.productName}</h3>
                        <Badge variant="outline" className={typeColors[movement.type]}>
                          {movement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {movement.type === "intake" ? "+" : "-"}{movement.quantity} {movement.unit}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {movement.date}
                        </span>
                        <span>By: {movement.performedBy}</span>
                        {movement.farmerName && (
                          <span>From: {movement.farmerName}</span>
                        )}
                        {movement.orderId && (
                          <span>Order: {movement.orderId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {movement.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Notes: </span>
                      {movement.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredMovements.length === 0 && (
          <div className="text-center py-12">
            <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No movements found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </WarehouseLayout>
  );
}
