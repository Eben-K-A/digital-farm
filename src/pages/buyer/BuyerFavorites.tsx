import { BuyerLayout } from "@/components/buyer/BuyerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { Link } from "react-router-dom";

export default function BuyerFavorites() {
  // Mock favorites - in real app would come from user data
  const favoriteProducts = products.slice(0, 4);

  return (
    <BuyerLayout 
      title="My Favorites" 
      description="Products you've saved for later"
    >
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background text-destructive"
                >
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
                {product.stock === 0 && (
                  <Badge className="absolute bottom-2 left-2 bg-destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{product.farmer}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary mb-4">
                  GH₵ {product.price.toFixed(2)}/{product.unit}
                </p>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2" 
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">
            Start adding products you love to your favorites
          </p>
          <Link to="/marketplace">
            <Button>Browse Products</Button>
          </Link>
        </div>
      )}
    </BuyerLayout>
  );
}
