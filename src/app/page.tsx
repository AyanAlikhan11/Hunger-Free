'use client';

import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import LandingPage from '@/components/home/landing-page';
import LoginPage from '@/components/auth/login-page';
import SignupPage from '@/components/auth/signup-page';
import { DashboardRouter } from '@/components/dashboard/dashboards';
import AvailableFoodPage from '@/components/food/available-food-page';
import MarketplacePage from '@/components/marketplace/marketplace-page';
import AboutPage from '@/components/pages/about-page';
import ContactPage from '@/components/pages/contact-page';
import { Apple } from 'lucide-react';

// ✅ Leaflet pages MUST be dynamically imported with SSR disabled
const DonateFoodPage = dynamic(() => import('@/components/food/donate-food-page'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-sm text-muted-foreground">Loading donate page...</div>
  ),
});

// NOTE: keep the path exactly as in your project.
// You currently import VolunteerPanel from: '@/components/dashboard/volunteer-panel'
const VolunteerPanel = dynamic(() => import('@/components/dashboard/volunteer-panel'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-sm text-muted-foreground">Loading volunteer panel...</div>
  ),
});

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl animate-pulse" />
          <div className="w-24 h-6 bg-gray-100 rounded animate-pulse" />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/25">
            <Apple className="h-8 w-8 text-white" />
          </div>
          <div className="w-48 h-3 bg-gray-200 rounded mx-auto animate-pulse" />
          <div className="w-64 h-3 bg-gray-100 rounded mx-auto animate-pulse" />
          <div className="w-32 h-10 bg-emerald-100 rounded-lg mx-auto animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const _hasHydrated = useAppStore((s) => s._hasHydrated);
  const currentPage = useAppStore((s) => s.currentPage);

  if (!_hasHydrated) {
    return <LoadingSkeleton />;
  }

  // Auth pages have their own layouts without navbar/footer
  if (currentPage === 'login') {
    return <LoginPage />;
  }

  if (currentPage === 'signup') {
    return <SignupPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="relative">
          <FoodPatternBackground />
        </div>
        <div className="relative z-10">
          {currentPage === 'home' && <LandingPage />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'contact' && <ContactPage />}
          {currentPage === 'dashboard' && <DashboardRouter />}

          {/* ✅ Leaflet pages loaded client-only */}
          {currentPage === 'donate-food' && <DonateFoodPage />}
          {currentPage === 'volunteer' && <VolunteerPanel />}

          {currentPage === 'available-food' && <AvailableFoodPage />}
          {currentPage === 'marketplace' && <MarketplacePage />}

          {currentPage === 'admin' && <DashboardRouter />}
        </div>
      </main>
      <Footer />
    </div>
  );
}