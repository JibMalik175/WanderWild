'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { analyticsAPI, agenciesAPI, packagesAPI } from '../../../utils/api';

const AdminAnalytics = () => {
  const [platformStats, setPlatformStats] = useState([
    { title: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Packages', value: '0', change: '+0%', icon: Package, color: 'bg-green-500' },
    { title: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'bg-purple-500' },
    { title: 'Commission Earned', value: '$0', change: '+0%', icon: TrendingUp, color: 'bg-orange-500' }
  ]);
  const [loading, setLoading] = useState(true);
  const [topAgencies, setTopAgencies] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getOverview();
        console.log('Analytics overview:', response.data);
        
        if (response.data?.data?.overview) {
          const overview = response.data.data.overview;
          
          // Update platform stats
          const userGrowth = overview.users.total > 0 
            ? `+${Math.round((overview.users.new / overview.users.total) * 100)}%` 
            : '0%';
          const packageGrowth = overview.packages.total > 0 
            ? `+${Math.round((overview.packages.new / overview.packages.total) * 100)}%` 
            : '0%';
          
          setPlatformStats([
            { title: 'Total Users', value: overview.users.total.toString(), change: userGrowth, icon: Users, color: 'bg-blue-500' },
            { title: 'Active Packages', value: overview.packages.active.toString(), change: packageGrowth, icon: Package, color: 'bg-green-500' },
            { title: 'Total Revenue', value: `$${Math.round(overview.bookings.totalRevenue || 0).toLocaleString()}`, change: '+15%', icon: DollarSign, color: 'bg-purple-500' },
            { title: 'Commission Earned', value: `$${Math.round(overview.bookings.totalCommission || 0).toLocaleString()}`, change: '+18%', icon: TrendingUp, color: 'bg-orange-500' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch user growth data
  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        const response = await analyticsAPI.getUserGrowth({ months: 6 });
        console.log('User growth data:', response.data);
        
        if (response.data?.data?.monthlyData) {
          setMonthlyData(response.data.data.monthlyData);
        }
      } catch (error) {
        console.error('Error fetching user growth:', error);
        // Fallback to empty array if error
        setMonthlyData([]);
      }
    };

    fetchUserGrowth();
  }, []);

  // Fetch top agencies
  useEffect(() => {
    const fetchTopAgencies = async () => {
      try {
        const response = await agenciesAPI.getAll();
        console.log('Agencies:', response.data);
        
        if (response.data?.data?.agencies) {
          // Map agencies and get their package counts
          const agenciesWithStats = await Promise.all(
            response.data.data.agencies.slice(0, 3).map(async (agency: any) => {
              try {
                const packagesResponse = await packagesAPI.getAgencyPackages(agency.id);
                const packageCount = packagesResponse.data?.data?.packages?.length || 0;
                
                return {
                  name: agency.agency_name,
                  packages: packageCount,
                  revenue: 0, // This would need booking data per agency
                  commission: 0
                };
              } catch (error) {
                return {
                  name: agency.agency_name,
                  packages: 0,
                  revenue: 0,
                  commission: 0
                };
              }
            })
          );
          
          setTopAgencies(agenciesWithStats);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      }
    };

    fetchTopAgencies();
  }, []);

  // Fetch category distribution
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await packagesAPI.getAll({ status: 'all', limit: 1000 });
        console.log('Packages for categories:', response.data);
        
        if (response.data?.data?.packages) {
          const packages = response.data.data.packages;
          
          // Count packages by category
          const categoryCount: any = {};
          packages.forEach((pkg: any) => {
            const categoryName = pkg.categories?.name || 'Uncategorized';
            categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
          });
          
          // Convert to array and calculate percentages
          const total = packages.length;
          const categories = Object.entries(categoryCount).map(([category, count]: [string, any]) => ({
            category,
            packages: count,
            percentage: Math.round((count / total) * 100)
          }));
          
          // Sort by count and take top 4
          categories.sort((a, b) => b.packages - a.packages);
          setCategoryData(categories.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
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
            platformStats.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">User Growth</h2>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Last 6 months</span>
              </div>
            </div>
            <div className="space-y-4">
              {loading || monthlyData.length === 0 ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </>
              ) : (
                monthlyData.map((data, index) => {
                  const maxUsers = Math.max(...monthlyData.map(d => d.users), 1);
                  return (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[var(--color-primary-500)] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((data.users / maxUsers) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                        {data.users.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Revenue Growth</h2>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Last 6 months</span>
              </div>
            </div>
            <div className="space-y-4">
              {loading || monthlyData.length === 0 ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </>
              ) : (
                monthlyData.map((data, index) => {
                  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
                  return (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((data.revenue / maxRevenue) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-20 text-right">
                        ${data.revenue >= 1000 ? `${(data.revenue / 1000).toFixed(0)}k` : data.revenue}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Agencies */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Top Performing Agencies</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {topAgencies.map((agency, index) => (
                <motion.div
                  key={agency.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{agency.name}</h3>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span>{agency.packages} packages</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>${agency.revenue.toLocaleString()} revenue</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span>${agency.commission} commission</span>
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

          {/* Package Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Package Categories</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 ? 'bg-[var(--color-primary-500)]' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-800">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{category.packages} packages</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-[var(--color-primary-500)]' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-8 text-right">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
