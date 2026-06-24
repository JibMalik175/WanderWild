'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, Calendar, User, DollarSign, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { bookingsAPI, agenciesAPI } from '../../../utils/api';

const AgencyBookingsPage = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
  const dateOptions = ['All', 'Today', 'This Week', 'This Month', 'This Year'];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching agency information...');
        // Get current user's agency information
        const agencyResponse = await agenciesAPI.getMe();
        console.log('Agency response:', agencyResponse);
        
        const agencyData = agencyResponse.data?.data?.agency || agencyResponse.data?.data || agencyResponse.data;
        const agencyId = agencyData?.id;
        
        console.log('Agency ID:', agencyId);
        
        if (agencyId) {
          // Fetch agency bookings with filters
          console.log('Fetching bookings for agency:', agencyId);
          const response = await agenciesAPI.getBookings(agencyId, {
            status: statusFilter !== 'All' ? statusFilter : undefined,
            search: searchTerm || undefined
          });
          
          console.log('Bookings response:', response);
          console.log('Bookings data:', response.data);
          
          const apiBookings = response.data?.data || response.data || [];
          console.log('API bookings:', apiBookings);
          console.log('Is array?', Array.isArray(apiBookings));
          
          // Map API response to frontend format
          const mappedBookings = (Array.isArray(apiBookings) ? apiBookings : []).map((booking: any) => ({
            id: booking.id,
            customerName: booking.profiles?.full_name || 'Unknown Customer',
            packageName: booking.packages?.name || 'Unknown Package',
            status: booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown',
            date: new Date(booking.start_date || booking.created_at).toLocaleDateString(),
            amount: booking.total_amount || 0,
            travelers: booking.num_travelers || booking.travelers || 1,
            email: booking.profiles?.email || '',
            phone: booking.profiles?.phone || '',
            startDate: booking.start_date,
            endDate: booking.end_date,
            paymentStatus: booking.payment_status
          }));
          
          console.log('Mapped bookings:', mappedBookings);
          setBookings(mappedBookings);
        } else {
          console.warn('No agency found for user');
          alert('No agency associated with this account. Please contact support.');
          setBookings([]);
        }
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        console.error('Error response:', error.response?.data);
        alert(error.response?.data?.message || 'Failed to fetch bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Agency Bookings</h1>
              <p className="text-gray-600">Manage and track all your package bookings</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bookings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
              >
                {dateOptions.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Bookings ({filteredBookings.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {booking.customerName}
                          </h3>
                          <p className="text-gray-600">{booking.packageName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span>{booking.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{booking.travelers} travelers</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${booking.amount}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">
                            {booking.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Pending Payment'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="truncate">{booking.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgencyBookingsPage;
