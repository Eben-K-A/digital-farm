// Mock data for admin dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "farmer" | "buyer" | "delivery" | "warehouse";
  status: "active" | "suspended" | "pending";
  joinedDate: string;
  lastActive: string;
  avatar?: string;
}

export interface PendingProduct {
  id: string;
  name: string;
  farmer: string;
  farmerId: string;
  category: string;
  price: number;
  unit: string;
  submittedDate: string;
  image: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  userRole: string;
  timestamp: string;
  details: string;
  severity: "info" | "warning" | "error";
}

export interface PlatformStats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeDeliveries: number;
  monthlyGrowth: number;
}

export const platformStats: PlatformStats = {
  totalUsers: 55420,
  totalFarmers: 5230,
  totalBuyers: 48150,
  totalOrders: 12450,
  totalRevenue: 2850000,
  pendingApprovals: 23,
  activeDeliveries: 156,
  monthlyGrowth: 12.5,
};

export const users: User[] = [
  {
    id: "1",
    name: "Kofi Mensah",
    email: "kofi.mensah@email.com",
    role: "farmer",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2024-12-08",
  },
  {
    id: "2",
    name: "Ama Darko",
    email: "ama.darko@email.com",
    role: "farmer",
    status: "active",
    joinedDate: "2024-02-20",
    lastActive: "2024-12-09",
  },
  {
    id: "3",
    name: "Kwame Asante",
    email: "kwame.asante@email.com",
    role: "buyer",
    status: "active",
    joinedDate: "2024-03-10",
    lastActive: "2024-12-09",
  },
  {
    id: "4",
    name: "Akosua Mensah",
    email: "akosua.m@email.com",
    role: "buyer",
    status: "suspended",
    joinedDate: "2024-04-05",
    lastActive: "2024-11-20",
  },
  {
    id: "5",
    name: "Yaw Boateng",
    email: "yaw.b@email.com",
    role: "delivery",
    status: "active",
    joinedDate: "2024-05-12",
    lastActive: "2024-12-09",
  },
  {
    id: "6",
    name: "Efua Owusu",
    email: "efua.o@email.com",
    role: "warehouse",
    status: "active",
    joinedDate: "2024-06-01",
    lastActive: "2024-12-08",
  },
  {
    id: "7",
    name: "Nana Adu",
    email: "nana.adu@email.com",
    role: "farmer",
    status: "pending",
    joinedDate: "2024-12-08",
    lastActive: "2024-12-08",
  },
];

export const pendingProducts: PendingProduct[] = [
  {
    id: "p1",
    name: "Organic Groundnuts",
    farmer: "Kofi Mensah",
    farmerId: "1",
    category: "Legumes",
    price: 45,
    unit: "kg",
    submittedDate: "2024-12-08",
    image: "https://images.unsplash.com/photo-1567892737950-4c8feef69c66?w=200&h=200&fit=crop",
  },
  {
    id: "p2",
    name: "Fresh Okra",
    farmer: "Ama Darko",
    farmerId: "2",
    category: "Vegetables",
    price: 22,
    unit: "kg",
    submittedDate: "2024-12-07",
    image: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=200&h=200&fit=crop",
  },
  {
    id: "p3",
    name: "Red Onions",
    farmer: "Kwesi Appiah",
    farmerId: "8",
    category: "Vegetables",
    price: 18,
    unit: "kg",
    submittedDate: "2024-12-06",
    image: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=200&h=200&fit=crop",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "a1",
    action: "User Login",
    user: "admin@farmconnect.gh",
    userRole: "admin",
    timestamp: "2024-12-09T10:30:00",
    details: "Successful login from IP 192.168.1.100",
    severity: "info",
  },
  {
    id: "a2",
    action: "Product Approved",
    user: "admin@farmconnect.gh",
    userRole: "admin",
    timestamp: "2024-12-09T10:15:00",
    details: "Approved product 'Fresh Tomatoes' by Kofi Mensah",
    severity: "info",
  },
  {
    id: "a3",
    action: "User Suspended",
    user: "admin@farmconnect.gh",
    userRole: "admin",
    timestamp: "2024-12-09T09:45:00",
    details: "Suspended user Akosua Mensah for policy violation",
    severity: "warning",
  },
  {
    id: "a4",
    action: "Failed Login Attempt",
    user: "unknown@email.com",
    userRole: "unknown",
    timestamp: "2024-12-09T09:30:00",
    details: "Multiple failed login attempts from IP 10.0.0.55",
    severity: "error",
  },
  {
    id: "a5",
    action: "Payout Processed",
    user: "finance@farmconnect.gh",
    userRole: "admin",
    timestamp: "2024-12-09T09:00:00",
    details: "Processed payout of ₵2,500 to farmer Ama Darko",
    severity: "info",
  },
  {
    id: "a6",
    action: "Product Rejected",
    user: "admin@farmconnect.gh",
    userRole: "admin",
    timestamp: "2024-12-08T16:30:00",
    details: "Rejected product 'Dried Fish' - quality standards not met",
    severity: "warning",
  },
];

export const revenueData = [
  { month: "Jul", revenue: 180000, orders: 850 },
  { month: "Aug", revenue: 220000, orders: 1020 },
  { month: "Sep", revenue: 195000, orders: 920 },
  { month: "Oct", revenue: 280000, orders: 1350 },
  { month: "Nov", revenue: 320000, orders: 1580 },
  { month: "Dec", revenue: 385000, orders: 1890 },
];

export const userGrowthData = [
  { month: "Jul", farmers: 4200, buyers: 38000 },
  { month: "Aug", farmers: 4450, buyers: 40500 },
  { month: "Sep", farmers: 4680, buyers: 42800 },
  { month: "Oct", farmers: 4850, buyers: 44500 },
  { month: "Nov", farmers: 5050, buyers: 46200 },
  { month: "Dec", revenue: 5230, buyers: 48150 },
];

export const regionDistribution = [
  { region: "Greater Accra", users: 12500, revenue: 580000 },
  { region: "Ashanti", users: 9800, revenue: 450000 },
  { region: "Eastern", users: 6200, revenue: 320000 },
  { region: "Western", users: 5100, revenue: 280000 },
  { region: "Central", users: 4800, revenue: 250000 },
  { region: "Northern", users: 4200, revenue: 220000 },
  { region: "Volta", users: 3800, revenue: 180000 },
  { region: "Others", users: 9020, revenue: 570000 },
];
