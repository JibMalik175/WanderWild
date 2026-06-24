'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { packagesAPI } from '@/app/utils/api';

const EditPackagePage = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    location: '',
    country: '',
    city: '',
    price: '',
    durationDays: '',
    durationNights: '',
    maxPeople: '',
    minPeople: '',
    categoryId: '',
    status: 'draft',
    highlights: '',
    itinerary: '',
    inclusions: '',
    exclusions: '',
    images: '',
    mainImage: ''
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedMainImage, setSelectedMainImage] = useState<string>('');

  const packageId = params.id as string;

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoadingData(true);
        
        try {
          // Try to fetch package from API
          const response = await packagesAPI.getById(packageId);
          console.log('Package response:', response);
          const pkg = response.data?.data?.package || response.data?.data || response.data;
          console.log('Package data for edit:', pkg);
          
          const formDataToSet = {
            name: pkg.name || '',
            description: pkg.description || '',
            shortDescription: pkg.short_description || '',
            location: pkg.location || '',
            country: pkg.country || '',
            city: pkg.city || '',
            price: pkg.price?.toString() || '',
            durationDays: pkg.duration_days?.toString() || '',
            durationNights: pkg.duration_nights?.toString() || '',
            maxPeople: pkg.max_people?.toString() || '',
            minPeople: pkg.min_people?.toString() || '',
            categoryId: pkg.category_id || '',
            status: pkg.status || 'draft',
            highlights: pkg.highlights ? (Array.isArray(pkg.highlights) ? pkg.highlights.join('\n') : pkg.highlights) : '',
            itinerary: pkg.itinerary ? (Array.isArray(pkg.itinerary) ? pkg.itinerary.join('\n') : Object.values(pkg.itinerary).join('\n')) : '',
            inclusions: pkg.includes ? (Array.isArray(pkg.includes) ? pkg.includes.join('\n') : pkg.includes) : '',
            exclusions: pkg.excludes ? (Array.isArray(pkg.excludes) ? pkg.excludes.join('\n') : pkg.excludes) : '',
            images: Array.isArray(pkg.images) ? pkg.images.join('\n') : '',
            mainImage: pkg.main_image || ''
          };
          
          console.log('Setting form data:', formDataToSet);
          setFormData(formDataToSet);

          // Initialize uploaded images and main image
          if (Array.isArray(pkg.images) && pkg.images.length > 0) {
            setUploadedImages(pkg.images);
          }
          if (pkg.main_image) {
            setSelectedMainImage(pkg.main_image);
          }
        } catch (apiError) {
          console.warn('API call failed, checking demo packages:', apiError);
          
          // Fallback: Check demo packages in localStorage
          const demoPackages = JSON.parse(localStorage.getItem('demoPackages') || '[]');
          const demoPackage = demoPackages.find((pkg: any) => pkg.id === packageId);
          
          if (demoPackage) {
            setFormData({
              name: demoPackage.title || demoPackage.name || '',
              description: demoPackage.description || '',
              shortDescription: demoPackage.shortDescription || '',
              location: demoPackage.location || '',
              country: demoPackage.country || '',
              city: demoPackage.city || '',
              price: demoPackage.price?.toString() || '',
              durationDays: demoPackage.duration || demoPackage.durationDays?.toString() || '',
              durationNights: demoPackage.durationNights?.toString() || '',
              maxPeople: demoPackage.maxPeople?.toString() || '',
              minPeople: demoPackage.minPeople?.toString() || '',
              categoryId: demoPackage.categoryId || demoPackage.category || '',
              status: demoPackage.status || 'draft',
              highlights: demoPackage.highlights?.join('\n') || '',
              itinerary: demoPackage.itinerary ? (typeof demoPackage.itinerary === 'object' ? Object.values(demoPackage.itinerary).join('\n') : demoPackage.itinerary) : '',
              inclusions: demoPackage.inclusions?.join('\n') || '',
              exclusions: demoPackage.exclusions?.join('\n') || '',
              images: Array.isArray(demoPackage.images) ? demoPackage.images.join('\n') : demoPackage.images || '',
              mainImage: demoPackage.mainImage || ''
            });
          } else {
            // Use default values
            setFormData({
              name: 'Sample Package',
              description: 'Sample description',
              shortDescription: '',
              location: 'Sample Location',
              country: '',
              city: '',
              price: '500',
              durationDays: '7',
              durationNights: '6',
              maxPeople: '10',
              minPeople: '2',
              categoryId: '',
              status: 'draft',
              highlights: 'Sample highlight 1\nSample highlight 2',
              itinerary: 'Day 1: Arrival\nDay 2: Activities\nDay 3: Departure',
              inclusions: 'Accommodation\nMeals\nTransportation',
              exclusions: 'Personal expenses\nTravel insurance',
              images: '',
              mainImage: ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'package');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token : ''}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.data?.url) {
          throw new Error('Invalid response from upload endpoint');
        }
        
        return result.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      
      // Set the first uploaded image as main image if none selected
      if (!selectedMainImage && uploadedUrls.length > 0) {
        setSelectedMainImage(uploadedUrls[0]);
        setFormData(prev => ({ ...prev, mainImage: uploadedUrls[0] }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Could not extract filename from URL');
      }

      // Delete from Supabase storage
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token : ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: fileName,
          type: 'package'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete image: ${response.status} ${errorText}`);
      }

      // Remove from local state
      setUploadedImages(prev => prev.filter(url => url !== imageUrl));
      if (selectedMainImage === imageUrl) {
        setSelectedMainImage('');
        setFormData(prev => ({ ...prev, mainImage: '' }));
      }

      // Update the package in database to remove the image URL
      try {
        const currentPackage = await packagesAPI.getById(packageId);
        const currentImages = currentPackage.data.images || [];
        const updatedImages = currentImages.filter((url: string) => url !== imageUrl);
        
        await packagesAPI.update(packageId, {
          images: updatedImages,
          main_image: selectedMainImage === imageUrl ? '' : selectedMainImage
        });
      } catch (dbError) {
        console.error('Failed to update package in database:', dbError);
        // Don't throw error here, image is already deleted from storage
      }

    } catch (error) {
      console.error('Image removal error:', error);
      alert('Failed to remove image. Please try again.');
    }
  };

  const setMainImage = (imageUrl: string) => {
    setSelectedMainImage(imageUrl);
    setFormData(prev => ({ ...prev, mainImage: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Convert itinerary from newline-separated string to object
      const itineraryLines = formData.itinerary.split('\n').filter(i => i.trim());
      const itinerary: { [key: string]: string } = {};
      itineraryLines.forEach((line, index) => {
        itinerary[`day${index + 1}`] = line.trim();
      });

      // Validate required fields
      if (!formData.name || !formData.description || !formData.categoryId || !formData.location || !formData.price || !formData.durationDays || !formData.maxPeople) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate field lengths and values
      if (formData.name.length < 2) {
        alert('Package name must be at least 2 characters long');
        return;
      }
      if (formData.description.length < 10) {
        alert('Description must be at least 10 characters long');
        return;
      }
      if (formData.location.length < 2) {
        alert('Location must be at least 2 characters long');
        return;
      }
      if (parseFloat(formData.price) <= 0) {
        alert('Price must be greater than 0');
        return;
      }
      if (parseInt(formData.durationDays) < 1 || parseInt(formData.durationDays) > 365) {
        alert('Duration must be between 1 and 365 days');
        return;
      }
      if (parseInt(formData.maxPeople) < 1 || parseInt(formData.maxPeople) > 100) {
        alert('Max people must be between 1 and 100');
        return;
      }
      if (formData.minPeople && (parseInt(formData.minPeople) < 1 || parseInt(formData.minPeople) > 100)) {
        alert('Min people must be between 1 and 100');
        return;
      }

      const packageData: any = {
        name: formData.name,
        description: formData.description,
        category_id: formData.categoryId,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.durationDays),
        location: formData.location,
        max_people: parseInt(formData.maxPeople),
        status: formData.status,
        highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
        itinerary: itinerary,
        includes: formData.inclusions ? formData.inclusions.split('\n').filter(i => i.trim()) : [],
        excludes: formData.exclusions ? formData.exclusions.split('\n').filter(e => e.trim()) : []
      };

      // Add optional fields only if they have values
      if (formData.shortDescription && formData.shortDescription.trim()) {
        packageData.short_description = formData.shortDescription;
      }
      if (formData.durationNights && formData.durationNights.trim()) {
        packageData.duration_nights = parseInt(formData.durationNights);
      }
      if (formData.country && formData.country.trim()) {
        packageData.country = formData.country;
      }
      if (formData.city && formData.city.trim()) {
        packageData.city = formData.city;
      }
      if (formData.minPeople && formData.minPeople.trim()) {
        packageData.min_people = parseInt(formData.minPeople);
      }
      
      // Add uploaded images
      if (uploadedImages.length > 0) {
        packageData.images = uploadedImages;
      }
      if (selectedMainImage) {
        packageData.main_image = selectedMainImage;
      }

      console.log('Sending package data:', packageData);

      // Update package via API
      const response = await packagesAPI.update(packageId, packageData);
      console.log('Package updated successfully:', response.data);
      
      alert('Package updated successfully!');
      router.push(`/dashboard/agency/packages/${packageId}`);
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading package data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Edit Package</h1>
              <p className="text-gray-600">Update your tourism package details</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter package title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter destination location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter price per person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="e.g., 7 (1-365 days)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Nights)
                  </label>
                  <input
                    type="number"
                    name="durationNights"
                    value={formData.durationNights}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="e.g., 6 (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Brief description (max 500 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>

              </div>

              {/* Detailed Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Describe your package in detail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Itinerary (one per line)
                  </label>
                  <textarea
                    name="itinerary"
                    value={formData.itinerary}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Day 1: Arrival and city tour&#10;Day 2: Visit historical sites&#10;Day 3: Nature exploration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  >
                    <option value="">Select category</option>
                    <option value="d0691e97-ecc4-43d1-bbb7-40282d020173">Adventure</option>
                    <option value="b433daed-cbd7-4308-87e9-ce8cdfa132bb">Beach</option>
                    <option value="bc1b4d5b-7d86-47d6-9327-64ef7d460b64">City</option>
                    <option value="f915574a-95e2-44a4-b6e8-391a6fa37bd8">Cultural</option>
                    <option value="d4445e52-faa9-40ce-b046-1c01b044397f">Mountain</option>
                    <option value="089e71e6-6058-4f7d-9565-17584b7719dd">Romantic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highlights (one per line)
                  </label>
                  <textarea
                    name="highlights"
                    value={formData.highlights}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="• Visit famous landmarks&#10;• Local cultural experiences&#10;• Scenic views"
                  />
                </div>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inclusions (one per line)
                </label>
                <textarea
                  name="inclusions"
                  value={formData.inclusions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  placeholder="• Accommodation&#10;• Meals&#10;• Transportation&#10;• Guide services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exclusions (one per line)
                </label>
                <textarea
                  name="exclusions"
                  value={formData.exclusions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                  placeholder="• International flights&#10;• Personal expenses&#10;• Travel insurance&#10;• Tips"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Package Images</h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--color-primary-500)] transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    {uploading ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                        <span>Uploading images...</span>
                      </span>
                    ) : (
                      'Click to upload images or drag and drop'
                    )}
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </label>
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Package image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEwxMDAgMTUwTDUwIDEwMEwxMDAgNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjEyIj5JbWFnZSBFcnJvcjwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setMainImage(imageUrl)}
                              className={`px-3 py-1 text-xs rounded ${
                                selectedMainImage === imageUrl
                                  ? 'bg-[var(--color-primary-500)] text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {selectedMainImage === imageUrl ? 'Main' : 'Set Main'}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(imageUrl)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {selectedMainImage === imageUrl && (
                          <div className="absolute top-2 right-2 bg-[var(--color-primary-500)] text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[var(--color-primary-500)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Package</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditPackagePage;
