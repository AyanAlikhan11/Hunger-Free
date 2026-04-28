
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  UtensilsCrossed,
  Leaf,
  Users,
  ClipboardList,
  PackageCheck,
  Handshake,
  Truck,
  Navigation,
  MapPin,
  Star,
  Sprout,
  TrendingUp,
  Coins,
  Building,
  Clock,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Shield,
  Download,
  ChevronRight,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Heart,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import AdminManagement from '@/components/admin/admin-management';
import AIPredictionPanel from "@/components/ai/AIPredictionPanel";


// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4 },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeUntilExpiry(expiryTime?: string) {
  if (!expiryTime) return 'N/A';

  const now = Date.now();
  const expiry = new Date(expiryTime).getTime();

  if (Number.isNaN(expiry)) return 'N/A';

  const diffMs = expiry - now;
  if (diffMs <= 0) return 'Expired';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
}

function formatRelativeTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function normalizeAnalytics(raw: any) {
  const donationsByMonth = Array.isArray(raw?.donationsByMonth)
    ? raw.donationsByMonth
    : Object.entries(raw?.donationsByMonth || {}).map(([key, count]) => {
        const [year, month] = key.split('-').map(Number);
        const date = year && month ? new Date(year, month - 1, 1) : null;
        return {
          month: date
            ? date.toLocaleString('en-US', { month: 'short' })
            : key,
          count: Number(count) || 0,
        };
      });

  const foodByCategory = Array.isArray(raw?.foodByCategory)
    ? raw.foodByCategory
    : Object.entries(raw?.foodByCategory || {}).map(([category, count]) => ({
        category,
        count: Number(count) || 0,
      }));

  const topDonors = Array.isArray(raw?.topDonors)
    ? raw.topDonors.map((d: any) => ({
        name: d.name || d.donorName || 'Unknown',
        donations: d.donations ?? d.count ?? 0,
      }))
    : [];

  const recentActivity = Array.isArray(raw?.recentActivity)
    ? raw.recentActivity.map((a: any) => {
        const description = a.action || a.description || '';
        const user =
          a.user ||
          (typeof description === 'string'
            ? description.match(/^(.+?)\s+(donated|requested|listed|delivered|claimed)/i)?.[1] || ''
            : '');
        return {
          action: description,
          user,
          time: a.time || formatRelativeTime(a.createdAt),
        };
      })
    : [];

  return {
    totalDonations: raw?.totalDonations ?? 0,
    totalFoodSaved: raw?.totalFoodSaved ?? 0,
    totalPeopleServed: raw?.totalPeopleServed ?? 0,
    totalFarmersConnected: raw?.totalFarmersConnected ?? 0,
    totalActiveVolunteers: raw?.totalActiveVolunteers ?? 0,
    donationsByMonth,
    foodByCategory,
    topDonors,
    recentActivity,
  };
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay }}>
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            </div>
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="size-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Skeleton Cards ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

function SkeletonFoodCard() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="h-36 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// ─── Status Badge Helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { className: string }> = {
    available: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    claimed: { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    delivered: { className: 'bg-blue-100 text-blue-700 border-blue-200' },
    pending: { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    accepted: { className: 'bg-blue-100 text-blue-700 border-blue-200' },
    in_transit: { className: 'bg-purple-100 text-purple-700 border-purple-200' },
    picked_up: { className: 'bg-blue-100 text-blue-700 border-blue-200' },
    expired: { className: 'bg-red-100 text-red-700 border-red-200' },
    cancelled: { className: 'bg-red-100 text-red-700 border-red-200' },
  };

  const v = variants[status.toLowerCase()] || {
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <Badge variant="outline" className={v.className}>
      {status}
    </Badge>
  );
}

// ─── Gradient map for food categories ─────────────────────────────────────────

