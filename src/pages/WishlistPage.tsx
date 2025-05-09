import { useWishlist } from '../hooks/useWishlist';
import { Button } from '../components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your wishlist yet.</p>
            <Link to="/products">
              <Button className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Wishlist ({wishlistItems.length})</h1>
          <Link to="/products" className="text-[#8B5E3C] hover:text-[#8B5E3C]/80 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border p-4">
              <div className="relative">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>
              <h3 className="font-medium text-lg mb-2">{item.product.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">GH₵ {item.product.price.toFixed(2)}</span>
                <Link to={`/products/${item.product.id}`}>
                  <Button variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage; 