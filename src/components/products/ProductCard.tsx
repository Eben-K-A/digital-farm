import { Product } from "@/data/products";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, MapPin } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      description: `₵${product.price} per ${product.unit}`,
    });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card variant="product" className="overflow-hidden group">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Badge variant="category" className="absolute top-3 left-3">
            {product.category}
          </Badge>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Button
            variant="golden"
            size="sm"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 text-secondary">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{product.location}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-display font-bold text-primary">
                ₵{product.price}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                /{product.unit}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              by {product.farmer}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
