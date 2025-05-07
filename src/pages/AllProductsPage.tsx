import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Product from '../components/products/Product';
import { featuredProducts } from '../data/products';
import { categories } from '../data/categories';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { Button } from '../components/ui/button';
import { Filter } from 'lucide-react';

const AllProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get category from URL on initial load
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? featuredProducts.filter(product => product.category === selectedCategory)
    : featuredProducts;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4" />
            {selectedCategory ? `Filter: ${selectedCategory}` : 'Filter Products'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className={`lg:w-64 space-y-4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#8B5E3C] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-[#8B5E3C] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                {selectedCategory ? selectedCategory : 'All Products'}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProductsPage; 