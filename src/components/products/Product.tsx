import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductCardProps } from '../../types/product';
import { Button } from '../ui/button';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const Product = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden group">
      <div className="p-0">
        <div 
          className="relative aspect-[5/3] sm:aspect-[3/2] overflow-hidden cursor-pointer"
          onClick={handleProductClick}
        >
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold">Out of Stock</span>
            </div>
          )}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <Heart 
              className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
            />
          </button>
        </div>
      </div>
      <div 
        className="p-1.5 sm:p-2.5 cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] line-clamp-1">{product.name}</h3>
          <p className="text-[10px] sm:text-xs text-[#666666] line-clamp-1 sm:line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-[#8B5E3C] text-[#8B5E3C]" />
            <span className="text-[10px] sm:text-xs font-medium">{product.rating}</span>
            <span className="text-[10px] sm:text-xs text-[#666666]">({product.reviews})</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="p-1.5 sm:p-2.5 pt-0">
        <Button 
          className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-8 sm:h-12 text-xs sm:text-sm"
          disabled={!product.inStock}
          size="lg"
          onClick={handleAddToCart}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};

export default Product;