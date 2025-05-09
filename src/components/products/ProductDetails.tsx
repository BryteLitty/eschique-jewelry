import { useState, useEffect } from 'react';
import { Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCartQuery } from '../../hooks/useCartQuery';
import { useWishlist } from '../../hooks/useWishlist';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
  category_id: string;
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCartQuery();
  const { addToWishlist, removeFromWishlist, isInWishlist, refreshWishlist } = useWishlist();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check if product is in cart
  const isInCart = cartItems?.some(item => item.product_id === product.id);

  // Check if product is in wishlist when component mounts
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.stock_quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlist = async () => {
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
      await refreshWishlist();
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Image */}
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-[#1A1A1A]">
                GH₵ {product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1 || !product.in_stock}
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.stock_quantity || !product.in_stock}
                >
                  +
                </button>
              </div>
              <Button
                className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-12"
                size="lg"
                disabled={!product.in_stock || addToCart.isPending}
                onClick={handleAddToCart}
              >
                {addToCart.isPending ? 'Adding...' : isInCart ? 'In Cart' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 ${isWishlisted ? 'text-red-500' : ''}`}
                onClick={handleWishlist}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#8B5E3C]" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#8B5E3C]" />
                <span className="text-sm">2 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#8B5E3C]" />
                <span className="text-sm">Easy Returns</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-2">Availability</h3>
              <p className={product.in_stock ? 'text-green-600' : 'text-red-600'}>
                {product.in_stock
                  ? `In Stock (${product.stock_quantity} available)`
                  : 'Out of Stock'}
              </p>
            </div>
          </div>
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

export default ProductDetails;