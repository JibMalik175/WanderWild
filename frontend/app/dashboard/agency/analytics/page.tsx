'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Eye, Calendar, Star, BarChart3, PieChart } from 'lucide-react';
import { agenciesAPI } from '../../../utils/api';

const AgencyAnalytics = () => {
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'bg-green-500' },
    { title: 'Total Bookings', value: '0', change: '+0%', icon: Users, color: 'bg-blue-500' },
    { title: 'Average Rating', value: '0.0', change: '+0', icon: Star, color: 'bg-yellow-500' },
    { title: 'Total Packages', value: '0', change: '+0%', icon: Eye, color: 'bg-purple-500' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Get current user's agency information
        const agencyResponse = await agenciesAPI.getMe();
        const agencyId = agencyResponse.data?.data?.agency?.id;
        
        if (agencyId) {
          // Fetch agency stats
          const statsResponse = await agenciesAPI.getStats(agencyId);
          console.log('Analytics stats response:', statsResponse);
          if (statsResponse.data?.data) {
            const data = statsResponse.data.data;
            console.log('Analytics data:', data);
            setStats([
              { title: 'Total Revenue', value: `$${data.totalRevenue?.toLocaleString() || 0}`, change: `+${data.growthRate || 0}%`, icon: DollarSign, color: 'bg-green-500' },
              { title: 'Active Bookings', value: data.activeBookings?.toString() || '0', change: '+0%', icon: Users, color: 'bg-blue-500' },
              { title: 'Average Rating', value: '4.5', change: '+0.1', icon: Star, color: 'bg-yellow-500' },
              { title: 'Total Packages', value: data.totalPackages?.toString() || '0', change: '+0%', icon: Eye, color: 'bg-purple-500' }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', revenue: 0, bookings: 0 },
    { month: 'Feb', revenue: 0, bookings: 0 },
    { month: 'Mar', revenue: 0, bookings: 0 },
    { month: 'Apr', revenue: 0, bookings: 0 },
    { month: 'May', revenue: 0, bookings: 0 },
    { month: 'Jun', revenue: 0, bookings: 0 }
  ]);

  const [topPackages, setTopPackages] = useState([
    { name: 'No packages yet', bookings: 0, revenue: 0, rating: 0 }
  ]);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your agency performance and insights</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
            </div>

            {/* No Data Message */}
            {stats[0].value === '$0' && stats[1].value === '0' && stats[3].value === '0' && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analytics Data Yet</h3>
                <p className="text-gray-600 mb-4">Start by creating packages and getting bookings to see your analytics here.</p>
                <button 
                  onClick={() => window.location.href = '/dashboard/agency/packages/add'}
                  className="px-6 py-2 bg-[var(--color-primary-500)] text-white rounded-lg hover:bg-[var(--color-primary-500)]/90 transition-colors"
                >
                  Create Your First Package
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Revenue Trend</h2>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Last 6 months</span>
              </div>
            </div>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[var(--color-primary-500)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.revenue / 7000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                    ${data.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bookings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Bookings Trend</h2>
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Last 6 months</span>
              </div>
            </div>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.bookings / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                    {data.bookings}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Packages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Top Performing Packages</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {topPackages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{pkg.name}</h3>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{pkg.bookings} bookings</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${pkg.revenue.toLocaleString()} revenue</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span>{pkg.rating} rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgencyAnalytics;
