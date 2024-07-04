import axios from 'axios';

const fetchProducts = async () => {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    //console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

export default fetchProducts;
