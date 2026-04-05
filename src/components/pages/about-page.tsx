'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Target,
  Users,
  Sprout,
  Globe,
  Shield,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';

const sdgTargets = [
  {
    icon: Heart,
    title: 'End hunger and ensure access to safe food',
    description:
      'Ensure everyone has access to sufficient, safe, and nutritious food all year round.',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: Shield,
    title: 'End malnutrition in all its forms',
    description:
      'End all forms of malnutrition, including achieving by 2025 the internationally agreed targets on stunting and wasting.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Sprout,
    title: 'Promote sustainable agriculture',
    description:
      'Ensure sustainable food production systems and implement resilient agricultural practices.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Users,
    title: 'Support small-scale farmers',
    description:
      'Ensure that small-scale food producers have equal access to land, technology, and markets.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Globe,
    title: 'Ensure resilient food systems',
    description:
      'Maintain genetic diversity of seeds and cultivated plants, and ensure fair distribution of benefits.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
];

const timelineEvents = [
  {
    year: '2021',
    title: 'The Idea was Born',
    description:
      'During the pandemic, our founders witnessed massive food waste alongside growing hunger. The idea for HungerFree sparked from a simple observation.',
  },
  {
    year: '2022',
    title: 'First Pilot in Mumbai',
    description:
      'We launched our first pilot program connecting 50 restaurants with local NGOs, rescuing over 2,000 meals in the first month.',
  },
  {
    year: '2023',
    title: 'Expanding Across India',
    description:
      'HungerFree expanded to 10 cities, partnered with 100+ NGOs, and onboarded 500+ volunteer drivers for food delivery.',
  },
  {
    year: '2024',
    title: 'Farmer Marketplace Launch',
    description:
      'We introduced the Farmer Marketplace to connect small-scale farmers directly with buyers, improving their income and reducing food waste.',
  },
  {
    year: '2025',
    title: 'Impact at Scale',
    description:
      'Today, HungerFree has facilitated over 500,000 meals saved, connected 1,000+ farmers, and serves communities across 25 cities in India.',
  },
];

const teamMembers = [
  {
    name: 'Priya Sharma',
    role: 'Founder & CEO',
    initials: 'PS',
    color: 'bg-emerald-500',
  },
  {
    name: 'Amit Patel',
    role: 'Chief Technology Officer',
    initials: 'AP',
    color: 'bg-blue-500',
  },
  {
    name: 'Kavitha Reddy',
    role: 'Head of Operations',
    initials: 'KR',
    color: 'bg-amber-500',
  },
  {
    name: 'Rahul Gupta',
    role: 'Community Lead',
    initials: 'RG',
    color: 'bg-purple-500',
  },
];

const partners = [
  { name: 'UN World Food Programme', color: 'bg-blue-500' },
  { name: 'FAO India', color: 'bg-emerald-600' },
  { name: 'Feeding India', color: 'bg-amber-500' },
  { name: 'Rotary International', color: 'bg-yellow-600' },
  { name: 'The Akshaya Patra Foundation', color: 'bg-red-500' },
  { name: 'Oxfam India', color: 'bg-purple-500' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function AboutPage() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30">
      <FoodPatternBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>← Back to Home</span>
        </button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1">
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            Supporting UN SDG Goal 2: Zero Hunger
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl mb-4">
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
              HungerFree
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            We are on a mission to eliminate hunger by connecting surplus food
            with those who need it most. Every meal shared is a step towards a
            hunger-free world.
          </p>
        </motion.div>

        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-800 text-white overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Target className="h-10 w-10" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                  <p className="text-emerald-100 leading-relaxed text-base sm:text-lg">
                    To end hunger and reduce food waste by building a technology-driven
                    platform that seamlessly connects donors, NGOs, volunteers, and
                    farmers. We believe that no food should go to waste while anyone
                    goes hungry.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SDG 2 Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              What is SDG Goal 2?
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              The United Nations Sustainable Development Goal 2 aims to achieve Zero
              Hunger by 2030. It calls for urgent action to end hunger, achieve food
              security, improve nutrition, and promote sustainable agriculture.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sdgTargets.map((target, index) => (
              <motion.div
                key={target.title}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${target.bg} mb-4`}
                    >
                      <target.icon className={`h-6 w-6 ${target.color}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {target.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {target.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Story - Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Story</h2>
            <p className="text-muted-foreground">
              From a simple idea to a nationwide movement
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 -translate-x-1/2" />

            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative flex items-start gap-6 ${
                    index % 2 === 0
                      ? 'sm:flex-row'
                      : 'sm:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold z-10 shadow-md">
                    <Calendar className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div
                    className={`ml-16 sm:ml-0 sm:w-[calc(50%-3rem)] ${
                      index % 2 === 0
                        ? 'sm:text-right sm:pr-4'
                        : 'sm:text-left sm:pl-4'
                    }`}
                  >
                    <Badge
                      variant="outline"
                      className="mb-2 border-emerald-200 text-emerald-700 bg-emerald-50"
                    >
                      {event.year}
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground">
              Passionate individuals working towards a common goal
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarFallback
                          className={`${member.color} text-white text-xl font-bold`}
                        >
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Our Partners
            </h2>
            <p className="text-muted-foreground">
              Collaborating with organizations that share our vision
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-6 hover:shadow-md transition-shadow duration-300 h-28">
                  <div
                    className={`h-10 w-10 rounded-lg ${partner.color} mb-3 flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {partner.name.charAt(0)}
                  </div>
                  <p className="text-xs text-center text-muted-foreground font-medium leading-tight">
                    {partner.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
