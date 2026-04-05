'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  UserPlus,
  Search,
  Link2,
  Heart,
  MapPin,
  ShieldCheck,
  Leaf,
  Sprout,
  Bell,
  BarChart3,
  ArrowRight,
  Package,
  Users,
  HandHelping,
} from 'lucide-react';

/* ────────────────────────────── animation helpers ────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

function Section({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ────────────────────────────── hero stats ──────────────────────────────── */

const heroStats = [
  { value: '42,350+', label: 'People Fed', icon: Users },
  { value: '12,470+', label: 'Meals Donated', icon: Package },
  { value: '892+', label: 'Active Volunteers', icon: HandHelping },
  { value: '328+', label: 'Farmers Connected', icon: Sprout },
];

/* ────────────────────────────── how‑it‑works steps ──────────────────────── */

const steps = [
  {
    num: 1,
    icon: UserPlus,
    title: 'Register',
    desc: 'Sign up as a donor, NGO, volunteer, or farmer',
  },
  {
    num: 2,
    icon: Search,
    title: 'List or Browse',
    desc: 'List surplus food or browse available donations',
  },
  {
    num: 3,
    icon: Link2,
    title: 'Connect',
    desc: 'NGOs request pickups, volunteers accept delivery',
  },
  {
    num: 4,
    icon: Heart,
    title: 'Deliver Impact',
    desc: 'Food reaches those who need it most',
  },
];

/* ────────────────────────────── impact stats ────────────────────────────── */

const impactStats = [
  {
    value: '15,680+',
    label: 'kg Food Saved',
    bg: 'bg-emerald-600',
    icon: Leaf,
  },
  {
    value: '42,350+',
    label: 'People Served',
    bg: 'bg-amber-500',
    icon: Users,
  },
  {
    value: '1,247+',
    label: 'Donations Made',
    bg: 'bg-emerald-700',
    icon: Package,
  },
  {
    value: '328+',
    label: 'Farmers Connected',
    bg: 'bg-amber-600',
    icon: Sprout,
  },
];

/* ────────────────────────────── features ────────────────────────────────── */

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Tracking',
    desc: 'Track food donations from pickup to delivery',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Partners',
    desc: 'All NGOs and volunteers are verified',
  },
  {
    icon: Leaf,
    title: 'Zero Food Waste',
    desc: 'Redirect surplus food to those in need',
  },
  {
    icon: Sprout,
    title: 'Direct Farm Sales',
    desc: 'Farmers sell directly, no middlemen',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Get alerts for nearby food donations',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    desc: 'Track your contribution to Zero Hunger',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   LandingPage
   ══════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const { setCurrentPage } = useAppStore();

  const navigate = (page: 'donate-food' | 'signup' | 'volunteer' | 'available-food') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ───── 1. Hero Section ───── */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center overflow-hidden"
      >
        <FoodPatternBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left – Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  UN SDG Goal 2 — Zero Hunger
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
              >
                Every Meal Matters{' '}
                <span className="text-emerald-600">Zero Hunger</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed"
              >
                Join our mission to end hunger by 2030. Connect surplus food with
                those who need it most — one meal at a time.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('donate-food')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 px-8 h-12 text-base font-semibold"
                >
                  Donate Food
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('signup')}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 px-8 h-12 text-base font-semibold"
                >
                  Join as Volunteer
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
              >
                {heroStats.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <stat.icon className="h-4 w-4 text-emerald-500" />
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right – Decorative Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:flex items-center justify-center relative"
              aria-hidden="true"
            >
              <div className="relative w-full max-w-md aspect-square">
                {/* Large background circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-amber-50 opacity-60" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-emerald-200/70 to-amber-100/70" />
                <div className="absolute inset-14 rounded-full bg-white/60 backdrop-blur-sm" />

                {/* Abstract food shapes */}
                <div className="absolute top-8 right-12 w-20 h-20 rounded-2xl bg-emerald-500/20 rotate-12 animate-pulse" />
                <div className="absolute bottom-16 left-8 w-16 h-16 rounded-full bg-amber-400/25 -rotate-6 animate-pulse delay-500" />
                <div className="absolute top-1/3 left-4 w-12 h-12 rounded-xl bg-emerald-600/15 rotate-[25deg]" />
                <div className="absolute bottom-8 right-8 w-14 h-14 rounded-2xl bg-amber-500/20 -rotate-12 animate-pulse delay-300" />
                <div className="absolute top-16 left-16 w-10 h-10 rounded-full bg-emerald-400/20" />
                <div className="absolute bottom-24 right-16 w-8 h-8 rounded-lg bg-amber-300/25 rotate-45" />

                {/* Center icon cluster */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30 -mt-2">
                      <Sprout className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Connecting dots */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                  <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-emerald-400/40" />
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-amber-400/40" />
                  <div className="absolute left-0 top-1/2 w-2 h-2 rounded-full bg-emerald-300/40" />
                  <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-amber-300/40" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── 2. How It Works ───── */}
      <Section
        id="how-it-works"
        className="py-20 lg:py-28 bg-gray-50/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              How HungerFree Works
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
              Four simple steps to bridge the gap between surplus food and empty plates.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-[60px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[2px] bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={scaleIn}
                custom={i}
                className="relative"
              >
                <Card className="relative z-10 text-center pt-8 pb-6 h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="flex flex-col items-center gap-4 px-6">
                    {/* Number + icon */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
                        <step.icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ───── 3. Impact / Statistics ───── */}
      <Section id="impact" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Our Impact in Numbers
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
              Real results from a community dedicated to ending hunger.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                custom={i}
                className="group"
              >
                <Card className={`${stat.bg} text-white border-0 overflow-hidden hover:scale-[1.03] transition-transform duration-300 shadow-lg`}>
                  <CardContent className="flex flex-col items-center gap-3 py-8 px-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-extrabold">{stat.value}</p>
                    <p className="text-sm font-medium text-white/80">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ───── 4. Features ───── */}
      <Section
        id="features"
        className="py-20 lg:py-28 bg-gray-50/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Why Choose HungerFree?
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
              Powerful tools designed to maximize impact and minimize food waste.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={scaleIn}
                custom={i}
                className="group"
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <feat.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ───── 5. CTA ───── */}
      <Section id="cta" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-16 sm:px-12 sm:py-20 text-center shadow-2xl"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Ready to Make a Difference?
              </h2>
              <p className="mt-5 text-lg text-emerald-100 max-w-lg mx-auto">
                Every donation counts, every volunteer matters. Join thousands
                already fighting hunger in their communities.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('donate-food')}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg px-8 h-12 text-base font-semibold"
                >
                  Start Donating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('volunteer')}
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white px-8 h-12 text-base font-semibold"
                >
                  Become a Volunteer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
