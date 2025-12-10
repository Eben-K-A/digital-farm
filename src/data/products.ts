import tomatoes from "@/assets/products/tomatoes.jpg";
import plantains from "@/assets/products/plantains.jpg";
import cassava from "@/assets/products/cassava.jpg";
import yam from "@/assets/products/yam.jpg";
import maize from "@/assets/products/maize.jpg";
import mangoes from "@/assets/products/mangoes.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  farmer: string;
  location: string;
  rating: number;
  stock: number;
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    price: 25,
    unit: "kg",
    image: tomatoes,
    category: "Vegetables",
    farmer: "Kofi Mensah",
    location: "Ashanti Region",
    rating: 4.8,
    stock: 150,
    description: "Freshly harvested organic tomatoes from the fertile lands of Ashanti. Perfect for stews, salads, and sauces.",
  },
  {
    id: "2",
    name: "Green Plantains",
    price: 18,
    unit: "bunch",
    image: plantains,
    category: "Fruits",
    farmer: "Ama Darko",
    location: "Eastern Region",
    rating: 4.9,
    stock: 80,
    description: "Premium quality green plantains, ideal for frying, roasting, or making fufu. Sourced directly from family farms.",
  },
  {
    id: "3",
    name: "Fresh Cassava",
    price: 15,
    unit: "kg",
    image: cassava,
    category: "Tubers",
    farmer: "Kwame Asante",
    location: "Volta Region",
    rating: 4.7,
    stock: 200,
    description: "High-quality cassava tubers, perfect for making gari, fufu, or cassava flour. Harvested fresh daily.",
  },
  {
    id: "4",
    name: "Premium Yam",
    price: 35,
    unit: "tuber",
    image: yam,
    category: "Tubers",
    farmer: "Yaw Boateng",
    location: "Brong Ahafo",
    rating: 4.9,
    stock: 60,
    description: "Puna yam variety known for its smooth texture and rich taste. A staple for authentic Ghanaian dishes.",
  },
  {
    id: "5",
    name: "Sweet Maize",
    price: 8,
    unit: "cob",
    image: maize,
    category: "Grains",
    farmer: "Akua Frimpong",
    location: "Greater Accra",
    rating: 4.6,
    stock: 300,
    description: "Fresh sweet corn, perfect for roasting or boiling. Grown using sustainable farming practices.",
  },
  {
    id: "6",
    name: "Ripe Mangoes",
    price: 12,
    unit: "kg",
    image: mangoes,
    category: "Fruits",
    farmer: "Kwesi Appiah",
    location: "Northern Region",
    rating: 4.8,
    stock: 120,
    description: "Juicy, sweet mangoes bursting with tropical flavor. Hand-picked at peak ripeness for maximum sweetness.",
  },
];

export const categories = [
  "All",
  "Vegetables",
  "Fruits",
  "Tubers",
  "Grains",
  "Legumes",
  "Spices",
];

export const regions = [
  "All Regions",
  "Greater Accra",
  "Ashanti Region",
  "Eastern Region",
  "Western Region",
  "Central Region",
  "Volta Region",
  "Northern Region",
  "Upper East Region",
  "Upper West Region",
  "Brong Ahafo",
];
