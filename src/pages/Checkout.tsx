import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Plus, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ordersAPI, usersAPI, cartAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/store/auth';

interface DeliveryAddress {
  id: string;
  recipient_name: string;
  street_address: string;
  city: string;
  region: string;
  gps_address?: string;
  recipient_phone: string;
  is_active: boolean;
}

interface CartData {
  items: any[];
  subtotal: number;
  item_count: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const { toast } = useToast();

  // State
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [cart, setCart] = useState<CartData | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('mobile_money');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // Loading states
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    recipient_name: '',
    street_address: '',
    city: '',
    region: '',
    gps_address: '',
    recipient_phone: '',
  });

  // Load cart and addresses on mount
  useEffect(() => {
    if (!accessToken) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        // Load cart
        const cartData = await cartAPI.get(accessToken);
        setCart(cartData);

        if (!cartData || cartData.items.length === 0) {
          toast({
            title: 'Empty Cart',
            description: 'Your cart is empty. Redirecting to marketplace...',
          });
          setTimeout(() => navigate('/marketplace'), 2000);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load cart',
          variant: 'destructive',
        });
      } finally {
        setLoadingCart(false);
      }

      try {
        // Load addresses
        const addressesData = await usersAPI.getAddresses(accessToken);
        setAddresses(addressesData);
        
        // Auto-select first address if available
        if (addressesData.length > 0) {
          setSelectedAddressId(addressesData[0].id);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load addresses',
          variant: 'destructive',
        });
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchData();
  }, [accessToken, navigate]);

  const handleCreateNewAddress = async () => {
    try {
      // Validate
      if (!newAddress.recipient_name || !newAddress.street_address || !newAddress.city || !newAddress.region || !newAddress.recipient_phone) {
        toast({
          title: 'Missing Fields',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const created = await usersAPI.createAddress(accessToken!, newAddress);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      setNewAddress({
        recipient_name: '',
        street_address: '',
        city: '',
        region: '',
        gps_address: '',
        recipient_phone: '',
      });
      
      toast({
        title: 'Success',
        description: 'Address added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddressId) {
        toast({
          title: 'Error',
          description: 'Please select a delivery address',
          variant: 'destructive',
        });
        return;
      }

      setCreatingOrder(true);

      const order = await ordersAPI.create(
        accessToken!,
        selectedAddressId,
        paymentMethod,
        specialInstructions
      );

      toast({
        title: 'Success',
        description: 'Order created successfully. Proceeding to payment...',
      });

      // Redirect to payment page with order ID
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loadingCart || loadingAddresses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <Button onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const deliveryFee = 5;
  const total = cart.subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>

              {addresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <label className="block text-sm font-medium">Select Delivery Address</label>
                  <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id}>
                          <div className="text-sm">
                            <div className="font-medium">{addr.recipient_name}</div>
                            <div className="text-gray-600">{addr.street_address}, {addr.city}, {addr.region}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* New Address Form */}
              {showNewAddressForm ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Recipient Name"
                    value={newAddress.recipient_name}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                  />
                  <Input
                    placeholder="Street Address"
                    value={newAddress.street_address}
                    onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                  <Input
                    placeholder="Region"
                    value={newAddress.region}
                    onChange={(e) => setNewAddress({ ...newAddress, region: e.target.value })}
                  />
                  <Input
                    placeholder="GPS Address (optional)"
                    value={newAddress.gps_address}
                    onChange={(e) => setNewAddress({ ...newAddress, gps_address: e.target.value })}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newAddress.recipient_phone}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_phone: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateNewAddress}
                      className="flex-1"
                    >
                      Save Address
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewAddressForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add New Address
                </Button>
              )}
            </Card>

            {/* Payment Method Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={24} className="text-green-600" />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Select Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">
                      Mobile Money (MTN, Vodafone, AirtelTigo)
                    </SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'mobile_money' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You'll receive a prompt on your mobile phone to complete the payment
                  </AlertDescription>
                </Alert>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pay to the delivery driver when your order arrives
                  </AlertDescription>
                </Alert>
              )}
            </Card>

            {/* Special Instructions Section */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Special Instructions</h2>
              <Textarea
                placeholder="Add any special delivery instructions (optional)"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={4}
              />
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="mb-6 pb-6 border-b max-h-48 overflow-y-auto">
                <h3 className="text-sm font-medium mb-3">Items</h3>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="text-sm flex justify-between">
                      <span className="text-gray-600">
                        {item.product_name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        ₵{(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₵{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₵{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">₵{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Validation Alert */}
              {!selectedAddressId && (
                <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-600">
                    Please select a delivery address
                  </AlertDescription>
                </Alert>
              )}

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || creatingOrder}
                className="w-full"
                size="lg"
              >
                {creatingOrder ? (
                  <>
                    <Loader size={20} className="animate-spin mr-2" />
                    Creating Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing an order, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
