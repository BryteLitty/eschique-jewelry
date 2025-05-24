import HeroImage from "../../assets/heroimg.jpg"
import { Link } from "react-router-dom"
import Logo from "../../assets/logo.png"

const HeroSection = () => {
  return (
    <div 
      className="relative h-[75vh] w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${HeroImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <img src={Logo} alt="E'schique Jewelry" className="h-20 mb-6" />
        
        <h1 className="text-4xl sm:text-4xl md:text-5xl font-montserrat font-bold text-white mb-4">
          E'schique Jewelry
        </h1>
        
        <p className="text-sm font-light sm:text-xl text-white/90 max-w-2xl mb-8 font-montserrat">
          Discover timeless elegance in every piece. Handcrafted jewelry that tells your unique story.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/products" 
            className="px-8 py-3 bg-[#8B5E3C] text-white font-montserrat font-medium rounded-md hover:bg-[#8B5E3C]/90 transition-colors"
          >
            Shop Collection
          </Link>
          {/* <Link 
            to="/about" 
            className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-montserrat font-medium rounded-md hover:bg-white/20 transition-colors"
          >
            Our Story
          </Link> */}
        </div>
      </div>
    </div>
  )
}

export default HeroSection