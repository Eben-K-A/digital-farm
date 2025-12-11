import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Farmers from "./pages/Farmers";
import NotFound from "./pages/NotFound";
import FarmerVerification from "./pages/FarmerVerification";
import FarmerVerificationPending from "./pages/FarmerVerificationPending";
// Farmer Dashboard
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardProductForm from "./pages/dashboard/DashboardProductForm";
import DashboardOrders from "./pages/dashboard/DashboardOrders";
import DashboardEarnings from "./pages/dashboard/DashboardEarnings";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
// Admin Dashboard
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminFarmers from "./pages/admin/AdminFarmers";
import AdminDelivery from "./pages/admin/AdminDelivery";
import AdminWarehouse from "./pages/admin/AdminWarehouse";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";
// Buyer Dashboard
import BuyerOverview from "./pages/buyer/BuyerOverview";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import BuyerAddresses from "./pages/buyer/BuyerAddresses";
import BuyerFavorites from "./pages/buyer/BuyerFavorites";
import BuyerReviews from "./pages/buyer/BuyerReviews";
import BuyerSettings from "./pages/buyer/BuyerSettings";
// Delivery Dashboard
import DeliveryOverview from "./pages/delivery/DeliveryOverview";
import DeliveryAssignments from "./pages/delivery/DeliveryAssignments";
import DeliveryEarnings from "./pages/delivery/DeliveryEarnings";
import DeliveryHistory from "./pages/delivery/DeliveryHistory";
import DeliveryRoutes from "./pages/delivery/DeliveryRoutes";
import DeliverySettings from "./pages/delivery/DeliverySettings";
// Warehouse Dashboard
import WarehouseOverview from "./pages/warehouse/WarehouseOverview";
import WarehouseInventory from "./pages/warehouse/WarehouseInventory";
import WarehouseDropoffs from "./pages/warehouse/WarehouseDropoffs";
import WarehouseMovements from "./pages/warehouse/WarehouseMovements";
import WarehouseReports from "./pages/warehouse/WarehouseReports";
import WarehouseSettings from "./pages/warehouse/WarehouseSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/about" element={<About />} />
          <Route path="/farmer-verification" element={<ProtectedRoute requiredRole="farmer"><FarmerVerification /></ProtectedRoute>} />
          <Route path="/farmer-verification-pending" element={<ProtectedRoute requiredRole="farmer"><FarmerVerificationPending /></ProtectedRoute>} />
          {/* Farmer Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="farmer"><DashboardOverview /></ProtectedRoute>} />
          <Route path="/dashboard/products" element={<ProtectedRoute requiredRole="farmer"><DashboardProducts /></ProtectedRoute>} />
          <Route path="/dashboard/products/new" element={<ProtectedRoute requiredRole="farmer"><DashboardProductForm /></ProtectedRoute>} />
          <Route path="/dashboard/orders" element={<ProtectedRoute requiredRole="farmer"><DashboardOrders /></ProtectedRoute>} />
          <Route path="/dashboard/earnings" element={<ProtectedRoute requiredRole="farmer"><DashboardEarnings /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute requiredRole="farmer"><DashboardSettings /></ProtectedRoute>} />
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute requiredRole="admin"><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute requiredRole="admin"><AdminApprovals /></ProtectedRoute>} />
          <Route path="/admin/farmers" element={<ProtectedRoute requiredRole="admin"><AdminFarmers /></ProtectedRoute>} />
          <Route path="/admin/delivery" element={<ProtectedRoute requiredRole="admin"><AdminDelivery /></ProtectedRoute>} />
          <Route path="/admin/warehouse" element={<ProtectedRoute requiredRole="admin"><AdminWarehouse /></ProtectedRoute>} />
          <Route path="/admin/financial" element={<ProtectedRoute requiredRole="admin"><AdminFinancial /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogs /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
          {/* Buyer Dashboard Routes */}
          <Route path="/buyer" element={<ProtectedRoute requiredRole="buyer"><BuyerOverview /></ProtectedRoute>} />
          <Route path="/buyer/orders" element={<ProtectedRoute requiredRole="buyer"><BuyerOrders /></ProtectedRoute>} />
          <Route path="/buyer/addresses" element={<ProtectedRoute requiredRole="buyer"><BuyerAddresses /></ProtectedRoute>} />
          <Route path="/buyer/favorites" element={<ProtectedRoute requiredRole="buyer"><BuyerFavorites /></ProtectedRoute>} />
          <Route path="/buyer/reviews" element={<ProtectedRoute requiredRole="buyer"><BuyerReviews /></ProtectedRoute>} />
          <Route path="/buyer/settings" element={<ProtectedRoute requiredRole="buyer"><BuyerSettings /></ProtectedRoute>} />
          {/* Delivery Dashboard Routes */}
          <Route path="/delivery" element={<ProtectedRoute requiredRole="delivery"><DeliveryOverview /></ProtectedRoute>} />
          <Route path="/delivery/assignments" element={<ProtectedRoute requiredRole="delivery"><DeliveryAssignments /></ProtectedRoute>} />
          <Route path="/delivery/earnings" element={<ProtectedRoute requiredRole="delivery"><DeliveryEarnings /></ProtectedRoute>} />
          <Route path="/delivery/history" element={<ProtectedRoute requiredRole="delivery"><DeliveryHistory /></ProtectedRoute>} />
          <Route path="/delivery/routes" element={<ProtectedRoute requiredRole="delivery"><DeliveryRoutes /></ProtectedRoute>} />
          <Route path="/delivery/settings" element={<ProtectedRoute requiredRole="delivery"><DeliverySettings /></ProtectedRoute>} />
          {/* Warehouse Dashboard Routes */}
          <Route path="/warehouse" element={<ProtectedRoute requiredRole="warehouse"><WarehouseOverview /></ProtectedRoute>} />
          <Route path="/warehouse/inventory" element={<ProtectedRoute requiredRole="warehouse"><WarehouseInventory /></ProtectedRoute>} />
          <Route path="/warehouse/dropoffs" element={<ProtectedRoute requiredRole="warehouse"><WarehouseDropoffs /></ProtectedRoute>} />
          <Route path="/warehouse/movements" element={<ProtectedRoute requiredRole="warehouse"><WarehouseMovements /></ProtectedRoute>} />
          <Route path="/warehouse/reports" element={<ProtectedRoute requiredRole="warehouse"><WarehouseReports /></ProtectedRoute>} />
          <Route path="/warehouse/settings" element={<ProtectedRoute requiredRole="warehouse"><WarehouseSettings /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
