'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { bookingsAPI, inquiriesAPI, agenciesAPI, packagesAPI, vrAPI } from '../../utils/api';
import { Calendar, MapPin, Clock, DollarSign, Star, Eye, MessageCircle, Plus, X } from 'lucide-react';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  
  // State for API data
  const [bookings, setBookings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inquiry form state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('pending');
  const [inquiryPriority, setInquiryPriority] = useState('normal');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  
  // Booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's bookings
        const bookingsResponse = await bookingsAPI.getMy();
        console.log('Bookings response:', bookingsResponse);
        console.log('Bookings response.data:', bookingsResponse.data);
        console.log('Bookings response.data.data:', bookingsResponse.data?.data);
        
        // Handle nested response structure
        const bookingsData = bookingsResponse.data?.data?.bookings || bookingsResponse.data?.data || bookingsResponse.data || [];
        console.log('Bookings data:', bookingsData);
        
        // Map API bookings to display format (regular travel packages)
        const mappedBookings = Array.isArray(bookingsData) ? bookingsData.map((booking: any) => ({
          id: booking.id,
          title: booking.packages?.name || 'Package',
          location: booking.packages?.destination || booking.packages?.location || 'N/A',
          date: booking.start_date || new Date(booking.created_at).toISOString().split('T')[0],
          duration: booking.packages?.duration_days ? `${booking.packages.duration_days} days` : booking.packages?.duration || 'N/A',
          price: booking.total_amount || booking.packages?.price || 0,
          totalAmount: booking.total_amount || booking.packages?.price || 0,
          status: booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending',
          rating: booking.packages?.rating || 0,
          image: booking.packages?.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
          travelers: booking.travelers || 1,
          endDate: booking.end_date
        })) : [];

        // Fetch user's VR bookings
        let mappedVrBookings: any[] = [];
        try {
          const vrRes = await vrAPI.getMyBookings();
          const vrData = vrRes.data?.data?.bookings || [];
          mappedVrBookings = Array.isArray(vrData) ? vrData.map((b: any) => ({
            id: b.id,
            title: b.vr_experiences?.title || 'VR Experience',
            location: 'Virtual',
            date: new Date(b.booking_date).toISOString().split('T')[0],
            duration: b.duration_minutes ? `${b.duration_minutes} min` : 'N/A',
            price: b.total_amount || 0,
            totalAmount: b.total_amount || 0,
            status: b.status?.charAt(0).toUpperCase() + b.status?.slice(1) || 'Confirmed',
            rating: 0,
            image: b.vr_experiences?.thumbnail_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
            travelers: 1,
            endDate: null
          })) : [];
        } catch (e) {
          // ignore VR fetch errors to not break dashboard
        }

        setBookings([...
          mappedBookings,
          ...mappedVrBookings
        ]);
        console.log('Mapped bookings:', mappedBookings);
        
        // Fetch user's inquiries
        const inquiriesResponse = await inquiriesAPI.getMy();
        const inquiriesData = inquiriesResponse.data?.data || inquiriesResponse.data || [];
        setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
        
        // Fetch agencies for inquiry form
        const agenciesResponse = await agenciesAPI.getAll();
        const agenciesData = agenciesResponse.data?.data || agenciesResponse.data || [];
        setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
        console.log('Agencies:', agenciesData);
        
        // Fetch packages for inquiry form
        const packagesResponse = await packagesAPI.getAll({ limit: 100 });
        const packagesData = packagesResponse.data?.data || packagesResponse.data || [];
        setPackages(Array.isArray(packagesData) ? packagesData : []);
        console.log('Packages:', packagesData);
        
      } catch (error) {
        console.error('Error fetching customer data:', error);
        // Ensure arrays are always defined even if API fails
        setBookings([]);
        setInquiries([]);
        setAgencies([]);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const handleSubmitInquiry = async () => {
    if (!inquiryTitle.trim() || !inquiryMessage.trim()) {
      setInquiryError('Please fill in all required fields');
      return;
    }

    if (!selectedAgency) {
      setInquiryError('Please select an agency');
      return;
    }

    if (inquiryMessage.trim().length < 10) {
      setInquiryError('Message must be at least 10 characters long');
      return;
    }

    try {
      setInquiryLoading(true);
      setInquiryError('');

      // Build inquiry data with all fields
      const inquiryData: any = {
        agency_id: selectedAgency,
        subject: inquiryTitle,
        message: inquiryMessage,
        priority: inquiryPriority
      };

      // Add package_id if selected (optional)
      if (selectedPackage) {
        inquiryData.package_id = selectedPackage;
      }

      console.log('Submitting inquiry:', inquiryData);
      const response = await inquiriesAPI.create(inquiryData);
      console.log('Inquiry response:', response);

      if (response.data) {
        // Close modal and reset form
        setShowInquiryForm(false);
        setInquiryTitle('');
        setInquiryMessage('');
        setSelectedAgency('');
        setSelectedPackage('');
        setInquiryPriority('normal');
        setInquiryStatus('pending');
        
        // Refresh inquiries list
        const inquiriesResponse = await inquiriesAPI.getMy();
        const inquiriesData = inquiriesResponse.data?.data || inquiriesResponse.data || [];
        setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
      }
    } catch (error: any) {
      console.error('Inquiry submission error:', error);
      setInquiryError(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      console.log('Updating booking status:', bookingId, newStatus);
      await bookingsAPI.updateStatus(bookingId, { status: newStatus });
      
      // Refresh bookings
      const result = await bookingsAPI.getMy();
      const bookingsData = result?.data?.data || result?.data || result || [];
      
      const mappedBookings = (Array.isArray(bookingsData) ? bookingsData : []).map((booking: any) => ({
        id: booking.id,
        title: booking.package?.name || 'Package',
        destination: booking.package?.destination || 'Unknown',
        image: booking.package?.image_url || '/placeholder-image.jpg',
        date: `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`,
        duration: `${booking.package?.duration_days || 0} days`,
        rating: booking.package?.average_rating || '4.5',
        price: booking.total_amount || 0,
        status: booking.status || 'pending',
        travelers: booking.num_travelers || 1,
        specialRequests: booking.special_requests || 'None',
        bookingDate: new Date(booking.created_at).toLocaleDateString(),
        packageId: booking.package_id
      }));
      
      setBookings(mappedBookings);
      
      // Update selected booking if modal is open
      if (selectedBooking?.id === bookingId) {
        const updatedBooking = mappedBookings.find((b: any) => b.id === bookingId);
        if (updatedBooking) {
          setSelectedBooking(updatedBooking);
        }
      }
      
      alert('Booking status updated successfully!');
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Replied': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your bookings, inquiries, and discover new packages</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Bookings', value: (Array.isArray(bookings) ? bookings.length : 0).toString(), icon: Calendar, color: 'bg-blue-500' },
            { title: 'Active Inquiries', value: (Array.isArray(inquiries) ? inquiries.length : 0).toString(), icon: MessageCircle, color: 'bg-green-500' },
            { title: 'Total Spent', value: `$${(Array.isArray(bookings) ? bookings : []).reduce((sum: number, booking: any) => sum + (booking.totalAmount || booking.price || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' },
            { title: 'Average Rating', value: '4.7', icon: Star, color: 'bg-yellow-500' }
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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'bookings', label: 'My Bookings', count: Array.isArray(bookings) ? bookings.length : 0 },
                { id: 'inquiries', label: 'My Inquiries', count: Array.isArray(inquiries) ? inquiries.length : 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">My Bookings</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {(Array.isArray(bookings) ? bookings : []).length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't made any bookings yet. Browse our packages to get started!</p>
                    <button
                      onClick={() => window.location.href = '/packages'}
                      className="px-6 py-3 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors"
                    >
                      Browse Packages
                    </button>
                  </div>
                ) : (
                  (Array.isArray(bookings) ? bookings : []).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.image}
                        alt={booking.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {booking.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{booking.location}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{booking.date}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{booking.duration}</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                <span>{booking.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800 mb-2">
                              ${booking.price}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4">
                          <button 
                            onClick={() => handleViewBookingDetails(booking)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                          {booking.status === 'cancelled' || booking.status === 'completed' ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this booking?')) {
                                  handleUpdateBookingStatus(booking.id, 'cancelled');
                                }
                              }}
                              className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                              Cancel Booking
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">My Inquiries</h2>
                  <button 
                    onClick={() => setShowInquiryForm(true)}
                    className="flex items-center px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Inquiry
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {(Array.isArray(inquiries) ? inquiries : []).map((inquiry, index) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {inquiry.title}
                            </h3>
                            <p className="text-sm text-gray-600">Provider: {inquiry.provider}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                              {inquiry.status}
                            </span>
                            {inquiry.unread && (
                              <div className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{inquiry.lastMessage}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{inquiry.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              View Conversation
                            </button>
                            <button className="flex items-center px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg hover:bg-[var(--color-primary-500)]/90 transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">New Inquiry</h2>
              <button
                onClick={() => {
                  setShowInquiryForm(false);
                  setInquiryError('');
                  setInquiryTitle('');
                  setInquiryMessage('');
                  setSelectedAgency('');
                  setSelectedPackage('');
                  setInquiryPriority('normal');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {inquiryError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{inquiryError}</p>
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Agency <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                >
                  <option value="">-- Select an agency --</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.agency_name || agency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Package <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                >
                  <option value="">-- Select a package (optional) --</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name || pkg.title} - ${pkg.price}
                    </option>
                  ))}
                </select>
              </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                      <input
                        type="text"
                  value={inquiryTitle}
                  onChange={(e) => setInquiryTitle(e.target.value)}
                  placeholder="Enter inquiry subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your inquiry in detail (minimum 10 characters)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                      />
                    </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={inquiryPriority}
                    onChange={(e) => setInquiryPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <input
                    type="text"
                    value="Pending"
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    title="Status is automatically set to Pending"
                  />
                  </div>
                </div>
              </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowInquiryForm(false);
                  setInquiryError('');
                  setInquiryTitle('');
                  setInquiryMessage('');
                  setSelectedAgency('');
                  setSelectedPackage('');
                  setInquiryPriority('normal');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInquiry}
                disabled={inquiryLoading}
                className="flex-1 px-4 py-3 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inquiryLoading ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </motion.div>
                        </div>
                      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                <button
                  onClick={() => {
                    setShowBookingDetails(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                      </button>
                    </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Package Image */}
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedBooking.image}
                  alt={selectedBooking.title}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Package Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedBooking.title}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{selectedBooking.destination}</span>
                        </div>
                      </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Booking Date</div>
                  <div className="font-semibold text-gray-800">{selectedBooking.bookingDate}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Travel Dates</div>
                  <div className="font-semibold text-gray-800">{selectedBooking.date}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-semibold text-gray-800">{selectedBooking.duration}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Number of Travelers</div>
                  <div className="font-semibold text-gray-800">{selectedBooking.travelers}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                  <div className="font-semibold text-gray-800">${selectedBooking.price}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                      </div>

              {/* Special Requests */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Special Requests</div>
                <div className="text-gray-800">{selectedBooking.specialRequests}</div>
                        </div>

              {/* Rating */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Package Rating</div>
                        <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold text-gray-800">{selectedBooking.rating}</span>
                        </div>
                      </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => window.location.href = `/packages/${selectedBooking.packageId}`}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View Package
                        </button>
                <button
                  onClick={() => {
                    setShowBookingDetails(false);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-3 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors"
                >
                  Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
            </div>
          )}
    </div>
  );
};

export default CustomerDashboard;