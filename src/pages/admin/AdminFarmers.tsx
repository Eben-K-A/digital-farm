import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFarmerVerification } from "@/store/farmer-verification";
import { CheckCircle, XCircle, Clock, Search, Eye, Download, Plus } from "lucide-react";
import { useState } from "react";

const mockFarmers = [
  {
    id: "farmer1",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    phone: "0501234567",
    farmName: "Green Valley Farm",
    region: "Ashanti",
    verificationStatus: "pending",
    submittedDate: "2024-01-15",
    documents: 4,
  },
  {
    id: "farmer2",
    name: "Abena Owusu",
    email: "abena@example.com",
    phone: "0502345678",
    farmName: "Golden Harvest",
    region: "Eastern",
    verificationStatus: "approved",
    approvedDate: "2024-01-10",
    documents: 5,
  },
  {
    id: "farmer3",
    name: "Kwame Boateng",
    email: "kwame@example.com",
    phone: "0503456789",
    farmName: "Fertile Lands",
    region: "Central",
    verificationStatus: "rejected",
    rejectionDate: "2024-01-12",
    rejectionReason: "Incomplete documentation",
    documents: 3,
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  approved: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
  pending: { bg: "bg-amber-100", text: "text-amber-800", icon: Clock },
  rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
};

export default function AdminFarmers() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { getVerification } = useFarmerVerification();
  const farmerCount = Object.keys(mockFarmers).length;
  const approvedCount = mockFarmers.filter((f) => f.verificationStatus === "approved").length;
  const pendingCount = mockFarmers.filter((f) => f.verificationStatus === "pending").length;

  return (
    <AdminLayout title="Farmer Management" description="Manage farmer accounts and verify farmer registrations">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Farmers</p>
              <p className="text-4xl font-bold text-foreground">{farmerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Verified</p>
              <p className="text-4xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Pending Review</p>
              <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmers Table */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All Farmers</CardTitle>
          <div className="flex gap-3 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search farmers..." className="pl-10" />
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Add Farmer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Farmer Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Farm Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Region</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Docs</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockFarmers.map((farmer) => {
                  const statusInfo = statusColors[farmer.verificationStatus];
                  const StatusIcon = statusInfo.icon;
                  const date = farmer.verificationStatus === "approved" ? farmer.approvedDate : farmer.submittedDate;

                  return (
                    <tr key={farmer.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          <p className="text-sm text-muted-foreground">{farmer.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-sm">{farmer.farmName}</p>
                      </td>
                      <td className="py-4 px-4 text-sm">{farmer.region}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusInfo.text}`} />
                          <Badge className={`${statusInfo.bg} ${statusInfo.text} border-0`}>
                            {farmer.verificationStatus.charAt(0).toUpperCase() + farmer.verificationStatus.slice(1)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{date}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{farmer.documents} files</Badge>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        {farmer.verificationStatus === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" className="gap-1 text-green-600 hover:text-green-700">
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
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

      {/* Add Farmer Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Farmer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input placeholder="Enter farmer's full name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input placeholder="email@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input placeholder="0501234567" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Farm Name *</label>
                <Input placeholder="Enter farm name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Region *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option>Select region</option>
                  <option>Ashanti</option>
                  <option>Eastern</option>
                  <option>Greater Accra</option>
                  <option>Central</option>
                  <option>Northern</option>
                  <option>Volta</option>
                  <option>Western</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">District *</label>
                <Input placeholder="Enter district" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Town/Community *</label>
                <Input placeholder="Enter town or community" />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>Add Farmer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
