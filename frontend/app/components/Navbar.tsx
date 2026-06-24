'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  MessageCircle, 
  MapPin, 
  User,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Button from './Button';
import { useAuthStore } from '../utils/store';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const learningCloseTimer = useRef<NodeJS.Timeout | null>(null);

  // Hydration check to prevent SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Build nav items based on role - memoized for performance
  const navItems = useMemo(() => {
    const baseItems = [
      { href: '/', label: 'Home' },
      { href: '/explore', label: 'Explore' },
      { href: '/packages', label: 'Packages' },
      { href: '/ai-itinerary', label: 'AI Itinerary' },
      { href: '/chatbot', label: 'AI Chat', isHighlighted: true },
    ];

    if (!isAuthenticated || !user) {
      return baseItems;
    }

    // Role-specific navigation items
    switch (user.role) {
      case 'customer':
        return [
          ...baseItems,
          { href: '/dashboard/customer', label: 'My Dashboard' },
        ];
      case 'agency':
        return [
          { href: '/', label: 'Home' },
          { href: '/dashboard/agency', label: 'Agency Dashboard' },
          { href: '/dashboard/agency/packages', label: 'Manage Packages' },
          { href: '/dashboard/agency/analytics', label: 'Analytics' },
        ];
      case 'admin':
        return [
          { href: '/', label: 'Home' },
          { href: '/dashboard/admin', label: 'Admin Dashboard' },
          { href: '/dashboard/admin/management', label: 'Management' },
          { href: '/dashboard/admin/analytics', label: 'Analytics' },
        ];
      default:
        return baseItems;
    }
  }, [isAuthenticated, user]);

  const isActive = (href: string) => pathname === href;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="navbar-white bg-white backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-black">
                WanderWild
              </h1>
          </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center max-w-4xl mx-8">
            {/* Navigation links - scrollable container */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href={item.href}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 text-black font-medium whitespace-nowrap ${
                      isActive(item.href)
                        ? 'bg-gray-100 text-black'
                        : item.isHighlighted
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'hover:bg-gray-100 text-black'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Search icon */}
            <motion.button
              className="p-2 rounded-lg text-black hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>

            {/* User Info or Sign In button */}
            {isHydrated && isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* User Role Badge */}
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'agency' ? 'bg-green-100 text-green-800' :
                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role === 'customer' ? 'Customer' :
                     user?.role === 'agency' ? 'Agency' :
                     user?.role === 'admin' ? 'Admin' : 'User'}
                  </div>
                  <span className="text-sm text-gray-600">
                    {user?.name || user?.email}
                  </span>
                </div>

                {/* User Dropdown */}
                <div className="relative group">
                  <motion.button
                    className="flex items-center space-x-2 p-2 rounded-lg text-black hover:bg-gray-100 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-5 h-5" />
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href={`/dashboard/${user?.role}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : isHydrated ? (
              <div className="hidden md:block">
                <Link href="/login">
                  <button className="btn-signin px-4 py-2 font-medium rounded-lg transition-colors duration-300">
                    Sign In
                  </button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:block">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-black hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-gray-200 navbar-white bg-white/95 backdrop-blur-md"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {/* User Info Section (if logged in) */}
                {isHydrated && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-4 border-b border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user?.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                        user?.role === 'agency' ? 'bg-green-100 text-green-800' :
                        user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user?.role === 'customer' ? 'Customer' :
                         user?.role === 'agency' ? 'Agency' :
                         user?.role === 'admin' ? 'Admin' : 'User'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Items */}
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-base py-3 px-4 rounded-lg text-black transition-colors ${
                        isActive(item.href)
                          ? 'bg-gray-100 text-black'
                          : item.isHighlighted
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'hover:bg-gray-100 text-black'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Auth Section */}
                <motion.div 
                  className="pt-6 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {isHydrated && isAuthenticated ? (
                    <div className="space-y-2">
                      <Link 
                        href={`/dashboard/${user?.role}`} 
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-center text-red-600 border border-red-300 rounded-lg font-medium hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="btn-signin w-full px-4 py-2 font-medium rounded-lg transition-colors duration-300">
                        Sign In
                      </button>
                    </Link>
                  )}
                </motion.div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
