'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { vrAPI } from '../utils/api';

const VRExperiencesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Experiences');
  const [selectedType, setSelectedType] = useState('All Types');

  // Local fallback VR Experience data
  const fallbackExperiences = useMemo(() => [
    {
      id: 1,
      title: "Rural Paddy Field Experience",
      price: 25.00,
      description: "Experience the beauty and tranquility of traditional paddy fields. Perfect for elderly visitors who want to reminisce about rural life.",
      duration: "30m",
      difficulty: "1/5",
      audience: "ELDERLY",
      featured: true,
      features: ["360° video", "Ambient sounds", "Guided narration", "Wheelchair accessible"]
    },
    {
      id: 2,
      title: "Rainforest Canopy Adventure",
      price: 35.00,
      description: "Take an exciting journey through the rainforest canopy. Educational and thrilling for students learning about ecosystems.",
      duration: "45m",
      difficulty: "3/5",
      audience: "STUDENT",
      featured: true,
      features: ["Interactive elements", "Educational content", "Wildlife spotting", "Virtual tour guide"]
    },
    {
      id: 3,
      title: "Accessible Beach Getaway",
      price: 30.00,
      description: "Experience the joy of a beach day with wheelchair-accessible pathways and assisted experiences designed for persons with disabilities.",
      duration: "40m",
      difficulty: "1/5",
      audience: "OKU",
      featured: true,
      features: ["Sensory-friendly content", "Adaptive controls", "OKU support staff", "Customizable experience"]
    },
    {
      id: 4,
      title: "Mountain Hiking Expedition",
      price: 45.00,
      description: "Climb mountains and enjoy breathtaking views without the physical exertion. A perfect virtual getaway for everyone.",
      duration: "60m",
      difficulty: "4/5",
      audience: "GENERAL",
      featured: true,
      features: ["360° video", "Mountain sounds", "Guided narration", "Multiple viewpoints"]
    }
  ], []);

  // Remote VR experiences
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const res = await vrAPI.getExperiences({ status: 'active', limit: 30 });
        const apiExperiences = res.data?.data?.experiences || [];
        setExperiences(apiExperiences);
      } catch (e) {
        console.warn('Failed to fetch VR experiences, using fallback.');
        setExperiences(fallbackExperiences);
        setError('Unable to load live experiences, showing samples.');
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, [fallbackExperiences]);

  const filterOptions = ['All Experiences', 'Featured', 'For Elderly', 'For Students', 'For OKU'];
  const typeOptions = ['All Types', 'Nature', 'Cultural', 'Adventure', 'Educational'];

  const filteredExperiences = useMemo(() => {
    let filtered = experiences;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by audience
    if (selectedFilter !== 'All Experiences') {
      if (selectedFilter === 'Featured') {
        filtered = filtered.filter(exp => exp.featured);
      } else if (selectedFilter === 'For Elderly') {
        filtered = filtered.filter(exp => exp.audience === 'ELDERLY');
      } else if (selectedFilter === 'For Students') {
        filtered = filtered.filter(exp => exp.audience === 'STUDENT');
      } else if (selectedFilter === 'For OKU') {
        filtered = filtered.filter(exp => exp.audience === 'OKU');
      }
    }

    return filtered;
  }, [searchTerm, selectedFilter, experiences]);

  const handleBookNow = async (experience: any) => {
    try {
      // Determine ID and duration fields for fallback vs API data
      const id = experience.id;
      const durationMinutes = experience.duration_minutes ||
        (typeof experience.duration === 'string' && experience.duration.endsWith('m')
          ? parseInt(experience.duration.replace('m', ''), 10)
          : 60);

      await vrAPI.createBooking({
        vr_experience_id: id,
        booking_date: new Date().toISOString(),
        duration_minutes: durationMinutes
      });

      alert('Booking confirmed! You can view it in your dashboard.');
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/customer';
      }
    } catch (e) {
      alert('Failed to book. Please ensure you are logged in and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Virtual Reality Experiences
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
            Explore stunning destinations from the comfort of your home. Perfect for elderly folks, students, and persons with disabilities (OKU) who want to experience the world virtually.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search VR experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-between mb-8 border-b border-gray-200"
        >
          <div className="flex space-x-8 mb-4">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedFilter(option)}
                className={`pb-2 text-sm font-medium transition-colors ${
                  selectedFilter === option
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
            >
              {typeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* VR Experience Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">Loading experiences...</div>
          ) : filteredExperiences.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">No experiences found</div>
          ) : filteredExperiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="relative p-6">
                {/* Audience Tag */}
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    experience.audience === 'ELDERLY' ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' :
                    experience.audience === 'STUDENT' ? 'bg-green-100 text-green-800' :
                    experience.audience === 'OKU' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {experience.audience}
                  </span>
                </div>

                {/* Featured Tag */}
                {experience.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                      Featured
                    </span>
                  </div>
                )}

                {/* Title and Price */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {experience.title || experience.name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mb-4">
                    ${((experience.price || 0) as number).toFixed(2)}/hr
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {experience.description}
                </p>

                {/* Duration and Difficulty */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{experience.duration || `${experience.duration_minutes || 60}m`}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Difficulty: {experience.difficulty || (experience.difficulty_level ? `${experience.difficulty_level}/5` : 'N/A')}</span>
                  </div>
                </div>

                {/* Accessibility Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(experience.features || []).map((feature: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link href={`/explore`} className="flex-1">
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </Link>
                  <button 
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--color-primary-dark)' }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1e293b'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-dark)'}
                    onClick={() => handleBookNow(experience)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {error && (
          <div className="mt-6 text-center text-sm text-gray-500">{error}</div>
        )}
      </div>
    </div>
  );
};

export default VRExperiencesPage;
