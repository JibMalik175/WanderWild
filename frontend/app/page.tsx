'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, MapPin, Sparkles, Users, User, Star, Globe, Plane, Building, Home, Shield, Clock } from 'lucide-react';
import Button from './components/Button';
import { packagesAPI, analyticsAPI } from './utils/api';

const HomePage = () => {
  const heroSrc = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80';
  
  // State for dynamic data
  const [featuredPackages, setFeaturedPackages] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { number: '10K+', label: 'Happy Travelers' },
    { number: '500+', label: 'Destinations' },
    { number: '50+', label: 'Partner Agencies' },
    { number: '24/7', label: 'AI Support' }
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch featured packages and analytics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured packages with error handling
        try {
          const packagesResponse = await packagesAPI.getFeatured();
          setFeaturedPackages(packagesResponse.data || []);
        } catch (error) {
          console.warn('Failed to fetch featured packages, using fallback data:', error);
          // Use fallback data when API is not available
          setFeaturedPackages([
            {
              id: '1',
              name: 'Bali Adventure',
              price: 500,
              location: 'Bali, Indonesia',
              image: '/images/bali.jpg',
              rating: 4.8,
              duration: '7 days',
              description: 'Experience the beauty of Bali with our comprehensive tour package.'
            },
            {
              id: '2',
              name: 'Swiss Alps Tour',
              price: 800,
              location: 'Switzerland',
              image: '/images/swiss.jpg',
              rating: 4.9,
              duration: '10 days',
              description: 'Discover the majestic Swiss Alps with our premium tour package.'
            }
          ]);
        }
        
        // Fetch analytics for stats
        try {
          const analyticsResponse = await analyticsAPI.getPublicStats();
          if (analyticsResponse.data) {
            setStats([
              { number: `${analyticsResponse.data.totalUsers || '10K+'}+`, label: 'Happy Travelers' },
              { number: `${analyticsResponse.data.totalPackages || '500+'}+`, label: 'Destinations' },
              { number: `${analyticsResponse.data.totalAgencies || '50+'}+`, label: 'Partner Agencies' },
              { number: '24/7', label: 'AI Support' }
            ]);
          }
        } catch (error) {
          console.warn('Failed to fetch analytics, using default stats:', error);
          // Use default stats when API is not available
          setStats([
            { number: '10K+', label: 'Happy Travelers' },
            { number: '500+', label: 'Destinations' },
            { number: '50+', label: 'Partner Agencies' },
            { number: '24/7', label: 'AI Support' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: 'AI-Powered Chat',
      description: 'Get instant, personalized travel recommendations from our intelligent chatbot.'
    },
    {
      icon: MapPin,
      title: 'Curated Packages',
      description: 'Discover handpicked travel packages from trusted agencies worldwide.'
    },
    {
      icon: Users,
      title: 'Expert Agencies',
      description: 'Connect with verified travel agencies and local experts.'
    },
    {
      icon: Star,
      title: 'Best Deals',
      description: 'Find the best prices and exclusive offers for your dream destinations.'
    }
  ];

  const providers = [
    {
      icon: Plane,
      title: 'Airlines',
      description: 'Connect with airlines offering special rates and packages for your destination.',
      link: '/packages?category=airlines'
    },
    {
      icon: MapPin,
      title: 'Tour Operators',
      description: 'Find tour operators with unique excursions and guided experiences.',
      link: '/packages?category=tours'
    },
    {
      icon: Building,
      title: 'Hotels & Resorts',
      description: 'Book accommodations ranging from luxury resorts to boutique hotels.',
      link: '/packages?category=hotels'
    },
    {
      icon: Home,
      title: 'Homestays',
      description: 'Experience authentic local living with carefully selected homestays.',
      link: '/packages?category=homestays'
    }
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section (Image background + left title + right search) */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
         <div className="absolute inset-0 overflow-hidden">
           <motion.img
             src={heroSrc}
             alt="Rural nature background"
             className="w-full h-full object-cover"
             loading="eager"
             decoding="async"
             animate={{
               scale: [1, 1.05, 1]
             }}
             transition={{
               duration: 8,
               repeat: Infinity,
               ease: "easeInOut"
             }}
           />
           <div className="absolute inset-0 bg-black/40"></div>
         </div>

        <div className="container-custom relative min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Left: Headline Card with Glass Effect */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-content-card max-w-2xl p-8 rounded-2xl"
            >
              <div className="glass-tag-card inline-flex items-center px-4 py-2 rounded-full text-white mb-6">
                <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
                <span className="text-sm font-medium">Experience WanderWild Tourism</span>
              </div>
              <h1 className="text-white font-extrabold tracking-tight leading-tight text-5xl md:text-6xl">
                Discover Hidden
                <br />
                <motion.span
                  animate={{
                    color: ['#bfbdb0', '#ffffff', '#bfbdb0']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Rural Treasures
                </motion.span>
              </h1>
              <p className="mt-6 text-white/95 text-lg max-w-xl">
                Connect with local tourism providers worldwide – airlines, tour operators, hotels, and homestays. Experience authentic adventures with personalized itineraries.
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30"></div>
                <div className="w-12 h-12 rounded-full bg-white/30 border border-white/40 -ml-2"></div>
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 -ml-2"></div>
                <span className="text-white/90 text-sm ml-2">1000+ tourism providers</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
                {/* Find Tours Button - Orange */}
                <Link href="/packages" className="block">
                  <button 
                    className="w-full px-6 py-3 text-white font-semibold rounded-xl transition-colors duration-300 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: 'var(--color-orange-button)' }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-orange-button)'}
                  >
                    Find Tours
                  </button>
                </Link>

                {/* Use AI Planner Button - Dark Gray */}
                <Link href="/chatbot" className="block">
                  <button 
                    className="w-full px-6 py-3 text-white font-semibold rounded-xl transition-colors duration-300 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: 'var(--color-dark-button)' }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#334155'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-dark-button)'}
                  >
                    Use AI Planner
                  </button>
                </Link>
              </div>
            </motion.div>

             {/* Right: Search Panel with Adventure Card */}
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="adventure-card rounded-2xl p-6"
             >
               <div className="flex items-center space-x-2 mb-6">
                 <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-500)' }}>
                   <MapPin className="w-3 h-3 text-white" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-800">Plan Your Rural Adventure</h3>
               </div>

               {/* Search Form */}
               <div className="space-y-4 mb-6">
                 {/* Destination */}
                 <div>
                   <div className="relative">
                     <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input
                       type="text"
                       placeholder="Where to?"
                       className="w-full px-4 py-3 pl-10 text-sm bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                     />
                   </div>
                 </div>

                 {/* Dates and Travelers Row */}
                 <div className="grid grid-cols-2 gap-3">
                   {/* Dates */}
                   <div>
                     <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input
                         type="text"
                         placeholder="Add dates"
                         className="w-full px-4 py-3 pl-10 text-sm bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                       />
                     </div>
                   </div>

                   {/* Travelers */}
                   <div>
                     <div className="relative">
                       <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <select className="w-full px-4 py-3 pl-10 pr-8 text-sm bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors appearance-none">
                         <option>1...</option>
                         <option>2</option>
                         <option>3</option>
                         <option>4+</option>
                       </select>
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Find Tours Button */}
                 <button className="w-full px-4 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed">
                   Find Tours
                 </button>
               </div>

               {/* Popular experiences */}
               <div>
                 <p className="text-sm font-medium text-gray-700 mb-3">Popular experiences:</p>
                 <div className="flex flex-wrap gap-2">
                   <span className="px-3 py-2 rounded-full bg-white/60 text-gray-700 text-xs hover:bg-white/80 transition-colors cursor-pointer">AI Itinerary Generator</span>
                   <span className="px-3 py-2 rounded-full bg-white/60 text-gray-700 text-xs hover:bg-white/80 transition-colors cursor-pointer">Unique Homestays</span>
                   <span className="px-3 py-2 rounded-full bg-white/60 text-gray-700 text-xs hover:bg-white/80 transition-colors cursor-pointer">Adventure Tours</span>
                   <span className="px-3 py-2 rounded-full bg-white/60 text-gray-700 text-xs hover:bg-white/80 transition-colors cursor-pointer">Food Experiences</span>
                   <span className="px-3 py-2 rounded-full bg-white/60 text-gray-700 text-xs hover:bg-white/80 transition-colors cursor-pointer">Cultural Tours</span>
                 </div>
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Tour Packages Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Tour Packages
            </h2>
            <Link href="/explore">
              <button className="text-gray-600 hover:text-gray-800 font-medium">
                View all
              </button>
            </Link>
          </motion.div>

          {/* Featured Packages Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64"></div>
              ))}
            </div>
          ) : featuredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.slice(0, 6).map((pkg: any, index: number) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80'}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-[var(--color-primary-500)] text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{pkg.location}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{pkg.rating || '4.5'}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">${pkg.price}</div>
                        <div className="text-sm text-gray-500">per person</div>
                      </div>
                    </div>
                    <Link href={`/packages/${pkg.id}`}>
                      <button className="w-full px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-500)]/90 transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured packages available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Create Your Perfect Itinerary Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Perfect Itinerary
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              Our AI-powered itinerary generator creates personalized travel plans based on your preferences, budget, and timeframe.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Itinerary Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <div className="space-y-6">
                {/* Where do you want to go? */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where do you want to go?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Thailand, Europe, Bali"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors"
                  />
                </div>

                {/* How many days? */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many days?
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors">
                    <option>3-5 days</option>
                    <option>1 week</option>
                    <option>2 weeks</option>
                    <option>1 month</option>
                  </select>
                </div>

                {/* What are your interests? */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are your interests?
                  </label>
                  <select 
                    multiple 
                    defaultValue={["Culture & History"]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors h-32"
                  >
                    <option>Culture & History</option>
                    <option>Food & Cuisine</option>
                    <option>Adventure & Outdoors</option>
                    <option>Relaxation & Wellness</option>
                    <option>Shopping & Entertainment</option>
                    <option>Nature & Wildlife</option>
                    <option>Art & Museums</option>
                    <option>Nightlife</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
                </div>

                {/* Budget per person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget per person
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-colors">
                    <option>Day Trip ($20-$150)</option>
                    <option>Budget ($150-$500)</option>
                    <option>Mid-range ($500-$1000)</option>
                    <option>Luxury ($1000+)</option>
                  </select>
                </div>

                {/* Generate Itinerary Button */}
                <button className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed">
                  Generate Itinerary
                </button>
              </div>
            </motion.div>

            {/* Right: Sample AI-Generated Itinerary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sample AI-Generated Itinerary</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">AI Generated</span>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Exploring Bali: 7-Day Cultural Adventure</h4>
                <p className="text-gray-600 text-sm">Perfect for culture lovers with a moderate budget</p>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Day 1 */}
                <div className="border-l-4 border-gray-300 pl-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Day 1: Arrival & Ubud Introduction</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Arrive at Denpasar Airport, private transfer to Ubud (1.5 hours)</li>
                    <li>• Check-in at Sapodilla Ubud (4-star boutique hotel)</li>
                    <li>• Evening dinner at Locavore, a celebrated farm-to-table restaurant</li>
                  </ul>
                </div>

                {/* Day 2 */}
                <div className="border-l-4 border-gray-300 pl-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Day 2: Sacred Temples & Rice Terraces</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Breakfast at the hotel</li>
                    <li>• Morning visit to Tirta Empul Temple with a local guide</li>
                    <li>• Tegallalang Rice Terraces exploration with lunch at a panoramic café</li>
                  </ul>
                </div>

                {/* Day 3 */}
                <div className="border-l-4 border-gray-300 pl-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Day 3: Monkey Forest & Arts</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Sacred Monkey Forest Sanctuary visit</li>
                    <li>• Traditional art workshops & galleries...</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Save as PDF
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                  Find Matching Tours
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Connect With Tourism Providers Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Connect With Tourism Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From airlines to homestays, WanderWild brings together diverse tourism service providers for your perfect travel experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-[var(--color-primary-500)] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <provider.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {provider.title}
                </h3>
                
                <p className="text-gray-600 mb-6 text-sm">
                  {provider.description}
                </p>
                
                <Link href={provider.link}>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Explore {provider.title}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Become a Service Provider Button */}
          <div className="text-center">
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2">
              Become a Service Provider
            </button>
            <p className="text-sm text-gray-600">
              Join our network and grow your tourism business.
            </p>
          </div>
        </div>
      </section>

      {/* How WanderWild Works Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              How WanderWild Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform connects travelers with tourism providers through a simple, transparent process.
            </p>
          </motion.div>

          {/* For Travelers Section */}
          <div className="mb-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <button className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium">
                  For Travelers
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {[
                { title: 'Search & Discover', desc: 'Browse tour packages or use our AI to generate a custom itinerary based on your preferences.' },
                { title: 'Compare Options', desc: 'Review pricing, itineraries, and provider ratings to find your perfect match.' },
                { title: 'Book Securely', desc: 'Make secure payments through our platform with multiple payment options.' },
                { title: 'Enjoy & Review', desc: 'Experience your trip and share feedback to help other travelers.' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* For Tourism Providers Section */}
          <div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <button className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium">
                  For Tourism Providers
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {[
                { step: '1', title: 'Join WanderWild', desc: 'Register your business and complete verification to join our network.' },
                { step: '2', title: 'List Services', desc: 'Create detailed listings with your services, availability, and pricing.' },
                { step: '3', title: 'Set Your Terms', desc: 'Control your pricing, availability, and bidding preferences.' },
                { step: '4', title: 'Manage Bookings', desc: 'Receive bookings, communicate with clients, and receive secure payments.' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-gray-600">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Ready to experience rural tourism?
            </h2>
            
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Whether you're a traveler seeking unique experiences or a provider looking to expand your reach, WanderWild offers the perfect platform to connect and explore rural tourism opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-8 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                  Sign Up Today
                </button>
              </Link>
              <Link href="/packages">
                <button className="px-8 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Browse Tour Packages
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ready to Transform Your Travel Experience Section */}
      <section className="relative py-10 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80"
            alt="Travel experience background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-primary-500)]/85"></div>
        </div>

        <div className="container-custom relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Travel Experience?
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Join thousands of travelers and tourism providers on WanderWild's global platform.
            </p>
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link href="/explore">
              <button className="px-8 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Explore as Traveler
              </button>
            </Link>
            <Link href="/register">
              <button className="px-8 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Join as Provider
              </button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Global Network Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Global Network</h3>
              <p className="text-white/90 text-xs">
                Connect with tourism providers from over 100 countries worldwide.
              </p>
            </div>

            {/* Secure Bookings Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure Bookings</h3>
              <p className="text-white/90 text-xs">
                Protected payments and verified providers for peace of mind.
              </p>
            </div>

            {/* Best Value Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Best Value</h3>
              <p className="text-white/90 text-xs">
                Competitive pricing with transparent bidding system.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
