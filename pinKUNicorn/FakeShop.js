import axios from 'axios';

const API_URL = 'https://fakestoreapi.com/products';

const newProducts = [
  { 
    "id": "21",
    "title": "Rugged Outdoor Smartwatch",
    "price": "249.99",
    "description": "Water-resistant smartwatch with GPS, heart rate monitor, and long battery life. Perfect for tracking hikes and outdoor activities.",
    "image": "https://m.media-amazon.com/images/I/81woasfZWKL._AC_SL1500_.jpg",
    "category": "electronics"
  },
  {
    "id": "22",
    "title": "Portable Solar Power Bank",
    "price": "59.99",
    "description": "High-capacity solar-powered charger for keeping devices powered during outdoor adventures.",
    "image": "https://down-sg.img.susercontent.com/file/sg-11134201-7rbka-lozeyf8m9a5h73",
    "category": "electronics"
  },
  {
    "id": "23",
    "title": "Weatherproof Bluetooth Speaker",
    "price": "89.99",
    "description": "Durable, water-resistant speaker for enjoying music outdoors. Features long battery life and excellent sound quality.",
    "image": "https://m.media-amazon.com/images/I/71zDU8JBLZL._AC_SL1500_.jpg",
    "category": "electronics"
  },
  {
    "id": "24",
    "title": "Advanced Handheld GPS Device",
    "price": "299.99",
    "description": "High-precision GPS for hiking and outdoor navigation, with preloaded maps and long battery life.",
    "image": "https://m.media-amazon.com/images/I/61tQIU28AsL._AC_SL1500_.jpg",
    "category": "electronics"
  },
  {
    "id": "25",
    "title": "Outdoor Survival Multi-tool",
    "price": "79.99",
    "description": "Compact multi-tool with various functions including knife, pliers, saw, and bottle opener. Essential for outdoor enthusiasts.",
    "image": "https://m.media-amazon.com/images/I/81RXx7BgrzL._AC_SL1479_.jpg",
    "category": "outdoor gear"
  },
  {"id": "26",
    "title": "Waterproof Action Camera",
    "price": "199.99",
    "description": "High-resolution, shock-resistant camera for capturing outdoor adventures in stunning detail.",
    "image": "https://m.media-amazon.com/images/I/41Ie7ejmtbL._AC_SL1000_.jpg",
    "category": "electronics"
  },
  {
    "id": "27",
    "title": "Smart Outdoor Grill Thermometer",
    "price": "69.99",
    "description": "Bluetooth-enabled meat thermometer for perfect grilling results. Sends notifications to smartphone.",
    "image": "https://m.media-amazon.com/images/I/71xNVR+bC-L._SL1500_.jpg",
    "category": "electronics"
  },
  {
    "id": "28",
    "title": "High-Performance Hiking Boots",
    "price": "159.99",
    "description": "Waterproof, breathable hiking boots with excellent traction and ankle support for challenging terrains.",
    "image": "https://m.media-amazon.com/images/I/71GWNsIg32L._AC_SY695_.jpg",
    "category": "outdoor gear"
  },
  {
    "id": "29",
    "title": "Compact Drone with HD Camera",
    "price": "399.99",
    "description": "Easy-to-use drone for capturing breathtaking aerial footage of outdoor landscapes.",
    "image": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR4BlM4ZHX2DDwNe8_DUtT8BIOcKZK_RpYokRz5kX8up_vPsbowTrlEAtBjX0Ig6MdUDTUzB1uiLAtIbvAYTZ5TsEHkGmCXA_M-cAymf-V_pPs-Vf2zHRYF_g&usqp=CAE",
    "category": "electronics"
  },
  {
    "id": "30",
    "title": "Smart Insulated Water Bottle",
    "price": "39.99",
    "description": "Vacuum-insulated bottle with built-in LED display showing water temperature and reminders to stay hydrated.",
    "image": "https://m.media-amazon.com/images/I/61ECosGPAVL._AC_UF894,1000_QL80_.jpg",
    "category": "outdoor gear"
  }
];

const fetchProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    let products = response.data;

    // Combine existing products with new products
    const existingIds = new Set(products.map(p => p.id));
    const filteredNewProducts = newProducts.filter(p => !existingIds.has(p.id));
    products = [...products, ...filteredNewProducts];

    return products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export default fetchProducts;