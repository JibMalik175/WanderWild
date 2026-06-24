'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { packagesAPI } from '../../../../utils/api';

const AddPackagePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

      // Create package via API
      const response = await packagesAPI.create(packageData);
      console.log('Package created successfully:', response.data);
      
      // Show success message
      alert('Package created successfully!');
      router.push('/dashboard/agency/packages');
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-800">Add New Package</h1>
              <p className="text-gray-600">Create a new tourism package for your agency</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter package title (min 2 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="Enter destination location (min 2 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    placeholder="Enter price per person (must be > 0)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max People *
                  </label>
                  <input
                    type="number"
                    name="maxPeople"
                    value={formData.maxPeople}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
                    placeholder="e.g., 10 (1-100 people)"
                  />
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
                    placeholder="Describe your package in detail (min 10 characters)"
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Package</span>
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

export default AddPackagePage;
