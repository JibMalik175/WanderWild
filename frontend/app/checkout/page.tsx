'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { packagesAPI, bookingsAPI } from '../utils/api';
import { useAuthStore } from '../utils/store';
import { Calendar, MapPin, Clock, Users, CheckCircle, ArrowLeft, Package, CreditCard } from 'lucide-react';
import Button from '../components/Button';

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');
  const { user } = useAuthStore();

  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!packageId) {
      setError('No package selected');
      setLoading(false);
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/checkout?package=${packageId}`);
      return;
    }

    fetchPackageDetails();
  }, [packageId, user]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await packagesAPI.getById(packageId!);
      console.log('Package response:', response);
      
      const pkg = response.data?.data?.package || response.data?.package || response.data;
      
      if (pkg && pkg.id) {
        setPackageData(pkg);
      } else {
        setError('Package not found or not active');
      }
    } catch (error: any) {
      console.error('Error fetching package:', error);
      setError(error.response?.data?.message || 'Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    if (travelers < 1) {
      setError('Please select at least 1 traveler');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      // Calculate end date based on package duration
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDate);
      const durationDays = packageData?.duration_days || 1;
      endDateObj.setDate(startDateObj.getDate() + durationDays);

      const bookingData = {
        package_id: packageId,
        start_date: startDate,
        end_date: endDateObj.toISOString().split('T')[0],
        travelers: travelers,
        special_requests: specialRequests || undefined
      };

      console.log('Creating booking:', bookingData);
      const response = await bookingsAPI.create(bookingData);
      console.log('Booking response:', response);

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/customer');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.details?.join(', ') ||
                          error.message || 
                          'Failed to create booking. Please try again.';
      setError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!packageData) return 0;
    const basePrice = packageData.price || 0;
    return basePrice * travelers;
  };

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-500)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (error && !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Package Not Available</h2>
          <p className="text-gray-600 mb-6">{error || 'The package you are trying to book is not available.'}</p>
          <Button onClick={() => router.push('/packages')}>
            Browse Packages
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">Your booking has been confirmed. Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Booking</h1>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={4}
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  />
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {bookingLoading ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h2>

              {packageData && (
                <>
                  {packageData.image_url && (
                    <img
                      src={packageData.image_url}
                      alt={packageData.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {packageData.name}
                  </h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{packageData.destination || packageData.location || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {packageData.duration_days ? `${packageData.duration_days} days` : packageData.duration || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Price per person</span>
                      <span>${packageData.price?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Number of travelers</span>
                      <span>×{travelers}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span>${calculateTotalAmount().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">
                      By confirming this booking, you agree to our terms and conditions. 
                      Cancellation policies apply. Full refund available if cancelled 
                      48 hours before the start date.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


