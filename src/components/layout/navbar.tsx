'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { PageRoute } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Menu,
  Apple,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Bell,
  ChevronDown,
  HandHelping,
  Truck,
  Sprout,
  Shield,
} from 'lucide-react';

const navLinks: { label: string; page: PageRoute; icon?: React.ReactNode }[] = [
  { label: 'Home', page: 'home' },
  { label: 'About', page: 'about' },
  { label: 'Donate Food', page: 'donate-food' },
  { label: 'Available Food', page: 'available-food' },
  { label: 'Marketplace', page: 'marketplace' },
  { label: 'Contact', page: 'contact' },
];

const roleIcons: Record<string, React.ReactNode> = {
  donor: <Apple className="h-4 w-4" />,
  ngo: <HandHelping className="h-4 w-4" />,
  volunteer: <Truck className="h-4 w-4" />,
  farmer: <Sprout className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
};

export function Navbar() {
  const {
    currentPage,
    setCurrentPage,
    user,
    isAuthenticated,
    logout,
    navbarVisible,
    setNavbarVisible,
    notifications,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore();
  const [lastScrollY, setLastScrollY] = useState(0);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      setNavbarVisible(false);
    } else {
      setNavbarVisible(true);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY, setNavbarVisible]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const navigate = (page: PageRoute) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        navbarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
                  <Apple className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Hunger<span className="text-emerald-600">Free</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    currentPage === link.page
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => navigate('dashboard')}
                      className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('dashboard')}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1.5" />
                    Dashboard
                  </Button>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                    {roleIcons[user.role]}
                    <span className="text-sm font-medium text-gray-700 capitalize">{user.role}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-500 hover:text-red-600"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('login')}
                    className="text-gray-600"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('signup')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => navigate('dashboard')}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between py-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                          <Apple className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          Hunger<span className="text-emerald-600">Free</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 py-4 space-y-1">
                      {navLinks.map(link => (
                        <button
                          key={link.page}
                          onClick={() => navigate(link.page)}
                          className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                            currentPage === link.page
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>

                    <div className="border-t py-4 space-y-2">
                      {isAuthenticated && user ? (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2 mb-2">
                            {roleIcons[user.role]}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full border-emerald-200 text-emerald-700"
                            onClick={() => navigate('dashboard')}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-gray-500"
                            onClick={logout}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate('login')}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                          </Button>
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => navigate('signup')}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Sign Up
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
