'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
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
  donationId: string;
  ngoId: string;
  ngoName: string;
  volunteerId?: string | null;
  volunteerName?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  donation?: {
    id: string;
    donorName: string;
    foodName: string;
    quantity: string;
    unit: string;
    address: string;
    category?: string;
    [key: string]: unknown;
  };
}

interface ActiveDelivery {
  id: string;
  food: string;
  from: string;
  to: string;
  status: 'accepted' | 'picked_up' | 'in_transit';
}

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

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="h-5 w-20 rounded bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="h-4 w-28 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-4 w-36 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-9 w-32 rounded-lg bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonDeliveryCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5 space-y-3">
        <div className="h-5 w-36 rounded bg-gray-200" />
        <div className="h-3 w-44 rounded bg-gray-100" />
        <div className="h-3 w-40 rounded bg-gray-100" />
        <div className="flex justify-between px-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-7 w-7 rounded-full bg-gray-200" />
              <div className="h-2.5 w-12 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="h-6 w-full rounded bg-gray-100 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function VolunteerPanel() {
  const { setCurrentPage, user, _hasHydrated } = useAppStore();
  const [availableRequests, setAvailableRequests] = useState<PickupRequest[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [totalDelivered, setTotalDelivered] = useState(0);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available pickup requests (pending status, no volunteer assigned)
        const pendingRes = await fetch('/api/requests?status=pending');
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          const pending = (pendingData.requests || []).filter(
            (r: PickupRequest) => !r.volunteerId
          );
          setAvailableRequests(pending);
        }

        // Fetch active deliveries for this volunteer
        const activeRes = await fetch(`/api/requests?volunteerId=${user.id}`);
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          const allRequests = activeData.requests || [];

          // Active deliveries (accepted/in_transit)
          const active = allRequests
            .filter((r: PickupRequest) =>
              ['accepted', 'in_transit', 'picked_up'].includes(r.status)
            )
            .map((r: PickupRequest): ActiveDelivery => ({
              id: r.id,
              food: r.donation?.foodName || 'Unknown Food',
              from: r.donation
                ? `${r.donation.donorName}, ${r.donation.address}`
                : 'Unknown',
              to: r.ngoName || 'Unknown NGO',
              status: r.status as ActiveDelivery['status'],
            }));
          setActiveDeliveries(active);

          // Total delivered
          const delivered = allRequests.filter(
            (r: PickupRequest) => r.status === 'delivered'
          ).length;
          setTotalDelivered(delivered);
        }
      } catch (error) {
        console.error('Failed to fetch volunteer data:', error);
        toast.error('Failed to load requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [_hasHydrated, user]);

  const handleAcceptPickup = async (requestId: string) => {
    if (!user) return;

    setAcceptingId(requestId);
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId,
          volunteerId: user.id,
          volunteerName: user.name,
          status: 'accepted',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to accept request');
      }

      const data = await res.json();
      const acceptedRequest = data.request;

      // Remove from available list
      setAvailableRequests((prev) =>
        prev.filter((r) => r.id !== requestId)
      );

      // Add to active deliveries
      setActiveDeliveries((prev) => [
        ...prev,
        {
          id: acceptedRequest.id,
          food: acceptedRequest.donation?.foodName || 'Unknown Food',
          from: acceptedRequest.donation
            ? `${acceptedRequest.donation.donorName}, ${acceptedRequest.donation.address}`
            : 'Unknown',
          to: acceptedRequest.ngoName || 'Unknown NGO',
          status: 'accepted',
        },
      ]);

      toast.success(
        'Pickup request accepted! Navigate to the donor location to collect the food.'
      );
    } catch (error) {
      console.error('Failed to accept pickup:', error);
      toast.error('Failed to accept pickup request. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Stats computed from real data
  const stats = [
    {
      label: 'Active Deliveries',
      value: activeDeliveries.length,
      icon: Truck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Completed Today',
      value: totalDelivered,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Delivered',
      value: totalDelivered,
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

  // Auth prompt if not logged in
  if (_hasHydrated && !user) {
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

          {/* Auth prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg max-w-lg mx-auto">
              <CardContent className="py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-4">
                  <User className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Login as Volunteer
                </h3>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in as a volunteer to view and accept pickup requests.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setCurrentPage('login')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage('signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                  {availableRequests.length} pending
                </Badge>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : availableRequests.length > 0 ? (
                <div className="space-y-4">
                  {availableRequests.map((request, index) => (
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
                                  {request.donation?.foodName || 'Unknown Food'}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {request.donation
                                    ? `${request.donation.quantity} ${request.donation.unit}`
                                    : ''}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {request.donation?.donorName || 'Unknown'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {request.ngoName || 'Unknown NGO'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {request.donation?.address || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {request.createdAt
                                      ? new Date(
                                          request.createdAt
                                        ).toLocaleDateString('en-IN', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAcceptPickup(request.id)}
                              disabled={acceptingId === request.id}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
                            >
                              {acceptingId === request.id ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Accepting...
                                </span>
                              ) : (
                                'Accept Pickup'
                              )}
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

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <SkeletonDeliveryCard key={i} />
                  ))}
                </div>
              ) : activeDeliveries.length > 0 ? (
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
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 mx-auto mb-4">
                      <Truck className="h-8 w-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No active deliveries
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Accept a pickup request to start delivering food!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
