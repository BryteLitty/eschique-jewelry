import Header from "../components/shared/Header"
import HeroSection from "../components/homepage/HeroSection"
import FeaturedProductsPage from "../pages/FeaturedProductsPage"
import ProductCategories from "../components/products/ProductCategories"
import Banner from "../components/products/Banner"
import Footer from '../components/shared/Footer'

const Homepage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedProductsPage />
      <ProductCategories />
      <Banner />
      <Footer />
    </div>
  )
}

export default Homepage