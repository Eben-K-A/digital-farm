import { BuyerLayout } from "@/components/buyer/BuyerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Edit, Package } from "lucide-react";
import { buyerOrders } from "@/data/buyer-data";

export default function BuyerReviews() {
  const reviewedOrders = buyerOrders.filter(order => order.rating !== null);
  const pendingReviews = buyerOrders.filter(order => order.status === "delivered" && order.rating === null);

  return (
    <BuyerLayout 
      title="My Reviews" 
      description="Manage your product reviews and ratings"
    >
      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            {pendingReviews.map((order) => (
              <Card key={order.id} className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          From {order.farmer} • {order.items.length} item(s)
                        </p>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Star className="h-4 w-4" />
                      Write Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Reviews */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Reviews</h2>
        {reviewedOrders.length > 0 ? (
          <div className="space-y-4">
            {reviewedOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground">{order.id}</h3>
                          <Badge variant="outline">Reviewed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          From {order.farmer} • Delivered on {order.date}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${
                                i < (order.rating || 0) 
                                  ? "fill-yellow-500 text-yellow-500" 
                                  : "text-muted-foreground"
                              }`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {order.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No reviews yet</h3>
            <p className="text-muted-foreground">
              Your submitted reviews will appear here
            </p>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
