import { useParams, useLocation } from 'react-router-dom';
import { featuredProducts } from '../data/products';
import ProductDetails from '../components/products/ProductDetails';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import type { Product } from '../types/product';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const productFromState = location.state?.product as Product | undefined;
  
  // Try to get product from state first, then fallback to finding it in featuredProducts
  const product = productFromState || featuredProducts.find(p => p.id === String(id));

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Product not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <ProductDetails product={product} />
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;