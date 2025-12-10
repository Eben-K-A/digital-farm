import { useState } from "react";
import { WarehouseLayout } from "@/components/warehouse/WarehouseLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, Plus, Edit, AlertTriangle } from "lucide-react";
import { warehouseInventory } from "@/data/warehouse-data";
import { Progress } from "@/components/ui/progress";

const statusColors: Record<string, string> = {
  in_stock: "bg-green-500/10 text-green-600 border-green-500/20",
  low_stock: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  out_of_stock: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function WarehouseInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [...new Set(warehouseInventory.map(item => item.category))];

  const filteredInventory = warehouseInventory.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <WarehouseLayout 
      title="Inventory" 
      description="Manage warehouse stock levels"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const stockPercentage = (item.quantity / item.maxStock) * 100;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{item.quantity} {item.unit}</span>
                            <span className="text-muted-foreground">/ {item.maxStock}</span>
                          </div>
                          <Progress 
                            value={stockPercentage} 
                            className={`h-2 ${
                              item.status === "out_of_stock" ? "[&>div]:bg-red-500" :
                              item.status === "low_stock" ? "[&>div]:bg-yellow-500" : ""
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.location}</TableCell>
                      <TableCell className="text-sm">{item.farmerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[item.status]}>
                          {item.status === "out_of_stock" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </WarehouseLayout>
  );
}
