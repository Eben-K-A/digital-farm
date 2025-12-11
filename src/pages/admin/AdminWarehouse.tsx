import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Package, Eye, Search, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";

const mockWarehouses = [
  {
    id: "warehouse1",
    name: "Central Distribution Hub",
    location: "Accra",
    region: "Greater Accra",
    capacity: 50000,
    currentStock: 38500,
    staff: 24,
    status: "operational",
    contactPerson: "Mr. Mensah",
    phone: "0501234567",
  },
  {
    id: "warehouse2",
    name: "Kumasi Regional Hub",
    location: "Kumasi",
    region: "Ashanti",
    capacity: 30000,
    currentStock: 18200,
    staff: 18,
    status: "operational",
    contactPerson: "Ms. Owusu",
    phone: "0502345678",
  },
  {
    id: "warehouse3",
    name: "Cape Coast Distribution Center",
    location: "Cape Coast",
    region: "Central",
    capacity: 20000,
    currentStock: 12500,
    staff: 12,
    status: "maintenance",
    contactPerson: "Mr. Agyeman",
    phone: "0503456789",
  },
  {
    id: "warehouse4",
    name: "Tamale Northern Hub",
    location: "Tamale",
    region: "Northern",
    capacity: 25000,
    currentStock: 21000,
    staff: 15,
    status: "operational",
    contactPerson: "Mr. Hassan",
    phone: "0504567890",
  },
];

const statusColors: Record<string, string> = {
  operational: "bg-green-100 text-green-800",
  maintenance: "bg-amber-100 text-amber-800",
  closed: "bg-red-100 text-red-800",
};

export default function AdminWarehouse() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const operationalCount = mockWarehouses.filter((w) => w.status === "operational").length;
  const totalCapacity = mockWarehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalStock = mockWarehouses.reduce((sum, w) => sum + w.currentStock, 0);
  const totalStaff = mockWarehouses.reduce((sum, w) => sum + w.staff, 0);

  return (
    <AdminLayout
      title="Warehouse Management"
      description="Manage warehouse operations, inventory, and staff"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Warehouses</p>
              <p className="text-4xl font-bold text-foreground">{mockWarehouses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Operational</p>
              <p className="text-4xl font-bold text-green-600">{operationalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Staff</p>
              <p className="text-4xl font-bold text-blue-600">{totalStaff}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Capacity Used</p>
              <p className="text-4xl font-bold text-purple-600">
                {Math.round((totalStock / totalCapacity) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouses Table */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Warehouse Locations</CardTitle>
          <div className="flex gap-3 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search warehouses..." className="pl-10" />
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Add Warehouse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Warehouse Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Staff</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockWarehouses.map((warehouse) => {
                  const capacityPercent = Math.round((warehouse.currentStock / warehouse.capacity) * 100);

                  return (
                    <tr key={warehouse.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{warehouse.name}</p>
                          <p className="text-sm text-muted-foreground">{warehouse.contactPerson}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{warehouse.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{warehouse.region}</td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[warehouse.status]}>
                          {warehouse.status.charAt(0).toUpperCase() + warehouse.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium">
                            {warehouse.currentStock.toLocaleString()} / {warehouse.capacity.toLocaleString()}
                          </p>
                          <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                capacityPercent > 80
                                  ? "bg-red-500"
                                  : capacityPercent > 60
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${capacityPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {warehouse.staff}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        {warehouse.status !== "operational" && (
                          <Button variant="ghost" size="sm" className="gap-1 text-green-600 hover:text-green-700">
                            <AlertCircle className="h-4 w-4" />
                            Reopen
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Warehouse Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Warehouse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Warehouse Name *</label>
                <Input placeholder="Enter warehouse name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input placeholder="Enter location" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Region *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option>Select region</option>
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Eastern</option>
                  <option>Central</option>
                  <option>Northern</option>
                  <option>Upper East</option>
                  <option>Upper West</option>
                  <option>Volta</option>
                  <option>Western</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Warehouse Capacity (units) *</label>
                <Input placeholder="50000" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person *</label>
                <Input placeholder="Enter contact person name" />
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
                <label className="text-sm font-medium">Initial Staff Count</label>
                <Input placeholder="10" type="number" />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>Add Warehouse</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
