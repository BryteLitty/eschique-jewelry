import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useCartQuery } from '../../hooks/useCartQuery';
import { useWishlist } from '../../hooks/useWishlist';
import type { Product as SupabaseProduct } from '../../hooks/useProducts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface ProductCardProps {
  product: SupabaseProduct;
}

const Product = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart } = useCartQuery();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check if product is in wishlist when component mounts
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Check if product is in cart
  const isInCart = cartItems?.some(item => item.product_id === product.id);

  return (
    <>
      <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden group">
        <div className="p-0">
          <div 
            className="relative aspect-[5/3] sm:aspect-[3/2] overflow-hidden cursor-pointer"
            onClick={handleProductClick}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-semibold">Out of Stock</span>
              </div>
            )}
            <button
              onClick={handleWishlistToggle}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors cursor-pointer ${
                isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-500 hover:bg-red-50'
              }`}
            >
              <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div 
          className="p-1.5 sm:p-2.5 cursor-pointer"
          onClick={handleProductClick}
        >
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-extrabold text-2xl md:text-1xl text-[#1A1A1A] line-clamp-1">{product.name}</h3>
            <p className="text-lg md:text-1xl font-bold text-[#666666] line-clamp-1 sm:line-clamp-2">{product.description}</p>
            <p className="text-lg md:text-1xl font-extrabold text-[#1A1A1A]">
              GH₵ {product.price.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="p-1.5 sm:p-2.5 pt-0">
          <Button 
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-10 sm:h-12 text-xs sm:text-sm cursor-pointer"
            disabled={!product.in_stock || addToCart.isPending}
            size="lg"
            onClick={handleAddToCart}
          >
            {addToCart.isPending ? 'Adding...' : isInCart ? 'In Cart' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to add items to your cart or wishlist.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLoginDialog(false);
                navigate('/login');
              }}
            >
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Product;