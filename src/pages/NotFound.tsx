import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-[#1A1A1A]">404</h1>
        <h2 className="text-2xl font-semibold text-[#1A1A1A]">Page Not Found</h2>
        <p className="text-[#666666] max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90">
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound; 