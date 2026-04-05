'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Apple, HandHelping, Truck, Sprout, Shield } from 'lucide-react';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';

const demoRoles = [
  { label: 'Login as Donor', email: 'rajesh@gmail.com', icon: Apple, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { label: 'Login as NGO', email: 'priya@gmail.com', icon: HandHelping, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { label: 'Login as Volunteer', email: 'amit@gmail.com', icon: Truck, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Login as Farmer', email: 'sunita@gmail.com', icon: Sprout, color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100' },
  { label: 'Login as Admin', email: 'admin@hungerfree.org', icon: Shield, color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, setCurrentPage } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { user } = await response.json();
      login(user);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'password' }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user } = await response.json();
      login(user);
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 relative">
      <FoodPatternBackground />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <Card className="overflow-hidden border-0 shadow-2xl shadow-emerald-900/5">
          <div className="flex flex-col lg:flex-row">
            {/* Left decorative panel - hidden on mobile */}
            <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
              {/* SVG decorative patterns */}
              <svg className="absolute top-10 left-10 w-32 h-32 text-emerald-500/20" viewBox="0 0 100 100" fill="currentColor">
                <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(-30 50 50)" />
                <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(10 50 50)" />
                <ellipse cx="50" cy="50" rx="8" ry="18" transform="rotate(50 50 50)" />
                <line x1="50" y1="20" x2="50" y2="80" strokeWidth="2" />
              </svg>
              <svg className="absolute bottom-20 right-10 w-24 h-24 text-emerald-400/15" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="55" r="30" />
                <rect x="46" y="15" width="8" height="25" rx="4" />
              </svg>
              <svg className="absolute top-1/3 right-16 w-20 h-20 text-amber-400/15 animate-float" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10 Q80 40 50 90 Q20 40 50 10 Z" />
                <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <div className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-amber-400/20 animate-pulse-soft" />
              <div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-white/10 animate-pulse-soft stagger-2" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-emerald-100 text-sm font-medium tracking-wider uppercase">HungerFree</span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                  Working Towards<br />
                  <span className="text-amber-300">Zero Hunger</span>
                </h2>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  Join our mission to reduce food waste and feed those in need. Every meal shared is a step towards a hunger-free world.
                </p>
              </div>

              <div className="relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '12K+', label: 'Meals Donated' },
                    { value: '500+', label: 'Active Donors' },
                    { value: '300+', label: 'NGOs Served' },
                    { value: '50+', label: 'Volunteers' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-emerald-200/70 text-xs mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 p-6 sm:p-8 xl:p-12">
              <CardHeader className="p-0 mb-6 gap-2">
                <div className="lg:hidden flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <Apple className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-emerald-700 font-semibold text-sm tracking-wide">HungerFree</span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  Sign in to your account to continue making a difference
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-emerald-600/25 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  {/* Demo hint */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-amber-700">
                      Demo: use any email with password <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-800">&apos;password&apos;</code>
                    </p>
                  </div>

                  {/* Quick role login buttons */}
                  <div className="space-y-3">
                    <div className="text-center text-xs text-gray-400 uppercase tracking-wider font-medium">
                      Quick Demo Login
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {demoRoles.map((role) => (
                        <button
                          key={role.email}
                          type="button"
                          onClick={() => handleDemoLogin(role.email)}
                          disabled={isLoading}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${role.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <role.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{role.label.replace('Login as ', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                {/* Sign up link */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => setCurrentPage('signup')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
