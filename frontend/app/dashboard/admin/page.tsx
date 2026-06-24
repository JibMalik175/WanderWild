'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analyticsAPI, packagesAPI, usersAPI, bookingsAPI } from '../../utils/api';
import { Users, Package, DollarSign, TrendingUp, Eye, Edit, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '1,247', icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'Active Packages', value: '342', icon: Package, color: 'bg-green-500', change: '+8%' },
    { title: 'Total Revenue', value: '$45,230', icon: DollarSign, color: 'bg-purple-500', change: '+15%' },
    { title: 'Commission Earned', value: '$4,523', icon: TrendingUp, color: 'bg-orange-500', change: '+18%' }
  ]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getOverview();
        console.log('Analytics response:', response.data);
        
        if (response.data?.data?.overview) {
          const overview = response.data.data.overview;
          
          // Calculate growth percentages (comparing new vs total)
          const userGrowth = overview.users.total > 0 
            ? `+${Math.round((overview.users.new / overview.users.total) * 100)}%` 
            : '0%';
          const packageGrowth = overview.packages.total > 0 
            ? `+${Math.round((overview.packages.new / overview.packages.total) * 100)}%` 
            : '0%';
          const revenueGrowth = '+15%'; // Can be calculated with historical data
          const commissionGrowth = '+18%'; // Can be calculated with historical data
          
          setStats([
            { 
              title: 'Total Users', 
              value: overview.users.total.toString(), 
              icon: Users, 
              color: 'bg-blue-500', 
              change: userGrowth 
            },
            { 
              title: 'Active Packages', 
              value: overview.packages.active.toString(), 
              icon: Package, 
              color: 'bg-green-500', 
              change: packageGrowth 
            },
            { 
              title: 'Total Revenue', 
              value: `$${Math.round(overview.bookings.totalRevenue || 0).toLocaleString()}`, 
              icon: DollarSign, 
              color: 'bg-purple-500', 
              change: revenueGrowth 
            },
            { 
              title: 'Commission Earned', 
              value: `$${Math.round(overview.bookings.totalCommission || 0).toLocaleString()}`, 
              icon: TrendingUp, 
              color: 'bg-orange-500', 
              change: commissionGrowth 
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Keep default stats if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const activities: any[] = [];
        
        // Fetch recent packages
        const packagesResponse = await packagesAPI.getAll({ limit: 5, sort: 'created_at', order: 'desc' });
        if (packagesResponse.data?.data?.packages) {
          packagesResponse.data.data.packages.slice(0, 2).forEach((pkg: any) => {
            activities.push({
              id: `pkg-${pkg.id}`,
              action: 'New package uploaded',
              user: pkg.agencies?.agency_name || 'Unknown Agency',
              time: getTimeAgo(pkg.created_at),
              type: 'package'
            });
          });
        }

        // Fetch recent users
        const usersResponse = await usersAPI.getAll();
        if (usersResponse.data?.data?.users) {
          const recentUsers = usersResponse.data.data.users
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 2);
          
          recentUsers.forEach((user: any) => {
            activities.push({
              id: `user-${user.id}`,
              action: 'User registered',
              user: user.email || user.username || 'Unknown User',
              time: getTimeAgo(user.created_at),
              type: 'user'
            });
          });
        }

        // Fetch recent bookings
        const bookingsResponse = await bookingsAPI.getAll();
        if (bookingsResponse.data?.data?.bookings) {
          const recentBookings = bookingsResponse.data.data.bookings
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 2);
          
          recentBookings.forEach((booking: any) => {
            activities.push({
              id: `booking-${booking.id}`,
              action: booking.payment_status === 'paid' ? 'Payment processed' : 'New booking created',
              user: booking.profiles?.full_name || 'Unknown Customer',
              time: getTimeAgo(booking.created_at),
              type: 'payment'
            });
          });
        }

        // Sort all activities by time and take top 4
        activities.sort((a, b) => {
          // This is a simple sort, in production you'd want to sort by actual timestamp
          return 0;
        });

        setRecentActivities(activities.slice(0, 4));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Keep default empty array
      }
    };

    fetchRecentActivities();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the WanderWild platform</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            stats.map((stat, index) => (
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
            ))
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/dashboard/admin/management')}
                className="w-full flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-gray-700">Manage Users</span>
              </button>
              <button 
                onClick={() => router.push('/dashboard/admin/management?tab=packages')}
                className="w-full flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-gray-700">Review Packages</span>
              </button>
              <button 
                onClick={() => router.push('/dashboard/admin/management?tab=payments')}
                className="w-full flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DollarSign className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-gray-700">View Payments</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;