'use client';

import { motion } from 'framer-motion';
import { Users, Package, DollarSign, Shield, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { packagesAPI, usersAPI, bookingsAPI } from '@/app/utils/api';

const AdminManagement = () => {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'users');
  const [loading, setLoading] = useState(false);
  
  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Package management state
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPackageDeleteConfirm, setShowPackageDeleteConfirm] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<any>(null);
  const [packageEditMode, setPackageEditMode] = useState(false);
  
  // Payment management state
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'packages') {
      fetchPackages();
    } else if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      console.log('Fetched users:', response.data);
      
      if (response.data?.data?.users) {
        setUsers(response.data.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Fetch all packages without status filter to see all packages for admin
      const response = await packagesAPI.getAll({ status: 'all', limit: 100 });
      console.log('Fetched packages:', response.data);
      
      if (response.data?.data?.packages) {
        setPackages(response.data.data.packages);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('Failed to fetch packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Fetch all bookings which contain payment information
      const response = await bookingsAPI.getAll();
      console.log('Fetched bookings for payments:', response.data);
      
      if (response.data?.data?.bookings) {
        // Map bookings to payment format
        const paymentsData = response.data.data.bookings.map((booking: any) => ({
          id: booking.id,
          bookingId: booking.id,
          agency: booking.package?.agencies?.agency_name || 'Unknown Agency',
          packageName: booking.package?.name || 'Unknown Package',
          customerName: booking.profiles?.full_name || 'Unknown Customer',
          amount: booking.total_amount || 0,
          commission: Math.round((booking.total_amount || 0) * 0.1), // 10% commission
          status: booking.payment_status === 'paid' ? 'Paid' : 'Pending',
          date: booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A',
          method: booking.payment_method || 'Pending',
          rawStatus: booking.payment_status
        }));
        setPayments(paymentsData);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Map user data to display format
  const displayUsers = users.map((user: any) => ({
    id: user.id,
    name: user.full_name || user.username || 'Unknown User',
    email: user.email || 'No email',
    role: user.role === 'customer' ? 'Customer' : 
          user.role === 'agency' ? 'Agency' : 
          user.role === 'admin' ? 'Admin' : user.role,
    status: user.status === 'active' ? 'Active' : 
            user.status === 'suspended' ? 'Suspended' : 
            user.status === 'pending' ? 'Pending' : user.status || 'Active',
    joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    avatar: user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    rawRole: user.role,
    rawStatus: user.status
  }));

  // Map package data to display format
  const displayPackages = packages.map((pkg: any) => ({
    id: pkg.id,
    title: pkg.name,
    provider: pkg.agencies?.agency_name || 'Unknown Agency',
    status: pkg.status === 'active' ? 'Approved' : 
            pkg.status === 'inactive' ? 'Rejected' : 
            pkg.status === 'pending_approval' ? 'Pending' : 
            pkg.status === 'draft' ? 'Draft' : pkg.status,
    price: pkg.price,
    bookings: 0, // TODO: get actual booking count
    createdAt: pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A',
    image: pkg.images?.[0] || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=100&q=80',
    rawStatus: pkg.status // Keep original status for API calls
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Approved':
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Customer':
        return 'bg-blue-100 text-blue-800';
      case 'Agency':
        return 'bg-green-100 text-green-800';
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // User management handlers
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setEditMode(false);
    setShowUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditMode(true);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      console.log('Deleting user:', userToDelete);
      await usersAPI.delete(userToDelete.id);
      alert(`User "${userToDelete.name}" has been deleted.`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleSaveUser = async () => {
    try {
      console.log('Saving user:', selectedUser);
      // Update user with new data
      const updateData: any = {
        full_name: selectedUser.name,
        email: selectedUser.email
      };
      
      await usersAPI.update(selectedUser.id, updateData);
      
      // Update status if changed
      if (selectedUser.rawStatus) {
        await usersAPI.updateStatus(selectedUser.id, { status: selectedUser.rawStatus });
      }
      
      alert(`User "${selectedUser.name}" has been updated.`);
      setShowUserModal(false);
      setSelectedUser(null);
      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Package management handlers
  const handleViewPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setPackageEditMode(false);
    setShowPackageModal(true);
  };

  const handleEditPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setPackageEditMode(true);
    setShowPackageModal(true);
  };

  const handleDeletePackage = (pkg: any) => {
    setPackageToDelete(pkg);
    setShowPackageDeleteConfirm(true);
  };

  const handleApprovePackage = async (pkg: any) => {
    try {
      console.log('Approving package:', pkg);
      await packagesAPI.updateStatus(pkg.id, { status: 'active' });
      alert(`Package "${pkg.name}" has been approved and is now active.`);
      // Refresh the packages list
      await fetchPackages();
    } catch (error) {
      console.error('Error approving package:', error);
      alert('Failed to approve package. Please try again.');
    }
  };

  const handleRejectPackage = async (pkg: any) => {
    try {
      console.log('Rejecting package:', pkg);
      await packagesAPI.updateStatus(pkg.id, { status: 'inactive' });
      alert(`Package "${pkg.name}" has been rejected and marked as inactive.`);
      // Refresh the packages list
      await fetchPackages();
    } catch (error) {
      console.error('Error rejecting package:', error);
      alert('Failed to reject package. Please try again.');
    }
  };

  const confirmDeletePackage = async () => {
    try {
      console.log('Deleting package:', packageToDelete);
      await packagesAPI.delete(packageToDelete.id);
      alert(`Package "${packageToDelete.name}" has been deleted.`);
      setShowPackageDeleteConfirm(false);
      setPackageToDelete(null);
      // Refresh the packages list
      await fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. It may have existing bookings.');
      setShowPackageDeleteConfirm(false);
      setPackageToDelete(null);
    }
  };

  const handleSavePackage = async () => {
    try {
      console.log('Saving package:', selectedPackage);
      // Update package with new data, using rawStatus if available
      const updateData: any = {
        name: selectedPackage.title,
        price: selectedPackage.price
      };
      
      // Only update status if rawStatus is available (from edit mode)
      if (selectedPackage.rawStatus) {
        updateData.status = selectedPackage.rawStatus;
      }
      
      await packagesAPI.update(selectedPackage.id, updateData);
      alert(`Package "${selectedPackage.title}" has been updated.`);
      setShowPackageModal(false);
      setSelectedPackage(null);
      // Refresh the packages list
      await fetchPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
    }
  };

  // Payment management handlers
  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleApprovePayment = (payment: any) => {
    console.log('Approving payment:', payment);
    alert(`Payment for "${payment.agency}" has been approved.`);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Management</h1>
          <p className="text-gray-600">Manage users, packages, and payments</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
               {[
                { id: 'users', label: 'User Management', count: displayUsers.length },
                { id: 'packages', label: 'Package Management', count: displayPackages.length },
                { id: 'payments', label: 'Payment Management', count: payments.length }
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
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                {loading && <p className="text-sm text-gray-500 mt-2">Loading users...</p>}
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading users...</div>
              ) : displayUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users found</div>
              ) : (
              <div className="divide-y divide-gray-200">
                {displayUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Joined: {user.joinDate}</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Package Management</h2>
                {loading && <p className="text-sm text-gray-500 mt-2">Loading packages...</p>}
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading packages...</div>
              ) : displayPackages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No packages found</div>
              ) : (
              <div className="divide-y divide-gray-200">
                {displayPackages.map((pkg, index) => (
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
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{pkg.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">Provider: {pkg.provider}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>${pkg.price} per person</span>
                              <span>{pkg.bookings} bookings</span>
                              <span>Created: {pkg.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                              {pkg.status}
                            </span>
                            <div className="flex space-x-2">
                              {pkg.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApprovePackage(pkg)}
                                    className="p-2 text-green-600 hover:text-green-800 transition-colors"
                                    title="Approve package"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectPackage(pkg)}
                                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                    title="Reject package"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleViewPackage(pkg)}
                                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                title="View package details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditPackage(pkg)}
                                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                title="Edit package"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeletePackage(pkg)}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete package"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Payment Management</h2>
                {loading && <p className="text-sm text-gray-500 mt-2">Loading payments...</p>}
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No payments found</div>
              ) : (
              <div className="divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{payment.agency}</h3>
                        <p className="text-sm text-gray-600 mb-2">Payment Date: {payment.date}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Amount: ${payment.amount.toLocaleString()}</span>
                          <span>Commission: ${payment.commission}</span>
                          <span>Method: {payment.method}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewPayment(payment)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="View payment details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {payment.status === 'Pending' && (
                            <button 
                              onClick={() => handleApprovePayment(payment)}
                              className="p-2 text-green-600 hover:text-green-800 transition-colors"
                              title="Approve payment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </div>
          )}
        </motion.div>

        {/* User View/Edit Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editMode ? 'Edit User' : 'User Details'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedUser.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  {editMode ? (
                    <select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Agency">Agency</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {editMode ? (
                    <select
                      value={selectedUser.rawStatus || selectedUser.status}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser, 
                        rawStatus: e.target.value,
                        status: e.target.value === 'active' ? 'Active' : 
                                e.target.value === 'suspended' ? 'Suspended' : 
                                e.target.value === 'pending' ? 'Pending' : e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                  <p className="text-gray-900">{selectedUser.joinDate}</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {editMode && (
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delete User</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Package View/Edit Modal */}
        {showPackageModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {packageEditMode ? 'Edit Package' : 'Package Details'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowPackageModal(false);
                      setSelectedPackage(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-6">
                  <img
                    src={selectedPackage.image}
                    alt={selectedPackage.title}
                    className="w-full h-48 rounded-lg object-cover"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
                  {packageEditMode ? (
                    <input
                      type="text"
                      value={selectedPackage.title}
                      onChange={(e) => setSelectedPackage({...selectedPackage, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{selectedPackage.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <p className="text-gray-900">{selectedPackage.provider}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    {packageEditMode ? (
                      <input
                        type="number"
                        value={selectedPackage.price}
                        onChange={(e) => setSelectedPackage({...selectedPackage, price: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">${selectedPackage.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bookings</label>
                    <p className="text-gray-900">{selectedPackage.bookings}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {packageEditMode ? (
                    <select
                      value={selectedPackage.rawStatus || selectedPackage.status}
                      onChange={(e) => setSelectedPackage({
                        ...selectedPackage, 
                        rawStatus: e.target.value,
                        status: e.target.value === 'active' ? 'Approved' : 
                                e.target.value === 'inactive' ? 'Rejected' : 
                                e.target.value === 'pending_approval' ? 'Pending' : 
                                e.target.value === 'draft' ? 'Draft' : e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Approved (Active)</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="inactive">Rejected (Inactive)</option>
                      <option value="draft">Draft</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPackage.status)}`}>
                      {selectedPackage.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                  <p className="text-gray-900">{selectedPackage.createdAt}</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setShowPackageModal(false);
                    setSelectedPackage(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {packageEditMode && (
                  <button
                    onClick={handleSavePackage}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Package Delete Confirmation Modal */}
        {showPackageDeleteConfirm && packageToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Package</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{packageToDelete.title}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPackageDeleteConfirm(false);
                    setPackageToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePackage}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment Details Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPayment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Information</h3>
                  <p className="text-sm text-gray-600">Booking ID: #{selectedPayment.bookingId}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Agency</h3>
                  <p className="text-gray-900 font-medium">{selectedPayment.agency}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Package</h3>
                  <p className="text-gray-900 font-medium">{selectedPayment.packageName}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
                  <p className="text-gray-900 font-medium">{selectedPayment.customerName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <p className="text-2xl font-bold text-gray-900">${selectedPayment.amount?.toLocaleString() || 0}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission (10%)</label>
                    <p className="text-2xl font-bold text-gray-900">${selectedPayment.commission?.toLocaleString() || 0}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <p className="text-gray-900">{selectedPayment.method}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date</label>
                  <p className="text-gray-900">{selectedPayment.date}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPayment.status === 'Pending' && (
                  <button
                    onClick={() => {
                      handleApprovePayment(selectedPayment);
                      setShowPaymentModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Payment
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
