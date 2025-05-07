import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Save items you love to your wishlist.</p>
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Wishlist Items */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">My Wishlist ({items.length})</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border overflow-hidden group">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                      <Button
                        className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90"
                        onClick={() => addToCart(item, 1)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage; 