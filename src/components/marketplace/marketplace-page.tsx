'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Leaf,
  ShoppingCart,
  Phone,
  Filter,
  Star,
  PackageOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  farmer: string;
  quantity: number;
  location: string;
  isOrganic: boolean;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Wheat',
    price: 45,
    unit: 'kg',
    category: 'Grains',
    farmer: 'Sunita Devi',
    quantity: 500,
    location: 'Punjab',
    isOrganic: true,
  },
  {
    id: '2',
    name: 'Fresh Tomatoes',
    price: 30,
    unit: 'kg',
    category: 'Vegetables',
    farmer: 'Sunita Devi',
    quantity: 200,
    location: 'Punjab',
    isOrganic: true,
  },
  {
    id: '3',
    name: 'Basmati Rice',
    price: 120,
    unit: 'kg',
    category: 'Grains',
    farmer: 'Vikram Singh',
    quantity: 1000,
    location: 'Amritsar',
    isOrganic: false,
  },
  {
    id: '4',
    name: 'Fresh Potatoes',
    price: 20,
    unit: 'kg',
    category: 'Vegetables',
    farmer: 'Ramesh Kumar',
    quantity: 800,
    location: 'Jalandhar',
    isOrganic: false,
  },
  {
    id: '5',
    name: 'Organic Spinach',
    price: 25,
    unit: 'kg',
    category: 'Vegetables',
    farmer: 'Sunita Devi',
    quantity: 150,
    location: 'Punjab',
    isOrganic: true,
  },
  {
    id: '6',
    name: 'Seasonal Fruits',
    price: 60,
    unit: 'kg',
    category: 'Fruits',
    farmer: 'Anil Verma',
    quantity: 300,
    location: 'Himachal',
    isOrganic: false,
  },
];

const categoryGradients: Record<string, string> = {
  Vegetables: 'from-green-100 to-emerald-50 text-emerald-600',
  Grains: 'from-amber-100 to-yellow-50 text-amber-600',
  Fruits: 'from-pink-100 to-rose-50 text-rose-600',
  Dairy: 'from-blue-100 to-sky-50 text-blue-600',
};

export default function MarketplacePage() {
  const { setCurrentPage } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [organicOnly, setOrganicOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    let results = [...sampleProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.farmer.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      results = results.filter((p) => p.category === categoryFilter);
    }

    if (organicOnly) {
      results = results.filter((p) => p.isOrganic);
    }

    return results;
  }, [searchQuery, categoryFilter, organicOnly]);

  const handleAddToCart = (product: Product) => {
    toast.success(`${product.name} added to cart!`);
  };

  const handleContactFarmer = (product: Product) => {
    toast.info(`Contact request sent to ${product.farmer}. They will reach out to you soon.`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30">
      <FoodPatternBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>← Back to Home</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Farmer Marketplace
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Buy fresh produce directly from farmers
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, farmers, or locations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Vegetables">Vegetables</SelectItem>
              <SelectItem value="Grains">Grains</SelectItem>
              <SelectItem value="Fruits">Fruits</SelectItem>
              <SelectItem value="Dairy">Dairy</SelectItem>
            </SelectContent>
          </Select>

          {/* Organic Toggle */}
          <div className="flex items-center gap-2 rounded-lg border px-4 py-2 bg-white">
            <Checkbox
              id="organic-only"
              checked={organicOnly}
              onCheckedChange={(checked) => setOrganicOnly(checked === true)}
              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <Label
              htmlFor="organic-only"
              className="text-sm font-medium cursor-pointer flex items-center gap-1.5 select-none"
            >
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              Organic Only
            </Label>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {filteredProducts.length}
            </span>{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
            {organicOnly && (
              <Badge
                variant="secondary"
                className="ml-2 bg-emerald-100 text-emerald-700"
              >
                <Leaf className="h-3 w-3 mr-1" />
                Organic
              </Badge>
            )}
          </p>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                  {/* Product Image Placeholder */}
                  <div
                    className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${
                      categoryGradients[product.category] ||
                      'from-gray-100 to-gray-50'
                    }`}
                  >
                    <Leaf className="h-12 w-12 opacity-40" />
                    {/* Organic badge */}
                    {product.isOrganic && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-600 text-white border-none">
                          <Leaf className="h-3 w-3 mr-1" />
                          Organic
                        </Badge>
                      </div>
                    )}
                    {/* Price tag */}
                    <div className="absolute bottom-3 right-3">
                      <div className="rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{product.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {product.name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Farmer</span>
                        <span className="font-medium text-gray-700">
                          {product.farmer}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-medium text-gray-700">
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          Location
                        </span>
                        <span className="font-medium text-gray-700">
                          {product.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleContactFarmer(product)}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16 px-8"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-6">
              <PackageOpen className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-center text-muted-foreground max-w-md mb-6">
              No products match your current filters. Try adjusting your search
              or category to find what you&apos;re looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setOrganicOnly(false);
              }}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
