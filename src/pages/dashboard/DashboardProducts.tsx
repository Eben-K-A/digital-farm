import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockFarmerProducts, FarmerProduct } from "@/data/farmer-data";
import { Plus, Search, Edit, Trash2, MoreVertical, Package } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  active: { variant: "default", label: "Active" },
  draft: { variant: "secondary", label: "Draft" },
  out_of_stock: { variant: "destructive", label: "Out of Stock" },
};

export default function DashboardProducts() {
  const [products, setProducts] = useState<FarmerProduct[]>(mockFarmerProducts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully");
  };

  return (
    <DashboardLayout
      title="Products"
      description="Manage your product listings"
      actions={
        <Link to="/dashboard/products/new">
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      }
    >
      {/* Search & Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">All ({products.length})</Button>
            <Button variant="ghost" size="sm">Active ({products.filter(p => p.status === "active").length})</Button>
            <Button variant="ghost" size="sm">Draft ({products.filter(p => p.status === "draft").length})</Button>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Badge
                  variant={statusStyles[product.status].variant}
                  className="absolute top-3 right-3"
                >
                  {statusStyles[product.status].label}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-2xl font-display font-bold text-primary">
                    ₵{product.price}
                  </span>
                  <span className="text-muted-foreground">/{product.unit}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm">
                  <div>
                    <span className="text-muted-foreground">Stock: </span>
                    <span className={product.stock === 0 ? "text-destructive font-medium" : "font-medium"}>
                      {product.stock} {product.unit}s
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sales: </span>
                    <span className="font-medium">{product.sales}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Start by adding your first product"}
          </p>
          <Link to="/dashboard/products/new">
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </Card>
      )}
    </DashboardLayout>
  );
}
