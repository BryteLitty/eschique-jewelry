import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products">
              <Button className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90">
                Continue Shopping
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
          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Shopping Cart ({totalItems})</h1>
              <Link to="/products" className="text-[#8B5E3C] hover:text-[#8B5E3C]/80 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-6 p-4 bg-white rounded-lg border">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{item.product.description}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-500 hover:text-red-500 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-gray-600">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-12">
                  Proceed to Checkout
                </Button>
                <div className="text-center text-sm text-gray-500">
                  <p>We accept:</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <span>Visa</span>
                    <span>•</span>
                    <span>Mastercard</span>
                    <span>•</span>
                    <span>PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage; 