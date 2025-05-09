import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/category-slider.css";

const ProductCategories = () => {
  const navigate = useNavigate();
  const { categories, loading } = useCategories();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 3,
          dots: true,
          centerMode: true,
          centerPadding: '20px',
          arrows: false,
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="w-full px-0 sm:px-4 py-12 sm:py-20">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 sm:mb-14 text-center">View By Category</h2>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 py-12 sm:py-20">
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 sm:mb-14 text-center">View By Category</h2>
      <div className="w-full sm:max-w-6xl mx-auto">
        <Slider {...settings} className="category-slider">
          {categories.map((category) => (
            <div key={category.id} className="px-2">
              <div 
                className="relative aspect-square w-16 sm:w-32 md:w-36 lg:w-40 mx-auto rounded-full overflow-hidden group cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/70 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 text-white">
                  <h3 className="font-medium text-xs sm:text-sm">{category.name}</h3>
                  <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 sm:mt-1 hidden sm:block">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ProductCategories;