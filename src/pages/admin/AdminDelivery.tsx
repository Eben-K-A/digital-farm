import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Eye, Download, Search, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";

const mockDeliveryPersons = [
  {
    id: "delivery1",
    name: "Kwesi Ansah",
    phone: "0549876543",
    email: "kwesi@example.com",
    vehicle: "Motorcycle",
    licensePlate: "GR-1234-21",
    status: "active",
    totalDeliveries: 145,
    rating: 4.8,
    region: "Greater Accra",
  },
  {
    id: "delivery2",
    name: "Yaw Owusu",
    phone: "0550123456",
    email: "yaw@example.com",
    vehicle: "Tricycle",
    licensePlate: "AS-5678-21",
    status: "active",
    totalDeliveries: 89,
    rating: 4.5,
    region: "Ashanti",
  },
  {
    id: "delivery3",
    name: "Ahmed Hassan",
    phone: "0551234567",
    email: "ahmed@example.com",
    vehicle: "Motorcycle",
    licensePlate: "NR-9012-21",
    status: "inactive",
    totalDeliveries: 234,
    rating: 4.6,
    region: "Northern",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

export default function AdminDelivery() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const activeCount = mockDeliveryPersons.filter((d) => d.status === "active").length;
  const totalDeliveries = mockDeliveryPersons.reduce((sum, d) => sum + d.totalDeliveries, 0);

  return (
    <AdminLayout
      title="Delivery Management"
      description="Manage delivery personnel, track deliveries, and monitor performance"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Riders</p>
              <p className="text-4xl font-bold text-foreground">{mockDeliveryPersons.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Active Now</p>
              <p className="text-4xl font-bold text-green-600">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Deliveries</p>
              <p className="text-4xl font-bold text-blue-600">{totalDeliveries}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Avg Rating</p>
              <p className="text-4xl font-bold text-amber-600">4.6★</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Personnel Table */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Delivery Personnel</CardTitle>
          <div className="flex gap-3 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search delivery riders..." className="pl-10" />
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Add Delivery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deliveries</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockDeliveryPersons.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{delivery.name}</p>
                        <p className="text-sm text-muted-foreground">{delivery.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-sm">{delivery.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{delivery.licensePlate}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{delivery.region}</td>
                    <td className="py-4 px-4">
                      <Badge className={statusColors[delivery.status]}>
                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-medium">{delivery.totalDeliveries}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium">{delivery.rating}★</span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      {delivery.status === "active" && (
                        <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700">
                          <AlertCircle className="h-4 w-4" />
                          Suspend
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Delivery Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Delivery Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input placeholder="0501234567" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input placeholder="email@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option>Select vehicle type</option>
                  <option>Motorcycle</option>
                  <option>Tricycle</option>
                  <option>Car</option>
                  <option>Van</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Plate *</label>
                <Input placeholder="GR-1234-21" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Region *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option>Select region</option>
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Eastern</option>
                  <option>Northern</option>
                  <option>Central</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>Add Delivery</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
