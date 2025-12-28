import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader, CheckCircle, MapPin, Package, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ordersAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/store/auth';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  farm_name: string;
}

interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  items: OrderItem[];
  ordered_at: string;
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !orderId) {
      navigate('/auth');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await ordersAPI.getById(accessToken, orderId);
        setOrder(orderData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/buyer/orders'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [accessToken, orderId, navigate]);

  const handleProceedToPayment = () => {
    // This would integrate with payment gateway
    toast({
      title: 'Payment Processing',
      description: 'Redirecting to payment gateway...',
    });
    // For now, navigate to buyer orders
    setTimeout(() => navigate('/buyer/orders'), 2000);
  };

  const handleViewOrders = () => {
    navigate('/buyer/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.ordered_at);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for your order. We've sent a confirmation email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Number & Date */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-blue-600">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="text-lg font-semibold">{formattedDate}</p>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-bold">{item.product_name}</h3>
                      <p className="text-sm text-gray-600">{item.farm_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} × ₵{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₵{(item.quantity * item.unit_price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Status */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Status
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Method
              </h2>
              <p className="text-gray-600">
                {order.payment_method === 'mobile_money' && 'Mobile Money (MTN, Vodafone, AirtelTigo)'}
                {order.payment_method === 'debit_card' && 'Debit Card'}
                {order.payment_method === 'bank_transfer' && 'Bank Transfer'}
                {order.payment_method === 'cash_on_delivery' && 'Cash on Delivery'}
              </p>
            </Card>

            {/* Next Steps */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                {order.payment_status === 'pending' 
                  ? 'Your order is pending payment. Complete payment to finalize your order.'
                  : 'Your order has been confirmed and payment received. Thank you for your purchase!'}
              </AlertDescription>
            </Alert>
          </div>

          {/* Summary Sidebar */}
          <div>
            {/* Order Summary */}
            <Card className="p-6 sticky top-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₵{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₵{order.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">₵{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {order.payment_status === 'pending' && (
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full mb-2"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
              )}

              <Button
                onClick={handleViewOrders}
                variant="outline"
                className="w-full"
              >
                View My Orders
              </Button>
            </Card>

            {/* Support Card */}
            <Card className="p-6 bg-gray-100">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <Button variant="outline" className="w-full text-sm">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
