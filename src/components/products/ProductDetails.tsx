import { useState } from 'react';
import { Star, Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import type { Product } from '../../types/product';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedImage(product.image)}
              className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#8B5E3C] transition-colors"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </button>
            {/* Add more thumbnail images here */}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 fill-[#8B5E3C] text-[#8B5E3C]" />
                <span className="ml-1 text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-gray-600">{product.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <Button
              className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-12"
              size="lg"
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <Heart className="h-5 w-5" />
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

          {/* Additional Info */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">Product Details</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Category: {product.category}</li>
              <li>• Material: Premium Quality</li>
              <li>• Dimensions: 10 x 5 x 2 inches</li>
              <li>• Weight: 0.5 lbs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;