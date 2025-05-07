import img1 from "../assets/necklace.jpg"
import img2 from "../assets/watch.jpg";
import img3 from "../assets/heroimg.jpg";


export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}



export const categories: Category[] = [
  {
    id: '1',
    name: 'Watches',
    image: img1,
    description: 'Luxury timepieces'
  },
  {
    id: '2',
    name: 'Jewelry',
    image: img2,
    description: 'Elegant accessories'
  },
  {
    id: '3',
    name: 'Bags',
    image: img3,
    description: 'Designer handbags'
  },
  {
    id: '4',
    name: 'Shoes',
    image: img3,
    description: 'Premium footwear'
  },
  {
    id: '5',
    name: 'Accessories',
    image: img3,
    description: 'Style essentials'
  }
]; 