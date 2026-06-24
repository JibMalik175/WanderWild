'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Check,
  X
} from 'lucide-react';
import Button from '../../components/Button';
import { packagesAPI } from '../../utils/api';
import { dummyPackages } from '../../utils/dummyData';

const PackageDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgency, setIsAgency] = useState(false);

  const packageId = params.id as string;

  // Check if user is an agency
  useEffect(() => {
    const checkUserRole = () => {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const userRole = parsed.state?.user?.role;
          console.log('User role detected:', userRole);
          setIsAgency(userRole === 'agency');
        } catch (error) {
          console.warn('Failed to parse auth storage:', error);
          setIsAgency(false);
        }
      } else {
        setIsAgency(false);
      }
    };
    
    checkUserRole();
  }, []);

  // Fetch package details on component mount
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await packagesAPI.getById(packageId);
        console.log('Package detail response:', response);
        const pkgData = response.data?.data?.package || response.data?.data || response.data;
        console.log('Package data:', pkgData);
        console.log('Itinerary data:', pkgData?.itinerary);
        console.log('Category data:', pkgData?.categories);
        setPkg(pkgData);
      } catch (error) {
        console.error('Error fetching package:', error);
        // Gracefully fall back to bundled sample data (consistent with the listing pages)
        // so the page still works when the API/database is unavailable.
        const fallback = dummyPackages.find((p) => p.id === packageId);
        if (fallback) {
          setPkg(fallback);
        } else {
          setError('Failed to load package details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Package Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The package you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => router.push('/packages')}>
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    // Check if user is logged in
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      // No user logged in, redirect to login
      router.push(`/login?redirect=/packages/${packageId}`);
      return;
    }
    
    try {
      const parsed = JSON.parse(authStorage);
      const userRole = parsed.state?.user?.role;
      
      // If user is agency, don't allow booking
      if (userRole === 'agency') {
        router.push(`/checkout?package=${packageId}`);
        return;
      }
      
      // Regular user or customer, proceed to checkout
      router.push(`/checkout?package=${packageId}`);
    } catch (error) {
      console.error('Error parsing auth storage:', error);
      // If error parsing, redirect to login
      router.push(`/login?redirect=/packages/${packageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="relative h-96">
                <img
                  src={pkg.images && pkg.images.length > 0 ? pkg.images[selectedImageIndex] : pkg.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                {/* Like and Share buttons removed */}
              </div>
              
              {/* Thumbnail Images */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {pkg.images && pkg.images.length > 0 ? (
                    pkg.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                          selectedImageIndex === index ? 'ring-2 ring-green-500' : ''
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${pkg.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))
                  ) : (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No images</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Package Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{pkg.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{pkg.duration ? pkg.duration : (pkg.duration_days ? `${pkg.duration_days} days` : 'Duration not specified')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>Max {pkg.maxPeople || pkg.max_people || 'N/A'} people</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{pkg.rating || '0'}</span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                {pkg.description || 'No description available'}
              </p>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Package Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pkg.highlights && Array.isArray(pkg.highlights) && pkg.highlights.length > 0 ? (
                    pkg.highlights.map((highlight: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-gray-500 italic">No highlights available</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Itinerary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Itinerary
              </h3>
              <div className="space-y-3">
                {(() => {
                  // Handle both array and object formats for itinerary
                  let itineraryItems = [];
                  
                  if (pkg.itinerary) {
                    if (Array.isArray(pkg.itinerary)) {
                      itineraryItems = pkg.itinerary;
                    } else if (typeof pkg.itinerary === 'object') {
                      // Convert object to array of values
                      itineraryItems = Object.values(pkg.itinerary).filter((item: any) => item && item.trim());
                    }
                  }
                  
                  if (itineraryItems.length > 0) {
                    return itineraryItems.map((day: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{day}</p>
                      </div>
                    ));
                  } else {
                    return <div className="text-gray-500 italic">No itinerary available</div>;
                  }
                })()}
              </div>
            </motion.div>

            {/* What's Included/Excluded */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {pkg.includes && Array.isArray(pkg.includes) && pkg.includes.length > 0 ? (
                    pkg.includes.map((item: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No inclusions listed</li>
                  )}
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  What's Not Included
                </h3>
                <ul className="space-y-2">
                  {pkg.excludes && Array.isArray(pkg.excludes) && pkg.excludes.length > 0 ? (
                    pkg.excludes.map((item: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No exclusions listed</li>
                  )}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 sticky top-8"
            >
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  ${pkg.price || pkg.price_per_person || 'N/A'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  per person
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium">{pkg.duration ? pkg.duration : (pkg.duration_days ? `${pkg.duration_days} days` : 'N/A')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max People</span>
                  <span className="font-medium">{pkg.maxPeople || pkg.max_people || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category</span>
                  <span className="font-medium">{pkg.categories?.name || pkg.category?.name || pkg.category || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{pkg.rating}</span>
                  </div>
                </div>
              </div>

              {/* Book Now Button - Hidden only for Agency users */}
              {!isAgency && (
                <Button
                  onClick={handleBookNow}
                  className="w-full mb-4"
                  size="lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
              )}

              {/* Contact Agency section removed */}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;
