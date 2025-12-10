import { useState } from "react";
import { BuyerLayout } from "@/components/buyer/BuyerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Edit, Trash2, Plus, Check } from "lucide-react";
import { savedAddresses } from "@/data/buyer-data";

export default function BuyerAddresses() {
  const [addresses, setAddresses] = useState(savedAddresses);

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  return (
    <BuyerLayout 
      title="My Addresses" 
      description="Manage your delivery addresses"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? "ring-2 ring-primary" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{address.label}</h3>
                    {address.isDefault && (
                      <Badge variant="secondary" className="mt-1">Default</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-foreground">{address.address}</p>
                <p className="text-muted-foreground">{address.city}, {address.region}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{address.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                {!address.isDefault && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Check className="h-4 w-4" />
                      Set Default
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Address Card */}
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Add New Address</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Save a new delivery location
            </p>
            <Button variant="outline">Add Address</Button>
          </CardContent>
        </Card>
      </div>
    </BuyerLayout>
  );
}
