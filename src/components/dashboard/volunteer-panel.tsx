'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Package,
  CheckCircle2,
  Truck,
  Star,
  MapPin,
  Clock,
  User,
  Building2,
  Navigation,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';

interface PickupRequest {
  id: string;
  food: string;
  quantity: string;
  donor: string;
  location: string;
  ngo: string;
  distance: string;
}

interface ActiveDelivery {
  id: string;
  food: string;
  from: string;
  to: string;
  status: 'accepted' | 'picked_up' | 'in_transit';
}

const pickupRequests: PickupRequest[] = [
  {
    id: '1',
    food: 'Cooked Rice & Curry',
    quantity: '50 servings',
    donor: 'Rajesh Kumar',
    location: 'Andheri, Mumbai',
    ngo: 'Feed The Children',
    distance: '3.2 km',
  },
  {
    id: '2',
    food: 'Fresh Vegetables',
    quantity: '20 kg',
    donor: 'Meera Household',
    location: 'Juhu, Mumbai',
    ngo: 'Helping Hands NGO',
    distance: '5.1 km',
  },
  {
    id: '3',
    food: 'Bread & Bakery Items',
    quantity: '30 pieces',
    donor: 'Green Valley Restaurant',
    location: 'Bandra, Mumbai',
    ngo: 'Food For All',
    distance: '2.8 km',
  },
];

const activeDeliveries: ActiveDelivery[] = [
  {
    id: '1',
    food: 'Vegetable Biryani',
    from: 'Spice Kitchen, Dadar',
    to: 'Feed The Children, Andheri',
    status: 'picked_up',
  },
  {
    id: '2',
    food: 'Fresh Fruits Basket',
    from: 'City Market, Crawford',
    to: 'Helping Hands, Juhu',
    status: 'accepted',
  },
  {
    id: '3',
    food: 'Rice & Dal Packets',
    from: 'Community Hall, Powai',
    to: 'Food For All, Goregaon',
    status: 'in_transit',
  },
];

const deliverySteps = [
  { key: 'requested', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'delivered', label: 'Delivered' },
];

function getStatusIndex(status: string): number {
  const statusMap: Record<string, number> = {
    accepted: 1,
    picked_up: 2,
    in_transit: 2,
    delivered: 3,
  };
  return statusMap[status] || 0;
}

function getDeliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    accepted: 'Accepted - Ready to Pickup',
    picked_up: 'Picked Up - In Transit',
    in_transit: 'In Transit - Almost There',
  };
  return labels[status] || status;
}

const stats = [
  {
    label: 'Active Deliveries',
    value: 3,
    icon: Truck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    label: 'Completed Today',
    value: 2,
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Total Delivered',
    value: 45,
    icon: Package,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    label: 'Rating',
    value: '4.9/5',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function VolunteerPanel() {
  const { setCurrentPage } = useAppStore();
  const [requests, setRequests] = useState<PickupRequest[]>(pickupRequests);

  const handleAcceptPickup = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast.success('Pickup request accepted! Navigate to the donor location to collect the food.');
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
            Volunteer Panel
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Accept and manage food pickup deliveries
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Available Pickup Requests */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Available Pickup Requests
                </h2>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {requests.length} pending
                </Badge>
              </div>

              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">
                                  {request.food}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {request.quantity}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {request.donor}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {request.ngo}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {request.location}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Navigation className="h-3.5 w-3.5 shrink-0" />
                                  <span>{request.distance}</span>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAcceptPickup(request.id)}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
                            >
                              Accept Pickup
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      All caught up!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No pending pickup requests right now. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* My Active Deliveries */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  My Active Deliveries
                </h2>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {activeDeliveries.length} active
                </Badge>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {activeDeliveries.map((delivery, index) => {
                  const currentStep = getStatusIndex(delivery.status);
                  return (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-5">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {delivery.food}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {delivery.from}
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            → {delivery.to}
                          </p>

                          {/* Progress Steps */}
                          <div className="relative mb-3">
                            <div className="flex items-center justify-between">
                              {deliverySteps.map((step, stepIndex) => (
                                <div
                                  key={step.key}
                                  className="flex flex-col items-center z-10"
                                >
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                      stepIndex <= currentStep
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {stepIndex < currentStep ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      stepIndex + 1
                                    )}
                                  </div>
                                  <span
                                    className={`mt-1.5 text-[10px] ${
                                      stepIndex <= currentStep
                                        ? 'text-emerald-600 font-medium'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {/* Progress bar background */}
                            <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-gray-200 -z-0" />
                            {/* Progress bar fill */}
                            <div
                              className="absolute top-3.5 left-4 h-0.5 bg-emerald-500 -z-0 transition-all duration-500"
                              style={{
                                width: `${
                                  (currentStep / (deliverySteps.length - 1)) * 100
                                }%`,
                              }}
                            />
                          </div>

                          <Badge
                            variant="outline"
                            className="w-full justify-center text-xs border-emerald-200 text-emerald-700 bg-emerald-50/50"
                          >
                            {getDeliveryStatusLabel(delivery.status)}
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
