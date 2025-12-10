export const buyerOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "delivered",
    total: 245.00,
    items: [
      { name: "Fresh Tomatoes", quantity: 10, unit: "kg", price: 8.50 },
      { name: "Organic Maize", quantity: 25, unit: "kg", price: 6.20 },
    ],
    farmer: "Kwame Asante",
    deliveryAddress: "123 Independence Ave, Accra",
    rating: 5,
  },
  {
    id: "ORD-002",
    date: "2024-01-18",
    status: "in_transit",
    total: 180.00,
    items: [
      { name: "Fresh Yams", quantity: 15, unit: "kg", price: 12.00 },
    ],
    farmer: "Ama Serwaa",
    deliveryAddress: "45 Liberation Road, Kumasi",
    rating: null,
  },
  {
    id: "ORD-003",
    date: "2024-01-20",
    status: "processing",
    total: 320.00,
    items: [
      { name: "Ripe Plantains", quantity: 20, unit: "bunches", price: 5.00 },
      { name: "Fresh Cassava", quantity: 30, unit: "kg", price: 7.33 },
    ],
    farmer: "Kofi Mensah",
    deliveryAddress: "78 Ring Road, Tamale",
    rating: null,
  },
  {
    id: "ORD-004",
    date: "2024-01-10",
    status: "delivered",
    total: 156.00,
    items: [
      { name: "Sweet Mangoes", quantity: 12, unit: "kg", price: 13.00 },
    ],
    farmer: "Efua Darkwa",
    deliveryAddress: "123 Independence Ave, Accra",
    rating: 4,
  },
];

export const savedAddresses = [
  {
    id: "ADDR-001",
    label: "Home",
    address: "123 Independence Ave, Accra",
    city: "Accra",
    region: "Greater Accra",
    isDefault: true,
    phone: "+233 24 123 4567",
  },
  {
    id: "ADDR-002",
    label: "Office",
    address: "45 Liberation Road",
    city: "Accra",
    region: "Greater Accra",
    isDefault: false,
    phone: "+233 24 987 6543",
  },
  {
    id: "ADDR-003",
    label: "Family House",
    address: "78 Ring Road",
    city: "Kumasi",
    region: "Ashanti",
    isDefault: false,
    phone: "+233 20 555 1234",
  },
];

export const buyerStats = {
  totalOrders: 24,
  totalSpent: 4520.00,
  pendingOrders: 2,
  favoriteProducts: 8,
};
