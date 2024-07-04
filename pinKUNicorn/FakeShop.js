import axios from 'axios';

const fetchProducts = async () => {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    const products = await response.json();
    return products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.count, // Ensure stock is part of the product data
      rating: product.rating // Ensure rating is part of the product data
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export default fetchProducts;
