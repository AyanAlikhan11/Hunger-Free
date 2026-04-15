'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  Clock,
  MapPin,
  Utensils,
  Carrot,
  Apple,
  Wheat,
  Cookie,
  Filter,
  ArrowUpDown,
  PackageOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Donation {
  id: string;
  name: string;
  category: string;
  quantity: string;
  description: string;
  donor: string;
  location: string;
  expiry: string;
  expiryTime: string;
  status: 'available' | 'claimed' | 'delivered' | 'picked_up' | 'expired';
  deliveryMode?: 'ngo' | 'direct';
}

type Beneficiary = {
  id: string;
  fullName: string;
  phone?: string | null;
  address: string;
  lat?: number | null;
  lng?: number | null;
};

function calculateExpiry(expiryTime: string): string {
  const now = Date.now();
  const expiry = new Date(expiryTime).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) return 'Expired';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  return `${Math.max(diffHours, 1)} hour${diffHours > 1 ? 's' : ''}`;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Cooked Food': <Utensils className="h-5 w-5" />,
  Vegetables: <Carrot className="h-5 w-5" />,
  'Fruits & Dairy': <Apple className="h-5 w-5" />,
  Grains: <Wheat className="h-5 w-5" />,
  Bakery: <Cookie className="h-5 w-5" />,
};

