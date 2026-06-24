'use client';

import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Eye, Trash2, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { packagesAPI, agenciesAPI } from '../../../utils/api';

const AgencyPackages = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default packages
  const defaultPackages = [
    {
      id: 1,
      title: 'Mountain Village Experience',
      location: 'Bali, Indonesia',
      price: 320,
      bookings: 24,
      revenue: 7680,
      status: 'Active',
      createdAt: '2026-01-10',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'Cultural Heritage Tour',
      location: 'Chiang Mai, Thailand',
      price: 280,
      bookings: 18,
      revenue: 5040,
      status: 'Active',
      createdAt: '2026-01-08',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'Farm Stay Experience',
      location: 'Tuscany, Italy',
      price: 450,
      bookings: 0,
      revenue: 0,
      status: 'Draft',
      createdAt: '2026-01-15',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      title: 'Rural Cooking Class',
      location: 'Provence, France',
      price: 180,
      bookings: 8,
      revenue: 1440,
      status: 'Inactive',
      createdAt: '2026-01-05',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80'
    }
  ];

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        
        // Get current user's agency information
        const agencyResponse = await agenciesAPI.getMe();
        console.log('Agency response:', agencyResponse);
        const agencyId = agencyResponse.data?.data?.agency?.id;
        console.log('Agency ID:', agencyId);
        
        if (agencyId) {
          // Fetch agency packages (all statuses)
          const response = await packagesAPI.getAgencyPackages(agencyId, { status: 'all' });
          console.log('Agency packages response:', response);
          const apiPackages = response.data?.data?.packages || response.data?.data || [];
          console.log('Agency packages data:', apiPackages);
          // Map API response to frontend format
          const mappedPackages = apiPackages.map((pkg: any) => ({
            id: pkg.id,
            title: pkg.name,
            location: pkg.location,
            price: pkg.price,
            bookings: pkg.total_reviews || 0, // Using reviews as booking count for now
            revenue: 0, // Not available in API
            status: pkg.status === 'draft' ? 'Draft' : pkg.status === 'active' ? 'Active' : pkg.status === 'inactive' ? 'Inactive' : pkg.status === 'pending_approval' ? 'Pending Approval' : 'Draft',
            createdAt: pkg.created_at,
            image: pkg.main_image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'
          }));
          setPackages(mappedPackages);
        } else {
          console.log('No agency ID found, using fallback to public packages');
          // Fallback to public packages
          const response = await packagesAPI.getAll();
          console.log('Public packages response:', response);
          const apiPackages = response.data?.data?.packages || [];
          console.log('Public packages data:', apiPackages);
          // Map API response to frontend format
          const mappedPackages = apiPackages.map((pkg: any) => ({
            id: pkg.id,
            title: pkg.name,
            location: pkg.location,
            price: pkg.price,
            bookings: pkg.total_reviews || 0,
            revenue: 0,
            status: pkg.status === 'draft' ? 'Draft' : pkg.status === 'active' ? 'Active' : pkg.status === 'inactive' ? 'Inactive' : pkg.status === 'pending_approval' ? 'Pending Approval' : 'Draft',
            createdAt: pkg.created_at,
            image: pkg.main_image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'
          }));
          setPackages(mappedPackages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        // Use default packages as final fallback
        setPackages(defaultPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleAddPackage = () => {
    router.push('/dashboard/agency/packages/add');
  };

  const handleViewPackage = (packageId: string | number) => {
    router.push(`/packages/${packageId}`);
  };

  const handleEditPackage = (packageId: string | number) => {
    router.push(`/dashboard/agency/packages/edit/${packageId}`);
  };

  const handleDeletePackage = async (packageId: string | number) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete via API
      await packagesAPI.delete(packageId.toString());
      
      // Remove from local state
      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      
      alert('Package deleted successfully!');
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log('All packages:', packages);
  console.log('Filtered packages:', filteredPackages);
  console.log('Status filter:', statusFilter);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Packages</h1>
              <p className="text-gray-600">Manage your tourism packages</p>
            </div>
            <button 
              onClick={handleAddPackage}
              className="flex items-center px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors appearance-none"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Packages Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading packages...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="flex space-x-2">
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[var(--color-primary-500)] transition-colors">
                      {pkg.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                      {pkg.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{pkg.location}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-gray-800">${pkg.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bookings</p>
                      <p className="text-lg font-semibold text-gray-800">{pkg.bookings}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-bold text-green-600">${pkg.revenue.toLocaleString()}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewPackage(pkg.id)}
                      className="flex-1 px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      View
                    </button>
                    <button 
                      onClick={() => handleEditPackage(pkg.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {filteredPackages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No packages found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AgencyPackages;
