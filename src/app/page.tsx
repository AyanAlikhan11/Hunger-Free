'use client';

import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import LandingPage from '@/components/home/landing-page';
import LoginPage from '@/components/auth/login-page';
import SignupPage from '@/components/auth/signup-page';
import { DashboardRouter } from '@/components/dashboard/dashboards';
import DonateFoodPage from '@/components/food/donate-food-page';
import AvailableFoodPage from '@/components/food/available-food-page';
import MarketplacePage from '@/components/marketplace/marketplace-page';
import VolunteerPanel from '@/components/dashboard/volunteer-panel';
import AboutPage from '@/components/pages/about-page';
import ContactPage from '@/components/pages/contact-page';

function PageContent() {
  const { currentPage } = useAppStore();

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
          {currentPage === 'donate-food' && <DonateFoodPage />}
          {currentPage === 'available-food' && <AvailableFoodPage />}
          {currentPage === 'marketplace' && <MarketplacePage />}
          {currentPage === 'volunteer' && <VolunteerPanel />}
          {currentPage === 'admin' && <DashboardRouter />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return <PageContent />;
}
