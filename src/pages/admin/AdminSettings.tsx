import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformFee: 5,
    minOrderAmount: 20,
    maxDeliveryRadius: 50,
    autoApproveVerifiedFarmers: true,
    enableNewRegistrations: true,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <AdminLayout
      title="Platform Settings"
      description="Configure platform-wide settings"
    >
      <div className="grid gap-6 max-w-2xl">
        {/* Platform Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Fees</CardTitle>
            <CardDescription>
              Configure commission and fee structures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Commission (%)</Label>
              <Input
                id="platformFee"
                type="number"
                value={settings.platformFee}
                onChange={(e) =>
                  setSettings({ ...settings, platformFee: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Percentage taken from each transaction
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrder">Minimum Order Amount (₵)</Label>
              <Input
                id="minOrder"
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) =>
                  setSettings({ ...settings, minOrderAmount: Number(e.target.value) })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
            <CardDescription>
              Configure delivery and logistics options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryRadius">Max Delivery Radius (km)</Label>
              <Input
                id="deliveryRadius"
                type="number"
                value={settings.maxDeliveryRadius}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxDeliveryRadius: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Registration & Approval */}
        <Card>
          <CardHeader>
            <CardTitle>Registration & Approval</CardTitle>
            <CardDescription>
              Control user registration and approval settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to sign up
                </p>
              </div>
              <Switch
                checked={settings.enableNewRegistrations}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableNewRegistrations: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve Verified Farmers</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve products from verified farmers
                </p>
              </div>
              <Switch
                checked={settings.autoApproveVerifiedFarmers}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoApproveVerifiedFarmers: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send admin alerts via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send critical alerts via SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              These settings can affect platform availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the platform for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button variant="hero" size="lg" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
