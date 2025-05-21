import { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import Header from "../components/shared/Header"
import HeroSection from "../components/homepage/HeroSection"
import FeaturedProductsPage from "../pages/FeaturedProductsPage"
import ProductCategories from "../components/products/ProductCategories"
import Banner from "../components/products/Banner"
import Footer from '../components/shared/Footer'

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const { loading: productsLoading } = useProducts({ featured: true, limit: 4 });
  const { loading: categoriesLoading } = useCategories();

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading || productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedProductsPage />
      <ProductCategories />
      <Banner />
      <Footer />
    </div>
  );
}