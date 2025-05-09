import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-[#8B5E3C] mb-4">Eschique</h3>
            <p className="text-gray-600">
              Your one-stop shop for all your needs.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-[#8B5E3C]">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-[#8B5E3C]">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-[#8B5E3C]">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-[#8B5E3C]">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-600 hover:text-[#8B5E3C]">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-[#8B5E3C]">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-[#8B5E3C]">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Eschique. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 