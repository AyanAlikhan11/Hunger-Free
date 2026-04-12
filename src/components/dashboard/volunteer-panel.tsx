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
  Loader2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';
import dynamic from 'next/dynamic';

const DeliveryMap = dynamic(() => import('@/components/maps/delivery-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

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

  pickupAddress?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;

  dropoffType?: 'ngo' | 'recipient';
  dropoffAddress?: string;
  dropoffLat?: number | null;
  dropoffLng?: number | null;

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
  from: string; // pickup address string
  to: string;   // dropoff address string
  status: 'accepted' | 'picked_up' | 'in_transit';

  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
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

// ✅ Google Maps helpers (free)
function googlePlaceUrl(lat?: number | null, lng?: number | null, address?: string) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return 'https://www.google.com/maps';
}

function googleDirectionsUrl(params: {
  originLat?: number | null;
  originLng?: number | null;
  originAddress?: string;
  destLat?: number | null;
  destLng?: number | null;
  destAddress?: string;
}) {
  const { originLat, originLng, originAddress, destLat, destLng, destAddress } = params;

  const origin =
    originLat != null && originLng != null
      ? `${originLat},${originLng}`
      : originAddress
        ? encodeURIComponent(originAddress)
        : '';

  const destination =
    destLat != null && destLng != null
      ? `${destLat},${destLng}`
      : destAddress
        ? encodeURIComponent(destAddress)
        : '';

  if (!origin && !destination) return 'https://www.google.com/maps';

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
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
  const { setCurrentPage, user, _hasHydrated, authToken } = useAppStore();
  const [availableRequests, setAvailableRequests] = useState<PickupRequest[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [totalDelivered, setTotalDelivered] = useState(0);

  const fetchData = async () => {
    if (!user || !authToken) return;

    setIsLoading(true);
    try {
      const pendingRes = await fetch('/api/requests?status=pending', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const pending = (pendingData.requests || []).filter((r: PickupRequest) => !r.volunteerId);
        setAvailableRequests(pending);
      } else {
        throw new Error('Failed to fetch pending requests');
      }

      const myRes = await fetch(`/api/requests?volunteerId=${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (myRes.ok) {
        const myData = await myRes.json();
        const allRequests: PickupRequest[] = myData.requests || [];

        const active = allRequests
          .filter((r) => ['accepted', 'in_transit', 'picked_up'].includes(r.status))
          .map((r): ActiveDelivery => ({
            id: r.id,
            food: r.donation?.foodName || 'Unknown Food',
            from: r.pickupAddress || r.donation?.address || 'Pickup location',
            to: r.dropoffAddress || r.ngoName || 'Dropoff',
            status: r.status as ActiveDelivery['status'],
            pickupLat: r.pickupLat ?? null,
            pickupLng: r.pickupLng ?? null,
            dropoffLat: r.dropoffLat ?? null,
            dropoffLng: r.dropoffLng ?? null,
          }));

        setActiveDeliveries(active);

        const delivered = allRequests.filter((r) => r.status === 'delivered').length;
        setTotalDelivered(delivered);
      } else {
        throw new Error('Failed to fetch my requests');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    if (!authToken) {
      setIsLoading(false);
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, user, authToken]);

  const handleAcceptPickup = async (requestId: string) => {
    if (!user || !authToken) return;

    setAcceptingId(requestId);
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: requestId, status: 'accepted' }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed to accept request');

      toast.success('Pickup request accepted!');
      await fetchData();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to accept pickup request.');
    } finally {
      setAcceptingId(null);
    }
  };

  const updateDeliveryStatus = async (requestId: string, status: 'in_transit' | 'delivered') => {
    if (!authToken) return;

    setActionLoadingId(requestId);
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: requestId, status }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed to update status');

      toast.success(status === 'in_transit' ? 'Marked as picked up!' : 'Marked as delivered!');
      await fetchData();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = [
    { label: 'Active Deliveries', value: activeDeliveries.length, icon: Truck, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Completed Today', value: totalDelivered, icon: CheckCircle2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Total Delivered', value: totalDelivered, icon: Package, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Rating', value: '4.9/5', icon: Star, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  if (_hasHydrated && !user) {
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

          <Card className="border-0 shadow-lg max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-4">
                <User className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login as Volunteer</h3>
              <p className="text-muted-foreground mb-6">
                You need to be logged in as a volunteer to view and accept pickup requests.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setCurrentPage('login')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Login
                </Button>
                <Button variant="outline" onClick={() => setCurrentPage('signup')}>
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Volunteer Panel</h1>
          <p className="mt-2 text-lg text-muted-foreground">Accept and manage food pickup deliveries</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Available Pickup Requests */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Available Pickup Requests</h2>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {availableRequests.length} pending
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : availableRequests.length > 0 ? (
              <div className="space-y-4">
                {availableRequests.map((r) => (
                  <Card key={r.id} className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{r.donation?.foodName || 'Donation'}</h3>
                            <Badge variant="outline" className="text-xs">
                              {r.donation ? `${r.donation.quantity} ${r.donation.unit}` : ''}
                            </Badge>
                            {r.dropoffType === 'recipient' && (
                              <Badge className="bg-emerald-600 text-white border-none text-xs">Direct</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{r.ngoName || 'NGO'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{r.pickupAddress || r.donation?.address || 'Pickup address'}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleAcceptPickup(r.id)}
                          disabled={acceptingId === r.id}
                          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
                        >
                          {acceptingId === r.id ? (
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
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  No pending pickup requests right now.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Active Deliveries */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Active Deliveries</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {activeDeliveries.length} active
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <SkeletonDeliveryCard key={i} />)}
              </div>
            ) : activeDeliveries.length > 0 ? (
              <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {activeDeliveries.map((d) => {
                  const currentStep = getStatusIndex(d.status);
                  const isBusy = actionLoadingId === d.id;

                  const mapsPickup = googlePlaceUrl(d.pickupLat, d.pickupLng, d.from);
                  const mapsDropoff = googlePlaceUrl(d.dropoffLat, d.dropoffLng, d.to);
                  const mapsRoute = googleDirectionsUrl({
                    originLat: d.pickupLat,
                    originLng: d.pickupLng,
                    originAddress: d.from,
                    destLat: d.dropoffLat,
                    destLng: d.dropoffLng,
                    destAddress: d.to,
                  });

                  return (
                    <Card key={d.id} className="hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-gray-900 mb-1">{d.food}</h3>
                        <p className="text-xs text-muted-foreground mb-1">{d.from}</p>
                        <p className="text-xs text-muted-foreground mb-4">→ {d.to}</p>

                        <div className="mb-4">
                          <DeliveryMap
                            pickup={{ lat: d.pickupLat ?? null, lng: d.pickupLng ?? null }}
                            dropoff={{ lat: d.dropoffLat ?? null, lng: d.dropoffLng ?? null }}
                            height={220}
                          />
                        </div>

                        {/* ✅ Google Maps buttons */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <Button asChild variant="outline" className="w-full">
                            <a href={mapsPickup} target="_blank" rel="noopener noreferrer">
                              <Navigation className="h-4 w-4 mr-2" />
                              Pickup
                            </a>
                          </Button>

                          <Button asChild variant="outline" className="w-full">
                            <a href={mapsDropoff} target="_blank" rel="noopener noreferrer">
                              <Navigation className="h-4 w-4 mr-2" />
                              Drop
                            </a>
                          </Button>

                          <Button asChild variant="outline" className="w-full">
                            <a href={mapsRoute} target="_blank" rel="noopener noreferrer">
                              <Navigation className="h-4 w-4 mr-2" />
                              Route
                            </a>
                          </Button>
                        </div>

                        {/* Progress steps */}
                        <div className="relative mb-3">
                          <div className="flex items-center justify-between">
                            {deliverySteps.map((step, stepIndex) => (
                              <div key={step.key} className="flex flex-col items-center z-10">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                    stepIndex <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {stepIndex < currentStep ? <CheckCircle2 className="h-4 w-4" /> : stepIndex + 1}
                                </div>
                                <span className={`mt-1.5 text-[10px] ${stepIndex <= currentStep ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                                  {step.label}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-gray-200 -z-0" />
                          <div
                            className="absolute top-3.5 left-4 h-0.5 bg-emerald-500 -z-0 transition-all duration-500"
                            style={{ width: `${(currentStep / (deliverySteps.length - 1)) * 100}%` }}
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-4">
                          {d.status === 'accepted' && (
                            <Button
                              onClick={() => updateDeliveryStatus(d.id, 'in_transit')}
                              disabled={isBusy}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isBusy ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Updating...
                                </span>
                              ) : (
                                'Mark Picked Up'
                              )}
                            </Button>
                          )}

                          {(d.status === 'in_transit' || d.status === 'picked_up') && (
                            <Button
                              onClick={() => updateDeliveryStatus(d.id, 'delivered')}
                              disabled={isBusy}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {isBusy ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Updating...
                                </span>
                              ) : (
                                'Mark Delivered'
                              )}
                            </Button>
                          )}
                        </div>

                        <Badge
                          variant="outline"
                          className="w-full justify-center text-xs border-emerald-200 text-emerald-700 bg-emerald-50/50 mt-4"
                        >
                          {getDeliveryStatusLabel(d.status)}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  No active deliveries yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}