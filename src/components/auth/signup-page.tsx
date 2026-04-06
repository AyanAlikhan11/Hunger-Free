'use client';

import { useState, useMemo, useEffect } from 'react';
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

// Firebase client auth (Google)
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config';

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

function GoogleIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.418,34.569,44,30.035,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
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

  // Google pending token (if user came from login page role_required)
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);

  const { login, setCurrentPage } = useAppStore();

  useEffect(() => {
    const pendingRaw = sessionStorage.getItem('hf_google_pending');
    if (!pendingRaw) return;

    try {
      const pending = JSON.parse(pendingRaw);
      if (pending?.idToken) setGoogleIdToken(pending.idToken);
      if (pending?.name) setName(pending.name);
      if (pending?.email) setEmail(pending.email);
    } catch {
      // ignore
    }
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!isFirebaseConfigured || !firebaseAuth) {
        throw new Error('Google Sign-In is not configured.');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();

      setGoogleIdToken(idToken);

      // Prefill name/email from google
      setName(result.user.displayName || '');
      setEmail(result.user.email || '');

      sessionStorage.setItem(
        'hf_google_pending',
        JSON.stringify({
          idToken,
          name: result.user.displayName || '',
          email: result.user.email || '',
        })
      );

      toast.success('Google account selected. Now choose a role to finish signup.');
    } catch (e: any) {
      setError(e?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }

    // If Google flow is active, password fields are not required
    const isGoogleFlow = Boolean(googleIdToken);

    if (!isGoogleFlow) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions.');
      return;
    }

    setIsLoading(true);

    try {
      // Google signup completion (create profile with role)
      if (googleIdToken) {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login-google',
            idToken: googleIdToken,
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
          sessionStorage.removeItem('hf_google_pending');
          login(data.user, data.token);
          toast.success('Account created successfully!', {
            description: `Welcome to HungerFree, ${data.user.name}!`,
          });
        }
        return;
      }

      // Normal email/password signup
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
              {/* ... unchanged left panel ... */}
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
            </div>

            {/* Right form panel */}
            <div className="flex-1 p-6 sm:p-8 xl:p-12">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  ← Back to Home
                </button>
              </div>

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
                {/* Google button (added) */}
                <div className="space-y-4 mb-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full h-11 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    <GoogleIcon className="w-5 h-5 mr-2" />
                    Continue with Google
                  </Button>

                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="px-3 text-xs text-gray-400">OR</span>
                    <div className="flex-1 border-t border-gray-200" />
                  </div>
                </div>

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
                        required={!googleIdToken}
                        disabled={Boolean(googleIdToken)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && !googleIdToken && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
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
                        required={!googleIdToken}
                        disabled={Boolean(googleIdToken)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!passwordsMatch && !googleIdToken && (
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
                              isSelected ? role.selectedColor : `${role.color} opacity-60 hover:opacity-90`
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