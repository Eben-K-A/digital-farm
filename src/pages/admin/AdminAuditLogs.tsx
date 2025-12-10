import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { auditLogs, AuditLog } from "@/data/admin-data";
import { useState } from "react";
import { toast } from "sonner";

const severityConfig: Record<
  AuditLog["severity"],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  info: {
    icon: Info,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-secondary",
    bgColor: "bg-secondary/20",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleExport = () => {
    toast.success("Audit logs exported", {
      description: "Download will start shortly",
    });
  };

  return (
    <AdminLayout
      title="Audit Logs"
      description="Track all activity on the platform"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {auditLogs.filter((l) => l.severity === "info").length}
              </p>
              <p className="text-sm text-muted-foreground">Info Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-secondary">
                {auditLogs.filter((l) => l.severity === "warning").length}
              </p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-destructive">
                {auditLogs.filter((l) => l.severity === "error").length}
              </p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Activity Log</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Level</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const config = severityConfig[log.severity];
                  const Icon = config.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div
                          className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}
                        >
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{log.action}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{log.user}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {log.userRole}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
