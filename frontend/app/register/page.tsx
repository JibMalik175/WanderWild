'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Globe, Sparkles, DollarSign, ChevronDown, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  accountType: z.enum(['Traveler', 'Tourism Provider']),
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      accountType: 'Traveler',
    },
  });

  const selectedAccountType = watch('accountType');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Map frontend account types to backend roles
      const roleMapping = {
        'Traveler': 'customer',
        'Tourism Provider': 'agency'
      };

      const registrationData = {
        full_name: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        role: roleMapping[data.accountType]
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (result.success) {
        // Registration successful
        router.push('/login?message=Registration successful. Please log in.');
      } else {
        // Handle registration error
        console.error('Registration failed:', result.message);
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Register Form */}
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
            <Link
              href="/login"
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </Link>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                aria-invalid={!!errors.fullName}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                  errors.fullName
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
                }`}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Your email"
                aria-invalid={!!errors.email}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
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

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                aria-invalid={!!errors.username}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                  errors.username
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
                }`}
                {...register('username')}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
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
                  placeholder="Choose a password"
                  aria-invalid={!!errors.password}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 ${
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  aria-invalid={!!errors.confirmPassword}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="relative">
                <select
                  {...register('accountType')}
                  aria-invalid={!!errors.accountType}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 appearance-none ${
                    errors.accountType
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]'
                  }`}
                >
                  <option value="Traveler">Traveler</option>
                  <option value="Tourism Provider">Tourism Provider</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select 'Tourism Provider' if you represent a business.
              </p>
              {errors.accountType && (
                <p className="mt-1 text-sm text-red-600">{errors.accountType.message}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full px-6 py-3 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-primary-dark)' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1e293b'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)'}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]/80 font-medium"
              >
                Sign in
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

export default RegisterPage;