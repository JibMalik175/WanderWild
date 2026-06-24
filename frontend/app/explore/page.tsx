'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, DollarSign, Clock, Users, Star, Calendar, Plane, Building, Home, Car, Utensils, Bed } from 'lucide-react';
import Button from '../components/Button';
import { packagesAPI, categoriesAPI } from '../utils/api';
import { useRouter } from 'next/navigation';

const ExplorePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDates, setSelectedDates] = useState('');
  const [selectedTravelers, setSelectedTravelers] = useState('1 Traveler');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('Any duration');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [providerTypes, setProviderTypes] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Recommended');
  
  // State for API data
  const [packages, setPackages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const durations = ['Any duration', '1-2 days', '3-5 days', '1 week', '2+ weeks'];
  const providerTypeOptions = ['Airline', 'Tour Operator', 'Hotel', 'Homestay'];
  const inclusionOptions = ['Flights', 'Meals', 'Accommodation', 'Transportation'];

  // Fetch packages and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch packages with current filters
        try {
        const packagesResponse = await packagesAPI.getAll({
          search: searchTerm,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
          sortBy: sortBy.toLowerCase()
        });
          console.log('Packages response:', packagesResponse);
          console.log('Packages response.data:', packagesResponse.data);
          console.log('Packages response.data.data:', packagesResponse.data?.data);
          
          // Handle the correct response structure: {success: true, data: {packages: [...]}}
          let packagesData = null;
          if (packagesResponse.data) {
            // Check if response.data is the actual data object
            if (packagesResponse.data.success && packagesResponse.data.data) {
              // Structure: {success: true, data: {packages: [...]}}
              packagesData = packagesResponse.data.data.packages;
            } else if (packagesResponse.data.data && packagesResponse.data.data.packages) {
              // Structure: {data: {packages: [...]}}
              packagesData = packagesResponse.data.data.packages;
            } else if (packagesResponse.data.packages && Array.isArray(packagesResponse.data.packages)) {
              // Structure: {packages: [...]}
              packagesData = packagesResponse.data.packages;
            } else if (Array.isArray(packagesResponse.data)) {
              // Structure: [...]
              packagesData = packagesResponse.data;
            }
          }
          
          console.log('Extracted packages data:', packagesData);
          console.log('Is packages data array?', Array.isArray(packagesData));
          
          if (packagesData && Array.isArray(packagesData)) {
            console.log('Setting packages:', packagesData.length, 'packages');
            setPackages(packagesData);
          } else {
            console.warn('Packages data is not an array:', packagesResponse.data);
            setPackages([]);
          }
        } catch (packagesError: any) {
          console.error('Failed to fetch packages:', packagesError);
          console.error('Error details:', {
            message: packagesError.message,
            status: packagesError.response?.status,
            data: packagesError.response?.data,
            url: packagesError.config?.url
          });
          
          // Use fallback data when API is not available
          console.log('Using fallback package data');
          setPackages([
            {
              id: '1',
              name: 'Bali Adventure Package',
              description: 'Experience the beauty of Bali with our comprehensive tour package.',
              price: 500,
              location: 'Bali, Indonesia',
              country: 'Indonesia',
              city: 'Bali',
              duration_days: 7,
              rating: 4.8,
              status: 'active',
              images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'],
              categories: { name: 'Adventure' },
              agencies: { 
                agency_name: 'Bali Tours', 
                verification_status: 'verified',
                rating: 4.5
              }
            },
            {
              id: '2',
              name: 'Swiss Alps Experience',
              description: 'Discover the majestic Swiss Alps with our premium tour package.',
              price: 800,
              location: 'Switzerland',
              country: 'Switzerland',
              city: 'Zermatt',
              duration_days: 10,
              rating: 4.9,
              status: 'active',
              images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80'],
              categories: { name: 'Nature' },
              agencies: { 
                agency_name: 'Alpine Adventures', 
                verification_status: 'verified',
                rating: 4.7
              }
            }
          ]);
        }
        
        // Fetch categories
        try {
        const categoriesResponse = await categoriesAPI.getAll();
          console.log('Categories response:', categoriesResponse);
          console.log('Categories response.data:', categoriesResponse.data);
          console.log('Categories response.data.data:', categoriesResponse.data?.data);
          
          // Handle the correct response structure: {success: true, data: {categories: [...]}}
          let categoriesData = null;
          if (categoriesResponse.data) {
            // Check if response.data is the actual data object
            if (categoriesResponse.data.success && categoriesResponse.data.data) {
              // Structure: {success: true, data: {categories: [...]}}
              categoriesData = categoriesResponse.data.data.categories;
            } else if (categoriesResponse.data.categories && Array.isArray(categoriesResponse.data.categories)) {
              // Structure: {categories: [...]}
              categoriesData = categoriesResponse.data.categories;
            } else if (Array.isArray(categoriesResponse.data)) {
              // Structure: [...]
              categoriesData = categoriesResponse.data;
            }
          }
          
          console.log('Extracted categories data:', categoriesData);
          console.log('Is categories data array?', Array.isArray(categoriesData));
          
          if (categoriesData && Array.isArray(categoriesData)) {
            console.log('Setting categories:', categoriesData.length, 'categories');
            setCategories(categoriesData);
          } else {
            console.warn('Categories data is not an array:', categoriesResponse.data);
            setCategories([]);
          }
        } catch (categoryError: any) {
          console.error('Failed to fetch categories:', categoryError);
          console.error('Category error details:', {
            message: categoryError.message,
            status: categoryError.response?.status,
            data: categoryError.response?.data
          });
          
          // Use fallback categories when API is not available
          console.log('Using fallback category data');
          setCategories([
            { id: '1', name: 'Adventure' },
            { id: '2', name: 'Nature' },
            { id: '3', name: 'Culture' },
            { id: '4', name: 'Beach' },
            { id: '5', name: 'Mountain' },
            { id: '6', name: 'City' }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, minPrice, maxPrice, selectedCategory, sortBy]);

  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (minPrice) {
      filtered = filtered.filter(pkg => pkg.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(pkg => pkg.price <= parseInt(maxPrice));
    }

    // Duration filter
    if (selectedDuration !== 'Any duration') {
      filtered = filtered.filter(pkg => {
        const duration = pkg.duration.toLowerCase();
        if (selectedDuration === '1-2 days') return duration.includes('1') || duration.includes('2');
        if (selectedDuration === '3-5 days') return duration.includes('3') || duration.includes('4') || duration.includes('5');
        if (selectedDuration === '1 week') return duration.includes('week') || duration.includes('7');
        if (selectedDuration === '2+ weeks') return duration.includes('week') && !duration.includes('1');
        return true;
      });
    }

    // Sort
    switch (sortBy) {
      case 'Price (Low to High)':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price (High to Low)':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Rating (High to Low)':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Name (A-Z)':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Recommended - keep original order
        break;
    }

    return filtered;
  }, [packages, searchTerm, minPrice, maxPrice, selectedDuration, sortBy]);

  const handleProviderTypeChange = (type: string) => {
    setProviderTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleInclusionChange = (inclusion: string) => {
    setInclusions(prev => 
      prev.includes(inclusion) 
        ? prev.filter(i => i !== inclusion)
        : [...prev, inclusion]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDates('');
    setSelectedTravelers('1 Traveler');
    setMinPrice('');
    setMaxPrice('');
    setSelectedDuration('Any duration');
    setSelectedCategory('All Categories');
    setProviderTypes([]);
    setInclusions([]);
    setSortBy('Recommended');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Blue Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white py-16"
        style={{ backgroundColor: 'var(--color-primary-dark)' }}
      >
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-8">
              Find Your Perfect Tour
            </h1>
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium mb-2">Where to?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                />
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium mb-2">Add dates</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Add dates"
                  value={selectedDates}
                  onChange={(e) => setSelectedDates(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                />
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-sm font-medium mb-2">Travelers</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedTravelers}
                  onChange={(e) => setSelectedTravelers(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] appearance-none"
                >
                  <option>1 Traveler</option>
                  <option>2 Travelers</option>
                  <option>3 Travelers</option>
                  <option>4+ Travelers</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button className="w-full px-6 py-3 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Filters</h3>

              <div className="space-y-6">
                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Where to?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="input-field pl-6 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="number"
                          placeholder="3000"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="input-field pl-6 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="input-field text-sm"
                  >
                    {durations.map(duration => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="All Categories">All Categories</option>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading categories...</option>
                    )}
                  </select>
                </div>

                {/* Provider Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                  <div className="space-y-2">
                    {providerTypeOptions.map(type => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={providerTypes.includes(type)}
                          onChange={() => handleProviderTypeChange(type)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Inclusions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
                  <div className="space-y-2">
                    {inclusionOptions.map(inclusion => (
                      <label key={inclusion} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inclusions.includes(inclusion)}
                          onChange={() => handleInclusionChange(inclusion)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{inclusion}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  className="w-full px-4 py-3 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: 'var(--color-primary-dark)' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1e293b'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)'}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="lg:col-span-3"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">All Tour Packages</h2>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                >
                  <option>Recommended</option>
                  <option>Price (Low to High)</option>
                  <option>Price (High to Low)</option>
                  <option>Rating (High to Low)</option>
                  <option>Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card-elevated overflow-hidden group relative hover:shadow-2xl transition-all duration-300 w-full min-w-[300px] max-w-[400px]"
                    style={{ 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(15, 23, 41, 0.25), 0 0 0 1px rgba(15, 23, 41, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative h-40 overflow-hidden rounded-t-xl">
                      {pkg.images && pkg.images.length > 0 ? (
                      <img
                          src={pkg.images[0]}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.log('Image failed to load:', pkg.images[0]);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2 mx-auto">
                              <span className="text-2xl">🏔️</span>
                            </div>
                            <p className="text-sm text-gray-500">{pkg.name}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Price Badge */}
                      <motion.div
                        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-lg font-bold text-green-600">${pkg.price}</span>
                      </motion.div>

                      {/* Rating Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-700">{pkg.rating}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2">
                      <h3 className="text-base font-semibold line-clamp-1 group-hover:text-green-600 transition-colors duration-300 mb-1">
                        {pkg.name}
                      </h3>
                      
                      <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">
                        {pkg.description}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 gap-1 mb-1.5">
                        <motion.div
                          className="flex items-center space-x-2 text-xs"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-1.5 bg-green-50 rounded">
                            <MapPin className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-neutral-600 truncate">{pkg.location}</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center space-x-2 text-xs"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-1.5 bg-[var(--color-primary-500)]/10 rounded">
                            <Clock className="w-3 h-3 text-[var(--color-primary-500)]" />
                          </div>
                          <span className="text-neutral-600">{pkg.duration_days ? `${pkg.duration_days} days` : 'N/A'}</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center space-x-2 text-xs"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-1.5 bg-amber-50 rounded">
                            <Users className="w-3 h-3 text-amber-600" />
                          </div>
                          <span className="text-neutral-600">Max {pkg.max_people || 'N/A'}</span>
                        </motion.div>
                      </div>

                      {/* Agency */}
                      <div className="mb-1.5">
                        <p className="text-xs text-neutral-400">
                          by <span className="font-medium text-neutral-600 truncate">{pkg.agencies?.agency_name || 'Unknown Agency'}</span>
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => router.push(`/packages/${pkg.id}`)}
                        className="w-full px-2 py-1.5 text-white rounded-lg text-xs font-medium transition-colors"
                        style={{ backgroundColor: 'var(--color-primary-dark)' }}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1e293b'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)'}
                      >
                        View Details
                      </button>
                    </div>

                    {/* Hover Border Effect */}
                    <div 
                      className="absolute inset-0 rounded-xl border-2 border-transparent transition-colors duration-300 pointer-events-none"
                      style={{
                        borderColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(15, 23, 41, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex justify-center"
              >
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-md">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    No tour packages found
                  </h3>
                  <p className="text-gray-600 text-sm">
                    No tour packages are currently available. Please check back later or try a different search.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;




