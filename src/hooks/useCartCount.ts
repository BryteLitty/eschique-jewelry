import { useCartQuery } from './useCartQuery';

export const useCartCount = () => {
  const { cartItems } = useCartQuery();
  
  const count = cartItems?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  
  return count;
};