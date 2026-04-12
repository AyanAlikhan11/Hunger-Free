'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Upload,
  MapPin,
  Camera,
  Leaf,
  Apple,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/maps/map-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-60 rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

const categories = [
  'Cooked Food',
  'Vegetables',
  'Fruits & Dairy',
  'Grains',
  'Bakery',
  'Beverages',
  'Other',
];

const units = ['servings', 'kg', 'pieces', 'liters', 'boxes'];

export default function DonateFoodPage() {
  const { setCurrentPage, user, isAuthenticated, _hasHydrated, authToken } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pickupPoint, setPickupPoint] = useState<{ lat: number; lng: number } | null>(null);
const [deliveryMode, setDeliveryMode] = useState<'ngo' | 'direct'>('ngo');

  useEffect(() => {
    if (_hasHydrated) setHydrated(true);
  }, [_hasHydrated]);

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'servings',
    expiryDate: '',
    address: '',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Simulate upload
    setUploadedImage('uploaded');
    toast.success('Image uploaded successfully!');
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = () => {
    setUploadedImage('uploaded');
    toast.success('Image uploaded successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!user || !authToken) {
    toast.error('You must be logged in to donate food.');
    return;
  }
  if (!pickupPoint) {
  toast.error('Please pick a pickup location on the map.');
  return;
}

  setIsSubmitting(true);

  try {
    const payload = {
      foodName: formData.foodName,
      description: formData.description,
      category: formData.category,
      quantity: formData.quantity,
      unit: formData.unit,
      expiryTime: formData.expiryDate
        ? new Date(formData.expiryDate).toISOString()
        : undefined,
      address: formData.address,
      // if you don't have real map yet, keep dummy coords:
      lat: 19.076,
      lng: 72.8777,
      // imageUrl: (later from Firebase Storage)
      deliveryMode, // NEW
    };

    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast.success('Food donation listed successfully! Thank you for your generosity.');
      setFormData({
        foodName: '',
        description: '',
        category: '',
        quantity: '',
        unit: 'servings',
        expiryDate: '',
        address: '',
        notes: '',
      });
      setUploadedImage(null);
      setCurrentPage('available-food');
    } else {
      const data = await response.json().catch(() => null);
      toast.error(data?.error || 'Failed to list donation. Please try again.');
    }
  } catch {
    toast.error('Something went wrong. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Show auth message if not logged in
  if (hydrated && !isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30">
        <FoodPatternBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>← Back to Home</span>
          </button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-6">
              <Heart className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You need to be logged in to donate food. Please sign up or log in to share your surplus food with those in need.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentPage('login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Log In
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage('signup')}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                Sign Up
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          {/* Form Section */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Donate Food
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Share your surplus food and help reduce hunger in your community
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Food Name */}
                  <div className="space-y-2">
                    <Label htmlFor="foodName" className="text-sm font-medium">
                      Food Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="foodName"
                      name="foodName"
                      placeholder="e.g., Fresh Vegetable Curry"
                      value={formData.foodName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the food item, ingredients, and condition"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Food Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
  <Label className="text-sm font-medium">
    Delivery Preference <span className="text-red-500">*</span>
  </Label>
  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => setDeliveryMode('ngo')}
      className={`rounded-xl border-2 p-3 text-left transition-all ${
        deliveryMode === 'ngo'
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="font-semibold text-sm text-gray-900">Deliver to NGO</div>
      <div className="text-xs text-gray-500">NGO receives & distributes</div>
    </button>

    <button
      type="button"
      onClick={() => setDeliveryMode('direct')}
      className={`rounded-xl border-2 p-3 text-left transition-all ${
        deliveryMode === 'direct'
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="font-semibold text-sm text-gray-900">Direct Delivery</div>
      <div className="text-xs text-gray-500">Deliver to a verified needy recipient</div>
    </button>
  </div>
</div>

                  {/* Quantity and Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        placeholder="e.g., 50"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Unit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, unit: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Expiry Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-sm font-medium">
                      Expiry Date & Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="datetime-local"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Pickup Location */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
                      Pickup Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="address"
                      placeholder="Enter pickup address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                    {/* Map Placeholder */}
                    <div className="relative flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 border border-dashed border-emerald-200">
                      <div className="flex flex-col items-center gap-2 text-emerald-600">
                        <MapPin className="h-8 w-8" />
                        <span className="text-sm font-medium">Map Integration</span>
                        <span className="text-xs text-emerald-500">
                          Interactive map coming soon
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* new map integration */}
                  <MapPicker value={pickupPoint} onChange={setPickupPoint} height={240} />

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Food Image
                    </Label>
                    {uploadedImage ? (
                      <div className="relative mt-2">
                        <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-amber-50 border overflow-hidden">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-200/60">
                              <Camera className="h-10 w-10 text-emerald-600" />
                            </div>
                            <p className="text-sm font-medium text-emerald-700">
                              food-preview.jpg
                            </p>
                            <button
                              type="button"
                              onClick={() => setUploadedImage(null)}
                              className="text-xs text-red-500 hover:text-red-600 underline"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleFileClick}
                        className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                          isDragOver
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-300 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        <Upload
                          className={`h-10 w-10 mb-3 ${
                            isDragOver ? 'text-emerald-500' : 'text-gray-400'
                          }`}
                        />
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Supports: JPG, PNG (Max 5MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Additional Notes{' '}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special instructions for pickup, allergen info, etc."
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold rounded-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Listing Donation...
                      </span>
                    ) : (
                      'List Food Donation'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Side Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex lg:col-span-2 flex-col justify-center items-center"
          >
            <div className="relative">
              {/* Main illustration card */}
              <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Heart className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Make a Difference
                  </h3>
                  <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                    Every donation counts. Your surplus food can feed families in
                    need and help build a hunger-free community.
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="rounded-xl bg-white/10 p-4 text-center">
                      <p className="text-2xl font-bold">2.5K+</p>
                      <p className="text-xs text-emerald-100">Donations Made</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4 text-center">
                      <p className="text-2xl font-bold">10K+</p>
                      <p className="text-xs text-emerald-100">Meals Served</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400 shadow-lg"
              >
                <Apple className="h-7 w-7 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400 shadow-lg"
              >
                <Leaf className="h-6 w-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                className="absolute top-1/2 -right-8 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-300 shadow-lg"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
            </div>

            {/* How it works */}
            <div className="mt-10 w-full max-w-sm">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                How it works
              </h4>
              <div className="space-y-4">
                {[
                  { step: '1', text: 'List your surplus food' },
                  { step: '2', text: 'NGOs request pickups' },
                  { step: '3', text: 'Volunteers deliver to those in need' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      {item.step}
                    </div>
                    <p className="text-sm text-gray-600 pt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
