'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Apple,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

const footerLinks = {
  platform: [
    { label: 'Donate Food', page: 'donate-food' as const },
    { label: 'Available Food', page: 'available-food' as const },
    { label: 'Marketplace', page: 'marketplace' as const },
    { label: 'Volunteer', page: 'volunteer' as const },
  ],
  company: [
    { label: 'About Us', page: 'about' as const },
    { label: 'Contact', page: 'contact' as const },
    { label: 'Our Impact', page: 'home' as const },
  ],
  roles: [
    { label: 'For Donors', page: 'signup' as const },
    { label: 'For NGOs', page: 'signup' as const },
    { label: 'For Volunteers', page: 'signup' as const },
    { label: 'For Farmers', page: 'signup' as const },
  ],
};

export function Footer() {
  const { setCurrentPage } = useAppStore();
  const [email, setEmail] = useState('');

  const navigate = (page: string) => {
    setCurrentPage(page as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Join the movement to end hunger</h3>
              <p className="text-gray-400 text-sm">Subscribe to our newsletter and stay updated on our impact.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 w-full md:w-72 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                Subscribe
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 mb-4 cursor-pointer"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Apple className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-gray-900" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Hunger<span className="text-emerald-400">Free</span>
              </span>
            </button>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Working towards SDG Goal 2: Zero Hunger. Connecting surplus food with those who need it most.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get Involved</h4>
            <ul className="space-y-3">
              {footerLinks.roles.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} HungerFree. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">Privacy Policy</button>
              <button className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer">Terms of Service</button>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for Zero Hunger
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
