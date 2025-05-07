import bannerImg from '../../assets/necklace.jpg';
import { Button } from '../ui/button';
import { Gift } from 'lucide-react';

const Banner = () => {
  return (
    <div className="relative max-w-7xl mx-auto my-16 md:my-24 px-6 sm:px-48 py-8 sm:py-12 w-full overflow-hidden sm:rounded-lg">
      <div className="absolute inset-0">
        <img
          src={bannerImg}
          alt="Custom Package Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 sm:bg-black/60" />
      </div>
      
      <div className="relative">
        <div className="max-w-2xl rounded-lg sm:rounded-none bg-black/30 sm:bg-transparent p-4 sm:p-0">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
              Custom Package Request
            </h2>
          </div>
          
          <p className="text-sm sm:text-lg text-white/90 mb-4 sm:mb-5">
            Looking for something special? We create custom packages tailored to your needs. 
            Perfect for corporate gifts, special occasions, or unique requests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              className="bg-white text-[#1A1A1A] hover:bg-white/90 h-9 sm:h-12 text-sm sm:text-base"
              size="lg"
            >
              Request Custom Package
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;