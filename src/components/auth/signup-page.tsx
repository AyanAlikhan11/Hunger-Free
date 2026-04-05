'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Apple, HandHelping, Truck, Sprout, Shield, Check } from 'lucide-react';
import { FoodPatternBackground } from '@/components/shared/food-pattern';
import { useAppStore } from '@/lib/store';
import type { UserRole } from '@/lib/types';
import { toast } from 'sonner';

const roles = [
  { id: 'donor' as UserRole, label: 'Donor', emoji: '\uD83C\uDF7D\uFE0F', subtitle: 'Restaurants, Hotels, Households', icon: Apple, color: 'border-amber-400 bg-amber-50 text-amber-700', selectedColor: 'border-amber-500 bg-amber-100 ring-2 ring-amber-500/20' },
  { id: 'ngo' as UserRole, label: 'NGO', emoji: '\uD83E\uDD1D', subtitle: 'Non-Profit Organizations', icon: HandHelping, color: 'border-emerald-400 bg-emerald-50 text-emerald-700', selectedColor: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-500/20' },
  { id: 'volunteer' as UserRole, label: 'Volunteer', emoji: '\uD83D\uDE9A', subtitle: 'Delivery Heroes', icon: Truck, color: 'border-blue-400 bg-blue-50 text-blue-700', selectedColor: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500/20' },
  { id: 'farmer' as UserRole, label: 'Farmer', emoji: '\uD83C\uDF3E', subtitle: 'Agricultural Producers', icon: Sprout, color: 'border-lime-400 bg-lime-50 text-lime-700', selectedColor: 'border-lime-500 bg-lime-100 ring-2 ring-lime-500/20' },
  { id: 'admin' as UserRole, label: 'Admin', emoji: '\uD83D\uDEE1\uFE0F', subtitle: 'Platform Administrators', icon: Shield, color: 'border-purple-400 bg-purple-50 text-purple-700', selectedColor: 'border-purple-500 bg-purple-100 ring-2 ring-purple-500/20' },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string; bgColor: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', bgColor: 'text-red-600 bg-red-50' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500', bgColor: 'text-orange-600 bg-orange-50' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500', bgColor: 'text-yellow-600 bg-yellow-50' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500', bgColor: 'text-emerald-600 bg-emerald-50' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-600', bgColor: 'text-emerald-700 bg-emerald-50' };
}

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, setCurrentPage } = useAppStore();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          name,
          email,
          password,
          role: selectedRole,
          phone: phone || undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.user) {
        login(data.user, data.token);
        toast.success('Account created successfully!', {
          description: `Welcome to HungerFree, ${data.user.name}!`,
        });
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 relative">
      <FoodPatternBackground />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-emerald-400/20 animate-pulse-soft" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-amber-400/20 animate-pulse-soft stagger-2" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <Card className="overflow-hidden border-0 shadow-2xl shadow-emerald-900/5">
          <div className="flex flex-col lg:flex-row">
            {/* Left decorative panel - hidden on mobile */}
            <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
              {/* SVG decorative patterns */}
              <svg className="absolute top-16 right-8 w-28 h-28 text-emerald-500/20" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10 Q80 40 50 90 Q20 40 50 10 Z" />
                <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <svg className="absolute bottom-16 left-8 w-20 h-20 text-amber-400/15 animate-float" viewBox="0 0 100 100" fill="currentColor">
                <ellipse cx="50" cy="50" rx="10" ry="20" transform="rotate(-15 50 50)" />
                <ellipse cx="50" cy="50" rx="10" ry="20" transform="rotate(15 50 50)" />
              </svg>
              <div className="absolute top-1/2 right-1/4 w-2.5 h-2.5 rounded-full bg-amber-300/20 animate-pulse-soft stagger-3" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-emerald-100 text-sm font-medium tracking-wider uppercase">HungerFree</span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                  Join the<br />
                  <span className="text-amber-300">Movement</span>
                </h2>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  Create an account and become part of the solution. Whether you donate food, volunteer your time, or connect communities — every action counts.
                </p>
              </div>

              {/* Impact preview */}
              <div className="relative z-10 space-y-4">
                <div className="text-emerald-200/60 text-xs uppercase tracking-wider font-medium">Your Impact Starts Here</div>
                <div className="space-y-3">
                  {[
                    { icon: '\uD83C\uDF4E', text: 'Reduce food waste in your community' },
                    { icon: '\uD83E\uDD1D', text: 'Help feed those in need' },
                    { icon: '\uD83C\uDF31', text: 'Support sustainable agriculture' },
                    { icon: '\u2764\uFE0F', text: 'Build a better future for all' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-emerald-50/90 text-sm">{item.text}</span>
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
                  Create an account
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  Start making a difference in your community today
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-email"
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
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
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
                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                level <= passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${passwordStrength.bgColor}`}>
                          {passwordStrength.label}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${
                          !passwordsMatch ? 'border-red-300 focus-visible:border-red-400' : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!passwordsMatch && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Select Your Role <span className="text-red-400">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {roles.map((role) => {
                        const isSelected = selectedRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? role.selectedColor
                                : `${role.color} opacity-60 hover:opacity-90`
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <role.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-xs font-semibold">{role.label}</span>
                            <span className="text-[10px] opacity-70 text-center leading-tight hidden sm:block">
                              {role.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedRole && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        Selected: {roles.find(r => r.id === selectedRole)?.label} — {roles.find(r => r.id === selectedRole)?.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                      className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <span className="text-emerald-600 font-medium hover:underline cursor-pointer">Terms &amp; Conditions</span>
                      {' '}and{' '}
                      <span className="text-emerald-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>
                    </Label>
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
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Sign in link */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <button
                      onClick={() => setCurrentPage('login')}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      Sign In
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
