import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImageUpload } from '../../components/ui/image-upload';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
  category_id: string;
  created_at: string;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  image_url: z.string().min(1, 'Image is required'),
  in_stock: z.boolean(),
  stock_quantity: z.number().min(0, 'Stock quantity must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  featured: z.boolean(),
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [stockStatus, setStockStatus] = useState<string>('all');
  const [showFeatured, setShowFeatured] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image_url: '',
      in_stock: true,
      stock_quantity: 0,
      category_id: '',
      featured: false,
    },
  });

  const imageUrl = watch('image_url');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, priceRange, stockStatus, showFeatured]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply price range filter
      const [minPrice, maxPrice] = priceRange;
      query = query.gte('price', minPrice);
      if (maxPrice < 1000) { // Only apply max price if it's not the default max
        query = query.lte('price', maxPrice);
      }

      if (stockStatus && stockStatus !== 'all') {
        query = query.eq('in_stock', stockStatus === 'in_stock');
      }

      if (showFeatured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('image_url', product.image_url);
    setValue('in_stock', product.in_stock);
    setValue('stock_quantity', product.stock_quantity);
    setValue('category_id', product.category_id);
    setValue('featured', product.featured);
    setIsDialogOpen(true);
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !product.featured })
        .eq('id', product.id);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      setIsDeleting(productId);
      
      // Get the product to delete
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) throw deleteError;

      // Delete the image from storage if it exists
      if (product?.image_url) {
        const filePath = product.image_url.split('/').pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('products')
            .remove([`products/${filePath}`]);

          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      await fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)
          .select();

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data]);

        if (error) throw error;
      }

      await fetchProducts();
      setIsDialogOpen(false);
      setEditingProduct(null);
      reset();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStock = async (productId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0 
        })
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white/95">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input {...register('name')} />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input {...register('description')} />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => setValue('image_url', url)}
                  onError={(error) => setUploadError(error)}
                  folder="products"
                />
                {errors.image_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                )}
                {uploadError && (
                  <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  {...register('category_id')}
                  className="w-full p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    {...register('stock_quantity', { valueAsNumber: true })}
                  />
                  {errors.stock_quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock_quantity.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="in_stock"
                    {...register('in_stock')}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="in_stock" className="text-sm font-medium">
                    In Stock
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Product
                </label>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {editingProduct ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Add Product'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">GH₵{priceRange[0]}</span>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={1000}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm">GH₵{priceRange[1]}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={stockStatus} onValueChange={setStockStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={showFeatured}
              onCheckedChange={setShowFeatured}
              id="featured-filter"
            />
            <label htmlFor="featured-filter" className="text-sm font-medium">
              Show Featured Only
            </label>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>GH₵ {product.price.toFixed(2)}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.category_id)?.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStock(product.id, product.stock_quantity - 1)}
                      disabled={product.stock_quantity <= 0}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{product.stock_quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStock(product.id, product.stock_quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(product)}
                    className={product.featured ? 'text-yellow-500' : 'text-gray-400'}
                  >
                    <Star className="w-4 h-4" fill={product.featured ? 'currentColor' : 'none'} />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(product)}
                      disabled={isSubmitting}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600"
                      onClick={() => openDeleteDialog(product)}
                      disabled={isDeleting === product.id}
                    >
                      {isDeleting === product.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-white/95">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && handleDelete(productToDelete.id)}
              disabled={isDeleting === productToDelete?.id}
            >
              {isDeleting === productToDelete?.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 