const categoryGradients: Record<string, string> = {
  'Cooked Food': 'from-emerald-400 to-teal-500',
  Vegetables: 'from-green-400 to-emerald-500',
  Bakery: 'from-amber-400 to-orange-500',
  Grains: 'from-yellow-400 to-amber-500',
  'Fruits & Dairy': 'from-pink-400 to-rose-500',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DONOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function DonorDashboard() {
  const { user, setCurrentPage, authToken } = useAppStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      if (!authToken) {
        setLoading(false);
        toast.error('Session missing/expired. Please login again.');
        return;
      }

      try {
        const res = await fetch(`/api/donations?donorId=${user.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load donations');

        setDonations(data.donations || []);
      } catch {
        toast.error('Failed to load donations');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.id, authToken]);

  const totalDonations = donations.length;
  const totalQuantity = donations.reduce(
    (sum, d) => sum + (parseInt(d.quantity, 10) || 0),
    0
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeInUp}>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-44 mt-2" />
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-52 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Donor'}
          </h1>
          <p className="text-muted-foreground">Your donation dashboard</p>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Total Donations" value={totalDonations} icon={Package} color="bg-emerald-500" delay={0} />
        <StatCard title="Meals Provided" value={totalQuantity} icon={UtensilsCrossed} color="bg-amber-500" delay={0.1} />
        <StatCard title="Food Saved" value={`${totalQuantity} kg`} icon={Leaf} color="bg-green-500" delay={0.2} />
        <StatCard title="People Reached" value={totalQuantity} icon={Users} color="bg-blue-500" delay={0.3} />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest food donation history</CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No donations yet. Start donating to see your history here.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.foodName}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
        <Button
          size="lg"
          onClick={() => setCurrentPage('donate-food')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="size-4" />
          Donate Food
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setCurrentPage('available-food')}
        >
          View All Donations
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. NGO DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function NGODashboard() {
  const { user, authToken, setCurrentPage } = useAppStore();
  const [availableDonations, setAvailableDonations] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    if (!authToken) {
      setLoading(false);
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    try {
      const [donRes, reqRes] = await Promise.all([
        fetch('/api/donations?status=available', {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: 'no-store',
        }),
        fetch(`/api/requests?ngoId=${user.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: 'no-store',
        }),
      ]);

      const donData = await donRes.json();
      const reqData = await reqRes.json();

      if (!donRes.ok) throw new Error(donData?.error || 'Failed to fetch donations');
      if (!reqRes.ok) throw new Error(reqData?.error || 'Failed to fetch requests');

      setAvailableDonations(donData.donations || []);
      setMyRequests(reqData.requests || []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id, fetchData]);

  const handleRequestPickup = async (donation: any) => {
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    // ✅ IMPORTANT: handle direct donations BEFORE calling /api/requests
    if (donation?.deliveryMode === 'direct') {
      // store donation id so available-food page can auto-open dialog
      sessionStorage.setItem('hf_direct_request_donationId', String(donation.id));
      toast.info('This donation requires beneficiary selection. Redirecting...');
      setCurrentPage('available-food');
      return;
    }

    setRequestingId(donation.id);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ donationId: donation.id }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed to request pickup');

      toast.success(`Pickup requested for ${donation.foodName}`);
      fetchData();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to request pickup');
    } finally {
      setRequestingId(null);
    }
  };

  const activeRequests = myRequests.filter(
    (r: any) => r.status !== 'delivered' && r.status !== 'cancelled'
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeInUp}>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-44 mt-2" />
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
        </div>
        <div>
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonFoodCard /> <SkeletonFoodCard /> <SkeletonFoodCard />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-52 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'NGO'}
          </h1>
          <p className="text-muted-foreground">Manage food requests</p>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Active Requests" value={activeRequests.length} icon={ClipboardList} color="bg-blue-500" delay={0} />
        <StatCard title="Total Requests" value={myRequests.length} icon={PackageCheck} color="bg-emerald-500" delay={0.1} />
        <StatCard title="Available Food" value={availableDonations.length} icon={Users} color="bg-amber-500" delay={0.2} />
        <StatCard title="Delivered" value={myRequests.filter((r: any) => r.status === 'delivered').length} icon={Handshake} color="bg-purple-500" delay={0.3} />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Available Food Nearby</h2>
            <p className="text-sm text-muted-foreground">
              Food donations ready for pickup in your area
            </p>
          </div>
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="size-4" />
          </Button>
        </div>

        {availableDonations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No available food donations right now. Check back later!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableDonations.map((food, idx) => (
              <motion.div key={food.id} {...scaleIn} transition={{ delay: 0.4 + idx * 0.1 }}>
                <Card className="overflow-hidden h-full">
                  <div
                    className={`h-36 bg-gradient-to-br ${
                      categoryGradients[food.category] || 'from-emerald-400 to-teal-500'
                    } relative`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="size-12 text-white/40" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-0">
                        <MapPin className="size-3 mr-1" />
                        {food.address || food.location?.address?.split(',').pop()?.trim() || 'Nearby'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold">{food.foodName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {food.quantity} {food.unit}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <Users className="inline size-3 mr-1" />
                        {food.donorName}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {food.expiryTime ? getTimeUntilExpiry(food.expiryTime) : 'N/A'}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={requestingId === food.id}
                      onClick={() => handleRequestPickup(food)}
                    >
                      {requestingId === food.id ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Requesting...
                        </>
                      ) : (
                        'Request Pickup'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track your pickup request status</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No requests yet. Browse available food and request a pickup!
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center rounded-full bg-muted p-2">
                        <Package className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{req.ngoName}</p>
                        <p className="text-sm text-muted-foreground">
                          {req.donationId} &middot; {formatDateTime(req.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. VOLUNTEER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function VolunteerDashboard() {
  const { user, authToken } = useAppStore();
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    if (!authToken) {
      setLoading(false);
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    try {
      const [myRes, availRes, allRes] = await Promise.all([
        fetch(`/api/requests?volunteerId=${user.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/requests?status=pending', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/requests', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      const myData = await myRes.json();
      const availData = await availRes.json();
      const allData = await allRes.json();

      if (!myRes.ok) throw new Error(myData?.error || 'Failed to load volunteer requests');
      if (!availRes.ok) throw new Error(availData?.error || 'Failed to load available requests');
      if (!allRes.ok) throw new Error(allData?.error || 'Failed to load all requests');

      const myActive = (myData.requests || []).filter(
        (r: any) => r.status === 'accepted' || r.status === 'in_transit'
      );

      const pending = (availData.requests || []).filter((r: any) => !r.volunteerId);

      setActiveDeliveries(myActive);
      setAvailableRequests(pending);
      setAllRequests(allData.requests || []);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authToken]);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id, fetchData]);

  const handlePickUp = async (requestId: string) => {
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    setActionLoading(requestId);
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: requestId, status: 'in_transit' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update status');

      toast.success('Marked as picked up! Delivery in progress.');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelivered = async (requestId: string) => {
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    setActionLoading(requestId);
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: requestId, status: 'delivered' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update delivery');

      toast.success('Delivery completed! Great job!');
      fetchData();
    } catch {
      toast.error('Failed to update delivery');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    setActionLoading(requestId);
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id: requestId,
          volunteerId: user?.id,
          volunteerName: user?.name,
          status: 'accepted',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to accept request');

      toast.success('Request accepted! Head to the pickup location.');
      fetchData();
    } catch {
      toast.error('Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const totalDelivered = allRequests.filter(
    (r: any) => r.volunteerId === user?.id && r.status === 'delivered'
  ).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeInUp}>
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-5 w-44 mt-2" />
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border p-5 space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Volunteer'}
          </h1>
          <p className="text-muted-foreground">Your delivery dashboard</p>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Deliveries Made" value={totalDelivered} icon={Truck} color="bg-emerald-500" delay={0} />
        <StatCard title="Active Deliveries" value={activeDeliveries.length} icon={Navigation} color="bg-blue-500" delay={0.1} />
        <StatCard title="Available Requests" value={availableRequests.length} icon={MapPin} color="bg-amber-500" delay={0.2} />
        <StatCard title="Rating" value="4.9/5" icon={Star} color="bg-purple-500" delay={0.3} />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
            <CardDescription>Current delivery assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {activeDeliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active deliveries. Accept a request below to get started!
              </p>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto">
                {activeDeliveries.map((delivery, idx) => {
                  const progress = delivery.status === 'in_transit' ? 50 : 0;
                  return (
                    <motion.div
                      key={delivery.id}
                      {...scaleIn}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="rounded-xl border p-5 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <div className="rounded-full bg-emerald-100 p-1.5">
                            <MapPin className="size-3.5 text-emerald-600" />
                          </div>
                          <div className="w-0.5 h-8 bg-muted-foreground/20" />
                          <div className="rounded-full bg-blue-100 p-1.5">
                            <Navigation className="size-3.5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-sm font-medium">{delivery.ngoName || 'NGO'}</p>
                            <p className="text-xs text-muted-foreground">Pickup Location</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Delivery Point</p>
                            <p className="text-xs text-muted-foreground">Drop-off Location</p>
                          </div>
                        </div>
                        <StatusBadge status={delivery.status} />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        <Package className="size-4" />
                        {delivery.donationId} - Requested on {formatDateTime(delivery.createdAt)}
                      </div>

                      {delivery.status === 'in_transit' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-3">
                        {delivery.status === 'accepted' && (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 flex-1"
                            disabled={actionLoading === delivery.id}
                            onClick={() => handlePickUp(delivery.id)}
                          >
                            {actionLoading === delivery.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )}
                            Mark as Picked Up
                          </Button>
                        )}
                        {delivery.status === 'in_transit' && (
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                            disabled={actionLoading === delivery.id}
                            onClick={() => handleDelivered(delivery.id)}
                          >
                            {actionLoading === delivery.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )}
                            Mark as Delivered
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Navigation className="size-4" />
                          Navigate
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle>Available Pickup Requests</CardTitle>
            <CardDescription>Pending requests from NGOs that need volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            {availableRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No available requests at the moment.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Building className="size-4 text-muted-foreground" />
                        <p className="font-medium">{req.ngoName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Donation: {req.donationId}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDateTime(req.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                      disabled={actionLoading === req.id}
                      onClick={() => handleAcceptRequest(req.id)}
                    >
                      {actionLoading === req.id ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Accepting...
                        </>
                      ) : (
                        'Accept Request'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FARMER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductFormData {
  productName: string;
  price: string;
  unit: string;
  quantity: string;
  category: string;
  description: string;
  isOrganic: boolean;
}

const defaultForm: ProductFormData = {
  productName: '',
  price: '',
  unit: 'kg',
  quantity: '',
  category: 'Vegetables',
  description: '',
  isOrganic: false,
};

export function FarmerDashboard() {
  const { user, setCurrentPage, authToken } = useAppStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [formLoading, setFormLoading] = useState(false);

  const categoryColors: Record<string, string> = {
    Vegetables: 'bg-green-100 text-green-700 border-green-200',
    Grains: 'bg-amber-100 text-amber-700 border-amber-200',
    Fruits: 'bg-purple-100 text-purple-700 border-purple-200',
    Dairy: 'bg-blue-100 text-blue-700 border-blue-200',
    Bakery: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const fetchProducts = useCallback(async () => {
  if (!user?.id) {
    setLoading(false);
    return;
  }
  if (!authToken) {
    setLoading(false);
    toast.error('Session missing/expired. Please login again.');
    return;
  }

  try {
    const url = `/api/products?farmerId=${encodeURIComponent(String(user.id))}&ts=${Date.now()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch products');

    setProducts(data.products || []);
  } catch (e: any) {
    toast.error(e?.message || 'Failed to load products');
  } finally {
    setLoading(false);
  }
}, [user?.id, authToken]);

  useEffect(() => {
    if (user?.id) fetchProducts();
  }, [user?.id, fetchProducts]);

  const openAddDialog = () => {
    setForm(defaultForm);
    setShowAddDialog(true);
  };

  const openEditDialog = (product: any) => {
    setForm({
      productName: product.productName,
      price: String(product.price),
      unit: product.unit,
      quantity: String(product.quantity),
      category: product.category,
      description: product.description || '',
      isOrganic: product.isOrganic,
    });
    setEditingProduct(product);
  };

  const handleSubmit = async () => {
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    if (!form.productName || !form.price || !form.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setFormLoading(true);
    try {
  if (editingProduct) {
    // ... PATCH code
    toast.success('Product updated successfully');
    setEditingProduct(null);
  } else {
    // ... POST code
    toast.success('Product added successfully');
    setShowAddDialog(false);
  }

  await fetchProducts(); // ✅ IMPORTANT: await refresh
} catch {
  toast.error('Failed to save product');
} finally {
  setFormLoading(false);
}
  }
  const handleDelete = async () => {
    if (!deletingProduct) return;
    if (!authToken) {
      toast.error('Session missing/expired. Please login again.');
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${deletingProduct.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to delete product');

      toast.success('Product deleted');
      setDeletingProduct(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeInUp}>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-40 mt-2" />
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Farmer'}
          </h1>
          <p className="text-muted-foreground">Your farm marketplace</p>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Products Listed" value={totalProducts} icon={Sprout} color="bg-green-500" delay={0} />
        <StatCard title="Total Quantity" value={`${totalQuantity} kg`} icon={TrendingUp} color="bg-emerald-500" delay={0.1} />
        <StatCard title="Revenue" value="₹0" icon={Coins} color="bg-amber-500" delay={0.2} />
        <StatCard title="Buyers Connected" value={0} icon={Users} color="bg-blue-500" delay={0.3} />
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>My Products</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No products listed yet. Add your first product!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[600px] overflow-y-auto">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    {...scaleIn}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{product.productName}</h3>
                              {product.isOrganic && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                  <Leaf className="size-3" />
                                  Organic
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className={categoryColors[product.category] || ''}>
                              {product.category}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <IndianRupee className="size-4 text-muted-foreground" />
                          <span className="text-xl font-bold">{product.price}</span>
                          <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {product.quantity} {product.unit} available
                          </span>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeletingProduct(product)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4">
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={openAddDialog}
        >
          <Plus className="size-4" />
          Add New Product
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setCurrentPage('marketplace')}
        >
          View Marketplace
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>

      <Dialog
        open={showAddDialog || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update your product details'
                : 'Fill in the details for your new product'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                placeholder="e.g. Organic Tomatoes"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="40"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="150"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="kg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Vegetables"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief product description"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isOrganic}
                onCheckedChange={(checked) => setForm({ ...form, isOrganic: checked })}
              />
              <Label>Organic Product</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={formLoading}
              onClick={handleSubmit}
            >
              {formLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.productName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS = ['#10b981', '#f59e0b', '#84cc16', '#f97316', '#14b8a6'];

const userGrowth = [
  { month: 'Jul', users: 245 },
  { month: 'Aug', users: 380 },
  { month: 'Sep', users: 520 },
  { month: 'Oct', users: 710 },
  { month: 'Nov', users: 950 },
  { month: 'Dec', users: 1280 },
  { month: 'Jan', users: 1560 },
];

const activityIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  donated: { icon: Package, color: 'bg-emerald-100 text-emerald-600' },
  delivered: { icon: CheckCircle2, color: 'bg-blue-100 text-blue-600' },
  requested: { icon: ClipboardList, color: 'bg-amber-100 text-amber-600' },
  listed: { icon: Sprout, color: 'bg-green-100 text-green-600' },
  registered: { icon: Users, color: 'bg-purple-100 text-purple-600' },
  claimed: { icon: Handshake, color: 'bg-amber-100 text-amber-600' },
  expired: { icon: AlertCircle, color: 'bg-red-100 text-red-600' },
};

function getActivityIcon(action: string) {
  const lower = action.toLowerCase();
  for (const [key, value] of Object.entries(activityIconMap)) {
    if (lower.includes(key)) return value;
  }
  return { icon: Heart, color: 'bg-pink-100 text-pink-600' };
}

export function AdminDashboard() {
  const { setCurrentPage, authToken } = useAppStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!authToken) {
        toast.error('Session missing/expired. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/analytics', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load analytics');

        setAnalytics(normalizeAnalytics(data.analytics || null));
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [authToken]);

  const donationsOverTime = analytics?.donationsByMonth || [];
  const totalFoodByCategory = analytics?.foodByCategory || [];
  const foodByCategory = totalFoodByCategory.map((item: any) => ({
    name: item.category,
    value: item.count,
  }));
  const topDonors = analytics?.topDonors || [];
  const recentActivity = analytics?.recentActivity || [];

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeInUp}>

          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-56 mt-2" />
        </motion.div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-72 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-44 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview &amp; analytics</p>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Total Donations" value={analytics?.totalDonations?.toLocaleString() || '0'} icon={Package} color="bg-emerald-500" delay={0} />
        <StatCard title="Food Saved" value={`${((analytics?.totalFoodSaved || 0) / 1000).toFixed(1)}k kg`} icon={Leaf} color="bg-green-500" delay={0.05} />
        <StatCard title="People Served" value={analytics?.totalPeopleServed?.toLocaleString() || '0'} icon={Users} color="bg-amber-500" delay={0.1} />
        <StatCard title="Farmers Connected" value={analytics?.totalFarmersConnected || 0} icon={Sprout} color="bg-lime-500" delay={0.15} />
        <StatCard title="Active Volunteers" value={analytics?.totalActiveVolunteers || 0} icon={Truck} color="bg-blue-500" delay={0.2} />
        <StatCard title="NGOs Active" value="156" icon={Building} color="bg-purple-500" delay={0.25} />
      </motion.div>
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
  <AIPredictionPanel />
</motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Donations Over Time</CardTitle>
              <CardDescription>Monthly donation trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={donationsOverTime}>
                    <defs>
                      <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#donationGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Food by Category</CardTitle>
              <CardDescription>Distribution of donated food types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={foodByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {foodByCategory.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[140px]">
                  {foodByCategory.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[index] }}
                      />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="font-medium ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>Highest contributing donors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDonors} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="donations"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity to show.
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity: any, idx: number) => {
                  const { icon: ActivityIcon, color } = getActivityIcon(activity.action);
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`rounded-full p-2 shrink-0 ${color}`}>
                        <ActivityIcon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.user && `${activity.user} • `}
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
  <AdminManagement />
</motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={() => setCurrentPage('available-food')}
        >
          View All Donations
          <ArrowRight className="size-4" />
        </Button>
        <Button size="lg" variant="outline">
          <Shield className="size-4" />
          Manage Users
        </Button>
        <Button size="lg" variant="outline">
          <Download className="size-4" />
          Export Report
        </Button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardRouter() {
  const { user, setCurrentPage } = useAppStore();

  if (!user) {
    return (
      <motion.div
        {...fadeInUp}
        className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
      >
        <div className="rounded-full bg-muted p-6">
          <Users className="size-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Please sign in</h2>
          <p className="text-muted-foreground max-w-md">
            You need to be logged in to access your dashboard. Sign in to view your personalized dashboard and manage your activities.
          </p>
        </div>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCurrentPage('login')}
        >
          Sign In
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    );
  }

  const dashboards: Record<string, React.FC> = {
    donor: DonorDashboard,
    ngo: NGODashboard,
    volunteer: VolunteerDashboard,
    farmer: FarmerDashboard,
    admin: AdminDashboard,
  };

  const DashboardComponent = dashboards[user.role];

  if (!DashboardComponent) {
    return (
      <motion.div
        {...fadeInUp}
        className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
      >
        <div className="rounded-full bg-amber-100 p-6">
          <AlertCircle className="size-12 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Unknown Role</h2>
          <p className="text-muted-foreground">
            Your role &quot;{user.role}&quot; does not have a dashboard configured.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <DashboardComponent />
    </motion.div>
  );
}