import type { Product } from '../types/product';

import product1 from '../assets/watch.jpg'
import product2 from '../assets/wrist.jpg'
import product3 from '../assets/necklace.jpg'

export const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Leather Wallet',
    description: 'Handcrafted genuine leather wallet with multiple card slots and coin pocket.',
    price: 49.99,
    image: product1,
    category: 'Accessories',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'Premium Watch',
    description: 'Elegant stainless steel watch with leather strap and minimalist design.',
    price: 199.99,
    image: product2,
    category: 'Accessories',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'Designer Sunglasses',
    description: 'UV-protected polarized sunglasses with lightweight frame and modern style.',
    price: 129.99,
    image: product3,
    category: 'Accessories',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    featured: true
  }
]; 