const categoryGradients: Record<string, string> = {
  'Cooked Food': 'from-orange-100 to-amber-50 text-orange-600',
  Vegetables: 'from-green-100 to-emerald-50 text-emerald-600',
  'Fruits & Dairy': 'from-pink-100 to-rose-50 text-rose-600',
  Grains: 'from-amber-100 to-yellow-50 text-amber-600',
  Bakery: 'from-yellow-100 to-orange-50 text-yellow-700',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  claimed: {
    label: 'Claimed',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  picked_up: {
    label: 'Picked Up',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export default function AvailableFoodPage() {
  const { setCurrentPage, user, isAuthenticated, authToken } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Direct delivery dialog state
  const [directDialogOpen, setDirectDialogOpen] = useState(false);
  const [directDonation, setDirectDonation] = useState<Donation | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiaryId, setBeneficiaryId] = useState<string>('');
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);

  // Inline create beneficiary
  const [newBName, setNewBName] = useState('');
  const [newBPhone, setNewBPhone] = useState('');
  const [newBAddress, setNewBAddress] = useState('');
  const [creatingB, setCreatingB] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Fetch donations
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    async function fetchDonations() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/donations?status=available', {
          cache: 'no-store',
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to fetch donations');
        }

        const mapped: Donation[] = (data?.donations || []).map((d: any) => ({
          id: d.id,
          name: d.foodName,
          category: d.category || 'Other',
          quantity: `${d.quantity} ${d.unit}`,
          description: d.description || '',
          donor: d.donorName || 'Donor',
          location: d.address || d.location?.address || 'Nearby',
          expiry: d.expiryTime ? calculateExpiry(d.expiryTime) : 'N/A',
          expiryTime: d.expiryTime || new Date().toISOString(),
          status: (d.status as Donation['status']) || 'available',
          deliveryMode: d.deliveryMode || 'ngo',
        }));

        setDonations(mapped);
      } catch (e) {
        if ((e as any)?.name === 'AbortError') return;
        toast.error('Failed to load donations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonations();
    return () => controller.abort();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────
  const filteredDonations = useMemo(() => {
    let results = [...donations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.donor.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') results = results.filter((d) => d.category === categoryFilter);
    if (statusFilter !== 'all') results = results.filter((d) => d.status === statusFilter);

    if (sortBy === 'expiry-soon') {
      results.sort((a, b) => new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime());
    }

    return results;
  }, [searchQuery, categoryFilter, statusFilter, sortBy, donations]);

  const isExpiringSoon = (expiry: string) => {
    const match = expiry.match(/(\d+)\s*(hour|day)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      return unit === 'hour' && value <= 6;
    }
    if (expiry === 'Expired') return true;
    return false;
  };

  const isUserNgo = isAuthenticated && user?.role === 'ngo';

  // ─────────────────────────────────────────────────────────────
  // Beneficiaries
  // ─────────────────────────────────────────────────────────────
  const fetchBeneficiaries = async () => {
    if (!authToken) return;
    setLoadingBeneficiaries(true);
    try {
      const res = await fetch('/api/beneficiaries', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load beneficiaries');
      setBeneficiaries(data.beneficiaries || []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load beneficiaries');
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const createBeneficiary = async () => {
    if (!authToken) return;
    if (!newBName || !newBAddress) {
      toast.error('Beneficiary name and address are required');
      return;
    }

    setCreatingB(true);
    try {
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fullName: newBName,
          phone: newBPhone || undefined,
          address: newBAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create beneficiary');

      toast.success('Beneficiary created');
      setNewBName('');
      setNewBPhone('');
      setNewBAddress('');

      await fetchBeneficiaries();

      if (data?.beneficiary?.id) setBeneficiaryId(data.beneficiary.id);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create beneficiary');
    } finally {
      setCreatingB(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Requests
  // ─────────────────────────────────────────────────────────────
  const requestPickup = async (donation: Donation, beneficiaryIdArg?: string) => {
    if (!user || user.role !== 'ngo') {
      toast.error('Only NGO users can request pickups. Please login as an NGO.');
      return;
    }
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        donationId: donation.id,
        ...(beneficiaryIdArg ? { beneficiaryId: beneficiaryIdArg } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to create pickup request');

    setDonations((prev) => prev.filter((d) => d.id !== donation.id));
    toast.success(`Pickup request sent for "${donation.name}"!`);
  };

  const openDirectDialog = async (donation: Donation) => {
    setDirectDonation(donation);
    setDirectDialogOpen(true);
    setBeneficiaryId('');
    await fetchBeneficiaries();
  };

  // ✅ AUTO-OPEN direct dialog if NGO comes from dashboard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ngo' || !authToken) return;
    if (!donations.length) return;

    const id = sessionStorage.getItem('hf_direct_request_donationId');
    if (!id) return;

    const target = donations.find((d) => d.id === id);
    if (!target) return;

    sessionStorage.removeItem('hf_direct_request_donationId');

    if (target.deliveryMode === 'direct') {
      openDirectDialog(target).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donations, isAuthenticated, user?.role, authToken]);

  const handleRequestPickup = async (donation: Donation) => {
    try {
      if (donation.deliveryMode === 'direct') {
        await openDirectDialog(donation);
        return;
      }
      await requestPickup(donation);
    } catch (e: any) {
      toast.error(e?.message || 'Something went wrong');
    }
  };

  const handleConfirmDirect = async () => {
    if (!directDonation) return;
    if (!beneficiaryId) {
      toast.error('Please select a beneficiary for direct delivery');
      return;
    }
    try {
      await requestPickup(directDonation, beneficiaryId);
      setDirectDialogOpen(false);
      setDirectDonation(null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to request pickup');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Available Food Donations
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse and request food from nearby donors
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by food name, donor, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Cooked Food">Cooked Food</SelectItem>
              <SelectItem value="Vegetables">Vegetables</SelectItem>
              <SelectItem value="Fruits & Dairy">Fruits & Dairy</SelectItem>
              <SelectItem value="Grains">Grains</SelectItem>
              <SelectItem value="Bakery">Bakery</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="expiry-soon">Expiry Soon</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden h-full">
                <Skeleton className="h-44 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pt-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {filteredDonations.length}
                </span>{' '}
                {filteredDonations.length === 1 ? 'donation' : 'donations'}
              </p>
            </div>

            {filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDonations.map((donation, index) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                      <div
                        className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${
                          categoryGradients[donation.category] ||
                          'from-gray-100 to-gray-50'
                        }`}
                      >
                        {categoryIcons[donation.category] || (
                          <PackageOpen className="h-10 w-10 opacity-50" />
                        )}

                        <div className="absolute top-3 right-3">
                          <Badge
                            variant="outline"
                            className={
                              statusConfig[donation.status]?.className ||
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          >
                            {statusConfig[donation.status]?.label || donation.status}
                          </Badge>
                        </div>

                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-white/90 text-gray-700 backdrop-blur-sm"
                          >
                            {donation.category}
                          </Badge>

                          {donation.deliveryMode === 'direct' && (
                            <Badge className="bg-emerald-600 text-white border-none">
                              Direct
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {donation.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {donation.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium text-gray-700">
                              {donation.quantity}
                            </span>
                          </div>

                          <div
                            className={`flex items-center justify-between text-sm ${
                              isExpiringSoon(donation.expiry) ? 'text-red-600' : ''
                            }`}
                          >
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {isExpiringSoon(donation.expiry) ? 'Expires soon!' : 'Expires in'}
                            </span>
                            <span
                              className={`font-medium ${
                                isExpiringSoon(donation.expiry) ? 'text-red-600' : 'text-gray-700'
                              }`}
                            >
                              {donation.expiry}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Donor</span>
                            <span className="font-medium text-gray-700">
                              {donation.donor}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              Location
                            </span>
                            <span className="font-medium text-gray-700">
                              {donation.location}
                            </span>
                          </div>
                        </div>

                        {donation.status === 'available' && (
                          <Button
                            onClick={() => handleRequestPickup(donation)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isUserNgo ? 'Request Pickup' : 'Login as NGO to Request'}
                          </Button>
                        )}

                        {donation.status !== 'available' && (
                          <Button variant="outline" className="w-full" disabled>
                            {statusConfig[donation.status]?.label || donation.status}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16 px-8"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-6">
                  <PackageOpen className="h-10 w-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No donations found
                </h3>
                <p className="text-center text-muted-foreground max-w-md mb-6">
                  No food donations match your current filters. Try adjusting your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Direct Delivery Dialog */}
      <Dialog open={directDialogOpen} onOpenChange={setDirectDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Select Beneficiary for Direct Delivery</DialogTitle>
            <DialogDescription>
              This donation is marked for direct delivery. Choose a verified recipient or create one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Beneficiary</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
                disabled={loadingBeneficiaries}
              >
                <option value="">
                  {loadingBeneficiaries ? 'Loading...' : 'Select a beneficiary'}
                </option>
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.fullName} — {b.address}
                  </option>
                ))}
              </select>
              {beneficiaries.length === 0 && !loadingBeneficiaries && (
                <p className="text-xs text-muted-foreground">
                  No beneficiaries found. Create one below.
                </p>
              )}
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <div className="text-sm font-semibold">Create New Beneficiary</div>

              <div className="grid gap-2">
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={newBName}
                  onChange={(e) => setNewBName(e.target.value)}
                  placeholder="Recipient name"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Phone (optional)</Label>
                <Input
                  value={newBPhone}
                  onChange={(e) => setNewBPhone(e.target.value)}
                  placeholder="+91..."
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Address</Label>
                <Input
                  value={newBAddress}
                  onChange={(e) => setNewBAddress(e.target.value)}
                  placeholder="Full address"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={createBeneficiary}
                disabled={creatingB || !authToken}
              >
                {creatingB ? 'Creating...' : 'Create Beneficiary'}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDirectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmDirect}
              disabled={!beneficiaryId}
            >
              Confirm & Request Pickup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}