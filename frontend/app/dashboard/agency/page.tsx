'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { packagesAPI, agenciesAPI } from '../../utils/api';
import { Package, Users, DollarSign, TrendingUp, Eye, Edit, Plus } from 'lucide-react';

const AgencyDashboard = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPackages: 0,
    activeBookings: 0,
    totalRevenue: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch agency data on component mount
  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        setLoading(true);
        
        // Get current user's agency information
        const agencyResponse = await agenciesAPI.getMe();
        const agencyId = agencyResponse.data?.data?.agency?.id;
        
        if (agencyId) {
          try {
            // Fetch agency packages
            const packagesResponse = await agenciesAPI.getPackages(agencyId);
            const apiPackages = packagesResponse.data?.data?.packages || [];
            // Map API response to frontend format
            const mappedPackages = apiPackages.map((pkg: any) => ({
              id: pkg.id,
              title: pkg.name,
              location: pkg.location,
              price: pkg.price,
              bookings: pkg.total_reviews || 0,
              revenue: 0,
              status: pkg.status === 'draft' ? 'Draft' : pkg.status === 'active' ? 'Active' : 'Inactive',
              createdAt: pkg.created_at,
              image: pkg.main_image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'
            }));
            setPackages(mappedPackages);
          } catch (apiError) {
            console.warn('Packages API failed:', apiError);
            setPackages([]);
          }
        } else {
          console.warn('No agency found for user');
          setPackages([]);
        }
        
        if (agencyId) {
          try {
            // Fetch agency stats
            const statsResponse = await agenciesAPI.getStats(agencyId);
            console.log('Dashboard stats response:', statsResponse);
            if (statsResponse.data?.data) {
              const data = statsResponse.data.data;
              console.log('Dashboard stats data:', data);
              setStats({
                totalPackages: data.totalPackages || 0,
                activeBookings: data.activeBookings || 0,
                totalRevenue: data.totalRevenue || 0,
                growthRate: data.growthRate || 0
              });
            }
          } catch (apiError) {
            console.warn('Stats API failed, using default stats:', apiError);
            // Use default stats based on packages
            setStats({
              totalPackages: packages.length,
              activeBookings: 0,
              totalRevenue: 0,
              growthRate: 0
            });
          }
        } else {
          setStats({
            totalPackages: 0,
            activeBookings: 0,
            totalRevenue: 0,
            growthRate: 0
          });
        }
      } catch (error) {
        console.error('Error fetching agency data:', error);
        // Keep default data if all APIs fail
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation handlers for Quick Actions
  const handleAddPackage = () => {
    router.push('/dashboard/agency/packages/add');
  };

  const handleViewBookings = () => {
    router.push('/dashboard/agency/bookings');
  };

  const handleViewPayments = () => {
    router.push('/dashboard/agency/payments');
  };

  const handleViewAllPackages = () => {
    router.push('/dashboard/agency/packages');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Agency Dashboard</h1>
          <p className="text-gray-600">Manage your tourism packages and bookings</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Packages', value: stats.totalPackages.toString(), icon: Package, color: 'bg-blue-500' },
            { title: 'Active Bookings', value: stats.activeBookings.toString(), icon: Users, color: 'bg-green-500' },
            { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' },
            { title: 'Growth Rate', value: `+${stats.growthRate}%`, icon: TrendingUp, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleAddPackage}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/5 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-600">Add New Package</span>
            </button>
            <button 
              onClick={handleViewBookings}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-700">View Bookings</span>
            </button>
            <button 
              onClick={handleViewPayments}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-700">View Payments</span>
            </button>
          </div>
        </motion.div>

        {/* Recent Packages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Recent Packages</h2>
              <button 
                onClick={handleViewAllPackages}
                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]/80 font-medium cursor-pointer"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {pkg.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{pkg.location}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>${pkg.price} per person</span>
                          <span>{pkg.bookings} bookings</span>
                          <span>${pkg.revenue} revenue</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                          {pkg.status}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/packages/${pkg.id}`)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="View Package"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => router.push(`/dashboard/agency/packages/edit/${pkg.id}`)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="Edit Package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgencyDashboard;