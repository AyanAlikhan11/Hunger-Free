'use client';

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
  CircleDot,
  AlertCircle,
  Heart,
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
import { useAppStore } from '@/lib/store';

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

  const v = variants[status.toLowerCase()] || { className: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <Badge variant="outline" className={v.className}>
      {status}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DONOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function DonorDashboard() {
  const { user, setCurrentPage } = useAppStore();

  const recentDonations = [
    { food: 'Cooked Rice & Curry', quantity: '50 servings', status: 'Available', date: 'Jan 20' },
    { food: 'Fresh Vegetables', quantity: '20 kg', status: 'Claimed', date: 'Jan 19' },
    { food: 'Bread Items', quantity: '30 pieces', status: 'Delivered', date: 'Jan 18' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Donor'}
          </h1>
          <p className="text-muted-foreground">Your donation dashboard</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Total Donations" value={12} icon={Package} color="bg-emerald-500" delay={0} />
        <StatCard title="Meals Provided" value="450+" icon={UtensilsCrossed} color="bg-amber-500" delay={0.1} />
        <StatCard title="Food Saved" value="180 kg" icon={Leaf} color="bg-green-500" delay={0.2} />
        <StatCard title="People Reached" value="350+" icon={Users} color="bg-blue-500" delay={0.3} />
      </motion.div>

      {/* Recent Donations Table */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest food donation history</CardDescription>
          </CardHeader>
          <CardContent>
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
                {recentDonations.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.food}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
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
  const { user } = useAppStore();

  const nearbyFood = [
    {
      id: 1,
      name: 'Cooked Rice & Curry',
      quantity: '50 servings',
      donor: 'Rajesh Kumar',
      expiry: '4 hours',
      distance: '2.3 km',
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      id: 2,
      name: 'Fresh Vegetables Bundle',
      quantity: '25 kg',
      donor: 'Green Farms',
      expiry: '1 day',
      distance: '5.1 km',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      id: 3,
      name: 'Bakery Items',
      quantity: '40 pieces',
      donor: 'City Bakery',
      expiry: '8 hours',
      distance: '1.8 km',
      gradient: 'from-amber-400 to-orange-500',
    },
  ];

  const myRequests = [
    { id: 1, food: 'Fresh Fruits', donor: 'Sunrise Orchards', status: 'accepted', date: 'Jan 20, 10:30 AM' },
    { id: 2, food: 'Rice & Dal', donor: 'Community Kitchen', status: 'in_transit', date: 'Jan 20, 09:15 AM' },
    { id: 3, food: 'Bread & Milk', donor: 'Morning Delight', status: 'delivered', date: 'Jan 19, 04:00 PM' },
    { id: 4, food: 'Cooked Meals', donor: 'Hotel Royal', status: 'pending', date: 'Jan 19, 02:30 PM' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'NGO'}
          </h1>
          <p className="text-muted-foreground">Manage food requests</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Active Requests" value={8} icon={ClipboardList} color="bg-blue-500" delay={0} />
        <StatCard title="Food Received" value="1,200+ kg" icon={PackageCheck} color="bg-emerald-500" delay={0.1} />
        <StatCard title="People Served" value="3,500+" icon={Users} color="bg-amber-500" delay={0.2} />
        <StatCard title="Partner Donors" value={24} icon={Handshake} color="bg-purple-500" delay={0.3} />
      </motion.div>

      {/* Available Food Nearby */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Available Food Nearby</h2>
            <p className="text-sm text-muted-foreground">Food donations ready for pickup in your area</p>
          </div>
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyFood.map((food, idx) => (
            <motion.div key={food.id} {...scaleIn} transition={{ delay: 0.4 + idx * 0.1 }}>
              <Card className="overflow-hidden h-full">
                <div className={`h-36 bg-gradient-to-br ${food.gradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="size-12 text-white/40" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-0">
                      <MapPin className="size-3 mr-1" />
                      {food.distance}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">{food.name}</h3>
                    <p className="text-sm text-muted-foreground">{food.quantity}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      <Users className="inline size-3 mr-1" />
                      {food.donor}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {food.expiry}
                    </span>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Request Pickup
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* My Requests */}
      <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track your pickup request status</CardDescription>
          </CardHeader>
          <CardContent>
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
                      <p className="font-medium">{req.food}</p>
                      <p className="text-sm text-muted-foreground">{req.donor} &middot; {req.date}</p>
                    </div>
                  </div>
                  <StatusBadge status={req.status.replace('_', ' ')} />
                </div>
              ))}
            </div>
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
  const { user } = useAppStore();

  const activeDeliveries = [
    {
      id: 1,
      pickup: 'Hotel Grand, MG Road',
      dropoff: 'Hope Shelter, Indiranagar',
      items: 'Cooked Rice & Curry (30 servings)',
      progress: 60,
      status: 'in_transit',
    },
    {
      id: 2,
      pickup: 'Fresh Mart, Koramangala',
      dropoff: 'Sunrise NGO, BTM Layout',
      items: 'Fresh Vegetables (15 kg)',
      progress: 0,
      status: 'pending',
    },
    {
      id: 3,
      pickup: 'City Bakery, Jayanagar',
      dropoff: 'Care Home, JP Nagar',
      items: 'Bread & Bakery Items (25 pieces)',
      progress: 80,
      status: 'in_transit',
    },
  ];

  const availableRequests = [
    { id: 1, ngo: 'Food for All Foundation', items: 'Rice & Dal (40 servings)', pickup: 'Community Kitchen, HSR Layout', distance: '4.2 km', time: '2 hours ago' },
    { id: 2, ngo: 'Helping Hands NGO', items: 'Fruits & Vegetables (20 kg)', pickup: 'Green Market, Whitefield', distance: '8.5 km', time: '30 min ago' },
    { id: 3, ngo: 'Seva Samiti', items: 'Cooked Meals (60 servings)', pickup: 'Restaurant Row, Church Street', distance: '3.1 km', time: '15 min ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Volunteer'}
          </h1>
          <p className="text-muted-foreground">Your delivery dashboard</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Deliveries Made" value={45} icon={Truck} color="bg-emerald-500" delay={0} />
        <StatCard title="Active Deliveries" value={3} icon={Navigation} color="bg-blue-500" delay={0.1} />
        <StatCard title="Distance Covered" value="280 + km" icon={MapPin} color="bg-amber-500" delay={0.2} />
        <StatCard title="Rating" value="4.9/5" icon={Star} color="bg-purple-500" delay={0.3} />
      </motion.div>

      {/* Active Deliveries */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
            <CardDescription>Current delivery assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {activeDeliveries.map((delivery, idx) => (
                <motion.div
                  key={delivery.id}
                  {...scaleIn}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="rounded-xl border p-5 space-y-4"
                >
                  {/* Route Info */}
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
                        <p className="text-sm font-medium">{delivery.pickup}</p>
                        <p className="text-xs text-muted-foreground">Pickup Location</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{delivery.dropoff}</p>
                        <p className="text-xs text-muted-foreground">Drop-off Location</p>
                      </div>
                    </div>
                    <StatusBadge status={delivery.status === 'in_transit' ? 'In Transit' : 'Pending'} />
                  </div>

                  {/* Food Summary */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <Package className="size-4" />
                    {delivery.items}
                  </div>

                  {/* Progress */}
                  {delivery.status === 'in_transit' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{delivery.progress}%</span>
                      </div>
                      <Progress value={delivery.progress} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {delivery.status === 'pending' && (
                      <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                        <CheckCircle2 className="size-4" />
                        Mark as Picked Up
                      </Button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <Button className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                        <CheckCircle2 className="size-4" />
                        Mark as Delivered
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Navigation className="size-4" />
                      Navigate
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Pickup Requests */}
      <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle>Available Pickup Requests</CardTitle>
            <CardDescription>Pending requests from NGOs that need volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="size-4 text-muted-foreground" />
                      <p className="font-medium">{req.ngo}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.items}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {req.pickup}
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation className="size-3" />
                        {req.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {req.time}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
                    Accept Request
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FARMER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function FarmerDashboard() {
  const { user, setCurrentPage } = useAppStore();

  const products = [
    { id: 1, name: 'Organic Tomatoes', price: 40, unit: 'kg', quantity: 150, category: 'Vegetables', isOrganic: true },
    { id: 2, name: 'Basmati Rice', price: 85, unit: 'kg', quantity: 500, category: 'Grains', isOrganic: false },
    { id: 3, name: 'Fresh Spinach', price: 25, unit: 'kg', quantity: 80, category: 'Vegetables', isOrganic: true },
    { id: 4, name: 'Whole Wheat Flour', price: 45, unit: 'kg', quantity: 300, category: 'Grains', isOrganic: false },
    { id: 5, name: 'Organic Carrots', price: 35, unit: 'kg', quantity: 120, category: 'Vegetables', isOrganic: true },
    { id: 6, name: 'Green Apples', price: 120, unit: 'kg', quantity: 200, category: 'Fruits', isOrganic: true },
  ];

  const categoryColors: Record<string, string> = {
    Vegetables: 'bg-green-100 text-green-700 border-green-200',
    Grains: 'bg-amber-100 text-amber-700 border-amber-200',
    Fruits: 'bg-purple-100 text-purple-700 border-purple-200',
    Dairy: 'bg-blue-100 text-blue-700 border-blue-200',
    Bakery: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Farmer'}
          </h1>
          <p className="text-muted-foreground">Your farm marketplace</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Products Listed" value={15} icon={Sprout} color="bg-green-500" delay={0} />
        <StatCard title="Total Sold" value="2,400+ kg" icon={TrendingUp} color="bg-emerald-500" delay={0.1} />
        <StatCard title="Revenue" value="₹85,000" icon={Coins} color="bg-amber-500" delay={0.2} />
        <StatCard title="Buyers Connected" value={120} icon={Users} color="bg-blue-500" delay={0.3} />
      </motion.div>

      {/* My Products */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>My Products</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </CardHeader>
          <CardContent>
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
                            <h3 className="font-semibold">{product.name}</h3>
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
                        <span>{product.quantity} {product.unit} available</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="size-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeInUp} transition={{ delay: 0.6 }} className="flex flex-wrap gap-4">
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700"
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// Chart data
const donationsOverTime = [
  { month: 'Jul', count: 45 },
  { month: 'Aug', count: 62 },
  { month: 'Sep', count: 88 },
  { month: 'Oct', count: 105 },
  { month: 'Nov', count: 130 },
  { month: 'Dec', count: 158 },
  { month: 'Jan', count: 172 },
];

const foodByCategory = [
  { name: 'Cooked Food', value: 35 },
  { name: 'Vegetables', value: 25 },
  { name: 'Grains', value: 18 },
  { name: 'Bakery', value: 12 },
  { name: 'Fruits & Dairy', value: 10 },
];

const CATEGORY_COLORS = ['#10b981', '#f59e0b', '#84cc16', '#f97316', '#14b8a6'];

const topDonors = [
  { name: 'Rajesh Kumar', donations: 87 },
  { name: 'Hotel Grand', donations: 72 },
  { name: 'Green Farms', donations: 65 },
  { name: 'City Bakery', donations: 54 },
  { name: 'Fresh Mart', donations: 48 },
];

const userGrowth = [
  { month: 'Jul', users: 245 },
  { month: 'Aug', users: 380 },
  { month: 'Sep', users: 520 },
  { month: 'Oct', users: 710 },
  { month: 'Nov', users: 950 },
  { month: 'Dec', users: 1280 },
  { month: 'Jan', users: 1560 },
];

const recentActivity = [
  { icon: Package, color: 'bg-emerald-100 text-emerald-600', action: 'New food donation listed by Hotel Grand', time: '5 min ago' },
  { icon: CheckCircle2, color: 'bg-blue-100 text-blue-600', action: 'Delivery completed by Volunteer Rahul', time: '12 min ago' },
  { icon: Users, color: 'bg-purple-100 text-purple-600', action: 'New NGO "Feed the Future" registered', time: '25 min ago' },
  { icon: Sprout, color: 'bg-green-100 text-green-600', action: 'Farmer Amit listed 5 new products', time: '1 hour ago' },
  { icon: Handshake, color: 'bg-amber-100 text-amber-600', action: 'Hope Shelter claimed 30 food packages', time: '2 hours ago' },
  { icon: AlertCircle, color: 'bg-red-100 text-red-600', action: 'Food donation expired - Fresh Fruits (15 kg)', time: '3 hours ago' },
  { icon: Heart, color: 'bg-pink-100 text-pink-600', action: 'Community milestone: 40,000+ meals served', time: '5 hours ago' },
];

export function AdminDashboard() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview &amp; analytics</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard title="Total Donations" value="1,247" icon={Package} color="bg-emerald-500" delay={0} />
        <StatCard title="Food Saved" value="15,680 kg" icon={Leaf} color="bg-green-500" delay={0.05} />
        <StatCard title="People Served" value="42,350" icon={Users} color="bg-amber-500" delay={0.1} />
        <StatCard title="Farmers Connected" value={328} icon={Sprout} color="bg-lime-500" delay={0.15} />
        <StatCard title="Active Volunteers" value={892} icon={Truck} color="bg-blue-500" delay={0.2} />
        <StatCard title="NGOs Active" value={156} icon={Building} color="bg-purple-500" delay={0.25} />
      </motion.div>

      {/* Charts Section */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Donations Over Time - AreaChart */}
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

          {/* Food by Category - PieChart */}
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
                      {foodByCategory.map((_entry, index) => (
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
                  {foodByCategory.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[index] }}
                      />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="font-medium ml-auto">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Donors - BarChart */}
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

          {/* User Growth - LineChart */}
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

      {/* Recent Activity Feed */}
      <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className={`rounded-full p-2 shrink-0 ${activity.color}`}>
                    <activity.icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
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
