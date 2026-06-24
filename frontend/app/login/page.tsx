'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Building, Shield, Globe, Sparkles, DollarSign, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../utils/store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();
  const loginStore = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email: data.email });
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      console.log('Login response status:', response.status);
      const result = await response.json();
      console.log('Login response data:', result);

      if (result.success) {
        // Login successful
        const userData = result.data.user;
        const token = result.data.session.access_token;
        
        // Map backend role to frontend role
        const roleMapping: { [key: string]: 'customer' | 'agency' | 'admin' } = {
          'customer': 'customer',
          'agency': 'agency', 
          'admin': 'admin'
        };

        loginStore.login(
          {
            id: userData.id,
            name: userData.full_name,
            email: userData.email,
            role: roleMapping[userData.role] || 'customer',
            avatar: userData.avatar_url,
            agencyName: userData.role === 'agency' ? 'Agency' : undefined,
          },
          token
        );

        // Redirect based on role
        if (userData.role === 'agency') {
          router.push('/dashboard/agency');
        } else if (userData.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/customer');
        }
      } else {
        // Handle login error with detailed message
        console.error('Login failed:', result);
        alert(result.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/">
              <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </Link>
          </div>

          {/* Logo and Tagline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">WanderWild</h1>
            <p className="text-gray-600">Connect with tourism providers worldwide.</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <Link
              href="/register"
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </Link>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Your email"
                aria-invalid={!!errors.email}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2  ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  aria-invalid={!!errors.password}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2  ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full px-6 py-3 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-primary-dark)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1e293b'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)'}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Test Login Buttons */}
          <div className="mt-8">
            <div className="text-center text-sm text-gray-500 mb-4">Quick test login</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  loginStore.login(
                    { id: 'u1', name: 'Demo Customer', email: 'customer@wanderwild.test', role: 'customer' },
                    'demo-token'
                  );
                  router.push('/dashboard/customer');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Login as Customer
              </button>
              <button
                onClick={() => {
                  loginStore.login(
                    { id: 'a1', name: 'Demo Agency', email: 'agency@wanderwild.test', role: 'agency', agencyName: 'Demo Travels' },
                    'demo-token'
                  );
                  router.push('/dashboard/agency');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Login as Agency
              </button>
              <button
                onClick={() => {
                  loginStore.login(
                    { id: 'p1', name: 'Demo Admin', email: 'admin@wanderwild.test', role: 'admin' },
                    'demo-token'
                  );
                  router.push('/dashboard/admin');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Login as Admin
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]/80 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Promotional Banner */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex flex-col justify-center p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-6">
            Experience Tourism Like Never Before
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Connect with tourism providers worldwide and create unforgettable travel experiences.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Global Network</h3>
                <p className="text-gray-200">Access to tourism providers from over 100 countries</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Itineraries</h3>
                <p className="text-gray-200">Personalized travel plans based on your preferences</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Competitive Pricing</h3>
                <p className="text-gray-200">Transparent pricing with bidding system</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
