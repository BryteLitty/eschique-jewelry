import { BrowserRouter as Router } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { CartProvider } from './contexts/CartContext';
import AppRoutes from './routes';

function App() {
  return (
    <QueryProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </QueryProvider>
  );
}

export default App; 