// Mock data for farmer dashboard

export interface FarmerProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  image: string;
  status: "active" | "draft" | "out_of_stock";
  sales: number;
  createdAt: string;
}

export interface FarmerOrder {
  id: string;
  buyerName: string;
  buyerLocation: string;
  products: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  date: string;
  paymentMethod: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  thisMonth: number;
  lastMonth: number;
  monthlyData: { month: string; earnings: number; orders: number }[];
}

export const mockFarmerProducts: FarmerProduct[] = [
  {
    id: "fp1",
    name: "Fresh Tomatoes",
    price: 25,
    unit: "kg",
    stock: 150,
    category: "Vegetables",
    image: "/placeholder.svg",
    status: "active",
    sales: 342,
    createdAt: "2024-01-15",
  },
  {
    id: "fp2",
    name: "Green Plantains",
    price: 18,
    unit: "bunch",
    stock: 80,
    category: "Fruits",
    image: "/placeholder.svg",
    status: "active",
    sales: 256,
    createdAt: "2024-01-20",
  },
  {
    id: "fp3",
    name: "Fresh Cassava",
    price: 15,
    unit: "kg",
    stock: 0,
    category: "Tubers",
    image: "/placeholder.svg",
    status: "out_of_stock",
    sales: 189,
    createdAt: "2024-02-01",
  },
  {
    id: "fp4",
    name: "Premium Yam",
    price: 35,
    unit: "tuber",
    stock: 60,
    category: "Tubers",
    image: "/placeholder.svg",
    status: "active",
    sales: 124,
    createdAt: "2024-02-10",
  },
  {
    id: "fp5",
    name: "Sweet Maize",
    price: 8,
    unit: "cob",
    stock: 300,
    category: "Grains",
    image: "/placeholder.svg",
    status: "draft",
    sales: 0,
    createdAt: "2024-03-01",
  },
];

export const mockFarmerOrders: FarmerOrder[] = [
  {
    id: "ORD-001",
    buyerName: "Akosua Mensah",
    buyerLocation: "Accra, Greater Accra",
    products: [
      { name: "Fresh Tomatoes", quantity: 5, price: 25 },
      { name: "Green Plantains", quantity: 2, price: 18 },
    ],
    total: 161,
    status: "pending",
    date: "2024-03-15",
    paymentMethod: "MTN Mobile Money",
  },
  {
    id: "ORD-002",
    buyerName: "Kwame Asante",
    buyerLocation: "Kumasi, Ashanti",
    products: [{ name: "Premium Yam", quantity: 10, price: 35 }],
    total: 350,
    status: "confirmed",
    date: "2024-03-14",
    paymentMethod: "Telecel Cash",
  },
  {
    id: "ORD-003",
    buyerName: "Ama Darko",
    buyerLocation: "Takoradi, Western",
    products: [
      { name: "Fresh Tomatoes", quantity: 20, price: 25 },
      { name: "Fresh Cassava", quantity: 15, price: 15 },
    ],
    total: 725,
    status: "shipped",
    date: "2024-03-13",
    paymentMethod: "AirtelTigo Money",
  },
  {
    id: "ORD-004",
    buyerName: "Kofi Boateng",
    buyerLocation: "Cape Coast, Central",
    products: [{ name: "Green Plantains", quantity: 8, price: 18 }],
    total: 144,
    status: "delivered",
    date: "2024-03-10",
    paymentMethod: "MTN Mobile Money",
  },
  {
    id: "ORD-005",
    buyerName: "Yaa Asantewaa",
    buyerLocation: "Ho, Volta",
    products: [{ name: "Premium Yam", quantity: 5, price: 35 }],
    total: 175,
    status: "cancelled",
    date: "2024-03-08",
    paymentMethod: "Bank Transfer",
  },
];

export const mockEarnings: EarningsSummary = {
  totalEarnings: 45680,
  pendingPayouts: 2340,
  thisMonth: 8750,
  lastMonth: 7200,
  monthlyData: [
    { month: "Oct", earnings: 4200, orders: 45 },
    { month: "Nov", earnings: 5800, orders: 62 },
    { month: "Dec", earnings: 7500, orders: 78 },
    { month: "Jan", earnings: 6200, orders: 58 },
    { month: "Feb", earnings: 7200, orders: 72 },
    { month: "Mar", earnings: 8750, orders: 89 },
  ],
};

export const dashboardStats = {
  totalProducts: 5,
  activeProducts: 3,
  totalOrders: 89,
  pendingOrders: 2,
  monthlyRevenue: 8750,
  revenueGrowth: 21.5,
  averageRating: 4.8,
  totalReviews: 156,
};
