import Product from '../components/products/Product';
import { useProducts } from '../hooks/useProducts';
import { Link } from 'react-router-dom';

const FeaturedProductsPage = () => {
  const { products: featuredProducts, loading } = useProducts({ featured: true, limit: 3 });

  if (loading) {
    return (
      <div className="container max-w-8xl mx-auto px-6 sm:px-48 py-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Featured Products</h1>
          <Link to="/products" className="text-sm font-medium text-[#8B5E3C] hover:text-[#1A1A1A]/80">
            See All Products
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-8xl mx-auto px-6 sm:px-48 py-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Featured Products</h1>
        <Link to="/products" className="text-sm font-medium text-[#8B5E3C] hover:text-[#1A1A1A]/80">
          See All Products
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {featuredProducts.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProductsPage;