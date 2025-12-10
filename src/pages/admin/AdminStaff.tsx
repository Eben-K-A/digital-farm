import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MoreHorizontal, UserPlus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { useStaff, STAFF_ROLES, PERMISSIONS, type StaffRole, type PermissionKey, type StaffAccount } from "@/store/staff";

const AdminStaff = () => {
  const { user } = useAuth();
  const { staffAccounts, addStaff, updateStaff, deleteStaff } = useStaff();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roles: [] as StaffRole[],
    permissions: [] as PermissionKey[],
  });

  const filteredStaff = staffAccounts.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      roles: [],
      permissions: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staff: StaffAccount) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: staff.password,
      roles: staff.roles,
      permissions: staff.permissions,
    });
    setIsDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.roles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roles: formData.roles,
        permissions: formData.permissions,
      });
      toast.success("Staff account updated successfully");
    } else {
      addStaff({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        roles: formData.roles,
        permissions: formData.permissions,
        createdBy: user?.email || "admin",
        active: true,
      });
      toast.success("Staff account created successfully");
    }

    setIsDialogOpen(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      roles: [],
      permissions: [],
    });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    deleteStaff(id);
    toast.success(`Staff account "${name}" deleted`);
  };

  const toggleRole = (role: StaffRole) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const togglePermission = (permission: PermissionKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const getRoleColor = (role: StaffRole) => {
    const colors: Record<StaffRole, string> = {
      farmer_manager: "bg-leaf-green/20 text-leaf-green",
      delivery_manager: "bg-accent/20 text-accent",
      warehouse_manager: "bg-orange-100 text-orange-800",
      buyer_manager: "bg-blue-100 text-blue-800",
      staff: "bg-gray-100 text-gray-800",
    };
    return colors[role];
  };

  return (
    <AdminLayout
      title="Staff Management"
      description="Manage staff accounts and assign roles with custom permissions"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-display font-bold text-foreground">
              {staffAccounts.length}
            </p>
            <p className="text-sm text-muted-foreground">Total Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-display font-bold text-primary">
              {staffAccounts.filter((s) => s.active).length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-display font-bold text-leaf-green">
              {staffAccounts.filter((s) => s.roles.includes("farmer_manager")).length}
            </p>
            <p className="text-sm text-muted-foreground">Farmer Managers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-display font-bold text-accent">
              {staffAccounts.filter((s) => s.roles.includes("delivery_manager")).length}
            </p>
            <p className="text-sm text-muted-foreground">Delivery Managers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Staff Accounts</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm" onClick={handleAddStaff}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingStaff ? "Edit Staff Account" : "Create New Staff Account"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!!editingStaff}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={editingStaff ? "Leave blank to keep current" : "Enter password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>

                  {/* Roles */}
                  <div className="space-y-3">
                    <Label>Assign Roles *</Label>
                    <div className="space-y-2">
                      {Object.entries(STAFF_ROLES).map(([roleKey, role]) => (
                        <div key={roleKey} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={formData.roles.includes(roleKey as StaffRole)}
                            onCheckedChange={() => toggleRole(roleKey as StaffRole)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{role.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-3">
                    <Label>Additional Permissions (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Select specific permissions beyond role defaults
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(PERMISSIONS).map(([permKey, perm]) => (
                        <div key={permKey} className="flex items-center gap-2">
                          <Checkbox
                            id={permKey}
                            checked={formData.permissions.includes(permKey as PermissionKey)}
                            onCheckedChange={() => togglePermission(permKey as PermissionKey)}
                          />
                          <label
                            htmlFor={permKey}
                            className="text-sm font-medium cursor-pointer leading-tight"
                          >
                            {perm.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={handleSaveStaff}>
                    {editingStaff ? "Update" : "Create"} Staff Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {staffAccounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No staff accounts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first staff account to get started
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {staff.name.charAt(0)}
                            </span>
                          </div>
                          <p className="font-medium">{staff.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {staff.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {staff.roles.map((role) => (
                            <Badge
                              key={role}
                              className={getRoleColor(role)}
                              variant="outline"
                            >
                              {STAFF_ROLES[role].label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {staff.permissions.length} custom
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            staff.active
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                          }
                          variant="outline"
                        >
                          {staff.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteStaff(staff.id, staff.name)
                              }
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Staff Login Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            Staff members can login using the credentials you assign here. They will have
            access to the activities and sections based on their assigned roles and permissions.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Farmer Manager:</strong> Manage all farmer accounts and activities</li>
            <li><strong>Delivery Manager:</strong> Manage all delivery operations</li>
            <li><strong>Warehouse Manager:</strong> Manage warehouse inventory and operations</li>
            <li><strong>Buyer Manager:</strong> Manage buyer accounts and orders</li>
          </ul>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminStaff;
